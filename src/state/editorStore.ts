import { create } from "zustand";
import type { EditorMode, SceneData } from "@/types";

interface EditorStore {
  mode: EditorMode;
  selectedId: string | null;
  playStateSnapshot: SceneData | null;
  isDirty: boolean; // T083: Track unsaved changes

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

  setMode: (mode) => set({ mode }),

  selectGameObject: (id) => set({ selectedId: id }),

  setPlayStateSnapshot: (snapshot) => set({ playStateSnapshot: snapshot }),

  setIsDirty: (isDirty) => set({ isDirty }),
}));
