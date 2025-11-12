// Tab Component
// Feature: 003-docking-panel-system - US3
// Individual tab with icon, name, and active state (draggable)

import React from "react";
import { getPanelDefinition } from "./PanelRegistry";
import { useDraggablePanel } from "@/hooks/useDragAndDrop";
import type { PanelType } from "@/core/plugin/plugin.type";

interface TabProps {
  panelType: PanelType;
  zoneId: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Tab Component
 * Represents a single tab in a TabBar
 * Displays panel icon and title, highlights when active
 * Can be dragged to separate tabs from groups
 */
export const Tab = React.memo<TabProps>(
  ({ panelType, zoneId, isActive, onClick, className = "" }) => {
    const definition = getPanelDefinition(panelType);
    const Icon = definition.icon;

    const { draggableProps, isDragging } = useDraggablePanel(panelType, zoneId);

    // Extract ref and omit role to avoid conflicts
    const { ref, role: _role, ...otherProps } = draggableProps;

    return (
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={onClick}
        ref={ref}
        {...otherProps}
        className={`
          flex items-center gap-2 px-3 py-2
          text-sm font-medium
          border-r border-border
          transition-colors duration-150
          select-none cursor-move
          ${
            isActive
              ? "bg-background text-foreground border-b-2 border-b-primary"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }
          ${isDragging ? "opacity-50" : ""}
          ${className}
        `}
        data-panel-type={panelType}
        data-active={isActive}
      >
        {/* Tab Icon */}
        <Icon className="w-4 h-4" />

        {/* Tab Title */}
        <span>{definition.title}</span>
      </button>
    );
  }
);

Tab.displayName = "Tab";
