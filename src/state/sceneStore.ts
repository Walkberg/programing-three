import { create } from "zustand";
import { Scene } from "@/core/Scene";
import { GameObject } from "@/core/GameObject";
import { Component } from "@/core/Component";
import type { GameObjectData, Vector3, ComponentData } from "@/types";
import { useEditorStore } from "./editorStore";
import { PRESET_CONFIGS } from "./presetConfig";

interface SceneStore {
  // Core scene instance (source of truth)
  scene: Scene;

  // Cached data for React rendering (updated via scene events)
  gameObjects: GameObjectData[];
  gameObjectMap: Map<string, GameObjectData>;

  // Subscriptions cleanup
  unsubscribers: Array<() => void>;

  // GameObject management
  addGameObject: (nameOrGameObject: string | GameObject, parentId?: string | null) => string;
  removeGameObject: (id: string, deleteChildren?: boolean) => void;
  updateGameObject: (id: string, updates: Partial<GameObjectData>) => void;
  updateTransform: (
    gameObjectId: string,
    position?: Vector3,
    rotation?: Vector3,
    scale?: Vector3
  ) => void;

  // Component management
  addComponent: (gameObjectId: string, component: Component) => void;
  updateComponent: (
    gameObjectId: string,
    componentId: string,
    updates: Partial<ComponentData>
  ) => void;
  removeComponent: (gameObjectId: string, componentId: string) => void;

  // Hierarchy
  setParent: (id: string, newParentId: string | null) => boolean;
  canSetParent: (id: string, newParentId: string | null) => boolean;
  toggleExpanded: (id: string) => void;
  reorderSibling: (
    draggedId: string,
    targetId: string,
    position: "above" | "below"
  ) => void;

  // Scene operations
  setScene: (gameObjects: GameObjectData[]) => void;
  clear: () => void;
  createGameObjectFromPreset: (
    presetType: string,
    parentId?: string | null
  ) => string | null;

  // Play mode
  startPlayMode: () => void;
  stopPlayMode: () => void;

  // Lifecycle
  initializeScene: () => void;
  syncFromScene: () => void;
  dispose: () => void;
}

// Helper to mark scene as dirty
const markDirty = () => {
  useEditorStore.getState().setIsDirty(true);
};

