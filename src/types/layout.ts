// Types for the Docking Panel System
// Feature: 003-docking-panel-system
// Based on data-model.md and LIBRARY_BEST_PRACTICES.md

import { type LucideIcon } from "lucide-react";
import { type ComponentType } from "react";

/**
 * Panel Types
 * Defines all available panel types in the editor
 */
export type PanelType =
  | "hierarchy"
  | "scene"
  | "game"
  | "code"
  | "inspector"
  | "console"
  | "assets";

/**
 * Panel Metadata
 * Defines the properties of a panel that can be docked
 */
export interface PanelMetadata {
  /** Unique identifier for the panel */
  id: PanelType;
  /** Panel type (same as id for panel metadata) */
  type: PanelType;
  /** Display name shown in headers and tabs */
  title: string;
  /** Lucide icon component for the panel */
  icon: LucideIcon;
  /** React component to render as panel content */
  component: ComponentType;
  /** Optional default zone ID for initial placement */
  defaultZone?: string;
}

/**
 * Zone Types
 * Discriminated union for leaf and split zones
 */
export type ZoneType = "leaf" | "split";

/**
 * Leaf Zone
 * Contains panels (can be multiple for tabs)
 */
export interface LeafZone {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Zone type discriminator */
  type: "leaf";
  /** Array of panel IDs in this zone */
  panels: PanelType[];
  /** Currently active panel (for tabs), null if panels is empty */
  activePanel: PanelType | null;
}

/**
 * Split Zone
 * Contains two child zones arranged horizontally or vertically
 */
export interface SplitZone {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Zone type discriminator */
  type: "split";
  /** Split direction */
  orientation: "horizontal" | "vertical";
  /** Exactly 2 child zones (can be leaf or split) */
  children: [Zone, Zone];
  /** Size ratios for children (0-1, must sum to 1.0) */
  sizes: [number, number];
}

/**
 * Zone
 * Recursive type representing either a leaf or split zone
 */
export type Zone = LeafZone | SplitZone;

/**
 * Drop Mode
 * Defines how a dragged panel will be dropped
 */
export type DropMode = "move" | "tab" | "split-h" | "split-v";

/**
 * Split Position
 * Defines where a split will occur (which side the new panel will be on)
 */
export type SplitPosition = "left" | "right" | "top" | "bottom";

/**
 * Drag State
 * Represents the current drag operation state (transient, not persisted)
 */
export interface DragState {
  /** ID of panel being dragged */
  draggedPanelId: PanelType | null;
  /** ID of zone where drag started */
  sourceZoneId: string | null;
  /** ID of zone where panel will be dropped */
  dropTargetZoneId: string | null;
  /** How panel will be dropped */
  dropMode: DropMode | null;
  /** Where the split will occur (for split modes) */
  splitPosition?: SplitPosition;
  /** Current mouse coordinates */
  mousePosition: { x: number; y: number };
}

/**
 * Layout
 * Top-level container for entire editor workspace configuration
 */
export interface Layout {
  /** Serialization format version (for migrations) */
  version: string;
  /** Root zone of the tree (ID must be 'root') */
  rootZone: Zone;
  /** Unix timestamp of last modification */
  timestamp: number;
}

/**
 * Serialized Layout
 * Format used for localStorage persistence
 */
export interface SerializedLayout {
  version: string;
  rootZone: Zone;
  timestamp: number;
}

/**
 * Layout Store State
 * Zustand store state for layout management
 */
export interface LayoutState {
  /** Root zone of the layout tree */
  rootZone: Zone;
  /** Current drag state (null when not dragging) */
  dragState: DragState | null;
}

/**
 * Layout Store Actions
 * Zustand store actions for layout manipulation
 */
export interface LayoutActions {
  // Layout management
  /** Set the entire layout (used for loading) */
  setLayout: (zone: Zone) => void;
  /** Reset layout to default configuration */
  resetLayout: () => void;

  // Drag operations
  /** Start dragging a panel */
  startDrag: (panelId: PanelType, zoneId: string) => void;
  /** Update drag target during drag move */
  updateDragTarget: (
    targetZoneId: string | null,
    dropMode: DropMode | null,
    splitPosition?: SplitPosition
  ) => void;
  /** Commit drag operation and update layout */
  commitDrag: () => void;
  /** Cancel drag operation */
  cancelDrag: () => void;

  // Panel operations
  /** Move panel to a different zone (replaces zone content) */
  movePanel: (panelId: PanelType, targetZoneId: string) => void;
  /** Add panel as tab to existing zone */
  addTabToZone: (panelId: PanelType, targetZoneId: string) => void;
  /** Set active tab in a zone */
  setActiveTab: (zoneId: string, panelId: PanelType) => void;

  // Zone operations
  /** Split a zone horizontally or vertically */
  splitZone: (
    zoneId: string,
    orientation: "horizontal" | "vertical",
    panelId: PanelType,
    splitPosition?: SplitPosition,
    sizes?: [number, number]
  ) => void;
  /** Update zone sizes (for splitter dragging) */
  updateZoneSizes: (zoneId: string, sizes: [number, number]) => void;

  // Persistence
  /** Save layout to localStorage */
  saveLayout: () => void;
  /** Load layout from localStorage */
  loadLayout: () => void;
}

/**
 * Layout Store
 * Combined Zustand store type
 */
export type LayoutStore = LayoutState & LayoutActions;

/**
 * Type guards for Zone discrimination
 */
export function isLeafZone(zone: Zone): zone is LeafZone {
  return zone.type === "leaf";
}

export function isSplitZone(zone: Zone): zone is SplitZone {
  return zone.type === "split";
}

/**
 * Type guard for DragState (checks if currently dragging)
 */
export function isDragging(
  dragState: DragState | null
): dragState is DragState {
  return dragState !== null && dragState.draggedPanelId !== null;
}
