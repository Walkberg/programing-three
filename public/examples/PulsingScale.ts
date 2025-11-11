/**
 * PulsingScale - Makes a GameObject grow and shrink rhythmically
 *
 * Usage:
 * 1. Save this file as an asset in the asset library
 * 2. Add a CodeComponent to a GameObject
 * 3. Select this asset in the CodeComponent's asset selector
 * 4. Click Play to see the GameObject pulse
 */

export default class PulsingScale {
  private baseScale: number;
  private pulseAmount: number;
  private pulseSpeed: number;
  private time: number;
  private context: any;

  constructor(context: any) {
    this.context = context;
    this.baseScale = 1;
    this.pulseAmount = 0.3;
    this.pulseSpeed = 2;
    this.time = 0;
  }

  initialize(): void {
    this.context.console.log(
      `PulsingScale initialized on ${this.context.gameObject.name}`
    );
  }

  update(deltaTime: number): void {
    this.time += deltaTime * this.pulseSpeed;

    const transform = this.context.transform;
    if (!transform) return;

    // Calculate pulsing scale using sine wave
    const pulse = Math.sin(this.time) * this.pulseAmount;
    const scale = this.baseScale + pulse;

    // Apply uniform scale
    transform.scale.x = scale;
    transform.scale.y = scale;
    transform.scale.z = scale;
  }
}
