// Docking Layout Component
// Feature: 003-docking-panel-system
// Root layout manager that renders the zone tree

import React, { useEffect } from "react";
import { useLayoutStore } from "@/state/layoutStore";
import { Zone } from "./Zone";

interface DockingLayoutProps {
  className?: string;
}

/**
 * Docking Layout Component
 * Root component for the docking panel system
 * Renders the zone tree from layoutStore
 *
 * Future enhancements (US2+):
 * - DndContext for drag and drop
 * - Drop zone indicators
 * - Drag overlay
 */
export const DockingLayout = React.memo<DockingLayoutProps>(
  ({ className = "" }) => {
    const rootZone = useLayoutStore((state) => state.rootZone);
    const loadLayout = useLayoutStore((state) => state.loadLayout);

    // Load persisted layout on mount
    useEffect(() => {
      loadLayout();
    }, [loadLayout]);

    return (
      <div
        className={`w-full h-full overflow-hidden bg-background p-1 ${className}`}
        data-docking-layout="root"
      >
        <Zone zone={rootZone} />
      </div>
    );
  }
);

DockingLayout.displayName = "DockingLayout";
