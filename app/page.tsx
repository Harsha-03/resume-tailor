"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import Workspace from "@/app/components/Workspace";
import UploadZone from "@/app/components/UploadZone";
import JobInput from "@/app/components/JobInput";
import MatchResults from "@/app/components/MatchResults";
import ExportPanel from "@/app/components/ExportPanel";
import BeforeAfterScore from "@/app/components/BeforeAfterScore";
import Footer from "@/app/components/Footer";

import { useWorkspace } from "@/app/lib/workspace";
import type { AnalyzeResult, TailoredResume } from "@/app/lib/types";

/* Flatten a TailoredResume into a single text string for re-analysis.
 * Includes ALL sections so the re-analysis sees the complete tailored content.
 */
function flattenTailoredResume(data: TailoredResume): string {
  const parts: string[] = [];

  if (data.name) parts.push(data.name);

  // Contact: include all fields so URLs and email show up in re-analysis
  const contactBits = [
    data.contact?.email,
    data.contact?.phone,
    data.contact?.linkedin,
    data.contact?.website,
    data.contact?.location,
  ].filter(Boolean);
  if (contactBits.length > 0) parts.push(contactBits.join(" • "));

  if (data.summary) parts.push(data.summary);

  if (data.skills?.length) parts.push("Skills: " + data.skills.join(" • "));

  if (data.experience?.length) {
    parts.push("Experience:");
    for (const e of data.experience) {
      parts.push(`${e.title} at ${e.company} (${e.dates})`);
      if (e.location) parts.push(e.location);
      for (const b of e.bullets || []) parts.push(b);
    }
  }

  if (data.projects?.length) {
    parts.push("Projects:");
    for (const p of data.projects) {
      parts.push(p.name);
      if (p.description) parts.push(p.description);
      for (const b of p.bullets || []) parts.push(b);
    }
  }

  if (data.education?.length) {
    parts.push("Education:");
    for (const e of data.education) {
      parts.push(`${e.degree}, ${e.institution} (${e.dates})`);
    }
  }

  return parts.join("\n");
}

export default function Home() {
  const ws = useWorkspace();
  const slot = ws.activeSlot;

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | undefined>(undefined);
  const [tailoredScoreElapsed, setTailoredScoreElapsed] = useState<number | undefined>(undefined);

  // Reset transient state when slot changes
  useEffect(() => {
    setError(null);
    setElapsedMs(undefined);
    setTailoredScoreElapsed(undefined);
  }, [slot?.id]);

  const handleAnalyze = useCallback(async () => {
    if (!slot) return;
    setError(null);
    if (!slot.resumeText) {
      setError("Upload your resume first.");
      return;
    }
    if (slot.jobText.length < 50) {
      setError("Paste a full job description (at least 50 characters).");
      return;
    }
    setAnalyzing(true);
    const startTime = performance.now();
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: slot.resumeText, jobText: slot.jobText }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data: AnalyzeResult = await res.json();
      ws.updateActiveSlot({ lastResult: data });
      setElapsedMs(performance.now() - startTime);
    } catch (err: any) {
      setError(err?.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }, [slot, ws]);

  // When user gets a tailored resume, re-analyze for the before/after score
  const handleTailored = useCallback(
    async (data: TailoredResume) => {
      if (!slot) return;
      ws.updateActiveSlot({ tailoredResume: data });

      const tailoredText = flattenTailoredResume(data);

      try {
        const startTime = performance.now();
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText: tailoredText, jobText: slot.jobText }),
        });
        if (res.ok) {
          const newAnalysis: AnalyzeResult = await res.json();
          const newScore = newAnalysis.overallFit ?? newAnalysis.matchScore;
          ws.updateActiveSlot({ tailoredScore: newScore });
          setTailoredScoreElapsed(performance.now() - startTime);
        }
      } catch {
        // Silent fail - before/after is enhancement, not critical
      }
    },
    [slot, ws]
  );

  if (!ws.hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 size={20} className="text-clay animate-spin" />
      </main>
    );
  }

  if (!slot) return null;

  const canAnalyze = !!slot.resumeText && slot.jobText.length >= 50 && !analyzing;
  const beforeScore = slot.lastResult?.overallFit ?? slot.lastResult?.matchScore ?? 0;

  return (
    <>
      <Header />

      <div className="flex">
        <Workspace
          slots={ws.slots}
          activeSlotId={ws.activeSlotId}
          onSelect={ws.setActive}
          onCreate={() => ws.createSlot()}
          onRename={ws.renameSlot}
          onDelete={ws.deleteSlot}
        />

        <main className="flex-1 pt-20 pb-12 px-5 md:px-8 max-w-4xl mx-auto w-full">
          <Hero />

          <div className="mt-8 space-y-6">
            <UploadZone
              onParsed={(text, name) =>
                ws.updateActiveSlot({ resumeText: text, resumeFileName: name })
              }
              resumeText={slot.resumeText}
              fileName={slot.resumeFileName}
              onClear={() =>
                ws.updateActiveSlot({
                  resumeText: "",
                  resumeFileName: "",
                  lastResult: undefined,
                  tailoredResume: undefined,
                  tailoredScore: undefined,
                })
              }
            />

            <JobInput
              jobText={slot.jobText}
              onJobTextChange={(t) => ws.updateActiveSlot({ jobText: t })}
              tone={slot.tone}
              onToneChange={(t) => ws.updateActiveSlot({ tone: t })}
              seniority={slot.seniority}
              onSeniorityChange={(s) => ws.updateActiveSlot({ seniority: s })}
            />

            <motion.button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              whileHover={canAnalyze ? { scale: 1.005 } : {}}
              whileTap={canAnalyze ? { scale: 0.99 } : {}}
              className={`w-full rounded-xl py-3.5 px-6 font-medium text-[14px] flex items-center justify-center gap-2 transition-all ${
                canAnalyze
                  ? "bg-clay text-ink-base hover:bg-clay-deep shadow-[0_4px_24px_-4px_rgba(217,119,87,0.4)]"
                  : "bg-white/[0.04] text-bone-dim cursor-not-allowed border border-white/[0.06]"
              }`}
            >
              {analyzing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Analyzing match...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyze match
                </>
              )}
            </motion.button>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[13px] text-rust text-center"
              >
                {error}
              </motion.p>
            )}
          </div>

          <AnimatePresence>
            {slot.lastResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-10 space-y-6"
              >
                <MatchResults result={slot.lastResult} elapsedMs={elapsedMs} />

                {slot.tailoredResume && slot.tailoredScore !== undefined && (
                  <BeforeAfterScore before={beforeScore} after={slot.tailoredScore} />
                )}

                <ExportPanel
                  resumeText={slot.resumeText}
                  jobText={slot.jobText}
                  tone={slot.tone}
                  seniority={slot.seniority}
                  tailored={slot.tailoredResume || null}
                  onTailored={handleTailored}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </>
  );
}
