import { useEffect } from "react";
import { HierarchyPanel } from "@/components/Hierarchy/HierarchyPanel";
import { SceneViewport } from "@/components/Viewport/SceneViewport";
import { InspectorPanel } from "@/components/Inspector/InspectorPanel";
import { Toolbar } from "./Toolbar";
import { ModeIndicator } from "./ModeIndicator";
import { useEditorStore } from "@/state/editorStore";
import { useSceneStore } from "@/state/sceneStore";

export function EditorLayout() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const mode = useEditorStore((state) => state.mode);
  const removeGameObject = useSceneStore((state) => state.removeGameObject);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace to remove selected GameObject
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        mode === "edit"
      ) {
        // Prevent default backspace navigation
        e.preventDefault();
        removeGameObject(selectedId);
        useEditorStore.getState().selectGameObject(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, mode, removeGameObject]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar />

      <ModeIndicator />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-semibold">Hierarchy</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <HierarchyPanel />
          </div>
        </div>

        <div className="flex-1 bg-muted">
          <SceneViewport />
        </div>

        <div className="w-80 border-l border-border bg-card flex flex-col">
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-semibold">Inspector</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <InspectorPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
