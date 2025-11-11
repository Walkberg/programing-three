/**
 * RotationComponent - Example custom component
 *
 * Usage:
 * 1. Save this file as an asset in the asset library
 * 2. Add a CodeComponent to a GameObject
 * 3. Select this asset in the CodeComponent's asset selector
 * 4. Click Play to see the GameObject rotate
 */

export default class RotationComponent {
  rotationSpeed: number;
  axis: "x" | "y" | "z";
  private context: any;

  constructor(context: any) {
    this.context = context;
    this.rotationSpeed = Math.PI * 0.5; // 90 degrees per second
    this.axis = "y";
  }

  initialize(): void {
    // Called once when play mode starts
    this.context.console.log(
      `RotationComponent initialized on ${this.context.gameObject.name}`
    );
    this.context.console.log(
      `Rotating on ${this.axis} axis at ${this.rotationSpeed} rad/s`
    );
  }

  update(deltaTime: number): void {
    // Called every frame
    const transform = this.context.transform;
    if (!transform) return;

    // Rotate on the specified axis
    transform.rotation[this.axis] += this.rotationSpeed * deltaTime;

    // Optional: Log every 60 frames (approximately once per second at 60fps)
    if (Math.floor(this.context.deltaTime * 60) % 60 === 0) {
      this.context.console.log(
        `Rotation ${this.axis}: ${transform.rotation[this.axis].toFixed(2)}`
      );
    }
  }
}
