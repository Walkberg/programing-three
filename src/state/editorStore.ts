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
  playStateSnapshot: SceneData | null;
  isDirty: boolean; // T083: Track unsaved changes

  // Gizmo state
  gizmoMode: GizmoMode;
  gizmoSpace: GizmoSpace;
  gizmoSnap: SnapSettings;

  setGizmoMode: (mode: GizmoMode) => void;
  setGizmoSpace: (space: GizmoSpace) => void;
  setGizmoSnap: (snap: SnapSettings) => void;

  // Shortcuts (user-configurable)
  // (moved to src/features/keybinding)

  setMode: (mode: EditorMode) => void;
  selectGameObject: (id: string | null) => void;
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
  gizmoSnap: {},
  // (keybinding state moved to `src/features/keybinding`)

  setMode: (mode) => set({ mode }),

  selectGameObject: (id) => set({ selectedId: id }),

  setPlayStateSnapshot: (snapshot) => set({ playStateSnapshot: snapshot }),

  setIsDirty: (isDirty) => set({ isDirty }),

  setGizmoMode: (gizmoMode) => set({ gizmoMode }),
  setGizmoSpace: (gizmoSpace) => set({ gizmoSpace }),
  setGizmoSnap: (gizmoSnap) => set({ gizmoSnap }),

  // (no shortcut state here)
}));
