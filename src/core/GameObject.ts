import { v4 as uuidv4 } from "uuid";
import { Component } from "./Component";
import { Transform } from "./Transform";
import type { GameObjectData } from "@/types";
import { MeshRenderer } from "./MeshRenderer";

export class GameObject {
  id: string;
  name: string;
  parent: string | null;
  components: Component[];

  private static nameCounter = new Map<string, number>();

  constructor(data?: Partial<GameObjectData>) {
    this.id = data?.id || uuidv4();
    this.name = data?.name || this.generateName("GameObject");
    this.parent = data?.parent || null;
    this.components = [];

    // Deserialize components if provided
    if (data?.components) {
      this.components = data.components.map((compData) =>
        Component.deserialize(compData)
      );
    }

    // Ensure every GameObject has a Transform component
    if (!this.getComponent("Transform")) {
      this.addComponent(new Transform());
    }

    if (!this.getComponent("MeshRenderer")) {
      this.addComponent(new MeshRenderer());
    }
  }

  // Generate auto-incrementing name (e.g., "GameObject", "GameObject (1)", "GameObject (2)")
  private generateName(baseName: string): string {
    const count = GameObject.nameCounter.get(baseName) || 0;
    GameObject.nameCounter.set(baseName, count + 1);

    return count === 0 ? baseName : `${baseName} (${count})`;
  }

  // Reset name counter (useful for testing or scene reload)
  static resetNameCounters(): void {
    GameObject.nameCounter.clear();
  }

  serialize(): GameObjectData {
    return {
      id: this.id,
      name: this.name,
      parent: this.parent,
      components: this.components.map((comp) => comp.serialize()),
    };
  }

  static deserialize(data: GameObjectData): GameObject {
    return new GameObject(data);
  }

  // Component management
  addComponent(component: Component): void {
    // Check for duplicate component types (warning only, allow duplicates per clarification Q2)
    const existingComponent = this.components.find(
      (c) => c.type === component.type
    );
    if (existingComponent) {
      console.warn(
        `GameObject "${this.name}" already has a ${component.type} component. Adding duplicate.`
      );
    }

    this.components.push(component);
  }

  removeComponent(componentId: string): boolean {
    const index = this.components.findIndex((c) => c.id === componentId);
    if (index !== -1) {
      // Don't allow removing Transform component
      if (this.components[index].type === "Transform") {
        console.warn("Cannot remove Transform component");
        return false;
      }
      this.components.splice(index, 1);
      return true;
    }
    return false;
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
