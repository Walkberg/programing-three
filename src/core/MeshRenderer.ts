import { Component, ComponentRegistry } from "./Component";
import type { MeshRendererData, ComponentData } from "@/types";

export type GeometryType = "cube" | "sphere" | "plane";

export class MeshRenderer extends Component {
  geometry: GeometryType;
  color: string;
  visible: boolean;

  constructor(data?: Partial<MeshRendererData>) {
    super("MeshRenderer", data);

    this.geometry = data?.geometry || "cube";
    this.color = data?.color || "#888888";
    this.visible = data?.visible ?? true;

    // Validate hex color format
    if (!this.isValidHexColor(this.color)) {
      console.warn(`Invalid color ${this.color}, defaulting to #888888`);
      this.color = "#888888";
    }
  }

  serialize(): MeshRendererData {
    return {
      ...super.serialize(),
      type: "MeshRenderer",
      geometry: this.geometry,
      color: this.color,
      visible: this.visible,
    };
  }

  setGeometry(geometry: GeometryType): void {
    this.geometry = geometry;
  }

  setColor(color: string): void {
    if (this.isValidHexColor(color)) {
      this.color = color;
    } else {
      console.warn(`Invalid color ${color}, keeping current color`);
    }
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  // Example update logic for play mode demonstration (T065)
  // In a real game engine, this would access the Transform component
  // to rotate the object. For now, this demonstrates the lifecycle.
  update(deltaTime: number): void {
    // Example: could modify internal state or trigger events
    // In a complete implementation, components would have access to
    // their GameObject to modify Transform, etc.
    // For MVP demo purposes, this just shows the update is being called
    if (this.enabled && deltaTime > 0) {
      // Update logic would go here
      // console.log(`MeshRenderer updating with dt=${deltaTime}`);
    }
  }
}

// Register MeshRenderer component
ComponentRegistry.register(
  "MeshRenderer",
  MeshRenderer as new (data?: Partial<ComponentData>) => Component
);
