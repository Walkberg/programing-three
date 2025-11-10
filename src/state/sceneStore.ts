import { create } from "zustand";
import { GameObject } from "@/core/GameObject";
import { Component } from "@/core/Component";
import type { GameObjectData, Vector3, ComponentData } from "@/types";
import { useEditorStore } from "./editorStore";

interface SceneStore {
  gameObjects: GameObjectData[];
  gameObjectMap: Map<string, GameObjectData>;

  addGameObject: (name?: string) => string;
  removeGameObject: (id: string) => void;
  updateGameObject: (id: string, updates: Partial<GameObjectData>) => void;
  updateTransform: (
    gameObjectId: string,
    position?: Vector3,
    rotation?: Vector3,
    scale?: Vector3
  ) => void;
  addComponent: (gameObjectId: string, component: Component) => void;
  updateComponent: (
    gameObjectId: string,
    componentId: string,
    updates: Partial<ComponentData>
  ) => void;
  removeComponent: (gameObjectId: string, componentId: string) => void;
  setScene: (gameObjects: GameObjectData[]) => void;
  clear: () => void;
}

// Helper to mark scene as dirty (T083)
const markDirty = () => {
  useEditorStore.getState().setIsDirty(true);
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  gameObjects: [],
  gameObjectMap: new Map(),

  addGameObject: (name) => {
    const gameObject = new GameObject({ name });
    const data = gameObject.serialize();

    set((state) => {
      const newMap = new Map(state.gameObjectMap);
      newMap.set(data.id, data);

      return {
        gameObjects: [...state.gameObjects, data],
        gameObjectMap: newMap,
      };
    });

    markDirty(); // T083
    return data.id;
  },

  removeGameObject: (id) => {
    set((state) => {
      const newGameObjects = state.gameObjects.filter(
        (go) => go.id !== id && go.parent !== id
      );
      const newMap = new Map<string, GameObjectData>();
      newGameObjects.forEach((go) => newMap.set(go.id, go));

      return {
        gameObjects: newGameObjects,
        gameObjectMap: newMap,
      };
    });

    markDirty(); // T083
  },

  updateGameObject: (id, updates) => {
    set((state) => {
      const newGameObjects = state.gameObjects.map((go) =>
        go.id === id ? { ...go, ...updates } : go
      );
      const newMap = new Map<string, GameObjectData>();
      newGameObjects.forEach((go) => newMap.set(go.id, go));

      return {
        gameObjects: newGameObjects,
        gameObjectMap: newMap,
      };
    });

    markDirty(); // T083
  },

  updateTransform: (gameObjectId, position, rotation, scale) => {
    const state = get();
    const gameObject = state.gameObjectMap.get(gameObjectId);
    if (!gameObject) return;

    const transformComponent = gameObject.components.find(
      (c) => c.type === "Transform"
    ) as any;
    if (!transformComponent) return;

    const updatedTransform = {
      ...transformComponent,
      ...(position && { position }),
      ...(rotation && { rotation }),
      ...(scale && { scale }),
    };

    const updatedComponents = gameObject.components.map((c) =>
      c.type === "Transform" ? updatedTransform : c
    );

    get().updateGameObject(gameObjectId, { components: updatedComponents });
  },

  addComponent: (gameObjectId, component) => {
    const state = get();
    const gameObject = state.gameObjectMap.get(gameObjectId);
    if (!gameObject) return;

    // Check for duplicate component type
    const hasDuplicate = gameObject.components.some(
      (c) => c.type === component.type
    );
    if (hasDuplicate) {
      console.warn(
        `GameObject already has a ${component.type} component. Adding duplicate.`
      );
    }

    const componentData = component.serialize();
    const updatedComponents = [...gameObject.components, componentData];

    get().updateGameObject(gameObjectId, { components: updatedComponents });
  },

  updateComponent: (gameObjectId, componentId, updates) => {
    const state = get();
    const gameObject = state.gameObjectMap.get(gameObjectId);
    if (!gameObject) return;

    const updatedComponents = gameObject.components.map((c) =>
      c.id === componentId ? { ...c, ...updates } : c
    );

    get().updateGameObject(gameObjectId, { components: updatedComponents });
  },

  removeComponent: (gameObjectId, componentId) => {
    const state = get();
    const gameObject = state.gameObjectMap.get(gameObjectId);
    if (!gameObject) return;

    const component = gameObject.components.find((c) => c.id === componentId);
    if (component?.type === "Transform") {
      console.warn("Cannot remove Transform component");
      return;
    }

    const updatedComponents = gameObject.components.filter(
      (c) => c.id !== componentId
    );
    get().updateGameObject(gameObjectId, { components: updatedComponents });
  },

  setScene: (gameObjects) => {
    const newMap = new Map<string, GameObjectData>();
    gameObjects.forEach((go) => newMap.set(go.id, go));

    set({
      gameObjects,
      gameObjectMap: newMap,
    });
    // Don't mark dirty when loading a scene
  },

  clear: () => {
    GameObject.resetNameCounters();
    set({
      gameObjects: [],
      gameObjectMap: new Map(),
    });

    markDirty(); // T083
  },
}));
