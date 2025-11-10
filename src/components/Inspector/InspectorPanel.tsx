import { useEditorStore } from "@/state/editorStore";
import { useSceneStore } from "@/state/sceneStore";
import { TransformEditor } from "./TransformEditor";
import { ComponentEditor } from "./ComponentEditor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComponentRegistry } from "@/core/Component";
import { MeshRenderer } from "@/core/MeshRenderer";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InspectorPanel() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const addComponent = useSceneStore((state) => state.addComponent);
  const mode = useEditorStore((state) => state.mode);
  const { toast } = useToast();

  const [showAddComponent, setShowAddComponent] = useState(false);
  const [selectedComponentType, setSelectedComponentType] = useState<
    string | null
  >(null);

  const selectedGameObject = gameObjects.find((go) => go.id === selectedId);

  // Get available component types from registry
  const availableTypes = ComponentRegistry.getAvailableTypes().filter(
    (type) => type !== "Transform" // Transform is always present
  );

  const handleAddComponent = () => {
    if (!selectedComponentType || !selectedGameObject) return;

    // Check for duplicate component
    const hasDuplicate = selectedGameObject.components.some(
      (c) => c.type === selectedComponentType
    );

    // Create component instance based on type
    let component;
    switch (selectedComponentType) {
      case "MeshRenderer":
        component = new MeshRenderer();
        break;
      default:
        toast({
          title: "Error",
          description: `Unknown component type: ${selectedComponentType}`,
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
        description: `GameObject already has a ${selectedComponentType} component. Another one has been added.`,
        variant: "default",
      });
    }

    // Reset selection
    setShowAddComponent(false);
    setSelectedComponentType(null);
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

      {/* Add Component Button (FR-017) */}
      {!showAddComponent && (
        <Button
          onClick={() => setShowAddComponent(true)}
          disabled={isPlayMode}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      )}

      {/* Add Component Dropdown */}
      {showAddComponent && (
        <div className="border border-border rounded-lg p-3 space-y-3">
          <h4 className="font-medium text-sm">Add Component</h4>
          <Select
            value={selectedComponentType || ""}
            onValueChange={setSelectedComponentType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select component type..." />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              onClick={handleAddComponent}
              disabled={!selectedComponentType}
              size="sm"
              className="flex-1"
            >
              Add
            </Button>
            <Button
              onClick={() => {
                setShowAddComponent(false);
                setSelectedComponentType(null);
              }}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {transformComponent && (
        <TransformEditor
          gameObjectId={selectedGameObject.id}
          transform={transformComponent}
          disabled={isPlayMode}
        />
      )}
      <ComponentEditor
        gameObjectId={selectedGameObject.id}
        components={selectedGameObject.components}
        disabled={isPlayMode}
      />
    </div>
  );
}
