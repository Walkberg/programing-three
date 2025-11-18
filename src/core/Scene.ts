import { GameObject } from "./GameObject";
import { EventEmitter } from "./EventEmitter";
import type { SceneData, Vector3 } from "@/types";
import { Transform } from "./Transform";

export class Scene {
  version: string;
  gameObjects: GameObject[];
  metadata: {
    createdAt: string;
    modifiedAt: string;
    editorVersion: string;
  };

  private events = new EventEmitter();

  private isPlaying = false;
  private lastUpdateTime = 0;

  constructor(data?: Partial<SceneData>) {
    this.version = data?.version || "1.0.0";
    this.metadata = data?.metadata || {
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      editorVersion: "0.1.0",
    };

    this.gameObjects = data?.gameObjects
      ? data.gameObjects.map((goData) => GameObject.deserialize(goData))
      : [];
  }

  on(event: string, callback: (...args: any[]) => void): () => void {
    return this.events.on(event, callback);
  }

  private emit(event: string, ...args: any[]): void {
    this.events.emit(event, ...args);
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

  // GameObject management with events
  addGameObject(gameObject: GameObject): void {
    this.gameObjects.push(gameObject);
    gameObject.setScene(this);
    this.emit("gameObject:added", gameObject.id);
  }

  removeGameObject(id: string): boolean {
    const index = this.gameObjects.findIndex((go) => go.id === id);
    if (index !== -1) {
      const childrenIds = this.gameObjects
        .filter((go) => go.parentId === id)
        .map((go) => go.id);

      childrenIds.forEach((childId) => this.removeGameObject(childId));

      this.gameObjects.splice(index, 1);
      this.emit("gameObject:removed", id);
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

  updateTransform(
    gameObjectId: string,
    position?: Vector3,
    rotation?: Vector3,
    scale?: Vector3
  ): void {
    const gameObject = this.getGameObject(gameObjectId);
    if (!gameObject) return;

    const transform = gameObject.getComponentByType(Transform);

    if (!transform) return;

    if (position) {
      transform.setPosition(position.x, position.y, position.z);
    }
    if (rotation) {
      transform.setRotation(rotation.x, rotation.y, rotation.z);
    }
    if (scale) {
      transform.setScale(scale.x, scale.y, scale.z);
    }

    this.emit("transform:updated", gameObjectId, {
      position: transform.getPosition(),
      rotation: transform.getRotation(),
      scale: transform.getScale(),
    });
  }

  getChildren(parentId: string): GameObject[] {
    return this.gameObjects.filter((go) => go.parentId === parentId);
  }

  getRootGameObjects(): GameObject[] {
    return this.gameObjects.filter((go) => go.parentId === null);
  }

  play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastUpdateTime = performance.now();
    this.initialize();
    this.emit("play:started");
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.emit("play:stopped");
  }

  isInPlayMode(): boolean {
    return this.isPlaying;
  }

  initialize(): void {
    this.gameObjects.forEach((go) => go.initialize());
  }

  tick(): void {
    if (!this.isPlaying) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    this.update(deltaTime);
  }

  update(deltaTime: number): void {
    this.gameObjects.forEach((go) => {
      go.update(deltaTime);

      // After update, check if transform changed and emit event
      const transform = go.getComponentByType(Transform);
      if (transform) {
        // Components are responsible for calling scene.updateTransform()
        // when they modify the transform
      }
    });
  }

  render(): void {
    this.gameObjects.forEach((go) => go.render());
  }

  dispose(): void {
    this.events.clear();
    this.gameObjects = [];
  }
}
