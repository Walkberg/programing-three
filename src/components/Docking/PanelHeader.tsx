// Panel Header Component
// Feature: 003-docking-panel-system - US2
// Panel header with icon, title, and drag handle

import React from "react";
import { GripVertical } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDraggablePanel } from "@/hooks/useDragAndDrop";
import type { PanelType } from "@/editor/plugin/plugin.type";

interface PanelHeaderProps {
  panelType: PanelType;
  zoneId: string;
  title: string;
  icon: LucideIcon;
  className?: string;
}

/**
 * Panel Header Component
 * Displays panel icon, title, and acts as drag handle
 * Draggable via @dnd-kit (US2)
 */
export const PanelHeader = React.memo<PanelHeaderProps>(
  ({ panelType, zoneId, title, icon: Icon, className = "" }) => {
    const { draggableProps, isDragging } = useDraggablePanel(panelType, zoneId);

    return (
      <div
        {...draggableProps}
        className={`
          flex items-center gap-2 px-3 py-2 bg-muted border-b border-border
          cursor-move transition-opacity duration-150
          ${isDragging ? "opacity-50" : "opacity-100"}
          ${className}
        `}
        data-panel-header={panelType}
        data-zone-id={zoneId}
      >
        {/* Drag Handle Icon */}
        <GripVertical className="w-4 h-4 text-muted-foreground" />

        {/* Panel Icon */}
        <Icon className="w-4 h-4 text-muted-foreground" />

        {/* Panel Title */}
        <span className="text-sm font-medium text-foreground select-none">
          {title}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Future: Panel actions (close, settings, etc.) */}
      </div>
    );
  }
);

PanelHeader.displayName = "PanelHeader";
