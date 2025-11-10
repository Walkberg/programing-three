import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { GameObjectItem } from "./GameObjectItem";

export function HierarchyPanel() {
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const selectedId = useEditorStore((state) => state.selectedId);

  // Filter root GameObjects (no parent)
  const rootGameObjects = gameObjects.filter((go) => go.parent === null);

  if (gameObjects.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No GameObjects in scene.
        <br />
        Click "Add GameObject" to create one.
      </div>
    );
  }

  return (
    <div className="p-2">
      {rootGameObjects.map((gameObject) => (
        <GameObjectItem
          key={gameObject.id}
          gameObject={gameObject}
          isSelected={gameObject.id === selectedId}
        />
      ))}
    </div>
  );
}
