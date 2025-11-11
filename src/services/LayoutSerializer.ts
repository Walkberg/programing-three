// Layout Serializer Service
// Feature: 003-docking-panel-system
// Handles serialization, deserialization, and validation of layout state

import type {
  Zone,
  SerializedLayout,
  PanelType,
  LayoutPreset,
} from "@/types/layout";
import { getDefaultLayout } from "@/state/layoutStore";

/**
 * Current serialization version
 * Increment when making breaking changes to layout schema
 */
const CURRENT_VERSION = "1.0.0";

/**
 * localStorage key for layout persistence
 */
const STORAGE_KEY = "layout-storage";

/**
 * Layout Serializer
 * Provides safe serialization/deserialization with validation and migration
 */
export class LayoutSerializer {
  /**
   * Serialize layout to JSON string
   */
  static serialize(rootZone: Zone): string {
    const layout: SerializedLayout = {
      version: CURRENT_VERSION,
      rootZone,
      timestamp: Date.now(),
    };

    return JSON.stringify(layout, null, 2);
  }

  /**
   * Deserialize layout from JSON string with validation
   * Returns null if deserialization fails
   */
  static deserialize(json: string): Zone | null {
    try {
      const parsed = JSON.parse(json);

      // Validate structure
      if (!LayoutSerializer.isValidLayout(parsed)) {
        console.error("[LayoutSerializer] Invalid layout structure");
        return null;
      }

      const layout = parsed as SerializedLayout;

      // Handle version migrations
      const migrated = LayoutSerializer.migrate(layout);
      if (!migrated) {
        console.error("[LayoutSerializer] Migration failed");
        return null;
      }

      // Final validation of zone tree
      if (!LayoutSerializer.validateZoneTree(migrated.rootZone)) {
        console.error("[LayoutSerializer] Invalid zone tree structure");
        return null;
      }

      return migrated.rootZone;
    } catch (error) {
      console.error("[LayoutSerializer] Deserialization error:", error);
      return null;
    }
  }

  /**
   * Save layout to localStorage
   */
  static save(rootZone: Zone): boolean {
    try {
      const serialized = LayoutSerializer.serialize(rootZone);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error("[LayoutSerializer] Save error:", error);
      return false;
    }
  }

  /**
   * Load layout from localStorage
   * Returns default layout if load fails
   */
  static load(): Zone {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.info("[LayoutSerializer] No saved layout, using default");
        return getDefaultLayout();
      }

      const deserialized = LayoutSerializer.deserialize(stored);
      if (!deserialized) {
        console.warn("[LayoutSerializer] Failed to load, using default");
        return getDefaultLayout();
      }

