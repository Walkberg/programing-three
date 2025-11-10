import { useSceneStore } from "@/state/sceneStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RotationComponentData } from "@/core/RotationComponent";

interface RotationComponentEditorProps {
  gameObjectId: string;
  component: RotationComponentData;
  disabled?: boolean;
}

export function RotationComponentEditor({
  gameObjectId,
  component,
  disabled = false,
}: RotationComponentEditorProps) {
  const updateComponent = useSceneStore((state) => state.updateComponent);

  const handleSpeedChange = (value: string) => {
    const speed = parseFloat(value);
    if (!isNaN(speed)) {
      updateComponent(gameObjectId, component.id, { speed });
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`speed-${component.id}`} className="text-xs">
          Rotation Speed (rad/s)
        </Label>
        <Input
          id={`speed-${component.id}`}
          type="number"
          step="0.1"
          value={component.speed}
          onChange={(e) => handleSpeedChange(e.target.value)}
          disabled={disabled}
          className="h-8 text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Rotation speed around Y axis when in play mode
        </p>
      </div>
    </div>
  );
}
