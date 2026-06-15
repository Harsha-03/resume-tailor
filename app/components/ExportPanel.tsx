"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, FileType2, Mail, Loader2, Download, Sparkles, Eye, EyeOff } from "lucide-react";
import type { TailoredResume, Tone, Seniority } from "@/app/lib/types";
import { runAtsCheck } from "@/app/lib/ats";
import ResumePreview from "./ResumePreview";
import ATSBadge from "./ATSBadge";
import ProgressMessages from "./ProgressMessages";

interface ExportPanelProps {
  resumeText: string;
  jobText: string;
  tone: Tone;
  seniority: Seniority;
  tailored: TailoredResume | null;
  onTailored: (data: TailoredResume) => void;
}

type Status = "idle" | "loading" | "error";

// Single template — keeps the product focused on tailoring intelligence
// rather than visual variety. Add more here if/when product needs them.
const TEMPLATE = "minimal" as const;

const TAILOR_MESSAGES = [
  "Parsing the job requirements...",
  "Understanding your experience...",
  "Tailoring your summary...",
  "Rewriting bullets to match...",
  "Structuring the final resume...",
];

const COVER_MESSAGES = [
  "Reading the job context...",
  "Drafting your opening...",
  "Highlighting your relevance...",
  "Polishing the close...",
];

