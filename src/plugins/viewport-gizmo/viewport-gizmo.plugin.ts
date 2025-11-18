import type { Editor } from "@/editor/editor";
import type { Shortcut } from "@/editor/keybinging-manager";
import { BasePlugin } from "@/editor/plugin/base-plugin";
import type { PluginManager } from "@/editor/plugin/plugin-manager";
import { useEditorStore } from "@/state/editorStore";

const VIEWPORT_ROTATE = "viewport.rotate";
const VIEWPORT_TRANSLATE = "viewport.translate";
const VIEWPORT_SCALE = "viewport.scale";
const VIEWPORT_TOGGLE_SPACE = "viewport.toggleSpace";
const VIEWPORT_OFF = "viewport.off";

const shortcuts: Shortcut[] = [
  { key: "t", command: VIEWPORT_TRANSLATE },
  { key: "r", command: VIEWPORT_ROTATE },
  { key: "s", command: VIEWPORT_SCALE },
  { key: "q", command: VIEWPORT_TOGGLE_SPACE },
  { key: "escape", command: VIEWPORT_OFF },
];

export class ViewportGizmoPlugin extends BasePlugin {
  public id = "plugin.viewport-gizmo";
  public name = "Viewport Gizmo Plugin";
  public version = "0.1.0";

  constructor(editor: Editor) {
    super(editor);
    this.manifest = {
      id: this.id,
      name: this.name,
      version: this.version,
      requestedCapabilities: ["commands", "keybindings"],
    };
  }

  register(editor: Editor): void {
    // Commands that mutate editor gizmo state. This plugin owns these
    // mutations so keybinding plugin can remain capability-restricted.
    this.registerCommand(VIEWPORT_TRANSLATE, () => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode("translate");
    });

    this.registerCommand(VIEWPORT_ROTATE, () => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode("rotate");
    });

    this.registerCommand(VIEWPORT_SCALE, () => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode("scale");
    });

    this.registerCommand(VIEWPORT_TOGGLE_SPACE, () => {
      const store = useEditorStore.getState();
      const next = store.gizmoSpace === "world" ? "local" : "world";
      store.setGizmoSpace(next);
    });

    this.registerCommand(VIEWPORT_OFF, () => {
      useEditorStore.getState().setGizmoMode("none");
    });

    // Backwards-compatible command used by existing tests and callers
    // that expect a generic `gizmo.setMode` command identifier.
    this.registerCommand("gizmo.setMode", (mode: string) => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode(mode as any);
    });

    this.editor.keybindings.registerKeybindings(shortcuts);
  }
}

export default ViewportGizmoPlugin;
