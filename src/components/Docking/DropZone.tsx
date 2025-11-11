// Drop Zone Component
// Feature: 003-docking-panel-system - US2
// Visual drop zone indicators for drag and drop

import React from "react";
import type { DropMode } from "@/types/layout";

interface DropZoneProps {
  isActive: boolean;
  mode: DropMode;
  className?: string;
}

/**
 * Drop Zone Component
 * Shows visual feedback when dragging over a valid drop target
 * Different styles for different drop modes (move, tab, split-h, split-v)
 */
export const DropZone = React.memo<DropZoneProps>(
  ({ isActive, mode, className = "" }) => {
    if (!isActive) return null;

    const getModeLabel = () => {
      switch (mode) {
        case "move":
          return "Move Here";
        case "tab":
          return "Add as Tab";
        case "split-h":
          return "Split Horizontal";
        case "split-v":
          return "Split Vertical";
        default:
          return "Drop Here";
      }
    };

    const getModeColor = () => {
      switch (mode) {
        case "move":
          return "bg-primary/20 border-primary";
        case "tab":
          return "bg-blue-500/20 border-blue-500";
        case "split-h":
          return "bg-green-500/20 border-green-500";
        case "split-v":
          return "bg-purple-500/20 border-purple-500";
        default:
          return "bg-primary/20 border-primary";
      }
    };

    return (
      <div
        className={`
          absolute inset-0 z-50
          flex items-center justify-center
          border-2 border-dashed rounded-lg
          ${getModeColor()}
          transition-all duration-150
          pointer-events-none
          ${className}
        `}
        data-drop-zone={mode}
      >
        <div className="px-4 py-2 bg-background/90 rounded-lg shadow-lg border border-border">
          <span className="text-sm font-medium text-foreground">
            {getModeLabel()}
          </span>
        </div>
      </div>
    );
  }
);

DropZone.displayName = "DropZone";
