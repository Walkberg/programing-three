// Save Layout Dialog Component
// Feature: 003-docking-panel-system / US6 - Layout Presets Manager

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayoutStore } from "@/state/layoutStore";

interface SaveLayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveLayoutDialog({
  open,
  onOpenChange,
}: SaveLayoutDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { savePreset, listPresets } = useLayoutStore();

  const handleSave = () => {
    // Validate name
    if (!name.trim()) {
      setError("Please enter a preset name");
      return;
    }

    // Generate ID from name
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if ID already exists
    const presets = listPresets();
    if (presets[id]) {
      setError("A preset with this name already exists");
      return;
    }

    // Save preset
    const success = savePreset(name.trim(), description.trim() || undefined);

    if (success) {
      // Reset form and close
      setName("");
      setDescription("");
      setError(null);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // Reset form and close
    setName("");
    setDescription("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Layout Preset</DialogTitle>
          <DialogDescription>
            Save your current workspace layout as a preset that you can quickly
            switch to later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              placeholder="My Custom Layout"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="preset-description">Description (Optional)</Label>
            <Input
              id="preset-description"
              placeholder="Describe this layout..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Preset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
