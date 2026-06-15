import { NextRequest, NextResponse } from "next/server";
import { REWRITE_BULLETS_PROMPT } from "@/app/lib/prompts";
import { callOpenAIJson } from "@/app/lib/openai";
import { checkRateLimit, getClientIp, limiters } from "@/app/lib/ratelimit";
import type { RewriteResult } from "@/app/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(limiters.rewrite, ip);
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
      REWRITE_BULLETS_PROMPT(resumeText, jobText, tone, seniority)
    );

    const result: RewriteResult = {
      bullets: Array.isArray(data.bullets) ? data.bullets : [],
      summary: typeof data.summary === "string" ? data.summary : "",
    };

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Limit": rl.limit.toString(),
        "X-RateLimit-Remaining": rl.remaining.toString(),
      },
    });
  } catch (err: any) {
    console.error("[rewrite] error:", err);
    return NextResponse.json(
      { error: err?.message || "Rewrite failed" },
      { status: 500 }
    );
  }
}
