/**
 * CircularMovement - Makes a GameObject move in a circle
 *
 * Usage:
 * 1. Save this file as an asset in the asset library
 * 2. Add a CodeComponent to a GameObject
 * 3. Select this asset in the CodeComponent's asset selector
 * 4. Click Play to see the GameObject move in a circle
 */

export default class CircularMovement {
  private radius: number;
  private speed: number;
  private time: number;
  private context: any;

  constructor(context: any) {
    this.context = context;
    this.radius = 5;
    this.speed = 1;
    this.time = 0;
  }

  initialize(): void {
    this.context.console.log(
      `CircularMovement initialized on ${this.context.gameObject.name}`
    );
    this.context.console.log(`Radius: ${this.radius}, Speed: ${this.speed}`);
  }

  update(deltaTime: number): void {
    this.time += deltaTime * this.speed;

    const transform = this.context.transform;
    if (!transform) return;

    // Circular movement on XZ plane
    transform.position.x = Math.cos(this.time) * this.radius;
    transform.position.z = Math.sin(this.time) * this.radius;

    // Make the object face the direction of movement
    transform.rotation.y = this.time + Math.PI / 2;
  }
}
