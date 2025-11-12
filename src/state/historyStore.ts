import { create } from "zustand";
import { useSceneStore } from "./sceneStore";
import type { GameObjectData } from "@/types";

type TransformPartial = {
  position?: { x: number; y: number; z: number } | null;
  rotation?: { x: number; y: number; z: number } | null;
  scale?: { x: number; y: number; z: number } | null;
};

export type HistoryEntry = {
  type: "transform";
  gameObjectId: string;
  before: TransformPartial;
  after: TransformPartial;
  timestamp: number;
  description?: string;
};

type HistoryItem = { type: "snapshot"; data: GameObjectData[] } | HistoryEntry;

interface HistoryStore {
  undoStack: HistoryItem[];
  redoStack: HistoryItem[];
  push: (item?: HistoryEntry | null) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  push: (item) => {
    try {
      if (item && item.type === "transform") {
        set((state) => ({
          undoStack: [...state.undoStack, item],
          redoStack: [],
        }));
        return;
      }
      // fallback snapshot
      const scene = useSceneStore.getState().gameObjects;
      const snapshot = JSON.parse(JSON.stringify(scene)) as GameObjectData[];
      set((state) => ({
        undoStack: [...state.undoStack, { type: "snapshot", data: snapshot }],
        redoStack: [],
      }));
    } catch (err) {
      // ignore
    }
  },
  undo: () => {
    const sceneStore = useSceneStore.getState();
    set((state) => {
      if (state.undoStack.length === 0) return {};
      const newUndo = [...state.undoStack];
      const last = newUndo.pop()!;
      const currentSnapshot = JSON.parse(
        JSON.stringify(sceneStore.gameObjects)
      ) as GameObjectData[];
      const newRedo = [...state.redoStack, last];

      // apply last (reverse)
      if (last.type === "snapshot") {
        useSceneStore
          .getState()
          .setScene(JSON.parse(JSON.stringify(last.data)));
      } else if (last.type === "transform") {
        const e = last as HistoryEntry;
        useSceneStore
          .getState()
          .updateTransform(
            e.gameObjectId,
            e.before.position as any,
            e.before.rotation as any,
            e.before.scale as any
          );
      }

      return { undoStack: newUndo, redoStack: newRedo };
    });
  },
  redo: () => {
    const sceneStore = useSceneStore.getState();
    set((state) => {
      if (state.redoStack.length === 0) return {};
      const newRedo = [...state.redoStack];
      const next = newRedo.pop()!;
      const currentSnapshot = JSON.parse(
        JSON.stringify(sceneStore.gameObjects)
      ) as GameObjectData[];
      const newUndo = [
        ...state.undoStack,
        { type: "snapshot", data: currentSnapshot },
      ];

      if (next.type === "snapshot") {
        useSceneStore
          .getState()
          .setScene(JSON.parse(JSON.stringify(next.data)));
      } else if (next.type === "transform") {
        const e = next as HistoryEntry;
        useSceneStore
          .getState()
          .updateTransform(
            e.gameObjectId,
            e.after.position as any,
            e.after.rotation as any,
            e.after.scale as any
          );
      }

      return { undoStack: newUndo, redoStack: newRedo };
    });
  },
  clear: () => set({ undoStack: [], redoStack: [] }),
  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}));
