export const PRESET_CONFIGS: Record<
  string,
  { name: string; components: ComponentData[] }
> = {
  empty: {
    name: "Empty",
    components: [
      {
        id: "transform",
        type: "Transform",
        enabled: true,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    ],
  },
  cube: {
    name: "Cube",
    components: [
      {
        id: "transform",
        type: "Transform",
        enabled: true,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "meshRenderer",
        type: "MeshRenderer",
        enabled: true,
        geometry: "cube",
        color: "#cccccc",
        visible: true,
      },
    ],
  },
  sphere: {
    name: "Sphere",
    components: [
      {
        id: "transform",
        type: "Transform",
        enabled: true,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "meshRenderer",
        type: "MeshRenderer",
        enabled: true,
        geometry: "sphere",
        color: "#cccccc",
        visible: true,
      },
    ],
  },
  plane: {
    name: "Plane",
    components: [
      {
        id: "transform",
        type: "Transform",
        enabled: true,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "meshRenderer",
        type: "MeshRenderer",
        enabled: true,
        geometry: "plane",
        color: "#cccccc",
        visible: true,
      },
    ],
  },
  camera: {
    name: "Camera",
    components: [
      {
        id: "transform",
        type: "Transform",
        enabled: true,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      // Camera component placeholder
    ],
  },
  light: {
    name: "Light",
    components: [
      {
        id: "transform",
        type: "Transform",
        enabled: true,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      // Light component placeholder
    ],
  },
};
import { create } from "zustand";
import { GameObject } from "@/core/GameObject";
import { Component } from "@/core/Component";
import type { GameObjectData, Vector3, ComponentData } from "@/types";
import { useEditorStore } from "./editorStore";

interface SceneStore {
  gameObjects: GameObjectData[];
  gameObjectMap: Map<string, GameObjectData>;

  addGameObject: (name?: string, parentId?: string | null) => string;
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
  setParent: (id: string, newParentId: string | null) => boolean;
  canSetParent: (id: string, newParentId: string | null) => boolean;
  toggleExpanded: (id: string) => void;
  setScene: (gameObjects: GameObjectData[]) => void;
  clear: () => void;
  createGameObjectFromPreset: (
    presetType: string,
    parentId?: string | null
  ) => string | null;
  reorderSibling: (
    draggedId: string,
    targetId: string,
    position: "above" | "below"
  ) => void;
}

// Helper to mark scene as dirty (T083)
const markDirty = () => {
  useEditorStore.getState().setIsDirty(true);
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  // T110: createGameObjectFromPreset action
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
    return get().addGameObject(name, parentId);
  },

  setParent: (id: string, newParentId: string | null) => {
    const state = get();
    // Validation: cannot set parent to self or circular
    if (id === newParentId) return false;
    if (!state.canSetParent(id, newParentId)) return false;

    set((currentState) => {
      const go = currentState.gameObjectMap.get(id);
      if (!go) return {};

      const oldParentId = go.parentId;
      let updatedGameObjects = [...currentState.gameObjects];
      let updatedMap = new Map(currentState.gameObjectMap);

      if (oldParentId && updatedMap.has(oldParentId)) {
        const oldParent = updatedMap.get(oldParentId)!;
        const newOldParent = {
          ...oldParent,
          children: oldParent.children.filter((cid) => cid !== id),
        };
        updatedMap.set(oldParentId, newOldParent);
        updatedGameObjects = updatedGameObjects.map((obj) =>
          obj.id === oldParentId ? newOldParent : obj
        );
      }

      if (newParentId && updatedMap.has(newParentId)) {
        const newParent = updatedMap.get(newParentId)!;
        const filteredChildren = newParent.children.filter((cid) => cid !== id);
        const newChildren = [...filteredChildren, id];
        const newNewParent = {
          ...newParent,
          children: newChildren,
        };
        updatedMap.set(newParentId, newNewParent);
        updatedGameObjects = updatedGameObjects.map((obj) =>
          obj.id === newParentId ? newNewParent : obj
        );
      }

      const newGo = { ...go, parentId: newParentId };
      updatedMap.set(id, newGo);
      updatedGameObjects = updatedGameObjects.map((obj) =>
        obj.id === id ? newGo : obj
      );

      return {
        gameObjects: updatedGameObjects,
        gameObjectMap: updatedMap,
      };
    });
    markDirty();
    return true;
  },
  reorderSibling: (draggedId, targetId, position) => {
    set((state) => {
      const draggedObj = state.gameObjectMap.get(draggedId);
      const targetObj = state.gameObjectMap.get(targetId);

      if (!draggedObj || !targetObj) return {};

      // Ils doivent avoir le même parent
      if (draggedObj.parentId !== targetObj.parentId) {
        console.warn("Cannot reorder: objects have different parents");
        return {};
      }

      const parentId = draggedObj.parentId;

      // Si c'est à la racine
      if (parentId === null) {
        // Filtrer les objets racine uniquement
        let rootObjects = state.gameObjects.filter(
          (obj) => obj.parentId === null && obj.id !== draggedId
        );

        const targetIdx = rootObjects.findIndex((obj) => obj.id === targetId);
        if (targetIdx === -1) return {};

        // Insérer selon la position
        const insertIdx = position === "above" ? targetIdx : targetIdx + 1;
        rootObjects.splice(insertIdx, 0, draggedObj);

        // Reconstruire le tableau complet en préservant l'ordre des enfants
        const nonRootObjects = state.gameObjects.filter(
          (obj) => obj.parentId !== null
        );

        return {
          gameObjects: [...rootObjects, ...nonRootObjects],
        };
      }

      // Si c'est dans un parent
      const parent = state.gameObjectMap.get(parentId);
      if (!parent) return {};

      // Réordonner les children
      let newChildren = parent.children.filter((cid) => cid !== draggedId);
      const targetIdx = newChildren.indexOf(targetId);

      if (targetIdx === -1) return {};

      const insertIdx = position === "above" ? targetIdx : targetIdx + 1;
      newChildren.splice(insertIdx, 0, draggedId);

      // Créer un nouveau parent avec les children réordonnés
      const newParent = { ...parent, children: newChildren };

      // Mettre à jour le gameObjects et la map
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

  canSetParent: (id: string, newParentId: string | null) => {
    if (!newParentId) return true;
    if (id === newParentId) return false;
    const state = get();
    // Traverse up the parent chain to detect circular dependency
    let currentId: string | null = newParentId;
    while (currentId) {
      if (currentId === id) return false;
      const go = state.gameObjectMap.get(currentId);
      currentId = go?.parentId ?? null;
    }
    return true;
  },

  toggleExpanded: (id: string) => {
    set((state) => {
      const go = state.gameObjectMap.get(id);
      if (!go) return {};
      const updatedGo = { ...go, isExpanded: !go.isExpanded };
      const updatedGameObjects = state.gameObjects.map((obj) =>
        obj.id === id ? updatedGo : obj
      );
      const updatedMap = new Map<string, GameObjectData>();
      updatedGameObjects.forEach((obj) => updatedMap.set(obj.id, obj));
      return {
        gameObjects: updatedGameObjects,
        gameObjectMap: updatedMap,
      };
    });
    markDirty();
  },
  gameObjects: [],
  gameObjectMap: new Map(),

  addGameObject: (name, parentId = null) => {
    const gameObject = new GameObject({ name });
    const data = gameObject.serialize();
    // US7: Add hierarchy fields
    data.parentId = parentId;
    data.children = [];
    data.isExpanded = true;

    set((state) => {
      const newMap = new Map(state.gameObjectMap);
      newMap.set(data.id, data);

      // If parentId is set, add to parent's children
      if (parentId && newMap.has(parentId)) {
        const parent = newMap.get(parentId)!;
        parent.children = [...parent.children, data.id];
        newMap.set(parentId, parent);
      }

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
      // Remove GameObject and its children recursively
      const removeIds = new Set<string>();
      const collectChildren = (goId: string) => {
        removeIds.add(goId);
        const go = state.gameObjectMap.get(goId);
        if (go && go.children) {
          go.children.forEach(collectChildren);
        }
      };
      collectChildren(id);

      // Remove from parent's children
      const gameObject = state.gameObjectMap.get(id);
      if (gameObject && gameObject.parentId) {
        const parent = state.gameObjectMap.get(gameObject.parentId);
        if (parent) {
          parent.children = parent.children.filter((cid) => cid !== id);
        }
      }

      const newGameObjects = state.gameObjects.filter(
        (go) => !removeIds.has(go.id)
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

      // If parentId changed, update parent/children relationships
      if ("parentId" in updates) {
        const oldGo = state.gameObjectMap.get(id);
        const oldParentId = oldGo?.parentId;
        const newParentId = updates.parentId;
        if (oldParentId && newMap.has(oldParentId)) {
          const oldParent = newMap.get(oldParentId)!;
          oldParent.children = oldParent.children.filter((cid) => cid !== id);
          newMap.set(oldParentId, oldParent);
        }
        if (newParentId && newMap.has(newParentId)) {
          const newParent = newMap.get(newParentId)!;
          newParent.children = [...newParent.children, id];
          newMap.set(newParentId, newParent);
        }
      }

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
