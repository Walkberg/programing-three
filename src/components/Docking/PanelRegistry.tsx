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
import type { PanelType } from "@/types/layout";

// Import panel components
import { HierarchyPanel } from "@/components/Hierarchy/HierarchyPanel";
import { SceneViewport } from "@/components/Viewport/SceneViewport";
import { InspectorPanel } from "@/components/Inspector/InspectorPanel";
import { ConsolePanel } from "@/components/Console/ConsolePanel";
import { AssetsPanel } from "@/components/Assets/AssetsPanel";

/**
 * Panel Definition
 * Metadata and component for a panel type
 */
export interface PanelDefinition {
  id: PanelType;
  title: string;
  icon: LucideIcon;
  component: React.ComponentType;
  defaultSize?: { width?: number; height?: number };
  description?: string;
}

/**
 * Panel Registry
 * Central registry mapping panel types to their definitions
 */
export const PANEL_REGISTRY: Record<PanelType, PanelDefinition> = {
  hierarchy: {
    id: "hierarchy",
    title: "Hierarchy",
    icon: Layers,
    component: HierarchyPanel,
    defaultSize: { width: 250 },
    description: "Scene object hierarchy tree",
  },
  scene: {
    id: "scene",
    title: "Scene",
    icon: Box,
    component: SceneViewport,
    description: "3D scene viewport for editing",
  },
  game: {
    id: "game",
    title: "Game",
    icon: Gamepad2,
    component: SceneViewport, // Same as scene but with play mode controls
    description: "Game preview viewport",
  },
  code: {
    id: "code",
    title: "Code",
    icon: Code,
    component: () => <div className="p-4">Code Editor (Coming Soon)</div>, // Placeholder
    description: "Code editor for scripts",
  },
  inspector: {
    id: "inspector",
    title: "Inspector",
    icon: FileText,
    component: InspectorPanel,
    defaultSize: { width: 300 },
    description: "Component properties editor",
  },
  console: {
    id: "console",
    title: "Console",
    icon: Terminal,
    component: ConsolePanel,
    defaultSize: { height: 200 },
    description: "Log messages and errors",
  },
  assets: {
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
 */
export function getPanelDefinition(panelType: PanelType): PanelDefinition {
  return PANEL_REGISTRY[panelType];
}

/**
 * Get all panel definitions
 */
export function getAllPanelDefinitions(): PanelDefinition[] {
  return Object.values(PANEL_REGISTRY);
}

/**
 * Check if a panel type is valid
 */
export function isValidPanelType(type: string): type is PanelType {
  return type in PANEL_REGISTRY;
}
