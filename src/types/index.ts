// Core type definitions for the Scene Editor

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Euler {
  x: number;
  y: number;
  z: number;
  order?: "XYZ" | "YXZ" | "ZXY" | "ZYX" | "YZX" | "XZY";
}

export interface ComponentData {
  id: string;
  type: string;
  enabled: boolean;
  [key: string]: unknown; // Additional component-specific properties
}

export interface TransformData extends ComponentData {
  type: "Transform";
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

export interface MeshRendererData extends ComponentData {
  type: "MeshRenderer";
  geometry: "cube" | "sphere" | "plane";
  color: string; // hex color
  visible: boolean;
}

export interface GameObjectData {
  id: string;
  name: string;
  parent: string | null;
  components: ComponentData[];
}

export interface SceneData {
  version: string;
  gameObjects: GameObjectData[];
  metadata: {
    createdAt: string;
    modifiedAt: string;
    editorVersion: string;
  };
}

export type EditorMode = "edit" | "play";

export interface EditorState {
  mode: EditorMode;
  selectedId: string | null;
  playStateSnapshot: SceneData | null;
}

export interface SceneState {
  gameObjects: GameObjectData[];
  gameObjectMap: Map<string, GameObjectData>;
}

// T004: Export asset types
export * from "./assets";
