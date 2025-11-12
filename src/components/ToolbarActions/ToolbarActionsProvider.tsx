import React, { createContext, useContext, useEffect, useState } from "react";
import { ToolbarActionRegistry } from "./ToolbarActionRegistry";
import type { RegisteredToolbarAction } from "./types";

interface ContextValue {
  actions: RegisteredToolbarAction[];
}

const ToolbarActionsContext = createContext<ContextValue | null>(null);

export const ToolbarActionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [actions, setActions] = useState<RegisteredToolbarAction[]>(
    ToolbarActionRegistry.getRegisteredActions()
  );

  useEffect(() => {
    const unsub = ToolbarActionRegistry.onRegistryChange(() => {
      setActions(ToolbarActionRegistry.getRegisteredActions());
    });
    return unsub;
  }, []);

  return (
    <ToolbarActionsContext.Provider value={{ actions }}>
      {children}
    </ToolbarActionsContext.Provider>
  );
};

export function useToolbarActionsContext() {
  const ctx = useContext(ToolbarActionsContext);
  if (!ctx) throw new Error("ToolbarActionsProvider missing");
  return ctx;
}
