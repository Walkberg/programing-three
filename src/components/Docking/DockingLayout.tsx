// Docking Layout Component
// Feature: 003-docking-panel-system - US2
// Root layout manager with drag and drop support

import React, { useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useLayoutStore } from "@/state/layoutStore";
import { Zone } from "./Zone";
import { useDragEndHandler } from "@/hooks/useDragAndDrop";
import { getPanelDefinition } from "./PanelRegistry";

interface DockingLayoutProps {
  className?: string;
}

/**
 * Docking Layout Component
 * Root component for the docking panel system with drag and drop
 * Wraps zone tree in DndContext (US2)
 */
export const DockingLayout = React.memo<DockingLayoutProps>(
  ({ className = "" }) => {
    const rootZone = useLayoutStore((state) => state.rootZone);
    const dragState = useLayoutStore((state) => state.dragState);
    const startDrag = useLayoutStore((state) => state.startDrag);
    const loadLayout = useLayoutStore((state) => state.loadLayout);
    const { handleDragMove, handleDragEnd, handleDragCancel } =
      useDragEndHandler();

    // Configure drag sensors
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8, // 8px movement required to start drag
        },
      })
    );

    // Handle drag start
    const handleDragStart = (event: any) => {
      const panelId = event.active.data.current?.panelId;
      const zoneId = event.active.data.current?.zoneId;

      if (panelId && zoneId) {
        startDrag(panelId, zoneId);
      }
    };

    // Load persisted layout on mount
    useEffect(() => {
      loadLayout();
    }, [loadLayout]);

    // Handle Escape key to cancel drag
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && dragState) {
          handleDragCancel();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dragState, handleDragCancel]);

    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className={`w-full h-full overflow-hidden bg-background p-1 ${className}`}
          data-docking-layout="root"
        >
          <Zone zone={rootZone} />
        </div>

        {/* Drag Overlay - shows panel being dragged */}
        <DragOverlay>
          {dragState?.draggedPanelId && (
            <DragPreview panelId={dragState.draggedPanelId} />
          )}
        </DragOverlay>
      </DndContext>
    );
  }
);

DockingLayout.displayName = "DockingLayout";

/**
 * Drag Preview Component
 * Shows a preview of the panel being dragged
 */
const DragPreview: React.FC<{ panelId: string }> = ({ panelId }) => {
  const definition = getPanelDefinition(panelId as any);
  const Icon = definition.icon;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg shadow-lg opacity-90">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">
        {definition.title}
      </span>
    </div>
  );
};
