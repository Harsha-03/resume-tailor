import { NextRequest, NextResponse } from "next/server";
import { COVER_LETTER_PROMPT } from "@/app/lib/prompts";
import { callOpenAIJson } from "@/app/lib/openai";
import { checkRateLimit, getClientIp, limiters } from "@/app/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(limiters.coverLetter, ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow.", remaining: 0 },
        { status: 429 }
      );
    }

    const body = await req.json();
    const resumeText: string = (body.resumeText || "").toString().trim();
    const jobText: string = (body.jobText || "").toString().trim();
    const tone: string = body.tone || "friendly";
    const seniority: string = body.seniority || "mid-level";

    if (!resumeText || !jobText) {
      return NextResponse.json(
        { error: "Both resumeText and jobText are required." },
        { status: 400 }
      );
    }

    const data = await callOpenAIJson(
      COVER_LETTER_PROMPT(resumeText, jobText, tone, seniority)
    );

    const letter: string =
      typeof data.letter === "string" ? data.letter.trim() : "";

    if (!letter) {
      return NextResponse.json(
        { error: "Failed to generate cover letter." },
        { status: 502 }
      );
    }

    return NextResponse.json({ letter }, {
      headers: {
        "X-RateLimit-Limit": rl.limit.toString(),
        "X-RateLimit-Remaining": rl.remaining.toString(),
      },
    });
  } catch (err: any) {
    console.error("[cover-letter] error:", err);
    return NextResponse.json(
      { error: err?.message || "Cover letter generation failed" },
      { status: 500 }
    );
  }
}
