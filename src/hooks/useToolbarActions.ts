import { useEffect } from "react";
import { ToolbarActionRegistry } from "@/components/ToolbarActions/ToolbarActionRegistry";
import { useToolbarActionsStore } from "@/state/toolbarActionsStore";
import type { ToolbarActionConfig } from "@/components/ToolbarActions/types";

export function useToolbarActions() {
  // list actions (live from registry)
  const list = () => ToolbarActionRegistry.getRegisteredActions();

  const register = (id: string, config: ToolbarActionConfig) =>
    ToolbarActionRegistry.registerToolbarAction(id, config);

  const unregister = (id: string) =>
    ToolbarActionRegistry.unregisterToolbarAction(id);

  const invoke = (id: string, payload?: any) => {
    // first allow subscribers to run
    useToolbarActionsStore.getState().invoke(id, payload);
  };

  const onAction = (id: string, cb: (payload?: any) => void) => {
    return useToolbarActionsStore.getState().subscribe(id, cb);
  };

  return { list, register, unregister, invoke, onAction } as const;
}

// Hook to subscribe to registry changes (for components wanting re-render)
export function useRegisteredActionsSubscription(onChange: () => void) {
  useEffect(() => {
    return ToolbarActionRegistry.onRegistryChange(onChange);
  }, [onChange]);
}
