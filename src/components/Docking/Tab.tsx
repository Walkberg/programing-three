// Tab Component
// Feature: 003-docking-panel-system
// Individual tab with icon, name, and active state

import React from "react";
import type { PanelType } from "@/types/layout";
import { getPanelDefinition } from "./PanelRegistry";

interface TabProps {
  panelType: PanelType;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Tab Component
 * Represents a single tab in a TabBar
 * Displays panel icon and title, highlights when active
 */
export const Tab = React.memo<TabProps>(
  ({ panelType, isActive, onClick, className = "" }) => {
    const definition = getPanelDefinition(panelType);
    const Icon = definition.icon;

    return (
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={onClick}
        className={`
          flex items-center gap-2 px-3 py-2
          text-sm font-medium
          border-r border-border
          transition-colors duration-150
          select-none cursor-pointer
          ${
            isActive
              ? "bg-background text-foreground border-b-2 border-b-primary"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }
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
