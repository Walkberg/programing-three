import { Button } from "@/components/ui/button";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { StorageService } from "@/services/StorageService";
import { SceneSerializer } from "@/services/SceneSerializer";
import { Scene } from "@/core/Scene";
import { Play, Square, Plus, Save, FolderOpen, Loader2 } from "lucide-react";
import { useState } from "react";

export function Toolbar() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const addGameObject = useSceneStore((state) => state.addGameObject);
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const setScene = useSceneStore((state) => state.setScene);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const setPlayStateSnapshot = useEditorStore(
    (state) => state.setPlayStateSnapshot
  );

  const handleAddGameObject = () => {
    const id = addGameObject();
    // Auto-select the new GameObject
    useEditorStore.getState().selectGameObject(id);
  };

  const handleSave = () => {
    try {
      const scene = new Scene({ gameObjects });
      const sceneData = SceneSerializer.serialize(scene);
      StorageService.save(sceneData);
      console.log("Scene saved successfully");
    } catch (error) {
      console.error("Failed to save scene:", error);
    }
  };

  const handleLoad = () => {
    try {
      const sceneData = StorageService.load();
      if (sceneData) {
        setScene(sceneData.gameObjects);
        console.log("Scene loaded successfully");
      } else {
        console.log("No saved scene found");
      }
    } catch (error) {
      console.error("Failed to load scene:", error);
    }
  };

  const handlePlay = () => {
    // Visual feedback for transition (T067)
    setIsTransitioning(true);

    // Performance monitoring for mode transition (T066)
    const startTime = performance.now();

    // Save current state before entering play mode
    const scene = new Scene({ gameObjects });
    const snapshot = SceneSerializer.serialize(scene);
    setPlayStateSnapshot(snapshot);
    setMode("play");

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 500) {
      console.warn(
        `⚠️ Play mode transition took ${duration.toFixed(2)}ms (target: <500ms)`
      );
    } else {
      console.log(`✓ Play mode transition: ${duration.toFixed(2)}ms`);
    }

    // Clear transition state
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleStop = () => {
    // Visual feedback for transition (T067)
    setIsTransitioning(true);

    // Performance monitoring for mode transition (T066)
    const startTime = performance.now();

    // Restore state from snapshot
    const snapshot = useEditorStore.getState().playStateSnapshot;
    if (snapshot) {
      setScene(snapshot.gameObjects);
    }
    setPlayStateSnapshot(null);
    setMode("edit");

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 500) {
      console.warn(
        `⚠️ Stop mode transition took ${duration.toFixed(2)}ms (target: <500ms)`
      );
    } else {
      console.log(`✓ Stop mode transition: ${duration.toFixed(2)}ms`);
    }

    // Clear transition state
    setTimeout(() => setIsTransitioning(false), 100);
  };

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2">
      {/* Play/Stop buttons */}
      {mode === "edit" ? (
        <Button
          size="sm"
          variant="default"
          onClick={handlePlay}
          disabled={isTransitioning}
          className="gap-2"
        >
          {isTransitioning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Play
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleStop}
          disabled={isTransitioning}
          className="gap-2"
        >
          {isTransitioning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          Stop
        </Button>
      )}

      <div className="h-6 w-px bg-border mx-2" />

      {/* Add GameObject button */}
      <Button
        size="sm"
        variant="secondary"
        onClick={handleAddGameObject}
        disabled={mode === "play"}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add GameObject
      </Button>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Save/Load buttons */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleSave}
        disabled={mode === "play"}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Save Scene
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleLoad}
        disabled={mode === "play"}
        className="gap-2"
      >
        <FolderOpen className="h-4 w-4" />
        Load Scene
      </Button>
    </div>
  );
}
