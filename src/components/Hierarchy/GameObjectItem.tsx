import { memo, useState } from "react";
import { useEditorStore } from "@/state/editorStore";
import { useSceneStore } from "@/state/sceneStore";
import type { GameObjectData } from "@/types";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  Box,
  Circle,
  Square,
  Camera,
  Sun,
  Dot,
} from "lucide-react";
// Helper to get icon by GameObject type
function getGameObjectIcon(gameObject: GameObjectData) {
  const mesh = gameObject.components.find(
    (c) => c.type === "MeshRenderer"
  ) as any;
  if (mesh) {
    switch (mesh.geometry) {
      case "cube":
        return <Box className="h-4 w-4 mr-1 text-muted-foreground" />;
      case "sphere":
        return <Circle className="h-4 w-4 mr-1 text-muted-foreground" />;
      case "plane":
        return <Square className="h-4 w-4 mr-1 text-muted-foreground" />;
      default:
        return <Dot className="h-4 w-4 mr-1 text-muted-foreground" />;
    }
  }
  if (gameObject.components.some((c) => c.type === "Camera")) {
    return <Camera className="h-4 w-4 mr-1 text-muted-foreground" />;
  }
  if (gameObject.components.some((c) => c.type === "Light")) {
    return <Sun className="h-4 w-4 mr-1 text-muted-foreground" />;
  }
  // Default for empty
  return <Dot className="h-4 w-4 mr-1 text-muted-foreground" />;
}

interface GameObjectItemProps {
  gameObject: GameObjectData;
  isSelected: boolean;
  depth?: number;
  onToggle?: (id: string) => void;
  childrenItems?: React.ReactNode;
}

/**
 * GameObjectItem with React.memo optimization (T080)
 * Only re-renders when gameObject, isSelected, or depth changes
 */
export const GameObjectItem = memo(function GameObjectItem({
  gameObject,
  isSelected,
  depth = 0,
  onToggle,
  childrenItems,
}: GameObjectItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(gameObject.name);

  const selectGameObject = useEditorStore((state) => state.selectGameObject);
  const updateGameObject = useSceneStore((state) => state.updateGameObject);
  const mode = useEditorStore((state) => state.mode);

  // Find children
  const hasChildren = gameObject.children && gameObject.children.length > 0;

  const handleClick = () => {
    if (mode === "edit") {
      selectGameObject(gameObject.id);
    }
  };

  const handleDoubleClick = () => {
    if (mode === "edit") {
      setIsRenaming(true);
    }
  };

  const handleRename = () => {
    if (name.trim() && name !== gameObject.name) {
      updateGameObject(gameObject.id, { name: name.trim() });
    } else {
      setName(gameObject.name);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setName(gameObject.name);
      setIsRenaming(false);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center px-2 py-1 rounded cursor-pointer hover:bg-accent group",
          isSelected && "bg-accent",
          mode === "play" && "cursor-default"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {hasChildren ? (
          <button
            type="button"
            className="mr-1 p-0 bg-transparent border-none outline-none focus:outline-none"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(gameObject.id);
            }}
            aria-label={gameObject.isExpanded ? "Collapse" : "Expand"}
          >
            {gameObject.isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5 mr-1" />
        )}

        {getGameObjectIcon(gameObject)}
        {isRenaming ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="flex-1 px-1 py-0 text-sm bg-background border border-border rounded"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{gameObject.name}</span>
        )}
      </div>
      {/* Render children if expanded */}
      {hasChildren && gameObject.isExpanded && childrenItems}
    </div>
  );
});
