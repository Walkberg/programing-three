import { Component, ComponentRegistry } from "./Component";
import type { ComponentData } from "@/types";

export interface RotationComponentData extends ComponentData {
  type: "RotationComponent";
  speed: number; // Rotation speed in radians per second
}

/**
 * Example component demonstrating the update lifecycle in play mode.
 * Rotates the GameObject over time when in play mode.
 * This component needs to work with the store to update the Transform.
 */
export class RotationComponent extends Component {
  speed: number;

  constructor(data?: Partial<RotationComponentData>) {
    super("RotationComponent", data);
    this.speed = data?.speed || 1.0; // Default: 1 radian per second
  }

  serialize(): RotationComponentData {
    return {
      ...super.serialize(),
      type: "RotationComponent",
      speed: this.speed,
    };
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  // This update method would need access to the GameObject to modify Transform
  // For now, this demonstrates the lifecycle hook being called
  update(deltaTime: number): void {
    // In a complete implementation, this would:
    // 1. Get the Transform component from the parent GameObject
    // 2. Increment rotation.y by speed * deltaTime
    // 3. Update the store to trigger re-render

    // For MVP demo purposes, we'll handle rotation in the UpdateLoop
    // where we have access to the store and can update transforms
    if (this.enabled && deltaTime > 0) {
      // Update logic handled externally in UpdateLoop
    }
  }
}

// Register RotationComponent
ComponentRegistry.register(
  "RotationComponent",
  RotationComponent as new (data?: Partial<ComponentData>) => Component
);
