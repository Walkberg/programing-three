// Layout Manager Popover Component
// Feature: 003-docking-panel-system / US6 - Layout Presets Manager

import { RotateCcw, Save, Settings2 } from "lucide-react";
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
import { usePanels } from "@/features/plugin/pluggin-hook";
import type { PanelType } from "@/core/plugin/plugin.type";

export function LayoutManagerPopover() {
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const {
    listPresets,
    getActivePresetId,
    loadPreset,
    resetLayout,
    addDockerPanel,
  } = useLayoutStore();

  const presets = listPresets();
  const activePresetId = getActivePresetId();
  const allPanels = usePanels();

  // Find first leaf zone to add panels to

  const handleAddPanel = (panelId: string) =>
    addDockerPanel(panelId as PanelType);

  const handlePresetLoad = (id: string) => {
    loadPreset(id);
    setOpen(false);
  };

  const handleResetLayout = () => {
    resetLayout();
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
              <h4 className="font-semibold text-sm">Layout Manager</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 h-8"
                  onClick={handleResetLayout}
                  title="Reset to default layout"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 h-8"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              </div>
            </div>

            <Separator />

            {/* Available Panels Section */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Available Panels</h4>
              <div className="flex flex-col gap-2">
                {allPanels.map((panel) => {
                  const Icon = panel.icon;
                  return (
                    <button
                      key={panel.id}
                      onClick={() => handleAddPanel(panel.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-sm border border-border"
                      title={panel.description}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{panel.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Preset List */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Layout Presets</h4>
              <div className="max-h-[300px] overflow-y-auto">
                <PresetList
                  presets={presets}
                  activePresetId={activePresetId}
                  onPresetLoad={handlePresetLoad}
                />
              </div>
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
