// Splitter Component
// Feature: 003-docking-panel-system - US4
// Draggable divider between split zones for resizing

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLayoutStore } from "@/state/layoutStore";

interface SplitterProps {
  zoneId: string;
  orientation: "horizontal" | "vertical";
  currentSizes: [number, number];
  className?: string;
}

/**
 * Splitter Component
 * Renders a draggable divider between two child zones
 * Allows users to resize zones by dragging
 */
export const Splitter = React.memo<SplitterProps>(
  ({ zoneId, orientation, currentSizes, className = "" }) => {
    const updateZoneSizes = useLayoutStore((state) => state.updateZoneSizes);
    const [isDragging, setIsDragging] = useState(false);
    const splitterRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLElement | null>(null);

    const isHorizontal = orientation === "horizontal";

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      // Find parent container to calculate relative positions
      const parentElement = splitterRef.current?.parentElement;
      if (parentElement) {
        containerRef.current = parentElement;
      }
    }, []);

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal ? rect.width : rect.height;
        const mousePos = isHorizontal ? e.clientX : e.clientY;
        const containerStart = isHorizontal ? rect.left : rect.top;

        // Calculate new size as ratio (0 to 1)
        let ratio = (mousePos - containerStart) / totalSize;

        // Clamp to minimum sizes (200px width / 150px height)
        const minSize = isHorizontal ? 200 / totalSize : 150 / totalSize;
        const maxSize = 1 - minSize;

        ratio = Math.max(minSize, Math.min(maxSize, ratio));

        // Update zone sizes
        updateZoneSizes(zoneId, [ratio, 1 - ratio]);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        containerRef.current = null;
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging, isHorizontal, zoneId, updateZoneSizes]);

    return (
      <div
        ref={splitterRef}
        onMouseDown={handleMouseDown}
        className={`
          relative
          ${
            isHorizontal
              ? "w-1 cursor-col-resize hover:w-2"
              : "h-1 cursor-row-resize hover:h-2"
          }
          ${isDragging ? "bg-primary" : "bg-border hover:bg-primary/50"}
          transition-all duration-150
          select-none
          group
          ${className}
        `}
        data-splitter-orientation={orientation}
        data-dragging={isDragging}
      >
        {/* Visual indicator on hover */}
        <div
          className={`
            absolute
            ${
              isHorizontal
                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1"
            }
            bg-primary
            rounded-full
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150
            pointer-events-none
          `}
        />
      </div>
    );
  }
);

Splitter.displayName = "Splitter";
