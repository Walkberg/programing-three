import { v4 as uuidv4 } from "uuid";
import { Component } from "./Component";
import { Transform } from "./Transform";
import type { GameObjectData } from "@/types";
import { MeshRenderer } from "./MeshRenderer";
import type { Scene } from "./Scene";

export class GameObject {
  id: string;
  name: string;
  parentId: string | null;
  components: Component[];
  children: GameObject[];

  public scene?: Scene;

  private static nameCounter = new Map<string, number>();

  constructor(data?: Partial<GameObjectData>) {
    this.id = data?.id || uuidv4();
    this.name = data?.name || this.generateName("GameObject");
    this.parentId = data?.parentId || null;
    this.components = [];
    this.children = [];

    if (data?.components) {
      this.components = data.components.map((compData) =>
        Component.deserialize(compData)
      );
    }

    if (!this.getComponentByType(Transform)) {
      this.addComponent(new Transform());
    }

    if (!this.getComponentByType(MeshRenderer)) {
      this.addComponent(new MeshRenderer());
    }
  }

  getComponentByType<T extends Component>(
    type: new (...args: any[]) => T
  ): T | undefined {
    return this.components.find((c) => c instanceof type) as T | undefined;
  }

  getComponentByTypeInChildren<T extends Component>(
    type: new (...args: any[]) => T
  ): T | undefined {
    const component = this.getComponentByType(type);
    if (component != null) {
      return component;
    }
    return this.children.reduce<T | undefined>((found, child) => {
      if (found) return found;
      return child.getComponentByTypeInChildren(type);
    }, undefined);
  }

  private generateName(baseName: string): string {
    const count = GameObject.nameCounter.get(baseName) || 0;
    GameObject.nameCounter.set(baseName, count + 1);
    return count === 0 ? baseName : `${baseName} (${count})`;
  }

  static resetNameCounters(): void {
    GameObject.nameCounter.clear();
  }

  serialize(): GameObjectData {
    return {
      id: this.id,
      name: this.name,
      parentId: this.parentId,
      components: this.components.map((comp) => comp.serialize()),
      children: this.children.map((child) => child.id),
    };
  }

  static deserialize(data: GameObjectData): GameObject {
    return new GameObject(data);
  }

  // Set scene context (called when added to scene)
  setScene(scene: Scene): void {
    this.scene = scene;

    // Propagate scene context to all components
    this.components.forEach((component) => {
      if (typeof (component as any).setContext === "function") {
        (component as any).setContext(this, scene);
      }
    });
  }

  // Component management
  addComponent(component: Component): void {
    const existingComponent = this.components.find(
      (c) => c.type === component.type
    );
    if (existingComponent) {
      console.warn(
        `GameObject "${this.name}" already has a ${component.type} component. Adding duplicate.`
      );
    }

    this.components.push(component);

    // Set context if scene is available
    if (this.scene && typeof (component as any).setContext === "function") {
      (component as any).setContext(this, this.scene);
    }
  }

  removeComponent(componentId: string): boolean {
    const index = this.components.findIndex((c) => c.id === componentId);
    if (index !== -1) {
      if (this.components[index].type === "Transform") {
        console.warn("Cannot remove Transform component");
        return false;
      }
      this.components.splice(index, 1);
      return true;
    }
    return false;
  }

  addChild(child: GameObject): boolean {
    if (!this.canAddChild(child)) {
      return false;
    }
    this.children.push(child);
    child.parentId = this.id;
    return true;
  }

  canAddChild(child: GameObject): boolean {
    const existing = this.children.find((c) => c.id === child.id);
    return !existing;
  }

  getComponent(type: string): Component | undefined {
    return this.components.find((c) => c.type === type);
  }

  getComponentById(id: string): Component | undefined {
    return this.components.find((c) => c.id === id);
  }

  getAllComponents(): Component[] {
    return [...this.components];
  }

  // Lifecycle methods
  initialize(): void {
    this.components.forEach((comp) => comp.initialize());
  }

  update(deltaTime: number): void {
    this.components.forEach((comp) => {
      if (comp.enabled) {
        comp.update(deltaTime);
      }
    });
  }

  render(): void {
    this.components.forEach((comp) => {
      if (comp.enabled) {
        comp.render();
      }
    });
  }
}
