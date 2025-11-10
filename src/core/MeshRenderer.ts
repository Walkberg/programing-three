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
}

// Register MeshRenderer component
ComponentRegistry.register(
  "MeshRenderer",
  MeshRenderer as new (data?: Partial<ComponentData>) => Component
);
