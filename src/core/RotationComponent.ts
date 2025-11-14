import { Component, ComponentRegistry } from "./Component";
import type { ComponentData } from "@/types";
import type { GameObject } from "./GameObject";
import { Transform } from "./Transform";

export interface RotationComponentData extends ComponentData {
  type: "RotationComponent";
  speed: number;
  axis: "x" | "y" | "z";
}

export class RotationComponent extends Component {
  speed: number;
  axis: "x" | "y" | "z";

  constructor(data?: Partial<RotationComponentData>) {
    super("RotationComponent", data);
    this.speed = data?.speed || 1.0;
    this.axis = data?.axis || "y";
  }

  serialize(): RotationComponentData {
    return {
      ...super.serialize(),
      type: "RotationComponent",
      speed: this.speed,
      axis: this.axis,
    };
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  setAxis(axis: "x" | "y" | "z"): void {
    this.axis = axis;
  }

  setContext(gameObject: GameObject): void {
    this.gameObject = gameObject;
  }

  update(deltaTime: number): void {
    if (!this.enabled || !this.gameObject || !this.gameObject?.scene) return;
    if (deltaTime <= 0) return;

    const transform = this.gameObject.getComponentByType(Transform);
    if (!transform) return;

    const rotationDelta = this.speed * deltaTime;

    const newRotation = { ...transform.rotation };
    newRotation[this.axis] = (newRotation[this.axis] || 0) + rotationDelta;

    this.gameObject.scene.updateTransform(
      this.gameObject.id,
      undefined,
      newRotation,
      undefined
    );
  }
}

ComponentRegistry.register(
  "RotationComponent",
  RotationComponent as new (data?: Partial<ComponentData>) => Component
);
