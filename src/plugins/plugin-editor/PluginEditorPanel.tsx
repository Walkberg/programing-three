import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEditor } from "@/features/plugin/PlugginProvider";
import { usePluginStateStore } from "@/plugins/plugin-editor/pluginStateStore";

import { useEffect, useState } from "react";

export const PluginEditorPanel: React.FC = () => {
  const editor = useEditor();
  const { isPluginEnabled, togglePlugin } = usePluginStateStore();
  const [open, setOpen] = useState(false);

  const plugins = editor.plugins.getPlugins();

  const handleRegisterPlugin = (pluginId: string) => {
    editor.executeCommand("register-plugin", pluginId);
  };

  const handleUnregisterPlugin = (pluginId: string) => {
    editor.executeCommand("unregister-plugin", pluginId);
  };

  const handleTogglePlugin = (pluginId: string) => {
    if (isPluginEnabled(pluginId)) {
      handleUnregisterPlugin(pluginId);
    } else {
      handleRegisterPlugin(pluginId);
    }
    togglePlugin(pluginId);
  };

  useEffect(() => {
    editor.registerSimpleCommand("docking.add-panel", () => {
      setOpen(true);
    });
  }, []);

  return (
    <div>
      {plugins.map((plugin) => (
        <div
          className="flex gap-2 items-center"
          key={plugin.id}
          style={{ marginBottom: "1rem" }}
        >
          <Checkbox
            checked={isPluginEnabled(plugin.id)}
            onCheckedChange={() => handleTogglePlugin(plugin.id)}
          />
          <h3>{plugin.name}</h3>
        </div>
      ))}
      <Button>UnBouton pourqupoi pas</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <h2>Ajouter un panneau</h2>
        </DialogContent>
      </Dialog>
    </div>
  );
};
