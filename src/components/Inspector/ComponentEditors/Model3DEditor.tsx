import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAssetStore } from "@/state/assetStore";
import { useSceneStore } from "@/state/sceneStore";
import type {
  Model3DComponent,
  Model3DComponentData,
} from "@/core/Model3DComponent";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Model3DEditor - Inspector editor for Model3D component (T026-T028)
 * Asset dropdown, scale slider, and model loading controls
 */

interface Model3DEditorProps {
  component: Model3DComponent;
  gameObjectId: string;
}

export function Model3DEditor({ component, gameObjectId }: Model3DEditorProps) {
  const assets = useAssetStore((state) => state.assets);
  const updateGameObject = useSceneStore((state) => state.updateGameObject);

  // T027: Filter assets by type='model'
  const modelAssets = assets.filter((asset) => asset.type === "model");

  const handleAssetChange = async (assetId: string) => {
    component.assetId = assetId;

    // Update in store
    const updatedComponent: Model3DComponentData = component.serialize();
    updateGameObject(gameObjectId, {
      components: [updatedComponent],
    });

    // Load the model
    await component.loadModel();
  };

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0];
    component.updateScale(newScale);

    // Update in store
    const updatedComponent: Model3DComponentData = component.serialize();
    updateGameObject(gameObjectId, {
      components: [updatedComponent],
    });
  };

  const handleReload = async () => {
    await component.loadModel();
  };

  return (
    <div className="space-y-4">
      {/* T027: Asset dropdown */}
      <div className="space-y-2">
        <Label htmlFor="model-asset">3D Model</Label>
        {modelAssets.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No models uploaded yet. Upload a .glb, .gltf, or .obj file in the
            Assets panel below.
          </p>
        ) : (
          <Select
            value={component.assetId || "none"}
            onValueChange={handleAssetChange}
          >
            <SelectTrigger id="model-asset">
              <SelectValue placeholder="Select a model..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {modelAssets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* T028: Scale slider */}
      {component.assetId && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="model-scale">Scale</Label>
              <span className="text-xs text-muted-foreground">
                {component.scale.toFixed(2)}
              </span>
            </div>
            <Slider
              id="model-scale"
              min={0.1}
              max={10}
              step={0.1}
              value={[component.scale]}
              onValueChange={handleScaleChange}
            />
          </div>

          {/* Loading state */}
          {component.isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading model...
            </div>
          )}

          {/* T030: Error display */}
          {component.loadError && (
            <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Load Error</p>
                <p className="text-destructive/80 mt-1">
                  {component.loadError}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-6"
                  onClick={handleReload}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Success state */}
          {component.loadedModel &&
            !component.loadError &&
            !component.isLoading && (
              <div className="text-xs text-green-600 dark:text-green-400">
                ✓ Model loaded successfully
              </div>
            )}
        </>
      )}
    </div>
  );
}
