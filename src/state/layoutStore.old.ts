// Layout Store with Zustand
// Feature: 003-docking-panel-system
// Based on LIBRARY_BEST_PRACTICES.md - Zustand best practices

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // Required for devtools typing
import type {
  Zone,
  LeafZone,
  SplitZone,
  PanelType,
  LayoutStore,
  SerializedLayout,
} from "@/types/layout";
import { v4 as uuidv4 } from "uuid";
import { produce } from "immer";

/**
 * Default Layout Configuration
 *
 * Structure:
 * ┌──────────────────────────────────────────────────────┐
 * │                      Toolbar                         │
 * ├──────────┬───────────────────────┬───────────────────┤
 * │          │                       │                   │
 * │ Hierarchy│        Scene          │     Inspector     │
 * │          │                       │                   │
 * │          │                       │                   │
 * ├──────────┴───────────────────────┴───────────────────┤
 * │         Console | Assets (tabs)                      │
 * └──────────────────────────────────────────────────────┘
 */
export function getDefaultLayout(): Zone {
  const topSplitId = uuidv4();
  const leftZoneId = uuidv4();
  const centerZoneId = uuidv4();
  const rightZoneId = uuidv4();
  const bottomZoneId = uuidv4();

  const topSplit: SplitZone = {
    id: topSplitId,
    type: "split",
    orientation: "horizontal",
    sizes: [0.2, 0.8], // Will be further split
    children: [
      // Left: Hierarchy
      {
        id: leftZoneId,
        type: "leaf",
        panels: ["hierarchy"],
        activePanel: "hierarchy",
      },
      // Right side: Center + Inspector
      {
        id: uuidv4(),
        type: "split",
        orientation: "horizontal",
        sizes: [0.75, 0.25], // 60% scene, 20% inspector (of the 80%)
        children: [
          // Center: Scene
          {
            id: centerZoneId,
            type: "leaf",
            panels: ["scene"],
            activePanel: "scene",
          },
          // Right: Inspector
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

  const bottomZone: LeafZone = {
    id: bottomZoneId,
    type: "leaf",
    panels: ["console", "assets"],
    activePanel: "console",
  };

  const rootZone: SplitZone = {
    id: "root",
    type: "split",
    orientation: "vertical",
    sizes: [0.75, 0.25], // 75% top, 25% bottom
    children: [topSplit, bottomZone],
  };

  return rootZone;
}

/**
 * Layout Store with Zustand
 *
 * Middleware stack (outer to inner):
 * 1. devtools - Redux DevTools integration
 * 2. persist - localStorage persistence
 * 3. immer - Immutable state updates with mutation syntax
 *
 * Best practices from LIBRARY_BEST_PRACTICES.md:
 * - Use curried syntax for TypeScript inference
 * - Chain middleware in correct order
 * - Exclude transient state (dragState) from persistence
 * - Use Immer for complex nested updates
 */
export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ===== State =====
        rootZone: getDefaultLayout(),
        dragState: null,

        // ===== Layout Management =====
        setLayout: (zone) =>
          set((state) => {
            state.rootZone = zone;
          }),

        resetLayout: () =>
          set((state) => {
            state.rootZone = getDefaultLayout();
            state.dragState = null;
          }),

        // ===== Drag Operations =====
        startDrag: (panelId, zoneId) =>
          set((state) => {
            state.dragState = {
              draggedPanelId: panelId,
              sourceZoneId: zoneId,
              dropTargetZoneId: null,
              dropMode: null,
              mousePosition: { x: 0, y: 0 },
            };
          }),

        updateDragTarget: (targetZoneId, dropMode) =>
          set((state) => {
            if (state.dragState) {
              state.dragState.dropTargetZoneId = targetZoneId;
              state.dragState.dropMode = dropMode;
            }
          }),

        commitDrag: () =>
          set((state) => {
            const { dragState } = state;
            if (!dragState || !dragState.dropTargetZoneId) {
              state.dragState = null;
              return;
            }

            const { draggedPanelId, sourceZoneId, dropTargetZoneId, dropMode } =
              dragState;

            if (!draggedPanelId || !sourceZoneId) {
              state.dragState = null;
              return;
            }

            // Apply layout transformation based on drop mode
            switch (dropMode) {
              case "move":
                // Move panel to target zone (replace content)
                get().movePanel(draggedPanelId, dropTargetZoneId);
                break;
              case "tab":
                // Add panel as tab to target zone
                get().addTabToZone(draggedPanelId, dropTargetZoneId);
                break;
              case "split-h":
                // Split target zone horizontally
                get().splitZone(dropTargetZoneId, "horizontal", draggedPanelId);
                break;
              case "split-v":
                // Split target zone vertically
                get().splitZone(dropTargetZoneId, "vertical", draggedPanelId);
                break;
            }

            state.dragState = null;
          }),

        cancelDrag: () =>
          set((state) => {
            state.dragState = null;
          }),

        // ===== Panel Operations =====
        movePanel: (panelId, targetZoneId) =>
          set((state) => {
            // Find source zone and remove panel
            const sourceZone = findLeafZoneWithPanel(state.rootZone, panelId);
            if (sourceZone) {
              sourceZone.panels = sourceZone.panels.filter(
                (p) => p !== panelId
              );
              if (sourceZone.activePanel === panelId) {
                sourceZone.activePanel =
                  sourceZone.panels.length > 0 ? sourceZone.panels[0] : null;
              }
            }

            // Find target zone and add panel
            const targetZone = findZoneById(state.rootZone, targetZoneId);
            if (targetZone && targetZone.type === "leaf") {
              targetZone.panels = [panelId]; // Replace all panels
              targetZone.activePanel = panelId;
            }
          }),

        addTabToZone: (panelId, targetZoneId) =>
          set((state) => {
            // Find source zone and remove panel
            const sourceZone = findLeafZoneWithPanel(state.rootZone, panelId);
            if (sourceZone) {
              sourceZone.panels = sourceZone.panels.filter(
                (p) => p !== panelId
              );
              if (sourceZone.activePanel === panelId) {
                sourceZone.activePanel =
                  sourceZone.panels.length > 0 ? sourceZone.panels[0] : null;
              }
            }

            // Find target zone and add panel as tab
            const targetZone = findZoneById(state.rootZone, targetZoneId);
            if (targetZone && targetZone.type === "leaf") {
              if (!targetZone.panels.includes(panelId)) {
                targetZone.panels.push(panelId);
              }
              targetZone.activePanel = panelId; // Make newly added panel active
            }
          }),

        setActiveTab: (zoneId, panelId) =>
          set((state) => {
            const zone = findZoneById(state.rootZone, zoneId);
            if (zone && zone.type === "leaf") {
              if (zone.panels.includes(panelId)) {
                zone.activePanel = panelId;
              }
            }
          }),

        // ===== Zone Operations =====
        splitZone: (zoneId, orientation, panelId, sizes = [0.5, 0.5]) =>
          set((state) => {
            const zone = findZoneById(state.rootZone, zoneId);
            if (!zone || zone.type !== "leaf") return;

            // Remove panel from source zone
            const sourceZone = findLeafZoneWithPanel(state.rootZone, panelId);
            if (sourceZone) {
              sourceZone.panels = sourceZone.panels.filter(
                (p) => p !== panelId
              );
              if (sourceZone.activePanel === panelId) {
                sourceZone.activePanel =
                  sourceZone.panels.length > 0 ? sourceZone.panels[0] : null;
              }
            }

            // Create two new leaf zones
            const newLeftId = uuidv4();
            const newRightId = uuidv4();

            const newLeftZone: LeafZone = {
              id: newLeftId,
              type: "leaf",
              panels: [panelId],
              activePanel: panelId,
            };

            const newRightZone: LeafZone = {
              id: newRightId,
              type: "leaf",
              panels: zone.panels,
              activePanel: zone.activePanel,
            };

            // Convert current zone to split
            const splitZone = zone as unknown as SplitZone;
            splitZone.type = "split";
            splitZone.orientation = orientation;
            splitZone.children = [newLeftZone, newRightZone];
            splitZone.sizes = sizes;
            // Remove leaf-specific properties
            delete (splitZone as any).panels;
            delete (splitZone as any).activePanel;
          }),

        updateZoneSizes: (zoneId, sizes) =>
          set((state) => {
            const zone = findZoneById(state.rootZone, zoneId);
            if (zone && zone.type === "split") {
              // Normalize sizes to ensure they sum to 1.0
              const total = sizes[0] + sizes[1];
              zone.sizes = [sizes[0] / total, sizes[1] / total];
            }
          }),

        // ===== Persistence =====
        saveLayout: () => {
          // Persistence is automatic with persist middleware
          // This method can be used to trigger manual saves if needed
          const { rootZone } = get();
          const layout: SerializedLayout = {
            version: "1.0.0",
            rootZone,
            timestamp: Date.now(),
          };
          // The persist middleware handles the actual saving
          return layout;
        },

        loadLayout: () => {
          // Loading is automatic on store initialization
          // This method can be used to reload from storage if needed
          // The persist middleware handles the actual loading
        },
      })),
      {
        name: "layout-storage", // localStorage key
        version: 1, // For migrations
        partialize: (state) => ({
          // Only persist rootZone, exclude dragState
          rootZone: state.rootZone,
        }),
        // Migration strategy for future schema changes
        migrate: (persistedState: any, version) => {
          if (version === 0) {
            // Example migration from v0 to v1
            // Transform old state format to new format
            return persistedState;
          }
          return persistedState;
        },
      }
    ),
    { name: "LayoutStore" } // Redux DevTools name
  )
);

// ===== Helper Functions =====

/**
 * Find a zone by ID in the zone tree (recursive)
 */
function findZoneById(zone: Zone, id: string): Zone | null {
  if (zone.id === id) return zone;

  if (zone.type === "split") {
    const leftResult = findZoneById(zone.children[0], id);
    if (leftResult) return leftResult;

    const rightResult = findZoneById(zone.children[1], id);
    if (rightResult) return rightResult;
  }

  return null;
}

/**
 * Find the leaf zone that contains a specific panel (recursive)
 */
function findLeafZoneWithPanel(
  zone: Zone,
  panelId: PanelType
): LeafZone | null {
  if (zone.type === "leaf") {
    if (zone.panels.includes(panelId)) {
      return zone;
    }
    return null;
  }

  if (zone.type === "split") {
    const leftResult = findLeafZoneWithPanel(zone.children[0], panelId);
    if (leftResult) return leftResult;

    const rightResult = findLeafZoneWithPanel(zone.children[1], panelId);
    if (rightResult) return rightResult;
  }

  return null;
}
