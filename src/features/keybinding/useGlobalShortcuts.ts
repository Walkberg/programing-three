import { useEffect } from "react";
import { useEditorStore } from "@/state/editorStore";
import { useKeybindingStore } from "./store";

/**
 * Global keyboard shortcuts for gizmo controls, implemented in the keybinding feature.
 * Uses `useKeybindingStore` for user-configurable bindings and `useEditorStore` for mode/state.
 */
export function useGlobalShortcuts() {
  const mode = useEditorStore((s) => s.mode);
  const gizmoSpace = useEditorStore((s) => s.gizmoSpace);
  const setGizmoMode = useEditorStore((s) => s.setGizmoMode);
  const setGizmoSpace = useEditorStore((s) => s.setGizmoSpace);

  const shortcuts = useKeybindingStore((s) => s.shortcuts);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (mode !== "edit") return;

      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable)
      )
        return;

      const key = e.key.toLowerCase();
      try {
        if (
          shortcuts &&
          key === (shortcuts["viewport.translate"] || "").toLowerCase()
        ) {
          e.preventDefault();
          setGizmoMode("translate");
          return;
        }
        if (
          shortcuts &&
          key === (shortcuts["viewport.rotate"] || "").toLowerCase()
        ) {
          e.preventDefault();
          setGizmoMode("rotate");
          return;
        }
        if (
          shortcuts &&
          key === (shortcuts["viewport.scale"] || "").toLowerCase()
        ) {
          e.preventDefault();
          setGizmoMode("scale");
          return;
        }
        if (
          shortcuts &&
          key === (shortcuts["viewport.toggleSpace"] || "").toLowerCase()
        ) {
          e.preventDefault();
          setGizmoSpace(gizmoSpace === "world" ? "local" : "world");
          return;
        }
        if (
          shortcuts &&
          key === (shortcuts["viewport.off"] || "").toLowerCase()
        ) {
          e.preventDefault();
          setGizmoMode("none");
          return;
        }
      } catch (err) {
        // ignore errors in key matching
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, gizmoSpace, shortcuts, setGizmoMode, setGizmoSpace]);
}

export function useKeybindings() {
  return useKeybindingStore();
}
