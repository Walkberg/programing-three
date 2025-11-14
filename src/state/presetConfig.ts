import type { ComponentData } from "@/types";

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
