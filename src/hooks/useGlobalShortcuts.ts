import { useEffect } from "react";
import { useEditorStore } from "@/state/editorStore";

/**
 * Global keyboard shortcuts for gizmo controls:
 * W = Translate, E = Rotate, R = Scale, Q = Toggle World/Local, Escape = None
 * Only active when editor is in 'edit' mode and focus is not on an input element.
 */
export function useGlobalShortcuts() {
  const mode = useEditorStore((s) => s.mode);
  const gizmoSpace = useEditorStore((s) => s.gizmoSpace);
  const shortcuts = useEditorStore((s) => s.shortcuts);
  const setGizmoMode = useEditorStore((s) => s.setGizmoMode);
  const setGizmoSpace = useEditorStore((s) => s.setGizmoSpace);

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
      // Compare against user-configured shortcuts (case-insensitive)
      try {
        if (shortcuts && key === (shortcuts.translate || "").toLowerCase()) {
          e.preventDefault();
          setGizmoMode("translate");
          return;
        }
        if (shortcuts && key === (shortcuts.rotate || "").toLowerCase()) {
          e.preventDefault();
          setGizmoMode("rotate");
          return;
        }
        if (shortcuts && key === (shortcuts.scale || "").toLowerCase()) {
          e.preventDefault();
          setGizmoMode("scale");
          return;
        }
        if (shortcuts && key === (shortcuts.toggleSpace || "").toLowerCase()) {
          e.preventDefault();
          setGizmoSpace(gizmoSpace === "world" ? "local" : "world");
          return;
        }
        if (shortcuts && key === (shortcuts.off || "").toLowerCase()) {
          e.preventDefault();
          setGizmoMode("none");
          return;
        }
      } catch (err) {
        // fall back to no-op on errors
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, gizmoSpace, shortcuts, setGizmoMode, setGizmoSpace]);
}
