import { GameObject } from "./GameObject";
import type { SceneData } from "@/types";

export class Scene {
  version: string;
  gameObjects: GameObject[];
  metadata: {
    createdAt: string;
    modifiedAt: string;
    editorVersion: string;
  };

  constructor(data?: Partial<SceneData>) {
    this.version = data?.version || "1.0.0";
    this.metadata = data?.metadata || {
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      editorVersion: "0.1.0",
    };

    // Deserialize GameObjects if provided
    this.gameObjects = data?.gameObjects
      ? data.gameObjects.map((goData) => GameObject.deserialize(goData))
      : [];
  }

  serialize(): SceneData {
    return {
      version: this.version,
      gameObjects: this.gameObjects.map((go) => go.serialize()),
      metadata: {
        ...this.metadata,
        modifiedAt: new Date().toISOString(),
      },
    };
  }

  static deserialize(data: SceneData): Scene {
    return new Scene(data);
  }

  // GameObject management
  addGameObject(gameObject: GameObject): void {
    this.gameObjects.push(gameObject);
  }

  removeGameObject(id: string): boolean {
    const index = this.gameObjects.findIndex((go) => go.id === id);
    if (index !== -1) {
      // Also remove any children
      const childrenIds = this.gameObjects
        .filter((go) => go.parent === id)
        .map((go) => go.id);

      childrenIds.forEach((childId) => this.removeGameObject(childId));

      this.gameObjects.splice(index, 1);
      return true;
    }
    return false;
  }

  getGameObject(id: string): GameObject | undefined {
    return this.gameObjects.find((go) => go.id === id);
  }

  getGameObjectByName(name: string): GameObject | undefined {
    return this.gameObjects.find((go) => go.name === name);
  }

  getAllGameObjects(): GameObject[] {
    return [...this.gameObjects];
  }

  // Hierarchy helpers
  getChildren(parentId: string): GameObject[] {
    return this.gameObjects.filter((go) => go.parent === parentId);
  }

  getRootGameObjects(): GameObject[] {
    return this.gameObjects.filter((go) => go.parent === null);
  }

  // Lifecycle methods
  initialize(): void {
    this.gameObjects.forEach((go) => go.initialize());
  }

  update(deltaTime: number): void {
    this.gameObjects.forEach((go) => go.update(deltaTime));
  }

  render(): void {
    this.gameObjects.forEach((go) => go.render());
  }
}
