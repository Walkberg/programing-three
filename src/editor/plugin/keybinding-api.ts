import type { PluginManager } from "./plugin-manager";

export interface Shortcut {
  key: string;
  command: string;
}

/**
 * Small helper class that exposes a namespaced keybinding API on the
 * PluginManager. It delegates to the manager's registerShortcut/unregisterShortcut
 * implementations but keeps the object-shaped API in one place (no inline
 * callbacks on the manager instance).
 */
export class KeybindingAPI {
  private manager: PluginManager;
  constructor(manager: PluginManager) {
    this.manager = manager;
  }

  /**
   * Register a shortcut using the object form: { key, command, args? }
   */
  public registerShortcut(shortcut: Shortcut): (() => void) | undefined {
    if (!shortcut || !shortcut.key || !shortcut.command) return undefined;
    return this.manager.registerShortcut(shortcut.key, shortcut.command);
  }

  public registerShortcuts(shortcuts: Shortcut[]): void {
    if (!Array.isArray(shortcuts)) return;
    for (const shortcut of shortcuts) {
      this.registerShortcut(shortcut);
    }
  }

  /**
   * Unregister a shortcut using the object form: { key }
   */
  public unregisterShortcut(descriptor: { key: string } | string): void {
    const key = typeof descriptor === "string" ? descriptor : descriptor?.key;
    if (!key) return;
    this.manager.unregisterShortcut(key);
  }
}

export default KeybindingAPI;
