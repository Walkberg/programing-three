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

    const getSplitBarColor = () => {
      switch (mode) {
        case "split-h":
          return "bg-green-500";
        case "split-v":
          return "bg-purple-500";
        default:
          return "";
      }
    };

    // For split modes, show a preview bar instead of full overlay
    const isSplitMode = mode === "split-h" || mode === "split-v";

    if (isSplitMode) {
      return (
        <>
          {/* Split preview bar - shows where the new split will be */}
          <div
            className={`
              absolute z-50
              ${
                mode === "split-h"
                  ? "w-1 h-full top-0 left-1/2 -translate-x-1/2"
                  : "h-1 w-full left-0 top-1/2 -translate-y-1/2"
              }
              ${getSplitBarColor()}
              transition-all duration-150
              pointer-events-none
            `}
          />

          {/* Light overlay on the side where new panel will appear */}
          <div
            className={`
              absolute z-40
              ${getModeColor()}
              transition-all duration-150
              pointer-events-none
              ${
                mode === "split-h"
                  ? "w-1/2 h-full top-0 left-0"
                  : "w-full h-1/2 top-0 left-0"
              }
            `}
          />

          {/* Label in center */}
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 bg-background/95 rounded-lg shadow-lg border-2 border-border">
              <span className="text-sm font-medium text-foreground">
                {getModeLabel()}
              </span>
            </div>
          </div>
        </>
      );
    }

    // Tab mode - full overlay
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
