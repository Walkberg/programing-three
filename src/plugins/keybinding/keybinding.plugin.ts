import { BasePlugin } from "@/core/plugin/base-plugin";
import type { PluginManager } from "@/core/plugin/plugin-manager";
import { useKeybindingStore, defaultShortcuts } from "./store";
import defaultKeybindingOptions from "./options";
import { useEditorStore } from "@/state/editorStore";

/**
 * KeybindingPlugin
 * - Registers small set of editor commands that reflect gizmo actions
 * - Attaches a global keydown listener that maps shortcuts -> `executeCommand`
 * - Does not mutate editor state directly; relies on commands and the PluginManager
 */
export class KeybindingPlugin extends BasePlugin {
  public id = "plugin.keybinding";
  public name = "Keybinding Plugin";
  public version = "0.1.0";

  private _unsubStore: (() => void) | null = null;
  private _onKeyDown = this._handleKeyDown.bind(this);
  private _lastHandled = 0;
  private _opts = defaultKeybindingOptions;

  constructor(manager: PluginManager) {
    super(manager);
    // declare manifest for tooling / capability checks
    this.manifest = {
      id: this.id,
      name: this.name,
      version: this.version,
      requestedCapabilities: ["keybindings"],
    };
  }

  register(): void {
    // Register commands that operate on gizmo/editor state. The command
    // implementations call into the editor store (via getState) so that tests
    // and other plugins can call `executeCommand` and have a single source of truth.
    this.registerCommand("gizmo.setMode", (mode: string) => {
      const setGizmoMode = useEditorStore.getState().setGizmoMode;
      if (setGizmoMode) setGizmoMode(mode as any);
    });

    this.registerCommand("gizmo.toggleSpace", () => {
      const store = useEditorStore.getState();
      const next = store.gizmoSpace === "world" ? "local" : "world";
      store.setGizmoSpace(next as any);
    });

    this.registerCommand("gizmo.off", () => {
      useEditorStore.getState().setGizmoMode("none");
    });

    // Attach global key listener (reads shortcuts from the plugin-scoped store)
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("keydown", this._onKeyDown);
    }

    // Keep a subscription to the shortcuts store so that we can react if
    // a test or other code changes shortcuts at runtime (not strictly needed
    // for the listener, but allowed for future extensions).
    if ((useKeybindingStore as any).subscribe) {
      this._unsubStore = (useKeybindingStore as any).subscribe(() => {
        // no-op for now; we read the latest shortcuts on each key event
      });
    }
  }

  unregister(): void {
    if (typeof window !== "undefined" && window.removeEventListener) {
      window.removeEventListener("keydown", this._onKeyDown);
    }
    if (this._unsubStore) {
      try {
        this._unsubStore();
      } catch (err) {
        // ignore
      }
      this._unsubStore = null;
    }
  }

  private _handleKeyDown(e: KeyboardEvent) {
    // Simple protection against extremely high-frequency events
    const now = Date.now();
    const minInterval = this._opts?.minEventIntervalMs || 0;
    if (minInterval > 0 && now - this._lastHandled < minInterval) return;
    this._lastHandled = now;
    try {
      const mode = useEditorStore.getState().mode;
      if (mode !== "edit") return;

      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable)
      )
        return;

      const key = (e.key || "").toLowerCase();
      const shortcuts =
        useKeybindingStore.getState().shortcuts || defaultShortcuts;

      // Map keys to command ids (safe: check existence before executing)
      if (key === (shortcuts["viewport.translate"] || "").toLowerCase()) {
        if (this.manager.hasCommand("gizmo.setMode")) {
          e.preventDefault();
          this.safeExecute("gizmo.setMode", "translate");
        }
        return;
      }
      if (key === (shortcuts["viewport.rotate"] || "").toLowerCase()) {
        if (this.manager.hasCommand("gizmo.setMode")) {
          e.preventDefault();
          this.safeExecute("gizmo.setMode", "rotate");
        }
        return;
      }
      if (key === (shortcuts["viewport.scale"] || "").toLowerCase()) {
        if (this.manager.hasCommand("gizmo.setMode")) {
          e.preventDefault();
          this.safeExecute("gizmo.setMode", "scale");
        }
        return;
      }
      if (key === (shortcuts["viewport.toggleSpace"] || "").toLowerCase()) {
        if (this.manager.hasCommand("gizmo.toggleSpace")) {
          e.preventDefault();
          this.safeExecute("gizmo.toggleSpace");
        }
        return;
      }
      if (key === (shortcuts["viewport.off"] || "").toLowerCase()) {
        if (this.manager.hasCommand("gizmo.off")) {
          e.preventDefault();
          this.safeExecute("gizmo.off");
        }
        return;
      }
    } catch (err) {
      // Keep keyboard handling resilient; swallow errors
      // but surface them when logging is enabled on the PluginManager
      (this.manager as any).log?.("error", "Keybinding handler error:", err);
    }
  }

  private safeExecute(commandId: string, ...args: any[]) {
    try {
      if (!this.manager.hasCommand(commandId)) {
        (this.manager as any).log?.(
          "warn",
          `KeybindingPlugin attempted to execute missing command ${commandId}`
        );
        return;
      }
      const res = this.executeCommand(commandId, ...args);
      if (res instanceof Promise) {
        res.catch((err) =>
          (this.manager as any).log?.("error", "Command error:", err)
        );
      }
    } catch (err) {
      (this.manager as any).log?.("error", "safeExecute error:", err);
    }
  }
}

export default KeybindingPlugin;
