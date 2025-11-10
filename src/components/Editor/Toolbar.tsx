import { Button } from "@/components/ui/button";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { StorageService } from "@/services/StorageService";
import { SceneSerializer } from "@/services/SceneSerializer";
import { Scene } from "@/core/Scene";
import { Play, Square, Plus, Save, FolderOpen } from "lucide-react";

export function Toolbar() {
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
    // Save current state before entering play mode
    const scene = new Scene({ gameObjects });
    const snapshot = SceneSerializer.serialize(scene);
    setPlayStateSnapshot(snapshot);
    setMode("play");
  };

  const handleStop = () => {
    // Restore state from snapshot
    const snapshot = useEditorStore.getState().playStateSnapshot;
    if (snapshot) {
      setScene(snapshot.gameObjects);
    }
    setPlayStateSnapshot(null);
    setMode("edit");
  };

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2">
      {/* Play/Stop buttons */}
      {mode === "edit" ? (
        <Button
          size="sm"
          variant="default"
          onClick={handlePlay}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Play
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleStop}
          className="gap-2"
        >
          <Square className="h-4 w-4" />
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
