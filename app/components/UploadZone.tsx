"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, Loader2, ShieldCheck } from "lucide-react";
import { parseFile } from "@/app/lib/parsers";

interface UploadZoneProps {
  onParsed: (text: string, fileName: string) => void;
  resumeText: string;
  fileName: string;
  onClear: () => void;
}

export default function UploadZone({ onParsed, resumeText, fileName, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsParsing(true);
      try {
        const text = await parseFile(file);
        if (!text || text.length < 50) {
          throw new Error(
            "Couldn't extract enough text. Looks like a scanned PDF — try pasting your resume manually below."
          );
        }
        onParsed(text, file.name);
      } catch (err: any) {
        setError(err?.message || "Failed to parse file.");
      } finally {
        setIsParsing(false);
      }
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const submitManual = () => {
    if (manualText.trim().length < 50) {
      setError("Paste at least 50 characters of your resume text.");
      return;
    }
    onParsed(manualText.trim(), "manual-paste.txt");
    setShowManual(false);
    setManualText("");
    setError(null);
  };

  const hasFile = !!resumeText && !!fileName;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] uppercase tracking-[0.16em] text-bone-dim font-medium font-display">
          Your resume
        </label>
        <div className="flex items-center gap-1 text-[10px] text-bone-dim">
          <ShieldCheck size={11} className="text-moss" />
          Local only
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!hasFile && !showManual ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 px-6 py-12 ${
              isDragging
                ? "border-clay bg-clay-soft"
                : "border-white/15 hover:border-white/25 hover:bg-white/[0.02]"
            }`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" onChange={onChange} className="hidden" />
            {isParsing ? (
              <>
                <Loader2 size={26} className="text-clay animate-spin" />
                <p className="text-[13px] text-bone-muted">Reading your resume...</p>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload size={17} className="text-bone-muted" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] text-bone mb-1">
                    Drop your resume here, or <span className="text-clay">browse</span>
                  </p>
                  <p className="text-[11px] text-bone-dim">PDF, DOCX, or TXT — under 5MB</p>
                </div>
              </>
            )}
          </motion.div>
        ) : showManual ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-white/10 p-3"
          >
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={8}
              className="w-full bg-transparent text-[13px] text-bone placeholder:text-bone-dim resize-none outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setShowManual(false);
                  setManualText("");
                }}
                className="px-3 py-1.5 text-[12px] text-bone-muted hover:text-bone"
              >
                Cancel
              </button>
              <button
                onClick={submitManual}
                className="px-3 py-1.5 text-[12px] bg-clay text-ink-base rounded-md hover:bg-clay-deep"
              >
                Use this text
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="filled"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-clay/30 bg-clay-soft px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-md bg-clay-soft border border-clay/30 flex items-center justify-center shrink-0">
                <FileText size={15} className="text-clay" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-bone truncate">{fileName}</p>
                <p className="text-[11px] text-bone-dim">
                  {resumeText.length.toLocaleString()} characters
                </p>
              </div>
            </div>
            <button
              onClick={onClear}
              className="h-8 w-8 rounded-md flex items-center justify-center text-bone-muted hover:text-bone hover:bg-white/5 shrink-0"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !showManual && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[12px] text-rust flex-1">{error}</p>
          <button
            onClick={() => {
              setShowManual(true);
              setError(null);
            }}
            className="text-[12px] text-clay hover:underline whitespace-nowrap"
          >
            Paste manually →
          </button>
        </div>
      )}
    </div>
  );
}
