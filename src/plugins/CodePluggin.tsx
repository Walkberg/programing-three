import { Button } from "@/components/ui/button";
import { BasePlugin } from "@/core/plugin/base-plugin";
import { usePluginManager } from "@/features/plugin/PlugginProvider";
import { House } from "lucide-react";

export class CodePanelPlugin extends BasePlugin {
  public id = "code-panel-plugin";
  public name = "Code Panel";
  public description =
    "Ajoute un panneau de code et une commande pour l'ouvrir";
  public version = "1.0.0";

  register(): void {
    this.registerCommand("open-code-panel", () => {
      console.log("Ouverture du panneau de code depuis le plugin");
      this.executeCommand("docking.add-panel", {
        id: "code",
        title: "Code",
      });
    });

    this.registerToolbarAction({
      type: "button",
      label: "Code",
      icon: "Code",
      action: "open-code-panel",
      tooltip: "Ouvrir l'éditeur de code",
    });

    this.registerPanel("boujour", {
      id: "boujour",
      title: "Bonjour",
      icon: House,
      component: CodePanelComponent,
      defaultSize: { height: 200 },
      description: "Log messages and errors",
    });
  }

  unregister(): void {
    console.log("Désactivation du plugin Code Panel");
  }
}

const CodePanelComponent: React.FC = () => {
  const pluginManager = usePluginManager();

  const handleAddPannel = () => {
    pluginManager.executeCommand("docking.add-panel", "code");
  };

  return (
    <div>
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
      <Button onClick={handleAddPannel}>Creer un nouveau Pannel</Button>
    </div>
  );
};
