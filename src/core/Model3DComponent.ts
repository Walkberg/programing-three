import { Component, ComponentRegistry } from "./Component";
import type { ComponentData, Model3DData } from "@/types";
import type { Object3D, Group } from "three";
import { ModelLoader } from "@/services/ModelLoader";
import { AssetService } from "@/services/AssetService";

/**
 * Model3DComponent - Component for rendering 3D models (T010)
 * References assets from the asset library
 */

export interface Model3DComponentData extends ComponentData {
  type: "Model3D";
  assetId: string | null; // Reference to Asset in library
  scale: number; // Uniform scale multiplier
  activeAnimation: string | null; // Currently playing animation
  animationSpeed: number; // Playback speed multiplier (1.0 = normal)
}

export class Model3DComponent extends Component {
  assetId: string | null;
  scale: number;
  activeAnimation: string | null;
  animationSpeed: number;

  // Runtime state (T024, T030)
  loadedModel: Object3D | Group | null = null;
  loadError: string | null = null;
  isLoading: boolean = false;

  constructor(data?: Partial<Model3DComponentData>) {
    super("Model3D", data);

    this.assetId = data?.assetId ?? null;
    this.scale = data?.scale ?? 1.0;
    this.activeAnimation = data?.activeAnimation ?? null;
    this.animationSpeed = data?.animationSpeed ?? 1.0;
  }

  serialize(): Model3DComponentData {
    return {
      ...super.serialize(),
      type: "Model3D",
      assetId: this.assetId,
      scale: this.scale,
      activeAnimation: this.activeAnimation,
      animationSpeed: this.animationSpeed,
    };
  }

  // Update model data from asset
  updateFromAsset(modelData: Model3DData): void {
    this.assetId = modelData.assetId;
    this.scale = modelData.scale;
    this.activeAnimation = modelData.activeAnimation;
    this.animationSpeed = modelData.animationSpeed;
  }

  // Get available animations (loaded from asset metadata)
  getAnimations(): string[] {
    // This will be populated when the asset is loaded
    // For now, return empty array
    return [];
  }

  // Play animation by name
  playAnimation(name: string, speed: number = 1.0): void {
    this.activeAnimation = name;
    this.animationSpeed = speed;
  }

  // Stop current animation
  stopAnimation(): void {
    this.activeAnimation = null;
  }

  // T024: Load model from asset
  async loadModel(): Promise<void> {
    if (!this.assetId) {
      this.loadError = "No asset selected";
      this.loadedModel = null;
      return;
    }

    this.isLoading = true;
    this.loadError = null;

    try {
      // Get asset from IndexedDB
      const asset = await AssetService.getAsset(this.assetId);

      if (!asset) {
        throw new Error("Asset not found");
      }

      if (asset.type !== "model") {
        throw new Error("Asset is not a 3D model");
      }

      // Determine format from file extension
      const format = asset.format.toLowerCase();
      let modelFormat: "gltf" | "glb" | "obj";

      if (format === ".glb") {
        modelFormat = "glb";
      } else if (format === ".gltf") {
        modelFormat = "gltf";
      } else if (format === ".obj") {
        modelFormat = "obj";
      } else {
        throw new Error(`Unsupported model format: ${format}`);
      }

      // Load the model
      const blob =
        asset.data instanceof Blob ? asset.data : new Blob([asset.data]);
      const result = await ModelLoader.loadModel(blob, modelFormat);

      // Extract the scene from GLTF result or use the object directly
      this.loadedModel = "scene" in result ? result.scene : result;

      // Apply scale
      if (this.loadedModel) {
        this.loadedModel.scale.setScalar(this.scale);
      }

      this.loadError = null;
    } catch (error) {
      // T030: Error handling
      this.loadError =
        error instanceof Error ? error.message : "Failed to load model";
      this.loadedModel = null;
      console.error("[Model3DComponent] Load error:", error);
    } finally {
      this.isLoading = false;
    }
  }

  // Update scale on loaded model
  updateScale(newScale: number): void {
    this.scale = newScale;
    if (this.loadedModel) {
      this.loadedModel.scale.setScalar(newScale);
    }
  }

  // Dispose of loaded model resources
  dispose(): void {
    if (this.loadedModel) {
      this.loadedModel.traverse((child) => {
        if ("geometry" in child) {
          (
            child as { geometry?: { dispose?: () => void } }
          ).geometry?.dispose?.();
        }
        if ("material" in child) {
          const material = (child as { material?: unknown }).material;
          if (
            material &&
            typeof material === "object" &&
            "dispose" in material
          ) {
            (material as { dispose: () => void }).dispose();
          }
        }
      });
      this.loadedModel = null;
    }
  }
}

// Register component type
ComponentRegistry.register(
  "Model3D",
  Model3DComponent as new (data?: Partial<ComponentData>) => Component
);
