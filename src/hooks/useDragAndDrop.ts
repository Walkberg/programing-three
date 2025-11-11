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

  // Calculate drop mode based on position
  const calculateDropMode = (event: any): "tab" | "split-h" | "split-v" => {
    const { over } = event;
    if (!over) return "tab";

    const dropZoneRect = over.rect;
    if (!dropZoneRect || !event.activatorEvent) return "tab";

    const initialX = event.activatorEvent.clientX;
    const initialY = event.activatorEvent.clientY;
    const deltaX = event.delta?.x || 0;
    const deltaY = event.delta?.y || 0;

    const finalX = initialX + deltaX;
    const finalY = initialY + deltaY;

    // Calculate relative position within zone (0 to 1)
    const relativeX = (finalX - dropZoneRect.left) / dropZoneRect.width;
    const relativeY = (finalY - dropZoneRect.top) / dropZoneRect.height;

    // Edge detection zones (20% on each edge)
    const leftEdge = relativeX < 0.2;
    const rightEdge = relativeX > 0.8;
    const topEdge = relativeY < 0.2;
    const bottomEdge = relativeY > 0.8;

    // Determine split mode based on which edge is closest
    if (leftEdge || rightEdge) {
      return "split-h"; // Horizontal split (side-by-side)
    } else if (topEdge || bottomEdge) {
      return "split-v"; // Vertical split (top-bottom)
    }

    return "tab"; // Center area
  };

  const handleDragMove = (event: any) => {
    const { over } = event;

    if (!over) return;

    const targetZoneId = over.data.current?.zoneId as string;
    if (!targetZoneId) return;

    const dropMode = calculateDropMode(event);
    updateDragTarget(targetZoneId, dropMode);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      cancelDrag();
      return;
    }

    // Extract data from drag event
    const panelId = active.data.current?.panelId;
    const sourceZoneId = active.data.current?.zoneId;
    const targetZoneId = over.data.current?.zoneId;

    if (!panelId || !sourceZoneId || !targetZoneId) {
      cancelDrag();
      return;
    }

    const dropMode = calculateDropMode(event);
    updateDragTarget(targetZoneId, dropMode);
    commitDrag();
  };

  const handleDragCancel = () => {
    cancelDrag();
  };

  return {
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
  };
}
