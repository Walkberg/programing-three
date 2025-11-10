import { useState } from "react";
import { useEditorStore } from "@/state/editorStore";
import { useSceneStore } from "@/state/sceneStore";
import type { GameObjectData } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface GameObjectItemProps {
  gameObject: GameObjectData;
  isSelected: boolean;
  depth?: number;
}

export function GameObjectItem({
  gameObject,
  isSelected,
  depth = 0,
}: GameObjectItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(gameObject.name);

  const selectGameObject = useEditorStore((state) => state.selectGameObject);
  const updateGameObject = useSceneStore((state) => state.updateGameObject);
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const mode = useEditorStore((state) => state.mode);

  // Find children
  const children = gameObjects.filter((go) => go.parent === gameObject.id);
  const hasChildren = children.length > 0;

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
        {hasChildren && (
          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
        )}
        {!hasChildren && <div className="w-5 mr-1" />}

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

      {/* Render children */}
      {hasChildren && (
        <div>
          {children.map((child) => (
            <GameObjectItem
              key={child.id}
              gameObject={child}
              isSelected={useEditorStore.getState().selectedId === child.id}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
