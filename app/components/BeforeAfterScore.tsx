"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface BeforeAfterScoreProps {
  before: number;
  after: number;
}

export default function BeforeAfterScore({ before, after }: BeforeAfterScoreProps) {
  const [displayAfter, setDisplayAfter] = useState(before);
  const delta = after - before;

  useEffect(() => {
    const duration = 1100;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayAfter(Math.round(before + (after - before) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [before, after]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="surface p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={13} className="text-moss" />
        <h3 className="text-[10px] uppercase tracking-[0.16em] text-bone-muted font-medium font-display">
          Tailored impact
        </h3>
      </div>
      <div className="flex items-end gap-4">
        <div>
          <p className="text-[10px] text-bone-dim uppercase tracking-wider mb-0.5">Before</p>
          <p className="font-display font-semibold text-bone-muted text-2xl">{before}</p>
        </div>
        <span className="text-bone-dim mb-2">→</span>
        <div>
          <p className="text-[10px] text-clay uppercase tracking-wider mb-0.5">After</p>
          <p className="font-display font-semibold text-clay text-4xl">{displayAfter}</p>
        </div>
        <div className="ml-auto mb-1">
          <span className="text-[13px] text-moss font-medium font-display">
            {delta > 0 ? `+${delta}` : delta}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
