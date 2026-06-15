"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ProgressMessagesProps {
  messages: string[];
  intervalMs?: number;
}

export default function ProgressMessages({ messages, intervalMs = 2400 }: ProgressMessagesProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => Math.min(i + 1, messages.length - 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [messages.length, intervalMs]);

  return (
    <div className="flex items-center gap-2.5 text-[13px] text-bone-muted">
      <Loader2 size={14} className="text-clay animate-spin" />
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.25 }}
        >
          {messages[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
