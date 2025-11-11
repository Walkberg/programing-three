// Auto-save Layout Hook
// Feature: 003-docking-panel-system - US5
// Debounced auto-save for layout changes

import { useEffect, useRef } from "react";
import { useLayoutStore } from "@/state/layoutStore";

/**
 * Auto-save layout changes with debouncing
 * @param delay Debounce delay in milliseconds (default: 500ms)
 */
export function useAutoSaveLayout(delay = 500) {
  const rootZone = useLayoutStore((state) => state.rootZone);
  const saveLayout = useLayoutStore((state) => state.saveLayout);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render (initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule save
    timeoutRef.current = setTimeout(() => {
      saveLayout();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [rootZone, saveLayout, delay]);
}
