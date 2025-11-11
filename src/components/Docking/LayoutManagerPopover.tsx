// Layout Manager Popover Component
// Feature: 003-docking-panel-system / US6 - Layout Presets Manager

import { Save, Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useLayoutStore } from "@/state/layoutStore";
import { PresetList } from "./PresetList";
import { SaveLayoutDialog } from "./SaveLayoutDialog";

export function LayoutManagerPopover() {
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const { listPresets, getActivePresetId, loadPreset } = useLayoutStore();

  const presets = listPresets();
  const activePresetId = getActivePresetId();

  const handlePresetLoad = (id: string) => {
    loadPreset(id);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            title="Manage Layouts"
          >
            <Settings2 className="h-4 w-4" />
            Layouts
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Layout Presets</h4>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 h-8"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save className="h-3 w-3" />
                Save Current
              </Button>
            </div>

            <Separator />

            {/* Preset List */}
            <div className="max-h-[400px] overflow-y-auto">
              <PresetList
                presets={presets}
                activePresetId={activePresetId}
                onPresetLoad={handlePresetLoad}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Save Layout Dialog */}
      <SaveLayoutDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
    </>
  );
}
