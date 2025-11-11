import { Scene } from "@/core/Scene";
import type { SceneData } from "@/types";

export class SceneSerializer {
  private static readonly CURRENT_VERSION = "1.0.0";

  static serialize(scene: Scene): SceneData {
    const data = scene.serialize();
    data.gameObjects = data.gameObjects.map((go) => ({
      ...go,
      parentId: go.parentId ?? null,
      children: go.children ?? [],
      isExpanded: go.isExpanded ?? true,
    }));
    return data;
  }

  static deserialize(data: SceneData): Scene {
    if (!this.isVersionCompatible(data.version)) {
      throw new Error(
        `Incompatible scene version: ${data.version}. Current version: ${this.CURRENT_VERSION}`
      );
    }

    data.gameObjects = data.gameObjects.map((go) => ({
      ...go,
      parentId: go.parentId ?? null,
      children: go.children ?? [],
      isExpanded: go.isExpanded ?? true,
    }));

    return Scene.deserialize(data);
  }

  static stringify(scene: Scene): string {
    const data = this.serialize(scene);
    return JSON.stringify(data, null, 2);
  }

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

  private static isVersionCompatible(version: string): boolean {
    const [major] = version.split(".");
    const [currentMajor] = this.CURRENT_VERSION.split(".");
    return major === currentMajor;
  }

  static getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }
}
