/**
 * Asset Types and Interfaces (T004)
 * Type definitions for asset management and code execution
 */

/**
 * Asset type discriminator
 */
export type AssetType = "model" | "script" | "texture" | "audio";

/**
 * Asset entity stored in IndexedDB
 */
export interface Asset {
  id: string; // UUID
  name: string; // User-editable filename
  type: AssetType; // Asset category
  format: string; // File extension (.glb, .js, etc.)
  size: number; // File size in bytes
  data: Blob | string; // Raw asset data (Blob for binary, string for text)
  thumbnail: string | null; // Data URL for preview image (null for non-visual assets)
  metadata: Record<string, unknown>; // Format-specific metadata
  uploadedAt: Date; // Upload timestamp
  usedBy: string[]; // GameObject IDs using this asset
}

/**
 * Model3D component data structure
 */
export interface Model3DData {
  assetId: string | null; // Reference to Asset in library
  scale: number; // Uniform scale multiplier
  animations: AnimationClipData[]; // Available animations from model
  activeAnimation: string | null; // Currently playing animation
  animationSpeed: number; // Playback speed multiplier
}

/**
 * Animation clip metadata
 */
export interface AnimationClipData {
  name: string;
  duration: number; // Seconds
  loop: boolean;
}

/**
 * Code component data structure
 */
export interface CodeData {
  code: string; // JavaScript/TypeScript source code
  language: "javascript" | "typescript"; // Language mode
  assetId: string | null; // Optional reference to saved script asset
  executionTime: number; // Last frame execution duration (ms)
  errors: CodeError[]; // Runtime errors from last execution
}

/**
 * Code execution error
 */
export interface CodeError {
  message: string;
  line: number | null;
  column: number | null;
  stack: string | null;
}

/**
 * Code execution context injected into user scripts
 * Available as 'this' in lifecycle hooks
 */
export interface CodeContext {
  gameObject: {
    id: string;
    name: string;
    components: unknown[]; // Simplified for now
  };
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  scene: {
    getGameObjectById: (id: string) => unknown | null;
    getAllGameObjects: () => unknown[];
  };
  deltaTime: number; // Seconds since last frame
}

/**
 * Upload progress state
 */
export interface UploadProgress {
  fileName: string; // Original filename
  progress: number; // Percentage (0-100)
  status: "uploading" | "complete" | "error"; // Upload status
  error?: string; // Error message if status is "error"
}

/**
 * Asset library filter options
 */
export interface AssetFilter {
  type?: AssetType; // Filter by asset type
  searchQuery?: string; // Filter by name
}

/**
 * Storage quota information
 */
export interface StorageQuota {
  usage: number; // Bytes used
  quota: number | null; // Total quota (null if unknown)
  usagePercent: number; // Percentage (0-100)
  warningThreshold: number; // Warn when usage exceeds this percent
}
