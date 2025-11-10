import { create } from "zustand";
import type { EditorMode, SceneData } from "@/types";

interface EditorStore {
  mode: EditorMode;
  selectedId: string | null;
  playStateSnapshot: SceneData | null;

  setMode: (mode: EditorMode) => void;
  selectGameObject: (id: string | null) => void;
  setPlayStateSnapshot: (snapshot: SceneData | null) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  mode: "edit",
  selectedId: null,
  playStateSnapshot: null,

  setMode: (mode) => set({ mode }),

  selectGameObject: (id) => set({ selectedId: id }),

  setPlayStateSnapshot: (snapshot) => set({ playStateSnapshot: snapshot }),
}));
