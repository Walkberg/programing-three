import type { ToolbarActionConfig, RegisteredToolbarAction } from "./types";

type Listener = () => void;

const actions = new Map<string, RegisteredToolbarAction>();
const listeners = new Set<Listener>();

export function registerToolbarAction(
  id: string,
  config: ToolbarActionConfig
): RegisteredToolbarAction {
  const entry: RegisteredToolbarAction = {
    ...config,
    id,
    registeredAt: Date.now(),
  };
  actions.set(id, entry);
  emitChange();
  return entry;
}

export function unregisterToolbarAction(id: string) {
  const removed = actions.delete(id);
  if (removed) emitChange();
  return removed;
}

export function getRegisteredActions(): RegisteredToolbarAction[] {
  return Array.from(actions.values()).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );
}

export function getActionById(id: string): RegisteredToolbarAction | undefined {
  return actions.get(id);
}

export function clearRegisteredActions() {
  actions.clear();
  emitChange();
}

export function onRegistryChange(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emitChange() {
  listeners.forEach((l) => l());
}

export const ToolbarActionRegistry = {
  registerToolbarAction,
  unregisterToolbarAction,
  getRegisteredActions,
  getActionById,
  clearRegisteredActions,
  onRegistryChange,
};
