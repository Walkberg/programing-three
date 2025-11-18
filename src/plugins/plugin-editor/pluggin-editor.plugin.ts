import { BasePlugin } from "@/editor/plugin/base-plugin";
import { Edit2Icon } from "lucide-react";
import { PluginEditorPanel } from "./PluginEditorPanel";

export class PluginEditor extends BasePlugin {
  public id = "plugin-editor-plugin";
  public name = "Plugin Editor";
  public description =
    "Ajoute un panneau de code et une commande pour l'ouvrir";
  public version = "1.0.0";

  register(): void {
    this.registerPanel("plugineditor", {
      id: "plugineditor",
      title: "Plugin Editor",
      icon: Edit2Icon,
      component: PluginEditorPanel,
      defaultSize: { height: 200 },
      description: "Log messages and errors",
    });

    this.registerCommand("unregister-plugin", (pluginId: string) => {
      if (this.editor.hasPlugin(pluginId)) {
        this.editor.plugins.unregisterPlugin(pluginId);
      }
    });

    this.registerCommand("register-plugin", (pluginId: string) => {});
  }

  unregister(): void {
    console.log("Désactivation du plugin Code Panel");
  }
}
