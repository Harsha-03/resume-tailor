"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Slot, WorkspaceState, Tone, Seniority, TemplateId } from "./types";

const STORAGE_KEY = "rt:workspace:v1";

function generateId(): string {
  return `slot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function makeEmptySlot(name: string = "Untitled"): Slot {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    resumeText: "",
    resumeFileName: "",
    jobText: "",
    tone: "impactful",
    seniority: "mid-level",
    template: "minimal",
    createdAt: now,
    updatedAt: now,
  };
}

function loadFromStorage(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkspaceState;
      if (Array.isArray(parsed.slots) && parsed.slots.length > 0) {
        return parsed;
      }
    }
  } catch {}
  const initial = makeEmptySlot("My first resume");
  return { slots: [initial], activeSlotId: initial.id };
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>({ slots: [], activeSlotId: null });
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);

  // Hydrate on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    setState(loaded);
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const activeSlot = state.slots.find((s) => s.id === state.activeSlotId) || null;

  const createSlot = useCallback((name?: string) => {
    const slot = makeEmptySlot(name || `Version ${Date.now().toString(36).slice(-4)}`);
    setState((prev) => ({
      slots: [slot, ...prev.slots],
      activeSlotId: slot.id,
    }));
    return slot.id;
  }, []);

  const updateActiveSlot = useCallback((patch: Partial<Slot>) => {
    setState((prev) => ({
      ...prev,
      slots: prev.slots.map((s) =>
        s.id === prev.activeSlotId ? { ...s, ...patch, updatedAt: Date.now() } : s
      ),
    }));
  }, []);

  const renameSlot = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      slots: prev.slots.map((s) =>
        s.id === id ? { ...s, name, updatedAt: Date.now() } : s
      ),
    }));
  }, []);

  const deleteSlot = useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.slots.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh = makeEmptySlot("Untitled");
        return { slots: [fresh], activeSlotId: fresh.id };
      }
      return {
        slots: remaining,
        activeSlotId:
          prev.activeSlotId === id ? remaining[0].id : prev.activeSlotId,
      };
    });
  }, []);

  const setActive = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeSlotId: id }));
  }, []);

  return {
    hydrated,
    slots: state.slots,
    activeSlotId: state.activeSlotId,
    activeSlot,
    createSlot,
    updateActiveSlot,
    renameSlot,
    deleteSlot,
    setActive,
  };
}
