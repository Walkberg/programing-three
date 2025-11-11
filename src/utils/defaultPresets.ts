// Default layout presets for 003-docking-panel-system
// Feature: US6 - Layout Presets Manager

import { v4 as uuidv4 } from "uuid";
import type { LayoutPreset, Zone } from "@/types/layout";

/**
 * Default layout preset - balanced workspace
 */
function createDefaultPreset(): LayoutPreset {
  const topSplitId = uuidv4();
  const leftZoneId = uuidv4();
  const centerZoneId = uuidv4();
  const rightZoneId = uuidv4();
  const centerSplitId = uuidv4();
  const viewportZoneId = uuidv4();
  const bottomZoneId = uuidv4();

  const layout: Zone = {
    id: topSplitId,
    type: "split",
    orientation: "horizontal",
    sizes: [0.2, 0.8],
    children: [
      {
        id: leftZoneId,
        type: "leaf",
        panels: ["hierarchy"],
        activePanel: "hierarchy",
      },
      {
        id: centerSplitId,
        type: "split",
        orientation: "horizontal",
        sizes: [0.7, 0.3],
        children: [
          {
            id: viewportZoneId,
            type: "split",
            orientation: "vertical",
            sizes: [0.75, 0.25],
            children: [
              {
                id: centerZoneId,
                type: "leaf",
                panels: ["scene"],
                activePanel: "scene",
              },
              {
                id: bottomZoneId,
                type: "leaf",
                panels: ["console", "assets"],
                activePanel: "console",
              },
            ],
          },
          {
            id: rightZoneId,
            type: "leaf",
            panels: ["inspector"],
            activePanel: "inspector",
          },
        ],
      },
    ],
  };

  return {
    id: "default",
    name: "Default Layout",
    isDefault: true,
    timestamp: Date.now(),
    layout,
  };
}

/**
 * Code-focused layout preset - maximize code editor
 */
function createCodeFocusPreset(): LayoutPreset {
  const topSplitId = uuidv4();
  const leftSplitId = uuidv4();
  const hierarchyZoneId = uuidv4();
  const codeZoneId = uuidv4();
  const rightSplitId = uuidv4();
  const viewportZoneId = uuidv4();
  const consoleZoneId = uuidv4();

  const layout: Zone = {
    id: topSplitId,
    type: "split",
    orientation: "horizontal",
    sizes: [0.15, 0.85],
    children: [
      {
        id: hierarchyZoneId,
        type: "leaf",
        panels: ["hierarchy"],
        activePanel: "hierarchy",
      },
      {
        id: leftSplitId,
        type: "split",
        orientation: "horizontal",
        sizes: [0.6, 0.4],
        children: [
          {
            id: rightSplitId,
            type: "split",
            orientation: "vertical",
            sizes: [0.8, 0.2],
            children: [
              {
                id: codeZoneId,
                type: "leaf",
                panels: ["inspector"],
                activePanel: "inspector",
              },
              {
                id: consoleZoneId,
                type: "leaf",
                panels: ["console"],
                activePanel: "console",
              },
            ],
          },
          {
            id: viewportZoneId,
            type: "leaf",
            panels: ["scene", "assets"],
            activePanel: "scene",
          },
        ],
      },
    ],
  };

  return {
    id: "code-focus",
    name: "Code Focus",
    isDefault: true,
    timestamp: Date.now(),
    layout,
  };
}

/**
 * Design-focused layout preset - maximize viewport
 */
function createDesignModePreset(): LayoutPreset {
  const topSplitId = uuidv4();
  const viewportZoneId = uuidv4();
  const rightZoneId = uuidv4();

  const layout: Zone = {
    id: topSplitId,
    type: "split",
    orientation: "horizontal",
    sizes: [0.75, 0.25],
    children: [
      {
        id: viewportZoneId,
        type: "leaf",
        panels: ["scene"],
        activePanel: "scene",
      },
      {
        id: rightZoneId,
        type: "leaf",
        panels: ["inspector", "hierarchy", "assets", "console"],
        activePanel: "inspector",
      },
    ],
  };

  return {
    id: "design-mode",
    name: "Design Mode",
    isDefault: true,
    timestamp: Date.now(),
    layout,
  };
}

/**
 * Get all default presets as a Record
 */
export function getDefaultPresets(): Record<string, LayoutPreset> {
  const defaultPreset = createDefaultPreset();
  const codeFocusPreset = createCodeFocusPreset();
  const designModePreset = createDesignModePreset();

  return {
    [defaultPreset.id]: defaultPreset,
    [codeFocusPreset.id]: codeFocusPreset,
    [designModePreset.id]: designModePreset,
  };
}

/**
 * Initialize default presets in localStorage if not already present
 */
export function initializeDefaultPresets(): void {
  try {
    const stored = localStorage.getItem("layout-presets");
    const existingPresets = stored ? JSON.parse(stored) : {};

    const defaults = getDefaultPresets();
    let updated = false;

    // Add default presets if they don't exist
    for (const [id, preset] of Object.entries(defaults)) {
      if (!existingPresets[id]) {
        existingPresets[id] = preset;
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem("layout-presets", JSON.stringify(existingPresets));
      console.info("[DefaultPresets] Initialized default layout presets");
    }
  } catch (error) {
    console.error("[DefaultPresets] Failed to initialize presets:", error);
  }
}
