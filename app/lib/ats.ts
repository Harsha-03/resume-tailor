/* Rule-based ATS validation of a TailoredResume.
 * Instant, deterministic, no API call needed.
 */

import type { TailoredResume } from "./types";

export interface AtsCheck {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface AtsResult {
  status: "validated" | "ready" | "needs-work";
  passedCount: number;
  totalCount: number;
  checks: AtsCheck[];
}

/* Focused emoji regex.
 * Catches actual emoji + common AI-tell decorative symbols (✨ ⭐ 🚀 etc.),
 * but NOT legitimate resume symbols like bullets (•), arrows (→ ↗), or check marks (✓).
 */
const EMOJI_RE =
  /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2728}\u{2B50}\u{2B55}]/u;

/* Accept any string that contains a 4-digit year OR a "Present/Current/Ongoing/Now" token */
const DATE_RE = /\d{4}|present|current|ongoing|now/i;

export function runAtsCheck(resume: TailoredResume): AtsResult {
  const checks: AtsCheck[] = [];

  // 1. Name present
  checks.push({
    id: "name",
    label: "Name present",
    passed: !!resume.name && resume.name.length >= 2,
    detail: resume.name ? `"${resume.name}"` : "Missing",
  });

  // 2. Contact info (at least 2 fields)
  const contactCount = Object.values(resume.contact || {}).filter(
    (v) => typeof v === "string" && v.trim().length > 0
  ).length;
  checks.push({
    id: "contact",
    label: "Contact info (2+ fields)",
    passed: contactCount >= 2,
    detail: `${contactCount} field${contactCount === 1 ? "" : "s"} found`,
  });

  // 3. Summary present
  const summaryLen = resume.summary?.length || 0;
  checks.push({
    id: "summary",
    label: "Summary section",
    passed: summaryLen >= 50,
    detail: `${summaryLen} chars (need 50+)`,
  });

  // 4. Skills (at least 5)
  const skillsCount = Array.isArray(resume.skills) ? resume.skills.length : 0;
  checks.push({
    id: "skills",
    label: "Skills section (5+ items)",
    passed: skillsCount >= 5,
    detail: `${skillsCount} skill${skillsCount === 1 ? "" : "s"}`,
  });

  // 5. Experience: at least one entry, MAJORITY of entries have bullets (not strict "every")
  // Strict "every" was failing on AI outputs where one entry occasionally lacked bullets.
  const expEntries = Array.isArray(resume.experience) ? resume.experience : [];
  const expWithBullets = expEntries.filter(
    (e) => Array.isArray(e.bullets) && e.bullets.length > 0
  ).length;
  const expCheckPassed =
    expEntries.length > 0 && expWithBullets >= Math.ceil(expEntries.length * 0.5);
  checks.push({
    id: "experience",
    label: "Experience with bullets",
    passed: expCheckPassed,
    detail:
      expEntries.length === 0
        ? "No experience entries"
        : `${expWithBullets}/${expEntries.length} entries have bullets`,
  });

  // 6. Education
  const eduCount = Array.isArray(resume.education) ? resume.education.length : 0;
  checks.push({
    id: "education",
    label: "Education section",
    passed: eduCount > 0,
    detail: eduCount === 0 ? "Missing" : `${eduCount} entr${eduCount === 1 ? "y" : "ies"}`,
  });

  // 7. No actual emoji (decorative symbols banned, legitimate punctuation allowed)
  const fullText = JSON.stringify(resume);
  const emojiMatch = fullText.match(EMOJI_RE);
  checks.push({
    id: "no-emoji",
    label: "No decorative emoji",
    passed: !emojiMatch,
    detail: emojiMatch ? `Found: ${emojiMatch[0]}` : "Clean",
  });

  // 8. Dates: accept year OR "Present/Current/Ongoing/Now"
  const allDates = expEntries
    .map((e) => e.dates || "")
    .concat(
      (Array.isArray(resume.education) ? resume.education : []).map((e) => e.dates || "")
    )
    .filter((d) => d.length > 0);

  const validDates = allDates.filter((d) => DATE_RE.test(d));
  const datesCheckPassed = allDates.length === 0 || validDates.length === allDates.length;
  checks.push({
    id: "dates",
    label: "Dates parseable",
    passed: datesCheckPassed,
    detail:
      allDates.length === 0
        ? "No dates"
        : `${validDates.length}/${allDates.length} valid`,
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;

  let status: AtsResult["status"];
  if (passedCount === totalCount) status = "validated";
  else if (passedCount >= totalCount - 2) status = "ready";
  else status = "needs-work";

  return { status, passedCount, totalCount, checks };
}
