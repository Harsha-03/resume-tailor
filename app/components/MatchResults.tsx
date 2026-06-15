"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Lightbulb, Clock } from "lucide-react";
import type { AnalyzeResult } from "@/app/lib/types";

interface MatchResultsProps {
  result: AnalyzeResult;
  elapsedMs?: number;
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-moss";
  if (score >= 55) return "text-sand";
  return "text-rust";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Here's where you stand. Strong match.";
  if (score >= 60) return "Here's where you stand. Good fit, needs tweaks.";
  if (score >= 40) return "Here's where you stand. Partial fit.";
  return "Here's where you stand. Significant gap.";
}

export default function MatchResults({ result, elapsedMs }: MatchResultsProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const target = result.overallFit ?? result.matchScore;

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="surface p-6 md:p-8"
    >
      <div className="flex items-end justify-between mb-1">
        <div className="flex items-end gap-3">
          <span
            className={`font-display font-semibold tracking-tight ${scoreColor(target)}`}
            style={{ fontSize: "5rem", lineHeight: 1 }}
          >
            {displayScore}
          </span>
          <span className="text-bone-dim font-display text-2xl mb-2">/100</span>
        </div>
        {elapsedMs !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1 text-[11px] text-bone-dim mb-3"
          >
            <Clock size={11} />
            Matched in {(elapsedMs / 1000).toFixed(1)}s
          </motion.div>
        )}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`font-editorial text-[15px] mb-6 ${scoreColor(target)}`}
      >
        {scoreLabel(target)}
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.coveredKeywords?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={13} className="text-moss" />
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-bone-muted font-medium font-display">
                You have ({result.coveredKeywords.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.coveredKeywords.slice(0, 18).map((kw, i) => (
                <motion.span
                  key={kw + i}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.02 }}
                  className="px-2 py-1 rounded-md text-[11px] bg-moss/10 border border-moss/25 text-moss"
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {result.missingKeywords?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={13} className="text-sand" />
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-bone-muted font-medium font-display">
                Missing ({result.missingKeywords.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.missingKeywords.slice(0, 18).map((kw, i) => (
                <motion.span
                  key={kw + i}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.02 }}
                  className="px-2 py-1 rounded-md text-[11px] bg-sand/10 border border-sand/25 text-sand"
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>

      {result.notes?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={13} className="text-bone-muted" />
            <h3 className="text-[10px] uppercase tracking-[0.16em] text-bone-muted font-medium font-display">
              Suggestions
            </h3>
          </div>
          <ul className="space-y-2">
            {result.notes.slice(0, 5).map((note, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="text-[13px] text-bone leading-relaxed flex gap-2"
              >
                <span className="text-bone-dim shrink-0">•</span>
                <span>{note}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
