import { create } from "zustand";
import type {
  EditorMode,
  SceneData,
  GizmoMode,
  GizmoSpace,
  SnapSettings,
} from "@/types";

// (Keybinding feature moved to `src/features/keybinding`)

interface EditorStore {
  mode: EditorMode;
  selectedId: string | null;
  selectedIds: string[];
  playStateSnapshot: SceneData | null;
  isDirty: boolean; // T083: Track unsaved changes

  // Gizmo state
  gizmoMode: GizmoMode;
  gizmoSpace: GizmoSpace;
  gizmoSnap: SnapSettings;
  pivotMode: "center" | "local";
  hoverHandle?: string | null;
  isDragging: boolean;

  setGizmoMode: (mode: GizmoMode) => void;
  setGizmoSpace: (space: GizmoSpace) => void;
  setGizmoSnap: (snap: SnapSettings) => void;
  setPivotMode: (pivotMode: "center" | "local") => void;
  setHoverHandle: (handle: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;

  // Shortcuts (user-configurable)
  // (moved to src/features/keybinding)

  setMode: (mode: EditorMode) => void;
  selectGameObject: (id: string | null) => void;
  setSelection: (ids: string[]) => void;
  setPlayStateSnapshot: (snapshot: SceneData | null) => void;
  setIsDirty: (isDirty: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  mode: "edit",
  selectedId: null,
  playStateSnapshot: null,
  isDirty: false,
  gizmoMode: "none",
  gizmoSpace: "world",
  // Persist gizmo snap and pivot mode across sessions
  gizmoSnap:
    typeof window !== "undefined" && window.localStorage
      ? (() => {
          try {
            const raw = window.localStorage.getItem("editor.gizmoSnap");
            if (raw) return JSON.parse(raw);
          } catch (err) {
            // ignore
          }
          return {};
        })()
      : {},
  // pivotMode: center = use object center, local = use object's origin/local pivot
  pivotMode: "center",
  hoverHandle: null,
  isDragging: false,
  // (keybinding state moved to `src/features/keybinding`)

  setMode: (mode) => set({ mode }),

  selectedIds: [],

  selectGameObject: (id) =>
    set(() => {
      const ids = id ? [id] : [];
      return { selectedId: id, selectedIds: ids } as any;
    }),

  setSelection: (ids) =>
    set(() => {
      return {
        selectedIds: ids,
        selectedId: ids && ids.length ? ids[0] : null,
      } as any;
    }),

  setPlayStateSnapshot: (snapshot) => set({ playStateSnapshot: snapshot }),

  setIsDirty: (isDirty) => set({ isDirty }),

  setGizmoMode: (gizmoMode) => set({ gizmoMode }),
  setGizmoSpace: (gizmoSpace) => set({ gizmoSpace }),
  setGizmoSnap: (gizmoSnap) =>
    set(() => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(
            "editor.gizmoSnap",
            JSON.stringify(gizmoSnap)
          );
        }
      } catch (err) {
        // ignore
      }
      return { gizmoSnap } as any;
    }),
  setPivotMode: (pivotMode) =>
    set(() => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("editor.pivotMode", pivotMode);
        }
      } catch (err) {
        // ignore
      }
      return { pivotMode } as any;
    }),

  setHoverHandle: (handle) => set({ hoverHandle: handle }),
  setIsDragging: (isDragging) => set({ isDragging }),

  // (no shortcut state here)
}));
