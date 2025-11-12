import type {
  Command,
  PanelDefinition,
  PluginInfo,
  ToolbarAction,
} from "@/core/plugin/plugin.type";
import { usePluginManager } from "./PlugginProvider";

export const usePlugins = (): PluginInfo[] => {
  const manager = usePluginManager();
  return manager.getPlugins();
};

/**
 * Hook pour accéder aux commandes
 */
export const useCommands = (): Map<string, Command> => {
  const manager = usePluginManager();
  return manager.getCommands();
};

/**
 * Hook pour exécuter une commande
 */
export const useCommand = <T = any>(commandId: string) => {
  const manager = usePluginManager();

  return (...args: any[]): T | undefined => {
    return manager.executeCommand<T>(commandId, ...args);
  };
};

/**
 * Hook pour accéder aux panels
 */
export const usePanels = (): Array<PanelDefinition & { id: string }> => {
  const manager = usePluginManager();
  return manager.getPanels();
};

/**
 * Hook pour accéder aux actions toolbar
 */
export const useToolbarActions = (): ToolbarAction[] => {
  const manager = usePluginManager();
  return manager.getToolbarActions();
};