export const useSceneStore = create<SceneStore>((set, get) => {
  const scene = new Scene();
  const unsubscribers: Array<() => void> = [];

  // Subscribe to scene events and update store
  const setupEventListeners = () => {
    const unsub1 = scene.on("transform:updated", () => {
      get().syncFromScene();
    });

    const unsub2 = scene.on("gameObject:added", () => {
      get().syncFromScene();
    });

    const unsub3 = scene.on("gameObject:removed", () => {
      get().syncFromScene();
    });

    unsubscribers.push(unsub1, unsub2, unsub3);
  };

  setupEventListeners();

  return {
    scene,
    gameObjects: [],
    gameObjectMap: new Map(),
    unsubscribers,

    // Lifecycle
    initializeScene: () => {
      scene.initialize();
      get().syncFromScene();
    },

    syncFromScene: () => {
      const gameObjects = scene.getAllGameObjects();
      const gameObjectMap = new Map<string, GameObjectData>();

      gameObjects.forEach((go) => {
        gameObjectMap.set(go.id, go.serialize());
      });

      set({
        gameObjects: gameObjects.map((go) => go.serialize()),
        gameObjectMap,
      });
    },

    dispose: () => {
      unsubscribers.forEach((unsub) => unsub());
      scene.dispose();
    },

    // Play mode
    startPlayMode: () => {
      scene.play();

      const tick = () => {
        if (scene.isInPlayMode()) {
          scene.tick();
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    },

    stopPlayMode: () => {
      scene.stop();
    },

    addGameObject: (nameOrGameObject: string | GameObject, parentId?: string | null) => {
      let gameObjectInstance: GameObject;

      if (typeof nameOrGameObject === "string") {
        gameObjectInstance = new GameObject({ name: nameOrGameObject, parentId });
      } else {
        gameObjectInstance = nameOrGameObject;
        // If a parentId was provided as second arg, respect it
        if (parentId !== undefined) {
          gameObjectInstance.parentId = parentId;
        }
      }

      scene.addGameObject(gameObjectInstance);
      markDirty();
      return gameObjectInstance.id;
    },

    removeGameObject: (id: string, deleteChildren = true) => {
      if (deleteChildren) {
        // Remove recursively
        const state = get();
        const removeIds = new Set<string>();
        const collectChildren = (goId: string) => {
          removeIds.add(goId);
          const serialized = state.gameObjectMap.get(goId);
          if (serialized && serialized.children) {
            serialized.children.forEach(collectChildren);
          }
        };
        collectChildren(id);

        removeIds.forEach((removeId) => scene.removeGameObject(removeId));
      } else {
        // Just remove the object, promote children
        const target = scene.getGameObject(id);
        if (target) {
          const children = scene.getChildren(id);
          children.forEach((child) => {
            child.parentId = target.parentId;
          });
        }
        scene.removeGameObject(id);
      }
      markDirty();
    },

    updateGameObject: (id: string, updates: Partial<GameObjectData>) => {
      const gameObject = scene.getGameObject(id);
      if (!gameObject) return;

      // Apply updates to the GameObject instance
      if (updates.name !== undefined) {
        gameObject.name = updates.name;
      }
      if (updates.parentId !== undefined) {
        gameObject.parentId = updates.parentId;
      }

      // Trigger sync
      get().syncFromScene();
      markDirty();
    },

    updateTransform: (gameObjectId, position, rotation, scale) => {
      scene.updateTransform(gameObjectId, position, rotation, scale);
      markDirty();
    },

    // Component management
    addComponent: (gameObjectId: string, component: Component) => {
      const gameObject = scene.getGameObject(gameObjectId);
      if (!gameObject) return;

      gameObject.addComponent(component);
      get().syncFromScene();
      markDirty();
    },

    updateComponent: (
      gameObjectId: string,
      componentId: string,
      updates: Partial<ComponentData>
    ) => {
      const gameObject = scene.getGameObject(gameObjectId);
      if (!gameObject) return;

      const component = gameObject.getComponentById(componentId);
      if (!component) return;

      // Apply updates to component
      Object.assign(component, updates);

      get().syncFromScene();
      markDirty();
    },

    removeComponent: (gameObjectId: string, componentId: string) => {
      const gameObject = scene.getGameObject(gameObjectId);
      if (!gameObject) return;

      const component = gameObject.getComponentById(componentId);
      if (component?.type === "Transform") {
        console.warn("Cannot remove Transform component");
        return;
      }

      gameObject.removeComponent(componentId);
      get().syncFromScene();
      markDirty();
    },

    // Hierarchy operations
    setParent: (id: string, newParentId: string | null) => {
      if (id === newParentId) return false;
      if (!get().canSetParent(id, newParentId)) return false;

      const gameObject = scene.getGameObject(id);

      if (!gameObject) return false;

      if (newParentId != null) {
        const parentGameObject = scene.getGameObject(newParentId);
        if (!parentGameObject) return false;
        parentGameObject.addChild(gameObject);
      }

      gameObject.parentId = newParentId;
      get().syncFromScene();
      markDirty();
      return true;
    },

    canSetParent: (id: string, newParentId: string | null) => {
      if (!newParentId) return true;
      if (id === newParentId) return false;

      // Check for circular dependency
      let currentId: string | null = newParentId;
      while (currentId) {
        if (currentId === id) return false;
        const go = scene.getGameObject(currentId);
        currentId = go?.parentId ?? null;
      }
      return true;
    },

    toggleExpanded: (id: string) => {
      const state = get();
      const serialized = state.gameObjectMap.get(id);
      if (!serialized) return;

      // Update the serialized data (this is UI state, not core scene state)
      const updatedGo = { ...serialized, isExpanded: !serialized.isExpanded };
      const updatedMap = new Map(state.gameObjectMap);
      updatedMap.set(id, updatedGo);

      const updatedGameObjects = state.gameObjects.map((go) =>
        go.id === id ? updatedGo : go
      );

      set({
        gameObjects: updatedGameObjects,
        gameObjectMap: updatedMap,
      });
      markDirty();
    },

    reorderSibling: (
      draggedId: string,
      targetId: string,
      position: "above" | "below"
    ) => {
      // This is a UI ordering operation - we need to maintain order in serialized data
      // but not necessarily in the core scene
      set((state) => {
        const draggedObj = state.gameObjectMap.get(draggedId);
        const targetObj = state.gameObjectMap.get(targetId);

        if (!draggedObj || !targetObj) return {};
        if (draggedObj.parentId !== targetObj.parentId) {
          console.warn("Cannot reorder: objects have different parents");
          return {};
        }

        const parentId = draggedObj.parentId;

        if (parentId === null) {
          // Reorder root objects
          let rootObjects = state.gameObjects.filter(
            (obj) => obj.parentId === null && obj.id !== draggedId
          );

          const targetIdx = rootObjects.findIndex((obj) => obj.id === targetId);
          if (targetIdx === -1) return {};

          const insertIdx = position === "above" ? targetIdx : targetIdx + 1;
          rootObjects.splice(insertIdx, 0, draggedObj);

          const nonRootObjects = state.gameObjects.filter(
            (obj) => obj.parentId !== null
          );

          return {
            gameObjects: [...rootObjects, ...nonRootObjects],
          };
        }

        // Reorder within parent
        const parent = state.gameObjectMap.get(parentId);
        if (!parent) return {};

        let newChildren = parent.children.filter((cid) => cid !== draggedId);
        const targetIdx = newChildren.indexOf(targetId);
        if (targetIdx === -1) return {};

        const insertIdx = position === "above" ? targetIdx : targetIdx + 1;
        newChildren.splice(insertIdx, 0, draggedId);

        const newParent = { ...parent, children: newChildren };
        const updatedGameObjects = state.gameObjects.map((obj) =>
          obj.id === parentId ? newParent : obj
        );
        const updatedMap = new Map(state.gameObjectMap);
        updatedMap.set(parentId, newParent);

        return {
          gameObjects: updatedGameObjects,
          gameObjectMap: updatedMap,
        };
      });

      markDirty();
    },

    // Preset creation
    createGameObjectFromPreset: (
      presetType: string,
      parentId?: string | null
    ) => {
      const config = PRESET_CONFIGS[presetType];
      if (!config) return null;

      if (presetType === "camera" || presetType === "light") {
        console.warn(`${config.name} components coming soon`);
        return null;
      }

      let name = config.name;
      if (presetType === "empty") {
        const state = get();
        const count = state.gameObjects.filter((go) =>
          go.name.startsWith("Empty")
        ).length;
        name = count === 0 ? "Empty" : `Empty (${count + 1})`;
      }

      const gameObject = new GameObject({ name, parentId: parentId });
      return get().addGameObject(gameObject);
    },

    setScene: (gameObjectsData: GameObjectData[]) => {
      scene.getAllGameObjects().forEach((go) => {
        scene.removeGameObject(go.id);
      });

      gameObjectsData.forEach((goData) => {
        const gameObject = GameObject.deserialize(goData);
        gameObject.setScene(scene);
        scene.addGameObject(gameObject);
      });

      get().syncFromScene();
    },

    clear: () => {
      GameObject.resetNameCounters();

      // Clear the core scene
      scene.getAllGameObjects().forEach((go) => {
        scene.removeGameObject(go.id);
      });

      get().syncFromScene();
      markDirty();
    },
  };
});
