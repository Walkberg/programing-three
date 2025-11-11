import { memo } from "react";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { GameObjectItem } from "./GameObjectItem";

function getGameObjectHierarchy(gameObjects: any[]): any[] {
  const map = new Map<string, any>();
  gameObjects.forEach((go) => map.set(go.id, { ...go }));
  // Attach children recursively
  gameObjects.forEach((go) => {
    go.children = go.children || [];
    go.children = go.children
      .map((cid: string) => map.get(cid))
      .filter(Boolean);
  });
  // Return root objects
  return gameObjects.filter((go) => go.parentId === null);
}

export const HierarchyPanel = memo(function HierarchyPanel() {
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const selectedId = useEditorStore((state) => state.selectedId);
  const toggleExpanded = useSceneStore((state) => state.toggleExpanded);

  if (gameObjects.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No GameObjects in scene.
        <br />
        Click "Add GameObject" to create one.
      </div>
    );
  }

  const roots = getGameObjectHierarchy(gameObjects);

  return (
    <div className="p-2">
      <RenderHierarchy
        nodes={roots}
        depth={0}
        selectedId={selectedId}
        toggleExpanded={toggleExpanded}
      />
    </div>
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
