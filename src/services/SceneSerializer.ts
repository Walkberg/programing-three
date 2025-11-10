import { Scene } from "@/core/Scene";
import type { SceneData } from "@/types";

export class SceneSerializer {
  private static readonly CURRENT_VERSION = "1.0.0";

  /**
   * Serialize a Scene object to JSON-compatible data
   */
  static serialize(scene: Scene): SceneData {
    return scene.serialize();
  }

  /**
   * Deserialize JSON data to a Scene object
   */
  static deserialize(data: SceneData): Scene {
    // Version validation
    if (!this.isVersionCompatible(data.version)) {
      throw new Error(
        `Incompatible scene version: ${data.version}. Current version: ${this.CURRENT_VERSION}`
      );
    }

    return Scene.deserialize(data);
  }

  /**
   * Serialize to JSON string
   */
  static stringify(scene: Scene): string {
    const data = this.serialize(scene);
    return JSON.stringify(data, null, 2);
  }

  /**
   * Parse JSON string to Scene
   */
  static parse(jsonString: string): Scene {
    try {
      const data = JSON.parse(jsonString) as SceneData;
      return this.deserialize(data);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid JSON format");
      }
      throw error;
    }
  }

  /**
   * Check if the version is compatible
   * For now, we only support exact version match
   * Future: implement semver compatibility
   */
  private static isVersionCompatible(version: string): boolean {
    const [major] = version.split(".");
    const [currentMajor] = this.CURRENT_VERSION.split(".");

    // Major version must match for compatibility
    return major === currentMajor;
  }

  /**
   * Get current serialization version
   */
  static getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }
}
