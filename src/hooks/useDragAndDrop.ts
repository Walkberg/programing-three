// useDragAndDrop Hook
// Feature: 003-docking-panel-system - US2
// Integrates @dnd-kit for drag and drop functionality

import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { PanelType } from "@/types/layout";
import { useLayoutStore } from "@/state/layoutStore";

/**
 * Hook for draggable panels
 * Used in PanelHeader to make panels draggable
 */
export function useDraggablePanel(panelId: PanelType, zoneId: string) {
  const startDrag = useLayoutStore((state) => state.startDrag);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel-${panelId}-${zoneId}`,
    data: {
      panelId,
      zoneId,
      type: "panel",
    },
  });

  return {
    draggableProps: {
      ref: setNodeRef,
      ...attributes,
      ...listeners,
    },
    isDragging,
    startDrag: () => startDrag(panelId, zoneId),
  };
}

/**
 * Hook for droppable zones
 * Used in Zone component to make zones accept drops
 */
export function useDroppableZone(zoneId: string) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `zone-${zoneId}`,
    data: {
      zoneId,
      type: "zone",
    },
  });

  return {
    droppableProps: {
      ref: setNodeRef,
    },
    isOver,
    isDraggingPanel: active?.data.current?.type === "panel",
  };
}

/**
 * Hook for handling drag end events
 * Used in DockingLayout to commit drag operations
 */
export function useDragEndHandler() {
  const commitDrag = useLayoutStore((state) => state.commitDrag);
  const cancelDrag = useLayoutStore((state) => state.cancelDrag);
  const updateDragTarget = useLayoutStore((state) => state.updateDragTarget);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      // No valid drop target - cancel drag
      cancelDrag();
      return;
    }

    // Extract data from drag event
    const panelId = active.data.current?.panelId as PanelType;
    const sourceZoneId = active.data.current?.zoneId as string;
    const targetZoneId = over.data.current?.zoneId as string;

    if (!panelId || !sourceZoneId || !targetZoneId) {
      cancelDrag();
      return;
    }

    // For US2, we only support "move" mode (replace zone content)
    // US3 will add "tab" mode, US4 will add "split-h/split-v" modes
    updateDragTarget(targetZoneId, "move");
    commitDrag();
  };

  const handleDragCancel = () => {
    cancelDrag();
  };

  return {
    handleDragEnd,
    handleDragCancel,
  };
}
