import { NextRequest, NextResponse } from "next/server";
import { GENERATE_FULL_RESUME_PROMPT } from "@/app/lib/prompts";
import { callOpenAIJson } from "@/app/lib/openai";
import { checkRateLimit, getClientIp, limiters } from "@/app/lib/ratelimit";
import type { TailoredResume, SectionId } from "@/app/lib/types";
import { DEFAULT_SECTION_ORDER } from "@/app/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_SECTIONS: SectionId[] = [
  "summary",
  "experience",
  "projects",
  "skills",
  "education",
];

const PLACEHOLDER_PATTERNS = [
  /\busername\b/i,
  /\byourname\b/i,
  /\byoursite\b/i,
  /\byour-portfolio\b/i,
  /example\.com/i,
  /\bplaceholder\b/i,
  /\/in\/user($|\/)/i,
  /\/in\/profile($|\/)/i,
  /\/in\/yourname/i,
];

/* Strip AI-tell em/en dashes from human-readable text fields.
 * Replaces "—" and "–" with ", ". Preserves regular hyphens in dates like "Jan 2024 - Dec 2025".
 */
function stripAIDashes(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\s+--\s+/g, ", ")
    .replace(/,\s*,/g, ",") // collapse accidental double commas
    .trim();
}

function normalizeUrl(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^mailto:/, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function validateUrl(url: string | undefined, sourceText: string): string {
  if (!url || typeof url !== "string") return "";
  const cleaned = url.trim();
  if (!cleaned) return "";

  for (const re of PLACEHOLDER_PATTERNS) {
    if (re.test(cleaned)) return "";
  }

  const normalizedUrl = normalizeUrl(cleaned);
  const normalizedSource = normalizeUrl(sourceText);

  if (normalizedSource.includes(normalizedUrl)) return cleaned;

  const parts = normalizedUrl.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const domain = parts[0];
    const lastSegment = parts[parts.length - 1];
    if (
      normalizedSource.includes(domain) &&
      lastSegment.length > 2 &&
      sourceText.toLowerCase().includes(lastSegment.toLowerCase())
    ) {
      return cleaned;
    }
  }

  if (parts.length === 1 && normalizedSource.includes(parts[0])) {
    return cleaned;
  }

  return "";
}

function validateEmail(email: string | undefined, sourceText: string): string {
  if (!email || typeof email !== "string") return "";
  const cleaned = email.trim().replace(/^mailto:/i, "");
  if (!cleaned.includes("@")) return "";

  for (const re of PLACEHOLDER_PATTERNS) {
    if (re.test(cleaned)) return "";
  }

  if (sourceText.toLowerCase().includes(cleaned.toLowerCase())) {
    return cleaned;
  }
  return "";
}

function normalizeSectionOrder(order: any): SectionId[] {
  if (!Array.isArray(order)) return [...DEFAULT_SECTION_ORDER];
  const filtered = order
    .filter((s): s is SectionId => VALID_SECTIONS.includes(s as SectionId))
    .filter((s, i, arr) => arr.indexOf(s) === i);
  const missing = DEFAULT_SECTION_ORDER.filter((s) => !filtered.includes(s));
  return [...filtered, ...missing];
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(limiters.generate, ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow.", remaining: 0 },
        { status: 429 }
      );
    }

    const body = await req.json();
    const resumeText: string = (body.resumeText || "").toString().trim();
    const jobText: string = (body.jobText || "").toString().trim();
    const tone: string = body.tone || "impactful";
    const seniority: string = body.seniority || "mid-level";

    if (!resumeText || !jobText) {
      return NextResponse.json(
        { error: "Both resumeText and jobText are required." },
        { status: 400 }
      );
    }

    const data = await callOpenAIJson(
      GENERATE_FULL_RESUME_PROMPT(resumeText, jobText, tone, seniority)
    );

    const validatedContact = {
      email: validateEmail(data.contact?.email, resumeText),
      phone: data.contact?.phone || "",
      linkedin: validateUrl(data.contact?.linkedin, resumeText),
      location: data.contact?.location || "",
      website: validateUrl(data.contact?.website, resumeText),
    };

    // Strip em/en dashes from all AI-written text fields
    const cleanExperience = (Array.isArray(data.experience) ? data.experience : []).map(
      (job: any) => ({
        title: stripAIDashes(job.title || ""),
        company: stripAIDashes(job.company || ""),
        location: job.location || "",
        dates: job.dates || "",
        bullets: Array.isArray(job.bullets)
          ? job.bullets.map((b: string) => stripAIDashes(b))
          : [],
      })
    );

    const cleanEducation = (Array.isArray(data.education) ? data.education : []).map(
      (edu: any) => ({
        degree: stripAIDashes(edu.degree || ""),
        institution: stripAIDashes(edu.institution || ""),
        location: edu.location || "",
        dates: edu.dates || "",
      })
    );

    const validatedProjects = (Array.isArray(data.projects) ? data.projects : []).map(
      (p: any) => ({
        name: stripAIDashes(p.name || ""),
        description: stripAIDashes(p.description || ""),
        bullets: Array.isArray(p.bullets)
          ? p.bullets.map((b: string) => stripAIDashes(b))
          : [],
        link: validateUrl(p.link, resumeText),
      })
    );

    const tailored: TailoredResume = {
      name: data.name || "",
      contact: validatedContact,
      summary: stripAIDashes(data.summary || ""),
      skills: Array.isArray(data.skills) ? data.skills.map((s: string) => stripAIDashes(s)) : [],
      experience: cleanExperience,
      education: cleanEducation,
      projects: validatedProjects,
      sectionOrder: normalizeSectionOrder(data.sectionOrder),
    };

    return NextResponse.json(
      { tailored },
      {
        headers: {
          "X-RateLimit-Limit": rl.limit.toString(),
          "X-RateLimit-Remaining": rl.remaining.toString(),
        },
      }
    );
  } catch (err: any) {
    console.error("[tailor] error:", err);
    return NextResponse.json(
      { error: err?.message || "Tailor failed" },
      { status: 500 }
    );
  }
}
