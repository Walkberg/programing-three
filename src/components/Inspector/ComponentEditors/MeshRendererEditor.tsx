import { useCallback, useState } from "react";
import Color from "color";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerOutput,
} from "@/components/ui/color-picker";
import { useSceneStore } from "@/state/sceneStore";
import type { MeshRendererData } from "@/types";
import { cn } from "@/lib/utils";

interface MeshRendererEditorProps {
  gameObjectId: string;
  component: MeshRendererData;
  disabled?: boolean;
}

export function MeshRendererEditor({
  gameObjectId,
  component,
  disabled,
}: MeshRendererEditorProps) {
  const updateComponent = useSceneStore((state) => state.updateComponent);
  const [colorValue, setColorValue] = useState(component.color || "#ffffff");
  const [colorError, setColorError] = useState<string | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const handleGeometryChange = (geometry: string) => {
    updateComponent(gameObjectId, component.id, {
      geometry: geometry as "cube" | "sphere" | "plane",
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColorValue(value);

    // Validate hex color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(value)) {
      setColorError("Must be a valid hex color (e.g., #FF0000)");
    } else {
      setColorError(null);
      updateComponent(gameObjectId, component.id, { color: value });
    }
  };

  const handleColorPickerChange = useCallback(
    (value: Parameters<typeof Color.rgb>[0]) => {
      try {
        const color = Color.rgb(value);
        const hex = color.hex();

        setColorValue(hex);
        setColorError(null);
        updateComponent(gameObjectId, component.id, { color: hex });
      } catch (error) {
        console.error("Color conversion error:", error);
      }
    },
    [gameObjectId, component.id, updateComponent]
  );

  return (
    <div className="space-y-3 pt-2">
      {/* Geometry Type */}
      <div>
        <Label htmlFor={`${component.id}-geometry`} className="text-xs mb-2">
          Geometry
        </Label>
        <Select
          value={component.geometry || "cube"}
          onValueChange={handleGeometryChange}
          disabled={disabled}
        >
          <SelectTrigger id={`${component.id}-geometry`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cube">Cube</SelectItem>
            <SelectItem value="sphere">Sphere</SelectItem>
            <SelectItem value="plane">Plane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div>
        <Label htmlFor={`${component.id}-color`} className="text-xs mb-2">
          Color
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id={`${component.id}-color`}
              type="text"
              value={colorValue}
              onChange={handleColorChange}
              disabled={disabled}
              placeholder="#FFFFFF"
              className={cn(colorError && "border-red-500")}
            />
            {colorError && (
              <p className="text-xs text-red-500 mt-1">{colorError}</p>
            )}
          </div>
          <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-10 h-10 rounded border border-border cursor-pointer hover:border-ring transition-colors"
                style={{ backgroundColor: colorValue }}
                title={colorValue}
                disabled={disabled}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <ColorPicker
                value={colorValue}
                onChange={handleColorPickerChange}
                className="gap-3"
              >
                <ColorPickerSelection className="h-48 w-64" />
                <div className="flex flex-col gap-2">
                  <ColorPickerHue />
                  <ColorPickerAlpha />
                </div>
                <div className="flex items-center gap-2">
                  <ColorPickerFormat />
                  <ColorPickerOutput />
                </div>
              </ColorPicker>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
