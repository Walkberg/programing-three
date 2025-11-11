// Zone Component
// Feature: 003-docking-panel-system
// Renders leaf zones (panels) and split zones (recursive layout) using flexbox

import React from "react";
import type { Zone as ZoneType, LeafZone, SplitZone } from "@/types/layout";
import { Panel } from "./Panel";
import { TabBar } from "./TabBar";

interface ZoneProps {
  zone: ZoneType;
  className?: string;
}

/**
 * Zone Component
 * Recursively renders the zone tree structure
 * - Leaf zones: Render panel content with optional tab bar
 * - Split zones: Render two child zones with flexbox layout
 */
export const Zone = React.memo<ZoneProps>(({ zone, className = "" }) => {
  if (zone.type === "leaf") {
    return <LeafZoneContent zone={zone} className={className} />;
  }

  if (zone.type === "split") {
    return <SplitZoneContent zone={zone} className={className} />;
  }

  return null;
});

Zone.displayName = "Zone";

/**
 * Leaf Zone Content
 * Renders a single panel or tabbed group of panels
 */
const LeafZoneContent = React.memo<{ zone: LeafZone; className: string }>(
  ({ zone, className }) => {
    const { panels, activePanel } = zone;

    // No panels: render empty zone
    if (panels.length === 0) {
      return (
        <div
          className={`flex items-center justify-center bg-background text-muted-foreground border border-border rounded-lg ${className}`}
          data-zone-id={zone.id}
          data-zone-type="leaf"
        >
          <p className="text-sm">Empty zone</p>
        </div>
      );
    }

    // Single panel: no tabs
    if (panels.length === 1) {
      return (
        <div
          className={`flex flex-col overflow-hidden border border-border rounded-lg ${className}`}
          data-zone-id={zone.id}
          data-zone-type="leaf"
        >
          <Panel panelType={panels[0]} zoneId={zone.id} />
        </div>
      );
    }

    // Multiple panels: show tab bar
    return (
      <div
        className={`flex flex-col overflow-hidden border border-border rounded-lg ${className}`}
        data-zone-id={zone.id}
        data-zone-type="leaf"
      >
        <TabBar
          zoneId={zone.id}
          panels={panels}
          activePanel={activePanel || panels[0]}
        />
        {activePanel && <Panel panelType={activePanel} zoneId={zone.id} />}
      </div>
    );
  }
);

LeafZoneContent.displayName = "LeafZoneContent";

/**
 * Split Zone Content
 * Renders two child zones with flexbox layout (horizontal or vertical split)
 */
const SplitZoneContent = React.memo<{ zone: SplitZone; className: string }>(
  ({ zone, className }) => {
    const { orientation, children, sizes } = zone;
    const isHorizontal = orientation === "horizontal";

    // Calculate flex-basis from sizes (normalized to percentages)
    const [size1, size2] = sizes;
    const percent1 = (size1 * 100).toFixed(2);
    const percent2 = (size2 * 100).toFixed(2);

    return (
      <div
        className={`flex ${
          isHorizontal ? "flex-row gap-1" : "flex-col gap-1"
        } w-full h-full overflow-hidden ${className}`}
        data-zone-id={zone.id}
        data-zone-type="split"
        data-orientation={orientation}
      >
        {/* First child */}
        <div
          className="relative overflow-hidden transition-all duration-300"
          style={{
            flexBasis: `${percent1}%`,
            flexGrow: 0,
            flexShrink: 1,
          }}
        >
          <Zone zone={children[0]} className="w-full h-full" />
        </div>

        {/* Second child */}
        <div
          className="relative overflow-hidden transition-all duration-300"
          style={{
            flexBasis: `${percent2}%`,
            flexGrow: 0,
            flexShrink: 1,
          }}
        >
          <Zone zone={children[1]} className="w-full h-full" />
        </div>
      </div>
    );
  }
);

SplitZoneContent.displayName = "SplitZoneContent";
