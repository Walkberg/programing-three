import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { StorageService } from "@/services/StorageService";
import { SceneSerializer } from "@/services/SceneSerializer";
import { Scene } from "@/core/Scene";
import {
  Play,
  Square,
  Plus,
  Save,
  FolderOpen,
  Loader2,
  Keyboard,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Toolbar() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false); // T083
  const { toast } = useToast();
  const addGameObject = useSceneStore((state) => state.addGameObject);
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const setScene = useSceneStore((state) => state.setScene);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const isDirty = useEditorStore((state) => state.isDirty);
  const setIsDirty = useEditorStore((state) => state.setIsDirty);
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

      // Check storage quota before saving (T076)
      const storageInfo = StorageService.getStorageInfo();
      if (storageInfo.usagePercent >= 80) {
        toast({
          title: "Storage Warning",
          description: `Storage is ${storageInfo.usagePercent.toFixed(
            1
          )}% full. Consider clearing old data.`,
          variant: "default",
        });
      }

      StorageService.save(sceneData);

      // Clear dirty flag after successful save (T083)
      setIsDirty(false);

      // Success toast (T071)
      toast({
        title: "Scene Saved",
        description: "Scene saved successfully to localStorage.",
        variant: "default",
      });

      console.log("✓ Scene saved successfully");
    } catch (error) {
      console.error("Failed to save scene:", error);

      // Error handling (T073, T074)
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleLoad = () => {
    // T083: Check for unsaved changes
    if (isDirty) {
      setShowLoadConfirm(true);
      return;
    }

    performLoad();
  };

  const performLoad = () => {
    try {
      const sceneData = StorageService.load();

      if (!sceneData) {
        toast({
          title: "No Saved Scene",
          description: "No saved scene found in localStorage.",
          variant: "default",
        });
        return;
      }

      // Validate scene version (T075)
      try {
        SceneSerializer.deserialize(sceneData);
      } catch (versionError) {
        // Version incompatibility
        toast({
          title: "Incompatible Version",
          description:
            versionError instanceof Error
              ? versionError.message
              : "Scene version is incompatible",
          variant: "destructive",
        });
        return;
      }

      setScene(sceneData.gameObjects);

      // Clear dirty flag after successful load (T083)
      setIsDirty(false);
      setShowLoadConfirm(false);

      // Success toast (T072)
      toast({
        title: "Scene Loaded",
        description: "Scene loaded successfully from localStorage.",
        variant: "default",
      });

      console.log("✓ Scene loaded successfully");
    } catch (error) {
      console.error("Failed to load scene:", error);

      // Error handling for corrupted JSON (T074)
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Load Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // If corrupted, optionally clear the corrupted data
      if (error instanceof Error && error.message.includes("Corrupted")) {
        console.warn(
          "Corrupted scene data detected. Consider clearing localStorage."
        );
      }
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

      {/* Keyboard Shortcuts Tooltip (T081) */}
      <div className="ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-2">
                <Keyboard className="h-4 w-4" />
                Shortcuts
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-2 text-sm">
                <div className="font-semibold border-b border-border pb-1">
                  Keyboard Shortcuts
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    Delete
                  </kbd>
                  <span>Delete selected GameObject</span>

                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    Space
                  </kbd>
                  <span>Toggle Play/Stop mode</span>

                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    Ctrl+S
                  </kbd>
                  <span>Save scene</span>

                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    Ctrl+O
                  </kbd>
                  <span>Load scene</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Confirmation dialog for unsaved changes (T083) */}
      <Dialog open={showLoadConfirm} onOpenChange={setShowLoadConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Loading a scene will discard them. Are
              you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={performLoad}>
              Load Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
