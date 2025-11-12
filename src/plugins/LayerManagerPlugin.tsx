import { BasePlugin } from "@/core/plugin/base-plugin";

export class LayersPanelPlugin extends BasePlugin {
  public id = "layers-panel-plugin";
  public name = "Layers Panel";
  public description = "Ajoute un panneau de gestion des calques";
  public version = "1.0.0";

  register(): void {
    console.log("Activation du plugin Layers Panel");
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

const LayersPanelComponent: React.FC = () => (
  <div style={{ padding: "1rem" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {["Calque 1", "Calque 2", "Calque 3"].map((layer, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "0.375rem",
          }}
        >
          <span>📄</span>
          <span>{layer}</span>
        </div>
      ))}
    </div>
  </div>
);
