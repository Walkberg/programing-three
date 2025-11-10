import type { Vector3, Euler } from "@/types";

/**
 * Math utilities for the Scene Editor
 */

// Vector3 operations
export const vec3 = {
  /**
   * Create a new Vector3
   */
  create(x = 0, y = 0, z = 0): Vector3 {
    return { x, y, z };
  },

  /**
   * Clone a Vector3
   */
  clone(v: Vector3): Vector3 {
    return { x: v.x, y: v.y, z: v.z };
  },

  /**
   * Add two vectors
   */
  add(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },

  /**
   * Subtract two vectors
   */
  subtract(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },

  /**
   * Multiply vector by scalar
   */
  multiplyScalar(v: Vector3, scalar: number): Vector3 {
    return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
  },

  /**
   * Get magnitude (length) of vector
   */
  magnitude(v: Vector3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },

  /**
   * Normalize vector (make length 1)
   */
  normalize(v: Vector3): Vector3 {
    const mag = this.magnitude(v);
    if (mag === 0) return { x: 0, y: 0, z: 0 };
    return this.multiplyScalar(v, 1 / mag);
  },

  /**
   * Dot product of two vectors
   */
  dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  /**
   * Cross product of two vectors
   */
  cross(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  /**
   * Distance between two vectors
   */
  distance(a: Vector3, b: Vector3): number {
    return this.magnitude(this.subtract(a, b));
  },

  /**
   * Lerp (linear interpolation) between two vectors
   */
  lerp(a: Vector3, b: Vector3, t: number): Vector3 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  },
};

// Euler operations
export const euler = {
  /**
   * Create a new Euler rotation
   */
  create(x = 0, y = 0, z = 0, order: Euler["order"] = "XYZ"): Euler {
    return { x, y, z, order };
  },

  /**
   * Clone an Euler rotation
   */
  clone(e: Euler): Euler {
    return { x: e.x, y: e.y, z: e.z, order: e.order };
  },

  /**
   * Convert degrees to radians
   */
  degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Convert radians to degrees
   */
  radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  },
};

// Number utilities
export const num = {
  /**
   * Clamp a value between min and max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Lerp (linear interpolation) between two numbers
   */
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },

  /**
   * Check if a number is approximately equal to another (within epsilon)
   */
  approxEqual(a: number, b: number, epsilon = 0.0001): boolean {
    return Math.abs(a - b) < epsilon;
  },

  /**
   * Round to specified decimal places
   */
  roundTo(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  },
};
