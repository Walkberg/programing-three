import { BasePlugin } from "@/editor/plugin/base-plugin";
import type { PluginManager } from "@/editor/plugin/plugin-manager";
import { useKeybindingStore, defaultShortcuts } from "./store";
import defaultKeybindingOptions from "./options";

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
  /** Map from normalized key string -> { commandId, args } */
  private _keyToBinding: Map<string, { commandId: string; args?: any[] }> =
    new Map();

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
    // Attach global key listener (reads shortcuts from the plugin-scoped store)
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("keydown", this._onKeyDown);
    }

    // Build the initial mapping and subscribe to changes so we only compute
    // a single lookup table instead of checking all shortcuts on each key.
    this._rebuildMap();
    if ((useKeybindingStore as any).subscribe) {
      this._unsubStore = (useKeybindingStore as any).subscribe(() => {
        this._rebuildMap();
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
    this._keyToBinding.clear();
  }

  private _handleKeyDown(e: KeyboardEvent) {
    // Simple protection against extremely high-frequency events
    const now = Date.now();
    const minInterval = this._opts?.minEventIntervalMs || 0;
    if (minInterval > 0 && now - this._lastHandled < minInterval) return;
    this._lastHandled = now;
    try {
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

      // Single lookup: if a mapping exists for this key, execute it.
      const mapping = this._keyToBinding.get(key);
      if (mapping) {
        if (this.manager.hasCommand(mapping.commandId)) {
          e.preventDefault();
          this.safeExecute(mapping.commandId, ...(mapping.args || []));
        }
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

  /**
   * Build a single key -> command mapping from the configured shortcuts.
   */
  private _rebuildMap() {
    this._keyToBinding.clear();
    const shortcuts =
      useKeybindingStore.getState().shortcuts || defaultShortcuts;

    Object.entries(shortcuts).forEach(([key, value]) => {
      this._keyToBinding.set(value, {
        commandId: key,
      });
    });
  }

  /**
   * Allow other code to register runtime shortcut mappings with this plugin.
   * Note: this is plugin-local and does not modify persisted user shortcuts.
   */
  public registerShortcut(key: string, commandId: string, args?: any[]) {
    if (!key) return () => {};
    const k = key.toLowerCase();
    this._keyToBinding.set(k, { commandId, args });
    return () => this._keyToBinding.delete(k);
  }

  public unregisterShortcut(key: string) {
    if (!key) return;
    this._keyToBinding.delete(key.toLowerCase());
  }
}

export default KeybindingPlugin;
