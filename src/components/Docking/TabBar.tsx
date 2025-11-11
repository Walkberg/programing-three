// Tab Bar Component
// Feature: 003-docking-panel-system
// Renders tabs for multi-panel zones with click-to-switch functionality

import React from "react";
import type { PanelType } from "@/types/layout";
import { Tab } from "./Tab";
import { useLayoutStore } from "@/state/layoutStore";

interface TabBarProps {
  zoneId: string;
  panels: PanelType[];
  activePanel: PanelType;
  className?: string;
}

/**
 * Tab Bar Component
 * Renders a horizontal list of tabs for panels in a zone
 * Handles tab switching via layoutStore
 */
export const TabBar = React.memo<TabBarProps>(
  ({ zoneId, panels, activePanel, className = "" }) => {
    const setActiveTab = useLayoutStore((state) => state.setActiveTab);

    const handleTabClick = (panelType: PanelType) => {
      if (panelType !== activePanel) {
        setActiveTab(zoneId, panelType);
      }
    };

    return (
      <div
        className={`flex items-center bg-muted border-b border-border ${className}`}
        data-zone-id={zoneId}
        role="tablist"
      >
        {panels.map((panelType) => (
          <Tab
            key={panelType}
            panelType={panelType}
            zoneId={zoneId}
            isActive={panelType === activePanel}
            onClick={() => handleTabClick(panelType)}
          />
        ))}
      </div>
    );
  }
);

TabBar.displayName = "TabBar";
