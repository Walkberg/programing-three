import { memo } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { GameObjectItem } from "./GameObjectItem";
import { toast } from "@/hooks/use-toast";
import type { GameObjectData } from "@/types";

function getGameObjectHierarchy(gameObjects: GameObjectData[]): any[] {
  const map = new Map<string, any>();

  gameObjects.forEach((go) => {
    map.set(go.id, {
      ...go,
      children: [...(go.children || [])],
    });
  });

  map.forEach((go) => {
    go.children = go.children
      .map((cid: string) => map.get(cid))
      .filter(Boolean);
  });

  return Array.from(map.values()).filter((go) => go.parentId === null);
}

export const HierarchyPanel = memo(function HierarchyPanel() {
  // Always call hooks at top level
  const { setNodeRef: setRootDropRef, isOver: isOverRoot } = useDroppable({
    id: "hierarchy-root-drop",
  });
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const selectedId = useEditorStore((state) => state.selectedId);
  const toggleExpanded = useSceneStore((state) => state.toggleExpanded);
  const setParent = useSceneStore((state) => state.setParent);
  const canSetParent = useSceneStore((state) => state.canSetParent);
  const reorderSibling = useSceneStore((state) => state.reorderSibling);

  const showToast = (opts: {
    title: string;
    variant?: "default" | "destructive" | null;
  }) => {
    toast({ title: opts.title, variant: opts.variant });
  };

  // Drag-and-drop handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const draggedId = active.data?.current?.gameObjectId;
    const overData = over.data?.current;

    if (!draggedId) return;

    if (over?.id === "hierarchy-root-drop") {
      if (!canSetParent(draggedId, null)) {
        showToast({
          title: "Cannot create circular parent-child relationship",
          variant: "destructive",
        });
        return;
      }
      setParent(draggedId, null);
      return;
    }

    if (!overData) return;
    if (draggedId === overData.targetId) return;

    const position = overData.position;

    if (position === "center") {
      if (!canSetParent(draggedId, overData.targetId)) {
        showToast({
          title: "Cannot create circular parent-child relationship",
          variant: "destructive",
        });
        return;
      }
      setParent(draggedId, overData.targetId);
    } else if (position === "above" || position === "below") {
      const target = gameObjects.find((go) => go.id === overData.targetId);
      if (!target) return;

      const parentId = target.parentId;

      if (!canSetParent(draggedId, parentId)) {
        showToast({
          title: "Cannot create circular parent-child relationship",
          variant: "destructive",
        });
        return;
      }

      setParent(draggedId, parentId);

      setTimeout(() => {
        reorderSibling(draggedId, overData.targetId, position);
      }, 0);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual drop indicators handled by GameObjectItem drop zones
  };

  if (gameObjects.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No GameObjects in scene.
        <br />
        Click "Add GameObject" to create one.
        <div
          ref={setRootDropRef}
          id="hierarchy-root-drop"
          style={{
            height: 4,
            marginBottom: 4,
            background: isOverRoot ? "#60a5fa" : undefined,
          }}
          className="w-full rounded transition-colors"
        />
      </div>
    );
  }

  const roots = getGameObjectHierarchy(gameObjects);

  return (
    <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="p-2">
        <div
          ref={setRootDropRef}
          id="hierarchy-root-drop"
          style={{
            height: 8,
            marginBottom: 4,
            background: isOverRoot ? "#60a5fa" : undefined,
          }}
          className="w-full rounded transition-colors"
        />
        <RenderHierarchy
          nodes={roots}
          depth={0}
          selectedId={selectedId}
          toggleExpanded={toggleExpanded}
        />
      </div>
    </DndContext>
  );
});

function RenderHierarchy({
  nodes,
  depth = 0,
  selectedId,
  toggleExpanded,
}: {
  nodes: any[];
  depth?: number;
  selectedId: string | null;
  toggleExpanded: (id: string) => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <GameObjectItem
          key={node.id}
          gameObject={node}
          isSelected={node.id === selectedId}
          depth={depth}
          onToggle={toggleExpanded}
          childrenItems={
            node.children && node.children.length > 0 ? (
              <RenderHierarchy
                nodes={node.children}
                depth={depth + 1}
                selectedId={selectedId}
                toggleExpanded={toggleExpanded}
              />
            ) : null
          }
        />
      ))}
    </>
  );
}
