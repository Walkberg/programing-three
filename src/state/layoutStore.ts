// Simplified Layout Store without immer middleware
// Feature: 003-docking-panel-system

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Zone,
  LeafZone,
  SplitZone,
  PanelType,
  LayoutStore,
  LayoutPreset,
} from "@/types/layout";
import { v4 as uuidv4 } from "uuid";
import { LayoutSerializer } from "@/services/LayoutSerializer";
import { toast } from "@/hooks/use-toast";

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
    sizes: [0.2, 0.8],
    children: [
      {
        id: leftZoneId,
        type: "leaf",
        panels: ["hierarchy"],
        activePanel: "hierarchy",
      },
      {
        id: uuidv4(),
        type: "split",
        orientation: "horizontal",
        sizes: [0.75, 0.25],
        children: [
          {
            id: centerZoneId,
            type: "leaf",
            panels: ["scene"],
            activePanel: "scene",
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
    sizes: [0.75, 0.25],
    children: [topSplit, bottomZone],
  };

  return rootZone;
}

const findFirstLeafZone = (zone: any): any => {
  if (zone.type === "leaf") {
    return zone;
  }
  if (zone.type === "split" && zone.children) {
    return findFirstLeafZone(zone.children[0]);
  }
  return null;
};

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        rootZone: getDefaultLayout(),
        dragState: null,

        setLayout: (zone) => set({ rootZone: zone }),

        addDockerPanel: (panelId: PanelType) => {
          const { rootZone } = get();
          const firstLeaf = findFirstLeafZone(rootZone);
          if (firstLeaf) {
            // Generate unique panel instance ID
            // Format: panelType-uuid (e.g., "hierarchy-a1b2c3d4")
            const uniquePanelId = `${panelId}-${uuidv4().slice(0, 8)}` as any;

            // Add panel to the first leaf zone
            useLayoutStore.getState().addTabToZone(uniquePanelId, firstLeaf.id);

            toast({
              title: "Panel Added",
              description: ` added to layout`,
            });

            return true;
          }
          return false;
        },

        resetLayout: () => {
          set({ rootZone: getDefaultLayout(), dragState: null });

          // Clear saved layout from storage
          LayoutSerializer.clear();

          toast({
            title: "Layout Reset",
            description: "Workspace layout has been reset to default.",
          });
        },

        startDrag: (panelId, zoneId) =>
          set({
            dragState: {
              draggedPanelId: panelId,
              sourceZoneId: zoneId,
              dropTargetZoneId: null,
              dropMode: null,
              mousePosition: { x: 0, y: 0 },
            },
          }),

        updateDragTarget: (targetZoneId, dropMode, splitPosition) =>
          set((state) => ({
            dragState: state.dragState
              ? {
                  ...state.dragState,
                  dropTargetZoneId: targetZoneId,
                  dropMode,
                  splitPosition,
                }
              : null,
          })),

        commitDrag: () => {
          const { dragState } = get();

          if (!dragState || !dragState.dropTargetZoneId) {
            set({ dragState: null });
            return;
          }

          const {
            draggedPanelId,
            sourceZoneId,
            dropTargetZoneId,
            dropMode,
            splitPosition,
          } = dragState;

          if (!draggedPanelId || !sourceZoneId) {
            set({ dragState: null });
            return;
          }

          switch (dropMode) {
            case "move":
              get().movePanel(draggedPanelId, dropTargetZoneId);
              break;
            case "tab":
              get().addTabToZone(draggedPanelId, dropTargetZoneId);
              break;
            case "split-h":
              get().splitZone(
                dropTargetZoneId,
                "horizontal",
                draggedPanelId,
                splitPosition
              );
              break;
            case "split-v":
              get().splitZone(
                dropTargetZoneId,
                "vertical",
                draggedPanelId,
                splitPosition
              );
              break;
          }

          set({ dragState: null });
        },

        cancelDrag: () => set({ dragState: null }),

        movePanel: (panelId, targetZoneId) => {
          const { rootZone } = get();
          const clonedRoot = JSON.parse(JSON.stringify(rootZone));

          const sourceZone = findLeafZoneWithPanel(clonedRoot, panelId);
          const targetZone = findZoneById(clonedRoot, targetZoneId);

          // Don't move if source and target are the same zone
          if (sourceZone && targetZone && sourceZone.id === targetZone.id) {
            return;
          }

          if (sourceZone) {
            sourceZone.panels = sourceZone.panels.filter((p) => p !== panelId);
            sourceZone.activePanel =
              sourceZone.panels.length > 0 ? sourceZone.panels[0] : null;
          }

          if (targetZone && targetZone.type === "leaf") {
            targetZone.panels = [panelId];
            targetZone.activePanel = panelId;
          }

          // Clean up empty zones
          const cleanedRoot = cleanupEmptyZones(clonedRoot);
          if (cleanedRoot) {
            set({ rootZone: cleanedRoot });
          }
        },

        addTabToZone: (panelId, targetZoneId) => {
          const { rootZone } = get();
          const clonedRoot = JSON.parse(JSON.stringify(rootZone));

          const sourceZone = findLeafZoneWithPanel(clonedRoot, panelId);
          const targetZone = findZoneById(clonedRoot, targetZoneId);

          // If source and target are the same zone, just set it as active
          if (sourceZone && targetZone && sourceZone.id === targetZone.id) {
            if (targetZone.type === "leaf") {
              targetZone.activePanel = panelId;
              set({ rootZone: clonedRoot });
            }
            return;
          }

          if (sourceZone) {
            sourceZone.panels = sourceZone.panels.filter((p) => p !== panelId);
            sourceZone.activePanel =
              sourceZone.panels.length > 0 ? sourceZone.panels[0] : null;
          }

          if (targetZone && targetZone.type === "leaf") {
            if (!targetZone.panels.includes(panelId)) {
              targetZone.panels.push(panelId);
            }
            targetZone.activePanel = panelId;
          }

          // Clean up empty zones
          const cleanedRoot = cleanupEmptyZones(clonedRoot);
          if (cleanedRoot) {
            set({ rootZone: cleanedRoot });
          }
        },

        setActiveTab: (zoneId, panelId) => {
          const { rootZone } = get();
          const clonedRoot = JSON.parse(JSON.stringify(rootZone));

          const zone = findZoneById(clonedRoot, zoneId);
          if (zone && zone.type === "leaf") {
            if (zone.panels.includes(panelId)) {
              zone.activePanel = panelId;
            }
          }

          set({ rootZone: clonedRoot });
        },

        splitZone: (
          zoneId,
          orientation,
          panelId,
          splitPosition,
          sizes = [0.5, 0.5] as [number, number]
        ) => {
          const { rootZone } = get();
          const clonedRoot = JSON.parse(JSON.stringify(rootZone));

          const zone = findZoneById(clonedRoot, zoneId);
          if (!zone || zone.type !== "leaf") {
            return;
          }

          const sourceZone = findLeafZoneWithPanel(clonedRoot, panelId);
          if (sourceZone) {
            sourceZone.panels = sourceZone.panels.filter((p) => p !== panelId);
            sourceZone.activePanel =
              sourceZone.panels.length > 0 ? sourceZone.panels[0] : null;
          }

          // Create new zone for dragged panel
          const newPanelZone: LeafZone = {
            id: uuidv4(),
            type: "leaf",
            panels: [panelId],
            activePanel: panelId,
          };

          // Create zone for existing content
          const existingContentZone: LeafZone = {
            id: uuidv4(),
            type: "leaf",
            panels: zone.panels,
            activePanel: zone.activePanel,
          };

          // Determine order based on split position
          // For horizontal: left = new panel first, right = existing first
          // For vertical: top = new panel first, bottom = existing first
          const shouldNewPanelBeFirst =
            splitPosition === "left" || splitPosition === "top";

          const children: [Zone, Zone] = shouldNewPanelBeFirst
            ? [newPanelZone, existingContentZone]
            : [existingContentZone, newPanelZone];

          const splitZone: SplitZone = {
            id: zone.id,
            type: "split",
            orientation,
            children,
            sizes,
          };

          Object.assign(zone, splitZone);

          // Clean up empty zones
          const cleanedRoot = cleanupEmptyZones(clonedRoot);
          if (cleanedRoot) {
            set({ rootZone: cleanedRoot });
          }
        },

        updateZoneSizes: (zoneId, sizes) => {
          const { rootZone } = get();
          const clonedRoot = JSON.parse(JSON.stringify(rootZone));

          const zone = findZoneById(clonedRoot, zoneId);
          if (zone && zone.type === "split") {
            const total = sizes[0] + sizes[1];
            zone.sizes = [sizes[0] / total, sizes[1] / total];
          }

          set({ rootZone: clonedRoot });
        },

        saveLayout: () => {
          const { rootZone } = get();
          const success = LayoutSerializer.save(rootZone);

          if (success) {
            toast({
              title: "Layout Saved",
              description: "Your workspace layout has been saved successfully.",
            });
          } else {
            toast({
              title: "Save Failed",
              description: "Failed to save layout. Please try again.",
              variant: "destructive",
            });
          }

          return success;
        },

        loadLayout: () => {
          try {
            const loadedZone = LayoutSerializer.load();
            set({ rootZone: loadedZone });

            toast({
              title: "Layout Loaded",
              description: "Your workspace layout has been restored.",
            });

            return true;
          } catch (error) {
            console.error("[LayoutStore] Failed to load layout:", error);

            toast({
              title: "Load Failed",
              description: "Failed to load layout. Using default layout.",
              variant: "destructive",
            });

            // Fall back to default
            set({ rootZone: getDefaultLayout() });
            return false;
          }
        },

        // ==================== PRESET MANAGEMENT ====================

        savePreset: (name: string, description?: string) => {
          const { rootZone } = get();
          const id = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

          const preset: LayoutPreset = {
            id,
            name,
            isDefault: false,
            timestamp: Date.now(),
            layout: rootZone,
            description,
          };

          const success = LayoutSerializer.savePreset(preset);

          if (success) {
            toast({
              title: "Preset Saved",
              description: `Layout preset "${name}" has been saved.`,
            });
          } else {
            toast({
              title: "Save Failed",
              description: "Failed to save preset. Please try again.",
              variant: "destructive",
            });
          }

          return success;
        },

        loadPreset: (id: string) => {
          const preset = LayoutSerializer.loadPreset(id);

          if (!preset) {
            toast({
              title: "Load Failed",
              description: "Preset not found.",
              variant: "destructive",
            });
            return false;
          }

          // Validate preset layout before applying (US6/T101)
          try {
            LayoutSerializer.validateZoneTree(preset.layout);
          } catch (error) {
            console.error("[LayoutStore] Invalid preset layout:", id, error);

            toast({
              title: "Invalid Preset",
              description:
                "This preset contains invalid data. Using default layout.",
              variant: "destructive",
            });

            // Fallback to default
            set({ rootZone: getDefaultLayout() });
            return false;
          }

          set({ rootZone: preset.layout });
          LayoutSerializer.setActivePresetId(id);

          toast({
            title: "Preset Loaded",
            description: `Layout preset "${preset.name}" has been applied.`,
          });

          return true;
        },

        deletePreset: (id: string) => {
          const preset = LayoutSerializer.loadPreset(id);

          if (!preset) {
            toast({
              title: "Delete Failed",
              description: "Preset not found.",
              variant: "destructive",
            });
            return false;
          }

          if (preset.isDefault) {
            toast({
              title: "Cannot Delete",
              description: "Built-in presets cannot be deleted.",
              variant: "destructive",
            });
            return false;
          }

          const success = LayoutSerializer.deletePreset(id);

          if (success) {
            toast({
              title: "Preset Deleted",
              description: `Layout preset "${preset.name}" has been deleted.`,
            });
          } else {
            toast({
              title: "Delete Failed",
              description: "Failed to delete preset. Please try again.",
              variant: "destructive",
            });
          }

          return success;
        },

        renamePreset: (id: string, newName: string) => {
          const preset = LayoutSerializer.loadPreset(id);

          if (!preset) {
            toast({
              title: "Rename Failed",
              description: "Preset not found.",
              variant: "destructive",
            });
            return false;
          }

          if (preset.isDefault) {
            toast({
              title: "Cannot Rename",
              description: "Built-in presets cannot be renamed.",
              variant: "destructive",
            });
            return false;
          }

          const success = LayoutSerializer.renamePreset(id, newName);

          if (success) {
            toast({
              title: "Preset Renamed",
              description: `Preset renamed to "${newName}".`,
            });
          } else {
            toast({
              title: "Rename Failed",
              description: "Failed to rename preset. Please try again.",
              variant: "destructive",
            });
          }

          return success;
        },

        listPresets: () => {
          return LayoutSerializer.listPresets();
        },

        getActivePresetId: () => {
          return LayoutSerializer.getActivePresetId();
        },
      }),
      {
        name: "layout-storage",
        partialize: (state) => ({
          rootZone: state.rootZone,
        }),
      }
    ),
    { name: "LayoutStore" }
  )
);

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

