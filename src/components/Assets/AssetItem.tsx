import { useState } from "react";
import type { Asset } from "@/types/assets";
import { useAssetStore } from "@/state/assetStore";
import { useSceneStore } from "@/state/sceneStore"; // T060
import { AssetService } from "@/services/AssetService";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // T061
import { Button } from "@/components/ui/button"; // T061
import { Trash2, Edit2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * AssetItem - Single asset card with thumbnail and actions (T016)
 * Shows thumbnail, name, size, and context menu for delete/rename/download
 */

interface AssetItemProps {
  asset: Asset;
}

export function AssetItem({ asset }: AssetItemProps) {
  const selectedAssetId = useAssetStore((state) => state.selectedAssetId);
  const selectAsset = useAssetStore((state) => state.selectAsset);
  const removeAsset = useAssetStore((state) => state.removeAsset);
  const updateAsset = useAssetStore((state) => state.updateAsset);
  const gameObjects = useSceneStore((state) => state.gameObjects); // T060
  const { toast } = useToast();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(asset.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // T061
  const [assetUsage, setAssetUsage] = useState<
    Array<{ gameObjectId: string; gameObjectName: string }>
  >([]); // T061

  const isSelected = selectedAssetId === asset.id;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = async () => {
    // T060-T061: Check if asset is in use before deleting
    const usage = AssetService.findAssetUsage(asset.id, gameObjects);

    if (usage.length > 0) {
      setAssetUsage(usage);
      setShowDeleteDialog(true);
      return;
    }

    // Asset not in use, delete immediately
    await performDelete();
  };

  const performDelete = async () => {
    try {
      await AssetService.deleteAsset(asset.id);
      removeAsset(asset.id);
      setShowDeleteDialog(false);
      toast({
        title: "Asset Deleted",
        description: `${asset.name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleRename = async () => {
    if (newName.trim() === "" || newName === asset.name) {
      setIsRenaming(false);
      return;
    }

    try {
      const updatedAsset = { ...asset, name: newName.trim() };
      await AssetService.updateAsset(updatedAsset);
      updateAsset(asset.id, { name: newName.trim() });
      setIsRenaming(false);
      toast({
        title: "Asset Renamed",
        description: `Renamed to ${newName.trim()}`,
      });
    } catch (error) {
      toast({
        title: "Rename Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    try {
      const blob =
        asset.data instanceof Blob ? asset.data : new Blob([asset.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: `Downloading ${asset.name}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`group cursor-pointer rounded-lg border-2 transition-colors ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border hover:border-accent bg-card"
            }`}
            onClick={() => selectAsset(asset.id)}
            onDoubleClick={() => setIsRenaming(true)} // T058: Double-click to rename
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
              {asset.thumbnail ? (
                <img
                  src={asset.thumbnail}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase">
                  {asset.type}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2">
              {isRenaming ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                      setIsRenaming(false);
                      setNewName(asset.name);
                    }
                  }}
                  className="w-full px-1 text-xs font-medium bg-background border border-border rounded"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-xs font-medium truncate" title={asset.name}>
                  {asset.name}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatSize(asset.size)}
              </p>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsRenaming(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* T061: Confirmation dialog for in-use assets */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset?</DialogTitle>
            <DialogDescription>
              This asset is currently being used by {assetUsage.length}{" "}
              GameObject{assetUsage.length !== 1 ? "s" : ""}:
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-48 overflow-y-auto">
            <ul className="space-y-1">
              {assetUsage.map((usage) => (
                <li
                  key={usage.gameObjectId}
                  className="text-sm text-muted-foreground"
                >
                  • {usage.gameObjectName}
                </li>
              ))}
            </ul>
          </div>

          <DialogDescription className="text-destructive">
            Deleting this asset will remove it from all GameObjects. This action
            cannot be undone.
          </DialogDescription>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={performDelete}>
              Delete Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
