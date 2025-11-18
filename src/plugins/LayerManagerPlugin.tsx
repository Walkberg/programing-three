import { BasePlugin } from "@/editor/plugin/base-plugin";

export class LayersPanelPlugin extends BasePlugin {
  public id = "layers-panel-plugin";
  public name = "Layers Panel";
  public description = "Ajoute un panneau de gestion des calques";
  public version = "1.0.0";

  register(): void {
    this.registerCommand("open-layers-panel", () => {
      console.log("Ouverture du panneau des calques");
      return "layers-panel";
    });

    this.registerToolbarAction({
      type: "button",
      label: "Calques",
      icon: "Layers",
      action: "open-layers-panel",
      tooltip: "Gérer les calques",
    });
  }

  unregister(): void {
    console.log("Désactivation du plugin Layers Panel");
  }
}
