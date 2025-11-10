/**
 * Validation utilities for input handling
 */

/**
 * Validate hex color format (#RRGGBB)
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  );
}

/**
 * Validate that a number is finite
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Validate that a value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

/**
 * Validate that a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

/**
 * Sanitize user input string (trim, remove special chars)
 */
export function sanitizeString(input: string, maxLength = 100): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Remove potential HTML tags
}

/**
 * Validate GameObject name
 */
export function isValidGameObjectName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 100;
}

/**
 * Parse float with fallback
 */
export function parseFloatSafe(value: string, fallback = 0): number {
  const parsed = parseFloat(value);
  return isFiniteNumber(parsed) ? parsed : fallback;
}

/**
 * Parse int with fallback
 */
export function parseIntSafe(value: string, fallback = 0): number {
  const parsed = parseInt(value, 10);
  return isFiniteNumber(parsed) ? parsed : fallback;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format number to fixed decimal places
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

/**
 * Get validation error message for common cases
 */
export function getValidationErrorMessage(
  field: string,
  value: unknown
): string {
  if (value === null || value === undefined) {
    return `${field} is required`;
  }
  if (typeof value === "string" && value.trim().length === 0) {
    return `${field} cannot be empty`;
  }
  if (typeof value === "number" && !isFiniteNumber(value)) {
    return `${field} must be a valid number`;
  }
  return `Invalid ${field}`;
}