async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportPanel({
  resumeText,
  jobText,
  tone,
  seniority,
  tailored,
  onTailored,
}: ExportPanelProps) {
  const [tailoring, setTailoring] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<{ docx: Status; pdf: Status }>({
    docx: "idle",
    pdf: "idle",
  });
  const [coverStatus, setCoverStatus] = useState<{ docx: Status; pdf: Status }>({
    docx: "idle",
    pdf: "idle",
  });
  const [coverLetterText, setCoverLetterText] = useState<string>("");
  const [generatingCover, setGeneratingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const atsResult = useMemo(() => (tailored ? runAtsCheck(tailored) : null), [tailored]);

  async function handleTailor() {
    setError(null);
    setTailoring(true);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobText, tone, seniority }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      onTailored(data.tailored);
    } catch (err: any) {
      setError(err?.message || "Tailoring failed.");
    } finally {
      setTailoring(false);
    }
  }

  async function handleDownloadResume(format: "docx" | "pdf") {
    if (!tailored) return;
    setError(null);
    setDownloadStatus((s) => ({ ...s, [format]: "loading" }));
    try {
      const res = await fetch("/api/download/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tailored, format, template: TEMPLATE }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      await downloadBlob(blob, `tailored-resume.${format}`);
      setDownloadStatus((s) => ({ ...s, [format]: "idle" }));
    } catch (err: any) {
      setError(err?.message || "Download failed");
      setDownloadStatus((s) => ({ ...s, [format]: "error" }));
      setTimeout(() => setDownloadStatus((s) => ({ ...s, [format]: "idle" })), 2000);
    }
  }

  async function handleGenerateCover() {
    setError(null);
    setGeneratingCover(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobText, tone, seniority }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setCoverLetterText(data.letter || "");
    } catch (err: any) {
      setError(err?.message || "Cover letter failed");
    } finally {
      setGeneratingCover(false);
    }
  }

  async function handleDownloadCover(format: "docx" | "pdf") {
    if (!coverLetterText) return;
    setError(null);
    setCoverStatus((s) => ({ ...s, [format]: "loading" }));
    try {
      const res = await fetch("/api/download/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letter: coverLetterText,
          candidateName: tailored?.name || "",
          format,
          template: TEMPLATE,
        }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      await downloadBlob(blob, `cover-letter.${format}`);
      setCoverStatus((s) => ({ ...s, [format]: "idle" }));
    } catch (err: any) {
      setError(err?.message || "Download failed");
      setCoverStatus((s) => ({ ...s, [format]: "error" }));
      setTimeout(() => setCoverStatus((s) => ({ ...s, [format]: "idle" })), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Generate button or preview */}
      {!tailored ? (
        <div className="surface p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold mb-1">Tailor your resume</h2>
          <p className="text-[13px] text-bone-muted mb-5">
            We&apos;ll rewrite your summary, skills, and bullets to match this job, then let you download as DOCX or PDF.
          </p>

          <motion.button
            onClick={handleTailor}
            disabled={tailoring}
            whileHover={!tailoring ? { scale: 1.005 } : {}}
            whileTap={!tailoring ? { scale: 0.99 } : {}}
            className={`w-full rounded-xl py-4 px-6 font-medium text-[14px] flex items-center justify-center gap-2 transition-all ${
              tailoring
                ? "bg-white/[0.04] text-bone-dim cursor-wait"
                : "bg-clay text-ink-base hover:bg-clay-deep shadow-[0_4px_24px_-4px_rgba(217,119,87,0.4)]"
            }`}
          >
            {tailoring ? (
              <ProgressMessages messages={TAILOR_MESSAGES} />
            ) : (
              <>
                <Sparkles size={15} />
                Tailor my resume
              </>
            )}
          </motion.button>
        </div>
      ) : (
        <>
          {/* ATS Badge */}
          {atsResult && <ATSBadge result={atsResult} />}

          {/* Preview + Download */}
          <div className="surface p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold">Your tailored resume</h2>
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-1.5 text-[12px] text-bone-muted hover:text-bone"
              >
                {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPreview ? "Hide preview" : "Show preview"}
              </button>
            </div>

            <div className="space-y-5">
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <ResumePreview data={tailored} template={TEMPLATE} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-bone-dim mb-3 font-medium font-display">
                  Download
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <DownloadButton
                    icon={<FileType2 size={15} />}
                    label="DOCX"
                    sublabel="Editable in Word"
                    status={downloadStatus.docx}
                    onClick={() => handleDownloadResume("docx")}
                  />
                  <DownloadButton
                    icon={<FileText size={15} />}
                    label="PDF"
                    sublabel="Ready to send"
                    status={downloadStatus.pdf}
                    onClick={() => handleDownloadResume("pdf")}
                  />
                </div>
              </div>

              <button
                onClick={handleTailor}
                disabled={tailoring}
                className="text-[12px] text-bone-dim hover:text-clay transition-colors"
              >
                {tailoring ? "Regenerating..." : "↻ Regenerate"}
              </button>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="surface p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold mb-1 flex items-center gap-2">
              <Mail size={17} className="text-bone-muted" />
              Cover letter
              <span className="text-[12px] font-normal text-bone-dim ml-1">(optional)</span>
            </h2>
            <p className="text-[13px] text-bone-muted mb-5">
              Personalized cover letter under 300 words.
            </p>

            {!coverLetterText && !generatingCover && (
              <button
                onClick={handleGenerateCover}
                className="w-full rounded-xl py-3 px-5 border border-white/10 hover:border-clay/40 hover:bg-clay-soft text-[13px] text-bone transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-clay" />
                Generate cover letter
              </button>
            )}

            {generatingCover && (
              <div className="rounded-xl py-4 px-5 border border-white/10 flex items-center justify-center">
                <ProgressMessages messages={COVER_MESSAGES} />
              </div>
            )}

            {coverLetterText && (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 max-h-64 overflow-y-auto">
                  <p className="text-[13px] text-bone whitespace-pre-wrap leading-relaxed font-body">
                    {coverLetterText}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DownloadButton
                    icon={<FileType2 size={15} />}
                    label="DOCX"
                    sublabel="Editable"
                    status={coverStatus.docx}
                    onClick={() => handleDownloadCover("docx")}
                  />
                  <DownloadButton
                    icon={<FileText size={15} />}
                    label="PDF"
                    sublabel="Ready to send"
                    status={coverStatus.pdf}
                    onClick={() => handleDownloadCover("pdf")}
                  />
                </div>
                <button
                  onClick={handleGenerateCover}
                  className="text-[12px] text-bone-dim hover:text-clay transition-colors"
                >
                  ↻ Regenerate
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="text-[12px] text-rust text-center">{error}</p>}
    </motion.div>
  );
}

function DownloadButton({
  icon,
  label,
  sublabel,
  status,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  status: Status;
  onClick: () => void;
}) {
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`group rounded-lg border px-4 py-3 text-left transition-all ${
        isError
          ? "border-rust/30 bg-rust/5"
          : "border-white/[0.08] hover:border-clay/40 hover:bg-clay-soft"
      } ${isLoading ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        {isLoading ? (
          <Loader2 size={15} className="text-clay animate-spin" />
        ) : (
          <span className="text-bone group-hover:text-clay transition-colors">{icon}</span>
        )}
        <span className="text-[13.5px] font-medium text-bone">{label}</span>
        {!isLoading && (
          <Download
            size={11}
            className="ml-auto text-bone-dim group-hover:text-clay transition-colors"
          />
        )}
      </div>
      <p className="text-[11px] text-bone-dim">
        {isLoading ? "Building..." : isError ? "Failed — retry" : sublabel}
      </p>
    </button>
  );
}
