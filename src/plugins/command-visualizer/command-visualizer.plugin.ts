import { BasePlugin } from "@/editor/plugin/base-plugin";

import { Layers } from "lucide-react";
import type { Editor } from "@/editor/editor";
import { CommandVisualizer } from "./CommandVisualizer";

export class CommandVisualizerPlugin extends BasePlugin {
  public id = "command-visualizer";
  public name = "Command Visualizer";
  public description = "Visualize les commandes enregistrées dans l'éditeur";
  public version = "1.0.0";

  register(editor: Editor): void {
    editor.registerPanel("commandVisualizer", {
      id: "command-visualizer",
      title: "Command Visualizer",
      icon: Layers,
      component: CommandVisualizer,
      defaultSize: { width: 250 },
      description: "Scene object hierarchy tree",
    });

    //this.editor.commands.hasCommand(ADD_PANEL_COMMAND_ID);
  }

  unregister(): void {
    console.log("Désactivation du plugin Command Visualizer");
  }
}
