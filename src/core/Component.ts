import { v4 as uuidv4 } from "uuid";
import type { ComponentData } from "@/types";

// Component registry to map type strings to constructors
const componentRegistry = new Map<
  string,
  new (data?: Partial<ComponentData>) => Component
>();

export abstract class Component {
  id: string;
  type: string;
  enabled: boolean;

  constructor(type: string, data?: Partial<ComponentData>) {
    this.id = data?.id || uuidv4();
    this.type = type;
    this.enabled = data?.enabled ?? true;
  }

  // Serialize component to JSON-compatible format
  serialize(): ComponentData {
    return {
      id: this.id,
      type: this.type,
      enabled: this.enabled,
    };
  }

  // Deserialize component from JSON data
  static deserialize(data: ComponentData): Component {
    const ComponentClass = componentRegistry.get(data.type);
    if (!ComponentClass) {
      throw new Error(`Unknown component type: ${data.type}`);
    }
    return new ComponentClass(data);
  }

  // Lifecycle methods to be implemented by subclasses
  initialize(): void {
    // Override in subclasses
  }

  update(_deltaTime: number): void {
    // Override in subclasses
  }

  render(): void {
    // Override in subclasses
  }
}

// Component Registry for deserialization
export class ComponentRegistry {
  static register(
    type: string,
    componentClass: new (data?: Partial<ComponentData>) => Component
  ): void {
    componentRegistry.set(type, componentClass);
  }

  static get(
    type: string
  ): (new (data?: Partial<ComponentData>) => Component) | undefined {
    return componentRegistry.get(type);
  }

  static getAvailableTypes(): string[] {
    return Array.from(componentRegistry.keys());
  }

  static has(type: string): boolean {
    return componentRegistry.has(type);
  }
}
