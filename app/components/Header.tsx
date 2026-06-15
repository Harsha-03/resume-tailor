"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-ink-base/70 border-b border-white/[0.06]"
    >
      <div className="px-5 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="h-7 w-7 rounded-md bg-clay-soft border border-clay/30 flex items-center justify-center text-clay text-[13px] font-semibold font-display">
            R
          </span>
          <span className="font-display font-semibold text-[14.5px] tracking-tight text-bone">
            Resume Tailor
          </span>
        </a>

        <nav className="flex items-center gap-1">
          <a
            href="https://github.com/Harsha-03"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-md flex items-center justify-center text-bone-muted hover:text-bone hover:bg-white/5 transition-colors"
            aria-label="GitHub"
          >
            <Github size={15} />
          </a>
          <a
            href="https://harshaasapu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-3 h-9 rounded-md flex items-center gap-1.5 text-bone-muted hover:text-bone text-[13px] transition-colors"
          >
            <span>Built by Harsha</span>
            <ExternalLink size={11} />
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