/**
 * Clean up empty zones after drag operations
 * Removes empty leaf zones and collapses split zones with only one child
 */
function cleanupEmptyZones(zone: Zone): Zone | null {
  // If it's a leaf zone with no panels, mark it for removal
  if (zone.type === "leaf") {
    return zone.panels.length > 0 ? zone : null;
  }

  // If it's a split zone, recursively clean children
  if (zone.type === "split") {
    const cleanedLeft = cleanupEmptyZones(zone.children[0]);
    const cleanedRight = cleanupEmptyZones(zone.children[1]);

    // Both children are empty -> remove this split
    if (!cleanedLeft && !cleanedRight) {
      return null;
    }

    // Left child is empty -> return right child (collapse)
    if (!cleanedLeft && cleanedRight) {
      // Preserve the ID if collapsing to avoid breaking references
      if (cleanedRight.type === "leaf") {
        return {
          ...cleanedRight,
          id: zone.id,
        };
      }
      return cleanedRight;
    }

    // Right child is empty -> return left child (collapse)
    if (cleanedLeft && !cleanedRight) {
      // Preserve the ID if collapsing to avoid breaking references
      if (cleanedLeft.type === "leaf") {
        return {
          ...cleanedLeft,
          id: zone.id,
        };
      }
      return cleanedLeft;
    }

    // Both children exist -> keep the split with cleaned children
    return {
      ...zone,
      children: [cleanedLeft!, cleanedRight!] as [Zone, Zone],
    };
  }

  return zone;
}
