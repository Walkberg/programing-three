import { BasePlugin } from "@/core/plugin/base-plugin";

import { HierarchyPanel } from "@/components/Hierarchy/HierarchyPanel";
import { SceneViewport } from "@/components/Viewport/SceneViewport";
import { InspectorPanel } from "@/components/Inspector/InspectorPanel";
import { ConsolePanel } from "@/components/Console/ConsolePanel";
import { AssetsPanel } from "@/components/Assets/AssetsPanel";
import {
  Box,
  Code,
  FileText,
  Folder,
  Gamepad2,
  Layers,
  Terminal,
} from "lucide-react";

const ADD_PANEL_COMMAND_ID = "docking.add-panel";

export class DockingPanelPlugin extends BasePlugin {
  public id = "docking-panel";
  public name = "Docking Panel";
  public description =
    "Ajoute un panneau de docking et une commande pour l'ouvrir";
  public version = "1.0.0";

  register(): void {
    this.registerPanel("hierarchy", {
      id: "hierarchy",
      title: "Hierarchy",
      icon: Layers,
      component: HierarchyPanel,
      defaultSize: { width: 250 },
      description: "Scene object hierarchy tree",
    });

    this.registerPanel("scene", {
      id: "scene",
      title: "Scene",
      icon: Box,
      component: SceneViewport,
      description: "3D scene viewport for editing",
    });

    this.registerPanel("game", {
      id: "game",
      title: "Game",
      icon: Gamepad2,
      component: SceneViewport,
      description: "Game preview viewport",
    });

    this.registerPanel("code", {
      id: "code",
      title: "Code",
      icon: Code,
      component: SceneViewport,
      description: "Code editor for scripts",
    });

    this.registerPanel("inspector", {
      id: "inspector",
      title: "Inspector",
      icon: FileText,
      component: InspectorPanel,
      defaultSize: { width: 300 },
      description: "Component properties editor",
    });
    this.registerPanel("console", {
      id: "console",
      title: "Console",
      icon: Terminal,
      component: ConsolePanel,
      defaultSize: { height: 200 },
      description: "Log messages and errors",
    });
    this.registerPanel("assets", {
      id: "assets",
      title: "Assets",
      icon: Folder,
      component: AssetsPanel,
      defaultSize: { height: 200 },
      description: "Project asset browser",
    });

    this.registerCommand(ADD_PANEL_COMMAND_ID, () => {
      console.log("Ajout d'un panneau ");
    });
  }

  unregister(): void {
    console.log("Désactivation du plugin Code Panel");
  }
}
