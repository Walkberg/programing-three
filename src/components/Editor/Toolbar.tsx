import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import { useSceneStore, PRESET_CONFIGS } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { useHistoryStore } from "@/state/historyStore";
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
import { LayoutManagerPopover } from "@/components/Docking/LayoutManagerPopover";
import {
  ToolbarActionsProvider,
  useToolbarActionsContext,
} from "@/components/ToolbarActions/ToolbarActionsProvider";

import {
  DropdownMenu as GizmoDropdown,
  DropdownMenuTrigger as GizmoTrigger,
  DropdownMenuContent as GizmoContent,
  DropdownMenuItem as GizmoItem,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { usePluginManager } from "@/features/plugin/PlugginProvider";
import type { RegisteredToolbarAction } from "../ToolbarActions/types";
import { useToolbarActions } from "@/features/plugin/pluggin-hook";
import type { ToolbarAction } from "@/core/plugin/plugin.type";

export function Toolbar() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false); // T083
  const { toast } = useToast();
  const createGameObjectFromPreset = useSceneStore(
    (state) => state.createGameObjectFromPreset
  );
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const setScene = useSceneStore((state) => state.setScene);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const isDirty = useEditorStore((state) => state.isDirty);
  const setIsDirty = useEditorStore((state) => state.setIsDirty);
  const setPlayStateSnapshot = useEditorStore(
    (state) => state.setPlayStateSnapshot
  );
  const canUndo = useHistoryStore
    ? useHistoryStore.getState().canUndo()
    : false;
  const canRedo = useHistoryStore
    ? useHistoryStore.getState().canRedo()
    : false;
  const undo = () => {
    try {
      useHistoryStore.getState().undo();
    } catch (err) {
      // ignore
    }
  };
  const redo = () => {
    try {
      useHistoryStore.getState().redo();
    } catch (err) {
      // ignore
    }
  };

  const handleAddPreset = (preset: string) => {
    const id = createGameObjectFromPreset(preset);
    if (id) {
      useEditorStore.getState().selectGameObject(id);
      toast({
        title: `${PRESET_CONFIGS[preset].name} created`,
        variant: "default",
      });
    } else if (preset === "camera" || preset === "light") {
      toast({
        title: `${PRESET_CONFIGS[preset].name} components coming soon`,
        variant: "default",
      });
    }
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
    <ToolbarActionsProvider>
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

        {/* Undo / Redo */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => useHistoryStore.getState().undo()}
          disabled={!useHistoryStore.getState().canUndo()}
          className="gap-2"
        >
          Undo
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => useHistoryStore.getState().redo()}
          disabled={!useHistoryStore.getState().canRedo()}
          className="gap-2"
        >
          Redo
        </Button>

        {/* Gizmos dropdown */}
        <GizmoDropdown>
          <GizmoTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              disabled={mode === "play"}
              className="gap-2"
            >
              Gizmos
            </Button>
          </GizmoTrigger>
          <GizmoContent side="bottom">
            <GizmoItem
              onClick={() =>
                useEditorStore.getState().setGizmoMode("translate")
              }
            >
              Translate (W)
            </GizmoItem>
            <GizmoItem
              onClick={() => useEditorStore.getState().setGizmoMode("rotate")}
            >
              Rotate (E)
            </GizmoItem>
            <GizmoItem
              onClick={() => useEditorStore.getState().setGizmoMode("scale")}
            >
              Scale (R)
            </GizmoItem>
            <GizmoItem
              onClick={() => useEditorStore.getState().setGizmoMode("none")}
            >
              Off
            </GizmoItem>
          </GizmoContent>
        </GizmoDropdown>

        <div className="h-6 w-px bg-border mx-2" />

        {/* Preset DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              disabled={mode === "play"}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add GameObject
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom">
            <DropdownMenuItem onClick={() => handleAddPreset("empty")}>
              Empty
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddPreset("cube")}>
              Cube
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddPreset("sphere")}>
              Sphere
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddPreset("plane")}>
              Plane
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddPreset("camera")}>
              Camera
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddPreset("light")}>
              Light
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

        <div className="h-6 w-px bg-border mx-2" />

        {/* Layout Manager Popover (US6) */}
        <LayoutManagerPopover />

        {/* Render registered toolbar actions (simple flat rendering for MVP) */}
        <ToolbarActionsRenderer />
        <PluginToolbar />
        <ToolBarAction />

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
                      W
                    </kbd>
                    <span>Translate Gizmo</span>

                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                      E
                    </kbd>
                    <span>Rotate Gizmo</span>

                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                      R
                    </kbd>
                    <span>Scale Gizmo</span>

                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                      Q
                    </kbd>
                    <span>Toggle World/Local Gizmo Space</span>

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
              <Button
                variant="outline"
                onClick={() => setShowLoadConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={performLoad}>
                Load Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ToolbarActionsProvider>
  );
}

function ToolbarActionsRenderer() {
  const { actions } = useToolbarActionsContext();
  return (
    <div className="flex items-center gap-2">
      {actions.map((a) => (
        <Button
          key={a.id}
          onClick={() => {
            // invoke subscribers
            // use hook directly to call invoke; import dynamically to avoid cycles
            const store =
              require("@/state/toolbarActionsStore").useToolbarActionsStore;
            store.getState().invoke(a.id, a.payload);
          }}
          title={a.title}
        >
          {a.title}
        </Button>
      ))}
    </div>
  );
}

export const PluginToolbar = () => {
  const tss = usePluginManager();
  const aa = useToolbarActions();

  const plugins = tss.getPlugins();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-2">
          Plugins
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom">
        {plugins.map((plugin) => (
          <Button
            key={plugin.id}
            onClick={() => tss.executeCommand("open-layers-panel")}
          >
            {plugin.name}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export const ToolBarAction = () => {
  const categories = [
    { id: "test", name: "Une actions" },
    { id: "test1", name: "une deuxieem Action" },
  ];

  return (
    <div>
      {categories.map((category) => (
        <ActionToolBarCategory key={category.id} category={category} />
      ))}
    </div>
  );
};

export const ActionToolBarCategory = ({
  category,
}: {
  category: { id: string; name: string };
}) => {
  const [open, setOpen] = useState(false);

  const toolbarActions = useToolbarActions();
  const actions = getToolBarAction(toolbarActions);

  const pluginManager = usePluginManager();

  const handleClickAction = async (toolbarAction: ToolbarAction) => {
    await pluginManager.executeCommand(toolbarAction.action);
  };

  if (actions.length === 0) return null;

  return (
    <Popover key={category.id} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-2">
          {category.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom">
        {actions.map((action) => (
          <Button key={action.action} onClick={() => handleClickAction(action)}>
            {action.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

function getToolBarAction(allToolBarAction: ToolbarAction[]): ToolbarAction[] {
  // todo: filter or process actions as needed
  return allToolBarAction;
}
