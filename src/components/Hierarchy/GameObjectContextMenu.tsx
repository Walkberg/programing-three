import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { PRESET_CONFIGS, useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import type { GameObjectData } from "@/types";
import { memo } from "react";
import { ComponentRegistry } from "@/core/Component";

function getPresetConfigs() {
  return Object.entries(PRESET_CONFIGS).map(([key, preset]) => ({
    type: key,
    label: preset.name,
  }));
}

export interface GameObjectContextMenuProps {
  gameObject?: GameObjectData;
  children?: React.ReactNode;
}

export const GameObjectContextMenu = memo(function GameObjectContextMenu({
  gameObject,
  children,
}: GameObjectContextMenuProps) {
  const addChild = useSceneStore((state) => state.createGameObjectFromPreset);
  const addComponent = useSceneStore((state) => state.addComponent);
  const removeGameObject = useSceneStore((state) => state.removeGameObject);
  const selectGameObject = useEditorStore((state) => state.selectGameObject);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {gameObject ? (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Add Child</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {getPresetConfigs().map((preset) => (
                  <ContextMenuItem
                    key={preset.type}
                    onClick={() => {
                      addChild(preset.type, gameObject.id);
                      selectGameObject(gameObject.id);
                    }}
                  >
                    {preset.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Add Component</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {ComponentRegistry.getAvailableTypes().map((type) => (
                  <ContextMenuItem
                    key={type}
                    onClick={() => {
                      const ComponentClass = ComponentRegistry.get(type);
                      if (ComponentClass) {
                        const instance = new ComponentClass({ enabled: true });
                        addComponent(gameObject.id, instance);
                      }
                    }}
                  >
                    {type}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem onClick={() => removeGameObject(gameObject.id)}>
              Delete
            </ContextMenuItem>
          </>
        ) : (
          <>
            {getPresetConfigs().map((preset) => (
              <ContextMenuItem
                key={preset.type}
                onClick={() => addChild(preset.type, null)}
              >
                {preset.label}
              </ContextMenuItem>
            ))}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
});
