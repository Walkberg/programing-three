import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import type { GameObjectData } from "@/types";
import React, { memo, useState } from "react";
import { ComponentRegistry } from "@/core/Component";
import { DeleteGameObjectDialog } from "./DeleteGameObjectDialog";
import { PRESET_CONFIGS } from "@/state/presetConfig";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<GameObjectData | null>(null);

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
            <ContextMenuItem
              onClick={() => {
                if (gameObject.children && gameObject.children.length > 0) {
                  // open confirmation dialog
                  setDialogTarget(gameObject);
                  setShowDeleteDialog(true);
                } else {
                  removeGameObject(gameObject.id);
                }
              }}
            >
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
      {/* Delete dialog */}
      {dialogTarget && (
        <DeleteGameObjectDialog
          open={showDeleteDialog}
          gameObject={dialogTarget}
          onClose={() => {
            setShowDeleteDialog(false);
            setDialogTarget(null);
          }}
          onConfirm={(deleteChildren) => {
            removeGameObject(dialogTarget.id, deleteChildren);
            setShowDeleteDialog(false);
            setDialogTarget(null);
          }}
        />
      )}
    </ContextMenu>
  );
});
