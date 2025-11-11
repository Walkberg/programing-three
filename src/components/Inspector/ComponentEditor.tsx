import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Trash2,
  Box,
  RotateCw,
  Boxes,
  Code, // T054
} from "lucide-react";
import { useSceneStore } from "@/state/sceneStore";
import type { ComponentData, MeshRendererData } from "@/types";
import type { RotationComponentData } from "@/core/RotationComponent";
import type { Model3DComponentData } from "@/core/Model3DComponent";
import type { CodeComponentData } from "@/core/CodeComponent"; // T054
import { MeshRendererEditor } from "./ComponentEditors/MeshRendererEditor";
import { RotationComponentEditor } from "./ComponentEditors/RotationComponentEditor";
import { Model3DEditor } from "./ComponentEditors/Model3DEditor";
import { CodeEditor } from "./ComponentEditors/CodeEditor"; // T054
import { Model3DComponent } from "@/core/Model3DComponent";
import { CodeComponent } from "@/core/CodeComponent"; // T054

interface ComponentEditorProps {
  gameObjectId: string;
  components: ComponentData[];
  disabled?: boolean;
}

/**
 * Component editor that displays all attached components with collapsible sections.
 * Each component type has its own property editor UI.
 *
 * Features:
 * - Collapsible sections for each component (FR-020)
 * - MeshRenderer geometry dropdown (cube, sphere, plane) (FR-021)
 * - MeshRenderer color picker with hex validation (FR-021)
 * - Property validation and real-time updates
 */
export function ComponentEditor({
  gameObjectId,
  components,
  disabled = false,
}: ComponentEditorProps) {
  // Track which components are expanded (all expanded by default except Transform)
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(
    () => {
      const expanded = new Set<string>();
      components.forEach((c) => {
        if (c.type !== "Transform") {
          expanded.add(c.id);
        }
      });
      return expanded;
    }
  );

  const toggleComponent = (componentId: string) => {
    setExpandedComponents((prev) => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  };

  // Filter out Transform component (it has its own TransformEditor)
  const editableComponents = components.filter((c) => c.type !== "Transform");

  if (editableComponents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {editableComponents.map((component) => (
        <ComponentSection
          key={component.id}
          gameObjectId={gameObjectId}
          component={component}
          expanded={expandedComponents.has(component.id)}
          onToggle={() => toggleComponent(component.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface ComponentSectionProps {
  gameObjectId: string;
  component: ComponentData;
  expanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function ComponentSection({
  gameObjectId,
  component,
  expanded,
  onToggle,
  disabled,
}: ComponentSectionProps) {
  const removeComponent = useSceneStore((state) => state.removeComponent);
  const updateComponent = useSceneStore((state) => state.updateComponent);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleRemoveComponent = () => {
    removeComponent(gameObjectId, component.id);
    setPopoverOpen(false);
  };

  const handleVisibleChange = (checked: boolean) => {
    updateComponent(gameObjectId, component.id, { visible: checked });
  };

  // Get component icon based on type
  const getComponentIcon = () => {
    switch (component.type) {
      case "MeshRenderer":
        return <Box className="h-4 w-4 text-muted-foreground" />;
      case "RotationComponent":
        return <RotateCw className="h-4 w-4 text-muted-foreground" />;
      case "Model3D":
        return <Boxes className="h-4 w-4 text-muted-foreground" />;
      case "Code": // T054
        return <Code className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Collapsible
      open={expanded}
      onOpenChange={onToggle}
      className="border border-border rounded-lg"
    >
      <div className="flex items-center w-full p-3 hover:bg-accent gap-2">
        <CollapsibleTrigger className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>

        {/* Visible checkbox - only for components that have visible property */}
        {"visible" in component && (
          <Checkbox
            checked={(component as any).visible ?? true}
            onCheckedChange={handleVisibleChange}
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Component icon */}
        {getComponentIcon()}

        <h4 className="font-medium text-sm flex-1">{component.type}</h4>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={disabled}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0" align="end">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemoveComponent}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <CollapsibleContent className="px-3 pb-3">
        {component.type === "MeshRenderer" && (
          <MeshRendererEditor
            gameObjectId={gameObjectId}
            component={component as MeshRendererData}
            disabled={disabled}
          />
        )}
        {component.type === "RotationComponent" && (
          <RotationComponentEditor
            gameObjectId={gameObjectId}
            component={component as RotationComponentData}
            disabled={disabled}
          />
        )}
        {component.type === "Model3D" && (
          <Model3DEditor
            gameObjectId={gameObjectId}
            component={new Model3DComponent(component as Model3DComponentData)}
          />
        )}
        {/* T054: Code component editor */}
        {component.type === "Code" && (
          <CodeEditor
            gameObjectId={gameObjectId}
            component={new CodeComponent(component as CodeComponentData)}
          />
        )}
        {component.type !== "MeshRenderer" &&
          component.type !== "RotationComponent" &&
          component.type !== "Model3D" &&
          component.type !== "Code" && (
            <div className="text-xs text-muted-foreground py-2">
              No editable properties
            </div>
          )}
      </CollapsibleContent>
    </Collapsible>
  );
}
