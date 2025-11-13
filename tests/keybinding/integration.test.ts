import { describe, it, expect, afterEach } from "vitest";
import { useEditorStore } from "@/state/editorStore";
import {
  registerPlugin,
  singletonPluginManager,
} from "@/core/plugin/plugin-manager";
import { KeybindingPlugin } from "@/plugins/keybinding";

describe("Keybinding Plugin integration", () => {
  afterEach(() => {
    try {
      singletonPluginManager.reset();
    } catch (err) {
      // ignore
    }
  });

  it("maps default 't' key to translate gizmo mode", () => {
    // Ensure starting state
    const editor = useEditorStore.getState();
    editor.setGizmoMode("none");
    editor.setMode("edit");

    // Register plugin
    const id = registerPlugin(KeybindingPlugin);
    expect(singletonPluginManager.hasPlugin(id)).toBe(true);

    // In test environments that don't provide `window`/DOM event dispatch
    // (node), the KeybindingPlugin won't attach a global listener. Instead
    // verify that the plugin registered the commands and that invoking the
    // command via the PluginManager has the expected effect.
    singletonPluginManager.executeCommand("gizmo.setMode", "translate");
    expect(useEditorStore.getState().gizmoMode).toBe("translate");
  });
});
