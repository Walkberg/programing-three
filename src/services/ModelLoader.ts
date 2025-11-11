import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { Group, Object3D } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * ModelLoader Service (T005, T008)
 * Handles loading 3D models from various formats
 */

export class ModelLoader {
  private static gltfLoader = new GLTFLoader();
  private static objLoader = new OBJLoader();

  /**
   * Load a .glb or .gltf file from a Blob
   * Returns the loaded Three.js scene with all meshes and materials
   */
  static async loadGLTF(blob: Blob): Promise<{
    scene: Group;
    animations: GLTF["animations"];
  }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);

      this.gltfLoader.load(
        url,
        (gltf) => {
          URL.revokeObjectURL(url); // Clean up blob URL
          resolve({
            scene: gltf.scene,
            animations: gltf.animations,
          });
        },
        undefined, // onProgress callback (optional)
        (error) => {
          URL.revokeObjectURL(url);
          const message =
            error instanceof Error ? error.message : "Unknown error";
          reject(new Error(`Failed to load GLTF: ${message}`));
        }
      );
    });
  }

  /**
   * Load a .obj file from a Blob
   * Returns the loaded Three.js object
   */
  static async loadOBJ(blob: Blob): Promise<Group> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const text = reader.result as string;
          const object = this.objLoader.parse(text);
          resolve(object);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse OBJ: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read OBJ file"));
      };

      reader.readAsText(blob);
    });
  }

  /**
   * Load a model from a Blob, automatically detecting format
   */
  static async loadModel(
    blob: Blob,
    format: string
  ): Promise<{
    scene: Group | Object3D;
    animations?: GLTF["animations"];
  }> {
    const lowerFormat = format.toLowerCase();

    if (lowerFormat === ".glb" || lowerFormat === ".gltf") {
      return this.loadGLTF(blob);
    }

    if (lowerFormat === ".obj") {
      const scene = await this.loadOBJ(blob);
      return { scene, animations: [] };
    }

    throw new Error(`Unsupported model format: ${format}`);
  }
}
