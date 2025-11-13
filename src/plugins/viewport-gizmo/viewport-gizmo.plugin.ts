import { BasePlugin } from "@/core/plugin/base-plugin";
import type { PluginManager } from "@/core/plugin/plugin-manager";
import { useEditorStore } from "@/state/editorStore";

export class ViewportGizmoPlugin extends BasePlugin {
  public id = "plugin.viewport-gizmo";
  public name = "Viewport Gizmo Plugin";
  public version = "0.1.0";

  constructor(manager: PluginManager) {
    super(manager);
    this.manifest = {
      id: this.id,
      name: this.name,
      version: this.version,
      requestedCapabilities: ["commands", "keybindings"],
    };
  }

  register(): void {
    // Commands that mutate editor gizmo state. This plugin owns these
    // mutations so keybinding plugin can remain capability-restricted.
    this.registerCommand("viewport.translate", () => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode("translate");
    });

    this.registerCommand("viewport.rotate", () => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode("rotate");
    });

    this.registerCommand("viewport.scale", () => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode("scale");
    });

    this.registerCommand("viewport.toggleSpace", () => {
      const store = useEditorStore.getState();
      const next = store.gizmoSpace === "world" ? "local" : "world";
      store.setGizmoSpace(next as any);
    });

    this.registerCommand("gizmo.off", () => {
      useEditorStore.getState().setGizmoMode("none");
    });

    // Backwards-compatible command surface used by toolbar and tests.
    this.registerCommand("gizmo.setMode", (mode?: string) => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (!setGizmoMode) return;
      const m = (mode as any) || "none";
      setGizmoMode(m as any);
    });

    this.registerCommand("gizmo.toggleSpace", () => {
      const store = useEditorStore.getState();
      const next = store.gizmoSpace === "world" ? "local" : "world";
      store.setGizmoSpace(next as any);
    });
  }
}

export default ViewportGizmoPlugin;
