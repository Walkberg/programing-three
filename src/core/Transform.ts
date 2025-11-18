import { Component, ComponentRegistry } from "./Component";
import type { Vector3, Euler, TransformData, ComponentData } from "@/types";

export class Transform extends Component {
  private position: Vector3;
  private rotation: Euler;
  private scale: Vector3;

  constructor(data?: Partial<TransformData>) {
    super("Transform", data);

    this.position = data?.position || { x: 0, y: 0, z: 0 };
    this.rotation = data?.rotation || { x: 0, y: 0, z: 0, order: "XYZ" };
    this.scale = data?.scale || { x: 1, y: 1, z: 1 };

    // Ensure scale is never negative
    this.scale.x = Math.max(0.001, this.scale.x);
    this.scale.y = Math.max(0.001, this.scale.y);
    this.scale.z = Math.max(0.001, this.scale.z);
  }

  serialize(): TransformData {
    return {
      ...super.serialize(),
      type: "Transform",
      position: { ...this.position },
      rotation: { ...this.rotation },
      scale: { ...this.scale },
    };
  }

  setPosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
  }

  setRotation(
    x: number,
    y: number,
    z: number,
    order: Euler["order"] = "XYZ"
  ): void {
    this.rotation = { x, y, z, order };
  }

  setScale(x: number, y: number, z: number): void {
    // Prevent negative scale values
    this.scale = {
      x: Math.max(0.001, x),
      y: Math.max(0.001, y),
      z: Math.max(0.001, z),
    };
  }

  udpateTransform(position: Vector3, rotation: Euler, scale: Vector3): void {
    this.setPosition(position.x, position.y, position.z);
    this.setRotation(rotation.x, rotation.y, rotation.z, rotation.order);
    this.setScale(scale.x, scale.y, scale.z);
  }

  getPosition(): Vector3 {
    return { ...this.position };
  }
  getRotation(): Euler {
    return { ...this.rotation };
  }
  getScale(): Vector3 {
    return { ...this.scale };
  }
}

// Register Transform component
ComponentRegistry.register(
  "Transform",
  Transform as new (data?: Partial<ComponentData>) => Component
);
