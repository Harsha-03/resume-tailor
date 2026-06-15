"use client";

import { motion } from "framer-motion";
import type { TemplateId } from "@/app/lib/types";
import { TEMPLATES } from "@/app/lib/templates";

interface TemplateSelectorProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const ids: TemplateId[] = ["minimal", "modern", "classic"];

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.16em] text-bone-dim mb-3 font-medium font-display">
        Template
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ids.map((id) => {
          const t = TEMPLATES[id];
          const isActive = value === id;
          return (
            <motion.button
              key={id}
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-lg border p-3 text-left transition-all ${
                isActive
                  ? "border-clay bg-clay-soft"
                  : "border-white/[0.08] hover:border-white/20 bg-white/[0.02]"
              }`}
            >
              {/* Swatch preview */}
              <div className="h-12 rounded-sm bg-bone mb-2 overflow-hidden relative">
                <div
                  className="h-1.5 w-3/4 rounded-sm mt-1.5 ml-1.5"
                  style={{ backgroundColor: t.swatchPrimary }}
                />
                <div className="h-0.5 w-1/2 bg-zinc-400 rounded-sm mt-1.5 ml-1.5" />
                <div className="h-0.5 w-2/3 bg-zinc-300 rounded-sm mt-1 ml-1.5" />
                <div className="h-0.5 w-3/5 bg-zinc-300 rounded-sm mt-1 ml-1.5" />
                <div
                  className="absolute bottom-1.5 left-1.5 h-0.5 w-1/3 rounded-sm"
                  style={{ backgroundColor: t.swatchSecondary }}
                />
              </div>
              <p className={`text-[12px] font-medium ${isActive ? "text-bone" : "text-bone-muted"}`}>
                {t.name}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
