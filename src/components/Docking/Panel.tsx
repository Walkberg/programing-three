// Panel Component
// Feature: 003-docking-panel-system
// Wraps panel content with header and provides drag functionality

import React from "react";
import { getPanelDefinition } from "./PanelRegistry";
import { PanelHeader } from "./PanelHeader";
import type { PanelType } from "@/core/plugin/plugin.type";

interface PanelProps {
  panelType: PanelType;
  zoneId: string;
  className?: string;
}

/**
 * Panel Component
 * Renders a panel with its header and content
 */
export const Panel = React.memo<PanelProps>(
  ({ panelType, zoneId, className = "" }) => {
    const definition = getPanelDefinition(panelType);
    const PanelContent = definition.component;

    return (
      <div
        className={`flex flex-col w-full h-full overflow-hidden ${className}`}
        data-panel-type={panelType}
        data-zone-id={zoneId}
      >
        {/* Panel Header */}
        <PanelHeader
          panelType={panelType}
          zoneId={zoneId}
          title={definition.title}
          icon={definition.icon}
        />

        {/* Panel Content */}
        <div className="flex-1 overflow-auto bg-background">
          <PanelContent />
        </div>
      </div>
    );
  }
);

Panel.displayName = "Panel";
