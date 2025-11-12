// Panel Registry
// Feature: 003-docking-panel-system
// Maps panel types to React components with metadata

import {
  Layers,
  Box,
  Gamepad2,
  Code,
  FileText,
  Terminal,
  Folder,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Import panel components
import { HierarchyPanel } from "@/components/Hierarchy/HierarchyPanel";
import { SceneViewport } from "@/components/Viewport/SceneViewport";
import { InspectorPanel } from "@/components/Inspector/InspectorPanel";
import { ConsolePanel } from "@/components/Console/ConsolePanel";
import { AssetsPanel } from "@/components/Assets/AssetsPanel";
import type { PanelDefinition, PanelType } from "@/core/plugin/plugin.type";

/**
 * Panel Registry
 * Central registry mapping panel types to their definitions
 */
const PANEL_REGISTRY: Record<PanelType, PanelDefinition> = {
  hierarchy: {
    id: "hierarchy",
    pluginId: "core",
    title: "Hierarchy",
    icon: Layers,
    component: HierarchyPanel,
    defaultSize: { width: 250 },
    description: "Scene object hierarchy tree",
  },
  scene: {
    id: "scene",
    pluginId: "core",
    title: "Scene",
    icon: Box,
    component: SceneViewport,
    description: "3D scene viewport for editing",
  },
  game: {
    pluginId: "core",
    id: "game",
    title: "Game",
    icon: Gamepad2,
    component: SceneViewport, // Same as scene but with play mode controls
    description: "Game preview viewport",
  },
  code: {
    pluginId: "core",
    id: "code",
    title: "Code",
    icon: Code,
    component: () => <div className="p-4">Code Editor (Coming Soon)</div>, // Placeholder
    description: "Code editor for scripts",
  },
  inspector: {
    pluginId: "core",
    id: "inspector",
    title: "Inspector",
    icon: FileText,
    component: InspectorPanel,
    defaultSize: { width: 300 },
    description: "Component properties editor",
  },
  console: {
    pluginId: "core",
    id: "console",
    title: "Console",
    icon: Terminal,
    component: ConsolePanel,
    defaultSize: { height: 200 },
    description: "Log messages and errors",
  },
  assets: {
    pluginId: "core",
    id: "assets",
    title: "Assets",
    icon: Folder,
    component: AssetsPanel,
    defaultSize: { height: 200 },
    description: "Project asset browser",
  },
};

/**
 * Get panel definition by type
 * Supports both simple types ("hierarchy") and instance IDs ("hierarchy-a1b2c3d4")
 */
export function getPanelDefinition(panelType: PanelType): PanelDefinition {
  // Extract base panel type from instance ID (e.g., "hierarchy-a1b2c3d4" -> "hierarchy")
  const baseType = panelType.split("-")[0] as PanelType;

  // Return definition for base type, fallback to panelType if no dash found
  return PANEL_REGISTRY[baseType] || PANEL_REGISTRY[panelType];
}

/**
 * Get all panel definitions
 */
export function getAllPanelDefinitions(): PanelDefinition[] {
  return Object.values(PANEL_REGISTRY);
}

/**
 * Check if a panel type is valid
 * Supports both simple types and instance IDs
 */
export function isValidPanelType(type: string): type is PanelType {
  // Extract base type and check if it exists in registry
  const baseType = type.split("-")[0];
  return baseType in PANEL_REGISTRY;
}
