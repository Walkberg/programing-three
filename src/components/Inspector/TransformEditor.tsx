import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSceneStore } from "@/state/sceneStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Move3d } from "lucide-react";
import type { TransformData } from "@/types";
import { useEffect, useState } from "react";

const transformSchema = z.object({
  positionX: z.number().finite(),
  positionY: z.number().finite(),
  positionZ: z.number().finite(),
  rotationX: z.number().finite(),
  rotationY: z.number().finite(),
  rotationZ: z.number().finite(),
  scaleX: z.number().positive(),
  scaleY: z.number().positive(),
  scaleZ: z.number().positive(),
});

type TransformFormData = z.infer<typeof transformSchema>;

interface TransformEditorProps {
  gameObjectId: string;
  transform: TransformData;
  disabled?: boolean;
}

export function TransformEditor({
  gameObjectId,
  transform,
  disabled = false,
}: TransformEditorProps) {
  const updateTransform = useSceneStore((state) => state.updateTransform);
  const [expanded, setExpanded] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransformFormData>({
    resolver: zodResolver(transformSchema),
    defaultValues: {
      positionX: transform.position.x,
      positionY: transform.position.y,
      positionZ: transform.position.z,
      rotationX: transform.rotation.x,
      rotationY: transform.rotation.y,
      rotationZ: transform.rotation.z,
      scaleX: transform.scale.x,
      scaleY: transform.scale.y,
      scaleZ: transform.scale.z,
    },
  });

  // Update form when transform changes
  useEffect(() => {
    reset({
      positionX: transform.position.x,
      positionY: transform.position.y,
      positionZ: transform.position.z,
      rotationX: transform.rotation.x,
      rotationY: transform.rotation.y,
      rotationZ: transform.rotation.z,
      scaleX: transform.scale.x,
      scaleY: transform.scale.y,
      scaleZ: transform.scale.z,
    });
  }, [transform, reset]);

  const onSubmit = (data: TransformFormData) => {
    updateTransform(
      gameObjectId,
      { x: data.positionX, y: data.positionY, z: data.positionZ },
      { x: data.rotationX, y: data.rotationY, z: data.rotationZ },
      { x: data.scaleX, y: data.scaleY, z: data.scaleZ }
    );
  };

  const handleBlur = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
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

        {/* Transform icon */}
        <Move3d className="h-4 w-4 text-muted-foreground" />

        <h4 className="font-medium text-sm flex-1">Transform</h4>
      </div>

      <CollapsibleContent className="px-3 pb-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Position */}
          <div>
            <Label className="text-xs font-semibold mb-2 block">Position</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label
                  htmlFor="positionX"
                  className="text-xs text-muted-foreground"
                >
                  X
                </Label>
                <Input
                  id="positionX"
                  type="number"
                  step="0.1"
                  disabled={disabled}
                  {...register("positionX", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.positionX ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label
                  htmlFor="positionY"
                  className="text-xs text-muted-foreground"
                >
                  Y
                </Label>
                <Input
                  id="positionY"
                  type="number"
                  step="0.1"
                  disabled={disabled}
                  {...register("positionY", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.positionY ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label
                  htmlFor="positionZ"
                  className="text-xs text-muted-foreground"
                >
                  Z
                </Label>
                <Input
                  id="positionZ"
                  type="number"
                  step="0.1"
                  disabled={disabled}
                  {...register("positionZ", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.positionZ ? "border-red-500" : ""}
                />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <Label className="text-xs font-semibold mb-2 block">Rotation</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label
                  htmlFor="rotationX"
                  className="text-xs text-muted-foreground"
                >
                  X
                </Label>
                <Input
                  id="rotationX"
                  type="number"
                  step="0.1"
                  disabled={disabled}
                  {...register("rotationX", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.rotationX ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label
                  htmlFor="rotationY"
                  className="text-xs text-muted-foreground"
                >
                  Y
                </Label>
                <Input
                  id="rotationY"
                  type="number"
                  step="0.1"
                  disabled={disabled}
                  {...register("rotationY", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.rotationY ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label
                  htmlFor="rotationZ"
                  className="text-xs text-muted-foreground"
                >
                  Z
                </Label>
                <Input
                  id="rotationZ"
                  type="number"
                  step="0.1"
                  disabled={disabled}
                  {...register("rotationZ", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.rotationZ ? "border-red-500" : ""}
                />
              </div>
            </div>
          </div>

          {/* Scale */}
          <div>
            <Label className="text-xs font-semibold mb-2 block">Scale</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label
                  htmlFor="scaleX"
                  className="text-xs text-muted-foreground"
                >
                  X
                </Label>
                <Input
                  id="scaleX"
                  type="number"
                  step="0.1"
                  min="0.001"
                  disabled={disabled}
                  {...register("scaleX", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.scaleX ? "border-red-500" : ""}
                />
                {errors.scaleX && (
                  <p className="text-xs text-red-500 mt-1">Must be positive</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="scaleY"
                  className="text-xs text-muted-foreground"
                >
                  Y
                </Label>
                <Input
                  id="scaleY"
                  type="number"
                  step="0.1"
                  min="0.001"
                  disabled={disabled}
                  {...register("scaleY", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.scaleY ? "border-red-500" : ""}
                />
                {errors.scaleY && (
                  <p className="text-xs text-red-500 mt-1">Must be positive</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="scaleZ"
                  className="text-xs text-muted-foreground"
                >
                  Z
                </Label>
                <Input
                  id="scaleZ"
                  type="number"
                  step="0.1"
                  min="0.001"
                  disabled={disabled}
                  {...register("scaleZ", { valueAsNumber: true })}
                  onBlur={handleBlur}
                  className={errors.scaleZ ? "border-red-500" : ""}
                />
                {errors.scaleZ && (
                  <p className="text-xs text-red-500 mt-1">Must be positive</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