      return deserialized;
    } catch (error) {
      console.error("[LayoutSerializer] Load error:", error);
      return getDefaultLayout();
    }
  }

  /**
   * Clear saved layout from localStorage
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.info("[LayoutSerializer] Layout cleared");
    } catch (error) {
      console.error("[LayoutSerializer] Clear error:", error);
    }
  }

  /**
   * Validate that an object is a valid SerializedLayout
   */
  private static isValidLayout(obj: any): obj is SerializedLayout {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.version === "string" &&
      obj.rootZone &&
      typeof obj.rootZone === "object" &&
      typeof obj.timestamp === "number"
    );
  }

  /**
   * Migrate layout to current version
   * Returns null if migration fails
   */
  private static migrate(layout: SerializedLayout): SerializedLayout | null {
    try {
      // Version 1.0.0 is the first version, no migrations needed yet
      if (layout.version === "1.0.0") {
        return layout;
      }

      // Example migration for future versions:
      // if (layout.version === "0.9.0") {
      //   // Migrate from 0.9.0 to 1.0.0
      //   const migrated = migrateFrom090(layout);
      //   return LayoutSerializer.migrate(migrated); // Recursive for multi-step migrations
      // }

      console.warn(
        `[LayoutSerializer] Unknown version ${layout.version}, treating as current`
      );
      return {
        ...layout,
        version: CURRENT_VERSION,
      };
    } catch (error) {
      console.error("[LayoutSerializer] Migration error:", error);
      return null;
    }
  }

  /**
   * Validate zone tree structure recursively
   * Made public for use in preset validation (US6/T101)
   */
  static validateZoneTree(zone: Zone): boolean {
    if (!zone || typeof zone !== "object") {
      return false;
    }

    // Validate common properties
    if (!zone.id || typeof zone.id !== "string") {
      return false;
    }

    if (!zone.type || (zone.type !== "leaf" && zone.type !== "split")) {
      return false;
    }

    // Validate type-specific properties
    if (zone.type === "leaf") {
      // Validate leaf zone
      if (!Array.isArray(zone.panels)) {
        return false;
      }

      // Validate panel types
      const validPanelTypes: PanelType[] = [
        "hierarchy",
        "scene",
        "game",
        "code",
        "inspector",
        "console",
        "assets",
      ];

      for (const panel of zone.panels) {
        if (!validPanelTypes.includes(panel)) {
          console.error(`[LayoutSerializer] Invalid panel type: ${panel}`);
          return false;
        }
      }

      // Validate activePanel
      if (
        zone.activePanel !== null &&
        !zone.panels.includes(zone.activePanel)
      ) {
        console.error(
          `[LayoutSerializer] Active panel ${zone.activePanel} not in panels array`
        );
        return false;
      }

      return true;
    }

    if (zone.type === "split") {
      // Validate split zone
      if (
        !zone.orientation ||
        (zone.orientation !== "horizontal" && zone.orientation !== "vertical")
      ) {
        return false;
      }

      if (!Array.isArray(zone.children) || zone.children.length !== 2) {
        return false;
      }

      if (!Array.isArray(zone.sizes) || zone.sizes.length !== 2) {
        return false;
      }

      // Validate sizes sum to ~1.0 (allow small floating point errors)
      const sum = zone.sizes[0] + zone.sizes[1];
      if (Math.abs(sum - 1.0) > 0.01) {
        console.warn(
          `[LayoutSerializer] Zone sizes sum to ${sum}, expected 1.0`
        );
        // Not fatal, we can normalize
      }

      // Validate children recursively
      return (
        LayoutSerializer.validateZoneTree(zone.children[0]) &&
        LayoutSerializer.validateZoneTree(zone.children[1])
      );
    }

    return false;
  }

  /**
   * Get storage info for debugging
   */
  static getStorageInfo(): {
    hasData: boolean;
    size: number;
    version: string | null;
    timestamp: number | null;
  } {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          hasData: false,
          size: 0,
          version: null,
          timestamp: null,
        };
      }

      const parsed = JSON.parse(stored);
      return {
        hasData: true,
        size: new Blob([stored]).size,
        version: parsed.version || null,
        timestamp: parsed.timestamp || null,
      };
    } catch {
      return {
        hasData: false,
        size: 0,
        version: null,
        timestamp: null,
      };
    }
  }

  // ==================== PRESET MANAGEMENT ====================

  /**
   * localStorage key for presets
   */
  private static readonly PRESETS_KEY = "layout-presets";

  /**
   * localStorage key for active preset ID
   */
  private static readonly ACTIVE_PRESET_KEY = "layout-active-preset";

  /**
   * Save a layout preset
   */
  static savePreset(preset: LayoutPreset): boolean {
    try {
      const presets = LayoutSerializer.listPresets();
      presets[preset.id] = preset;

      localStorage.setItem(
        LayoutSerializer.PRESETS_KEY,
        JSON.stringify(presets)
      );
      return true;
    } catch (error) {
      console.error("[LayoutSerializer] Save preset error:", error);
      return false;
    }
  }

  /**
   * Load a layout preset by ID
   */
  static loadPreset(id: string): LayoutPreset | null {
    try {
      const presets = LayoutSerializer.listPresets();
      return presets[id] || null;
    } catch (error) {
      console.error("[LayoutSerializer] Load preset error:", error);
      return null;
    }
  }

  /**
   * List all saved presets
   */
  static listPresets(): Record<string, LayoutPreset> {
    try {
      const stored = localStorage.getItem(LayoutSerializer.PRESETS_KEY);
      if (!stored) {
        return {};
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error("[LayoutSerializer] List presets error:", error);
      return {};
    }
  }

  /**
   * Delete a preset
   */
  static deletePreset(id: string): boolean {
    try {
      const presets = LayoutSerializer.listPresets();
      delete presets[id];

      localStorage.setItem(
        LayoutSerializer.PRESETS_KEY,
        JSON.stringify(presets)
      );

      // Clear active preset if it was deleted
      const activeId = LayoutSerializer.getActivePresetId();
      if (activeId === id) {
        LayoutSerializer.setActivePresetId(null);
      }

      return true;
    } catch (error) {
      console.error("[LayoutSerializer] Delete preset error:", error);
      return false;
    }
  }

  /**
   * Rename a preset
   */
  static renamePreset(id: string, newName: string): boolean {
    try {
      const preset = LayoutSerializer.loadPreset(id);
      if (!preset) {
        return false;
      }

      preset.name = newName;
      preset.timestamp = Date.now();

      return LayoutSerializer.savePreset(preset);
    } catch (error) {
      console.error("[LayoutSerializer] Rename preset error:", error);
      return false;
    }
  }

  /**
   * Get active preset ID
   */
  static getActivePresetId(): string | null {
    try {
      return localStorage.getItem(LayoutSerializer.ACTIVE_PRESET_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Set active preset ID
   */
  static setActivePresetId(id: string | null): void {
    try {
      if (id === null) {
        localStorage.removeItem(LayoutSerializer.ACTIVE_PRESET_KEY);
      } else {
        localStorage.setItem(LayoutSerializer.ACTIVE_PRESET_KEY, id);
      }
    } catch (error) {
      console.error("[LayoutSerializer] Set active preset error:", error);
    }
  }

  /**
   * Clear all presets
   */
  static clearAllPresets(): void {
    try {
      localStorage.removeItem(LayoutSerializer.PRESETS_KEY);
      localStorage.removeItem(LayoutSerializer.ACTIVE_PRESET_KEY);
      console.info("[LayoutSerializer] All presets cleared");
    } catch (error) {
      console.error("[LayoutSerializer] Clear presets error:", error);
    }
  }
}

/**
 * Export convenience functions
 */
export const serializeLayout = LayoutSerializer.serialize;
export const deserializeLayout = LayoutSerializer.deserialize;
export const saveLayout = LayoutSerializer.save;
export const loadLayout = LayoutSerializer.load;
export const clearLayout = LayoutSerializer.clear;
