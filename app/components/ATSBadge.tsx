"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, ChevronDown, Check, X } from "lucide-react";
import type { AtsResult } from "@/app/lib/ats";

interface ATSBadgeProps {
  result: AtsResult;
}

export default function ATSBadge({ result }: ATSBadgeProps) {
  const [open, setOpen] = useState(false);

  const isGood = result.status === "validated" || result.status === "ready";
  const Icon = isGood ? ShieldCheck : ShieldAlert;
  const color = result.status === "validated" ? "text-moss" : result.status === "ready" ? "text-sand" : "text-rust";
  const bg =
    result.status === "validated"
      ? "bg-moss/10 border-moss/30"
      : result.status === "ready"
      ? "bg-sand/10 border-sand/30"
      : "bg-rust/10 border-rust/30";

  const label =
    result.status === "validated"
      ? "ATS validated"
      : result.status === "ready"
      ? "ATS ready"
      : "Needs work";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-lg border ${bg}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
      >
        <Icon size={16} className={color} />
        <div className="flex-1">
          <p className={`text-[13px] font-medium ${color}`}>{label}</p>
          <p className="text-[11px] text-bone-dim">
            {result.passedCount} of {result.totalCount} checks passed
          </p>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-bone-muted">
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <ul className="px-4 py-3 space-y-1.5">
              {result.checks.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-[12px]">
                  {c.passed ? (
                    <Check size={11} className="text-moss shrink-0" />
                  ) : (
                    <X size={11} className="text-rust shrink-0" />
                  )}
                  <span className={c.passed ? "text-bone-muted" : "text-rust"}>{c.label}</span>
                  {c.detail && <span className="text-bone-dim ml-auto">{c.detail}</span>}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
