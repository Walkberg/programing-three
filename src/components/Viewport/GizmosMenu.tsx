import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/state/editorStore";
import type { GizmoMode, GizmoSpace } from "@/types";

export function GizmosMenu() {
  const gizmoMode = useEditorStore((s) => s.gizmoMode);
  const gizmoSpace = useEditorStore((s) => s.gizmoSpace);
  const gizmoSnap = useEditorStore((s) => s.gizmoSnap);
  const setGizmoMode = useEditorStore((s) => s.setGizmoMode);
  const setGizmoSpace = useEditorStore((s) => s.setGizmoSpace);
  const setGizmoSnap = useEditorStore((s) => s.setGizmoSnap);

  const toggleSpace = () => {
    setGizmoSpace(gizmoSpace === "world" ? "local" : "world");
  };

  const setSnapValue = (key: string, value: string) => {
    const num = value === "" ? null : Number(value);
    const newSnap = { ...(gizmoSnap || {}) } as any;
    newSnap[key] = Number.isFinite(num) ? num : null;
    setGizmoSnap(newSnap);
  };

  return (
    <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm p-3 rounded shadow-md w-56">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Gizmos</div>
        <div className="text-xs text-muted-foreground">Mode: {gizmoMode}</div>
      </div>

      <div className="flex gap-2 mb-2">
        <Button
          size="sm"
          variant={gizmoMode === "translate" ? "default" : "ghost"}
          onClick={() => setGizmoMode("translate")}
        >
          Translate
        </Button>
        <Button
          size="sm"
          variant={gizmoMode === "rotate" ? "default" : "ghost"}
          onClick={() => setGizmoMode("rotate")}
        >
          Rotate
        </Button>
        <Button
          size="sm"
          variant={gizmoMode === "scale" ? "default" : "ghost"}
          onClick={() => setGizmoMode("scale")}
        >
          Scale
        </Button>
        <Button
          size="sm"
          variant={gizmoMode === "none" ? "default" : "ghost"}
          onClick={() => setGizmoMode("none")}
        >
          Off
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Label className="text-xs">Space</Label>
        <Button size="sm" variant="outline" onClick={toggleSpace}>
          {gizmoSpace === "world" ? "World" : "Local"}
        </Button>
      </div>

      <div className="mb-1">
        <div className="text-xs font-medium mb-1">Snap</div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Trans</Label>
            <Input
              type="number"
              value={gizmoSnap?.translate ?? ""}
              onChange={(e) => setSnapValue("translate", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs">Rotate°</Label>
            <Input
              type="number"
              value={gizmoSnap?.rotate ?? ""}
              onChange={(e) => setSnapValue("rotate", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs">Scale</Label>
            <Input
              type="number"
              value={gizmoSnap?.scale ?? ""}
              onChange={(e) => setSnapValue("scale", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Shortcuts: <kbd className="px-1 py-0.5 bg-muted rounded">W</kbd>{" "}
        <kbd className="px-1 py-0.5 bg-muted rounded">E</kbd>{" "}
        <kbd className="px-1 py-0.5 bg-muted rounded">R</kbd>{" "}
        <kbd className="px-1 py-0.5 bg-muted rounded">Q</kbd>
      </div>
    </div>
  );
}
