import type { ToolbarActionConfig, ToolbarActionItem } from "./types";

type RegistryListener = () => void;

const actions = new Map<string, ToolbarActionItem>();
const listeners = new Set<RegistryListener>();

export const ToolbarActionRegistry = {
  registerToolbarAction(id: string, config: ToolbarActionConfig) {
    actions.set(id, { id, ...config });
    this._notify();
  },

  unregisterToolbarAction(id: string) {
    actions.delete(id);
    this._notify();
  },

  getRegisteredActions(): ToolbarActionItem[] {
    return Array.from(actions.values());
  },

  clearRegisteredActions() {
    actions.clear();
    this._notify();
  },

  onRegistryChange(cb: RegistryListener) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  _notify() {
    listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        // ignore
      }
    });
  },
};

export default ToolbarActionRegistry;
