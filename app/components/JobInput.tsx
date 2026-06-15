"use client";

import { motion } from "framer-motion";
import type { Tone, Seniority } from "@/app/lib/types";

interface JobInputProps {
  jobText: string;
  onJobTextChange: (text: string) => void;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  seniority: Seniority;
  onSeniorityChange: (seniority: Seniority) => void;
}

const SELECT_BG = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a8a39a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

export default function JobInput({
  jobText,
  onJobTextChange,
  tone,
  onToneChange,
  seniority,
  onSeniorityChange,
}: JobInputProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="w-full">
      <label className="block text-[10px] uppercase tracking-[0.16em] text-bone-dim mb-2 font-medium font-display">
        Job description
      </label>

      <textarea
        value={jobText}
        onChange={(e) => onJobTextChange(e.target.value)}
        placeholder="Paste the full job description here..."
        rows={9}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[13.5px] text-bone placeholder:text-bone-dim resize-none focus:outline-none focus:border-clay/40 focus:bg-white/[0.03] transition-colors font-body"
      />

      <div className="mt-1.5">
        <p className="text-[11px] text-bone-dim">{jobText.length.toLocaleString()} characters</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.16em] text-bone-dim mb-1.5 font-medium font-display">
            Tone
          </label>
          <select
            value={tone}
            onChange={(e) => onToneChange(e.target.value as Tone)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-bone focus:outline-none focus:border-clay/40 appearance-none cursor-pointer"
            style={{
              backgroundImage: SELECT_BG,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "13px",
              paddingRight: "32px",
            }}
          >
            <option value="impactful">Impactful</option>
            <option value="neutral">Neutral</option>
            <option value="conservative">Conservative</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.16em] text-bone-dim mb-1.5 font-medium font-display">
            Seniority
          </label>
          <select
            value={seniority}
            onChange={(e) => onSeniorityChange(e.target.value as Seniority)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-bone focus:outline-none focus:border-clay/40 appearance-none cursor-pointer"
            style={{
              backgroundImage: SELECT_BG,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "13px",
              paddingRight: "32px",
            }}
          >
            <option value="entry-level">Entry level</option>
            <option value="mid-level">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
