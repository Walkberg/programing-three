// Preset List Component
// Feature: 003-docking-panel-system / US6 - Layout Presets Manager

import { Check, Lock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { LayoutPreset } from "@/types/layout";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useLayoutStore } from "@/state/layoutStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PresetListProps {
  presets: Record<string, LayoutPreset>;
  activePresetId: string | null;
  onPresetLoad: (id: string) => void;
}

export function PresetList({
  presets,
  activePresetId,
  onPresetLoad,
}: PresetListProps) {
  const { deletePreset, renamePreset } = useLayoutStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<LayoutPreset | null>(
    null
  );
  const [newName, setNewName] = useState("");

  // Sort presets: built-in first (alphabetical), then user presets (newest first)
  const sortedPresets = Object.values(presets).sort((a, b) => {
    // Built-in presets first
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;

    // Within built-in, sort alphabetically
    if (a.isDefault && b.isDefault) {
      return a.name.localeCompare(b.name);
    }

    // Within user presets, sort by timestamp (newest first)
    return b.timestamp - a.timestamp;
  });

  const handleDelete = (preset: LayoutPreset) => {
    setSelectedPreset(preset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPreset) {
      deletePreset(selectedPreset.id);
      setDeleteDialogOpen(false);
      setSelectedPreset(null);
    }
  };

  const handleRename = (preset: LayoutPreset) => {
    setSelectedPreset(preset);
    setNewName(preset.name);
    setRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (selectedPreset && newName.trim()) {
      renamePreset(selectedPreset.id, newName.trim());
      setRenameDialogOpen(false);
      setSelectedPreset(null);
      setNewName("");
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (sortedPresets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No presets found</p>
        <p className="text-sm mt-2">Save your first layout preset to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {sortedPresets.map((preset) => {
          const isActive = preset.id === activePresetId;
          const isBuiltIn = preset.isDefault;

          return (
            <ContextMenu key={preset.id}>
              <ContextMenuTrigger asChild>
                <button
                  onClick={() => onPresetLoad(preset.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
                    hover:bg-accent transition-colors
                    ${isActive ? "bg-accent" : ""}
                  `}
                >
                  {/* Active indicator */}
                  <div className="w-4 shrink-0">
                    {isActive && <Check className="h-4 w-4 text-primary" />}
                  </div>

                  {/* Preset info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {preset.name}
                      </p>
                      {isBuiltIn && (
                        <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    {preset.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {preset.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(preset.timestamp)}
                    </p>
                  </div>

                  {/* Actions menu */}
                  {!isBuiltIn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </button>
              </ContextMenuTrigger>

              {!isBuiltIn && (
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => onPresetLoad(preset.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Load Preset
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleRename(preset)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDelete(preset)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              )}
            </ContextMenu>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Preset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPreset?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Preset</DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedPreset?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-name">New Name</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    confirmRename();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
