import { useEffect } from "react";
import { HierarchyPanel } from "@/components/Hierarchy/HierarchyPanel";
import { SceneViewport } from "@/components/Viewport/SceneViewport";
import { InspectorPanel } from "@/components/Inspector/InspectorPanel";
import { AssetsPanel } from "@/components/Assets/AssetsPanel";
import { ConsolePanel } from "@/components/Console/ConsolePanel"; // T050
import { Toolbar } from "./Toolbar";
import { ModeIndicator } from "./ModeIndicator";
import { useEditorStore } from "@/state/editorStore";
import { useSceneStore } from "@/state/sceneStore";
import { useAssetStore } from "@/state/assetStore";
import { AssetService } from "@/services/AssetService";
import { Scene } from "@/core/Scene";
import { SceneSerializer } from "@/services/SceneSerializer";
import { StorageService } from "@/services/StorageService";
import { useToast } from "@/hooks/use-toast";

export function EditorLayout() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const setPlayStateSnapshot = useEditorStore(
    (state) => state.setPlayStateSnapshot
  );
  const removeGameObject = useSceneStore((state) => state.removeGameObject);
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const setScene = useSceneStore((state) => state.setScene);
  const setAssets = useAssetStore((state) => state.setAssets);
  const { toast } = useToast();

  // Load assets from IndexedDB on mount (T022)
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assets = await AssetService.listAssets();
        setAssets(assets);
      } catch (error) {
        console.error("Failed to load assets:", error);
      }
    };
    loadAssets();
  }, [setAssets]);

  // Keyboard shortcuts (T082: proper cleanup)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Delete/Backspace to remove selected GameObject
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        mode === "edit"
      ) {
        e.preventDefault();
        removeGameObject(selectedId);
        useEditorStore.getState().selectGameObject(null);
      }

      // Space to toggle Play/Stop
      if (e.key === " " && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (mode === "edit") {
          // Start play mode - save snapshot
          const scene = new Scene({ gameObjects });
          const snapshot = SceneSerializer.serialize(scene);
          setPlayStateSnapshot(snapshot);
          setMode("play");
        } else {
          // Stop play mode
          setMode("edit");
        }
      }

      // Ctrl+S to save
      if (e.key === "s" && e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        try {
          const scene = new Scene({ gameObjects });
          const sceneData = SceneSerializer.serialize(scene);
          StorageService.save(sceneData);
          toast({
            title: "Scene Saved",
            description: "Scene saved successfully.",
          });
        } catch (error) {
          toast({
            title: "Save Failed",
            description:
              error instanceof Error ? error.message : "Unknown error",
            variant: "destructive",
          });
        }
      }

      // Ctrl+O to load
      if (e.key === "o" && e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (mode === "play") return; // Don't load during play mode
        try {
          const sceneData = StorageService.load();
          if (sceneData) {
            const scene = SceneSerializer.deserialize(sceneData);
            // Convert Scene.gameObjects to GameObjectData format
            const gameObjectsData = scene.gameObjects.map((go) => ({
              id: go.id,
              name: go.name,
              parent: go.parent,
              components: go.components.map((c) => c.serialize()),
            }));
            setScene(gameObjectsData);
            toast({
              title: "Scene Loaded",
              description: "Scene loaded successfully.",
            });
          }
        } catch (error) {
          toast({
            title: "Load Failed",
            description:
              error instanceof Error ? error.message : "Unknown error",
            variant: "destructive",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Cleanup function to prevent memory leaks (T082)
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedId,
    mode,
    gameObjects,
    removeGameObject,
    setMode,
    setPlayStateSnapshot,
    setScene,
    toast,
  ]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar />

      <ModeIndicator />

      <div className="flex-1 flex flex-col overflow-hidden">
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

        {/* T050: Console panel for code execution logs */}
        <ConsolePanel />

        {/* T014: Assets panel at bottom */}
        <AssetsPanel />
      </div>
    </div>
  );
}
