"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-clay mb-3 font-medium font-display">
          AI-powered resume tailoring
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-bone leading-[1.05] mb-3">
          Tailor your resume
          <br />
          <span className="font-editorial text-bone-muted font-normal">to any job, in seconds.</span>
        </h1>
        <p className="text-bone-muted max-w-xl text-[14.5px] leading-relaxed">
          Upload your resume, paste the job description, download a tailored,
          ATS-friendly version. Optional cover letter included.
        </p>
      </motion.div>
    </section>
  );
}
