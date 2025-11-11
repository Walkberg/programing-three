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
  SerializedLayout,
} from "@/types/layout";
import { v4 as uuidv4 } from "uuid";

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

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        rootZone: getDefaultLayout(),
        dragState: null,

        setLayout: (zone) => set({ rootZone: zone }),

        resetLayout: () =>
          set({ rootZone: getDefaultLayout(), dragState: null }),

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

        updateDragTarget: (targetZoneId, dropMode) =>
          set((state) => ({
            dragState: state.dragState
              ? {
                  ...state.dragState,
                  dropTargetZoneId: targetZoneId,
                  dropMode,
                }
              : null,
          })),

        commitDrag: () => {
          const { dragState } = get();

          if (!dragState || !dragState.dropTargetZoneId) {
            set({ dragState: null });
            return;
          }

          const { draggedPanelId, sourceZoneId, dropTargetZoneId, dropMode } =
            dragState;

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
              get().splitZone(dropTargetZoneId, "horizontal", draggedPanelId);
              break;
            case "split-v":
              get().splitZone(dropTargetZoneId, "vertical", draggedPanelId);
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

          set({ rootZone: clonedRoot });
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

          set({ rootZone: clonedRoot });
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

        splitZone: (zoneId, orientation, panelId, sizes = [0.5, 0.5]) => {
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

          const newLeftZone: LeafZone = {
            id: uuidv4(),
            type: "leaf",
            panels: [panelId],
            activePanel: panelId,
          };

          const newRightZone: LeafZone = {
            id: uuidv4(),
            type: "leaf",
            panels: zone.panels,
            activePanel: zone.activePanel,
          };

          const splitZone: SplitZone = {
            id: zone.id,
            type: "split",
            orientation,
            children: [newLeftZone, newRightZone],
            sizes,
          };

          Object.assign(zone, splitZone);

          set({ rootZone: clonedRoot });
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
          const layout: SerializedLayout = {
            version: "1.0.0",
            rootZone,
            timestamp: Date.now(),
          };
          return layout;
        },

        loadLayout: () => {
          // Auto-loaded by persist middleware
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
