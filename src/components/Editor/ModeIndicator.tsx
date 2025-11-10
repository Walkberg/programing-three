import { useEditorStore } from "@/state/editorStore";
import { cn } from "@/lib/utils";

export function ModeIndicator() {
  const mode = useEditorStore((state) => state.mode);

  return (
    <div className="h-8 border-b border-border bg-card flex items-center px-4">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            mode === "play" ? "bg-green-500 animate-pulse" : "bg-blue-500"
          )}
        />
        <span className="text-xs font-medium">
          {mode === "edit" ? "Edit Mode" : "Playing"}
        </span>
      </div>
    </div>
  );
}
