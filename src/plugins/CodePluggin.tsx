import { BasePlugin } from "@/core/plugin/base-plugin";

export class CodePanelPlugin extends BasePlugin {
  public id = "code-panel-plugin";
  public name = "Code Panel";
  public description =
    "Ajoute un panneau de code et une commande pour l'ouvrir";
  public version = "1.0.0";

  register(): void {
    // Enregistrer la commande
    this.registerCommand("open-code-panel", () => {
      console.log("Ouverture du panneau de code");
      return "code-panel";
    });

    // Enregistrer l'action toolbar
    this.registerToolbarAction({
      type: "button",
      label: "Code",
      icon: "Code",
      action: "open-code-panel",
      tooltip: "Ouvrir l'éditeur de code",
    });
  }

  unregister(): void {
    console.log("Désactivation du plugin Code Panel");
  }
}

const CodePanelComponent: React.FC = () => (
  <div
    style={{
      padding: "1rem",
      backgroundColor: "#1e1e1e",
      color: "#4ade80",
      fontFamily: "monospace",
      fontSize: "0.875rem",
      borderRadius: "0.375rem",
    }}
  >
    <div style={{ marginBottom: "0.5rem" }}>
      &gt; function helloWorld() {"{"}
    </div>
    <div style={{ marginLeft: "1rem", marginBottom: "0.5rem" }}>
      console.log("Hello from plugin!");
    </div>
    <div style={{ marginBottom: "0.5rem" }}>{"}"}</div>
    <div style={{ color: "#6b7280", marginTop: "1rem" }}>
      // Panel ajouté par plugin
    </div>
  </div>
);
