"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, FileText } from "lucide-react";
import type { Slot } from "@/app/lib/types";

interface WorkspaceProps {
  slots: Slot[];
  activeSlotId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function Workspace({
  slots,
  activeSlotId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: WorkspaceProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startRename = (slot: Slot) => {
    setEditingId(slot.id);
    setEditName(slot.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-white/[0.06] bg-ink-base/30">
      <div className="px-4 pt-20 pb-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-bone-dim font-medium font-display">
          Workspace
        </p>
      </div>

      <button
        onClick={onCreate}
        className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/15 hover:border-clay/40 hover:bg-clay-soft/50 text-bone-muted hover:text-bone text-[13px] transition-all"
      >
        <Plus size={14} />
        New version
      </button>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <AnimatePresence initial={false}>
          {slots.map((slot) => {
            const isActive = slot.id === activeSlotId;
            const isEditing = editingId === slot.id;

            return (
              <motion.div
                key={slot.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`group relative rounded-lg mb-1 transition-colors ${
                  isActive ? "bg-clay-soft" : "hover:bg-white/[0.03]"
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1 px-2 py-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 min-w-0 bg-transparent text-[13px] text-bone outline-none border-b border-clay/40 pb-0.5"
                    />
                    <button
                      onClick={commitRename}
                      className="h-6 w-6 rounded flex items-center justify-center text-clay hover:bg-white/5"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="h-6 w-6 rounded flex items-center justify-center text-bone-dim hover:bg-white/5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelect(slot.id)}
                    className="w-full text-left px-3 py-2.5 flex items-start gap-2.5"
                  >
                    <FileText
                      size={14}
                      className={`mt-0.5 shrink-0 ${
                        isActive ? "text-clay" : "text-bone-dim"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] truncate ${
                          isActive ? "text-bone font-medium" : "text-bone-muted"
                        }`}
                      >
                        {slot.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {slot.tailoredScore !== undefined && (
                          <span
                            className={`text-[10px] font-medium ${
                              slot.tailoredScore >= 75
                                ? "text-moss"
                                : slot.tailoredScore >= 55
                                ? "text-sand"
                                : "text-rust"
                            }`}
                          >
                            {slot.tailoredScore}
                          </span>
                        )}
                        <span className="text-[10px] text-bone-dim">
                          {timeAgo(slot.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                )}

                {!isEditing && (
                  <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(slot);
                      }}
                      className="h-6 w-6 rounded flex items-center justify-center text-bone-dim hover:text-bone hover:bg-white/5"
                      aria-label="Rename"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${slot.name}"?`)) onDelete(slot.id);
                      }}
                      className="h-6 w-6 rounded flex items-center justify-center text-bone-dim hover:text-rust hover:bg-white/5"
                      aria-label="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-[10px] text-bone-dim leading-relaxed">
          Resumes live in your browser only. They never leave your device until you click generate.
        </p>
      </div>
    </aside>
  );
}
