import { NextRequest, NextResponse } from "next/server";
import { tfidfMatchScore, coverage } from "@/app/lib/matching";
import { ANALYZE_PROMPT } from "@/app/lib/prompts";
import { callOpenAIJson } from "@/app/lib/openai";
import { checkRateLimit, getClientIp, limiters } from "@/app/lib/ratelimit";
import type { AnalyzeResult } from "@/app/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(limiters.analyze, ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow.", remaining: 0 },
        { status: 429 }
      );
    }

    const body = await req.json();
    const resumeText: string = (body.resumeText || "").toString().trim();
    const jobText: string = (body.jobText || "").toString().trim();

    if (!resumeText || !jobText) {
      return NextResponse.json(
        { error: "Both resumeText and jobText are required." },
        { status: 400 }
      );
    }

    const tfidf = tfidfMatchScore(resumeText, jobText);
    const cov = coverage(resumeText, jobText);

    let gptAnalysis: any = {};
    try {
      gptAnalysis = await callOpenAIJson(ANALYZE_PROMPT(resumeText, jobText));
    } catch (err) {
      console.error("[analyze] GPT error:", err);
    }

    const result: AnalyzeResult = {
      matchScore: tfidf.score,
      overallFit: gptAnalysis.overall_fit ?? tfidf.score,
      coveredKeywords: gptAnalysis.covered_keywords || cov.covered.slice(0, 20),
      missingKeywords: gptAnalysis.missing_keywords || cov.missing.slice(0, 20),
      notes: gptAnalysis.notes || [],
      suggestedTitle: gptAnalysis.suggested_title,
      skillsToSurface: gptAnalysis.skills_to_surface || [],
      topJdTerms: tfidf.topJdTerms,
    };

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Limit": rl.limit.toString(),
        "X-RateLimit-Remaining": rl.remaining.toString(),
      },
    });
  } catch (err: any) {
    console.error("[analyze] error:", err);
    return NextResponse.json(
      { error: err?.message || "Analyze failed" },
      { status: 500 }
    );
  }
}
