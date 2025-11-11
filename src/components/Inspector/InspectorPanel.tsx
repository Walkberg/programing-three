import { memo } from "react";
import { useEditorStore } from "@/state/editorStore";
import { useSceneStore } from "@/state/sceneStore";
import { TransformEditor } from "./TransformEditor";
import { ComponentEditor } from "./ComponentEditor";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ComponentRegistry } from "@/core/Component";
import { MeshRenderer } from "@/core/MeshRenderer";
import { RotationComponent } from "@/core/RotationComponent";
import { Model3DComponent } from "@/core/Model3DComponent"; // T032
import { CodeComponent } from "@/core/CodeComponent"; // T032
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * InspectorPanel with React.memo optimization (T080)
 * Only re-renders when selected GameObject changes
 */
export const InspectorPanel = memo(function InspectorPanel() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const addComponent = useSceneStore((state) => state.addComponent);
  const mode = useEditorStore((state) => state.mode);
  const { toast } = useToast();

  const selectedGameObject = gameObjects.find((go) => go.id === selectedId);

  // Get available component types from registry
  const availableTypes = ComponentRegistry.getAvailableTypes().filter(
    (type) => type !== "Transform" // Transform is always present
  );

  const handleAddComponent = (componentType: string) => {
    if (!selectedGameObject) return;

    // Check for duplicate component
    const hasDuplicate = selectedGameObject.components.some(
      (c) => c.type === componentType
    );

    // Create component instance based on type
    let component;
    switch (componentType) {
      case "MeshRenderer":
        component = new MeshRenderer();
        break;
      case "RotationComponent":
        component = new RotationComponent();
        break;
      case "Model3D": // T023
        component = new Model3DComponent();
        break;
      case "Code": // T032
        component = new CodeComponent();
        break;
      default:
        toast({
          title: "Error",
          description: `Unknown component type: ${componentType}`,
          variant: "destructive",
        });
        return;
    }

    // Add component
    addComponent(selectedGameObject.id, component);

    // Show duplicate warning if applicable (FR-033)
    if (hasDuplicate) {
      toast({
        title: "Duplicate Component",
        description: `GameObject already has a ${componentType} component. Another one has been added.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Component Added",
        description: `${componentType} has been added to ${selectedGameObject.name}`,
      });
    }
  };

  if (!selectedGameObject) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Select a GameObject to view its properties.
      </div>
    );
  }

  const transformComponent = selectedGameObject.components.find(
    (c) => c.type === "Transform"
  ) as any;

  const isPlayMode = mode === "play";

  return (
    <div className="p-4 space-y-4">
      {/* GameObject Name */}
      <div>
        <h3 className="font-semibold text-lg mb-2">
          {selectedGameObject.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          ID: {selectedGameObject.id}
        </p>
      </div>

      {/* Transform Component */}
      {transformComponent && (
        <TransformEditor
          gameObjectId={selectedGameObject.id}
          transform={transformComponent}
          disabled={isPlayMode}
        />
      )}

      {/* Other Components */}
      <ComponentEditor
        gameObjectId={selectedGameObject.id}
        components={selectedGameObject.components}
        disabled={isPlayMode}
      />

      {/* Add Component Popover (at the end) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button disabled={isPlayMode} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-3">Add Component</h4>
            <div className="flex flex-col gap-1">
              {availableTypes.map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={() => handleAddComponent(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
