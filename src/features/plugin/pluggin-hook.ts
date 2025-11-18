import type {
  PanelDefinition,
  PluginInfo,
  ToolbarAction,
} from "@/editor/plugin/plugin.type";
import { useEditor } from "./PlugginProvider";

export const usePlugins = (): PluginInfo[] => {
  const editor = useEditor();
  return editor.plugins.getPlugins();
};

// /**
//  * Hook pour accéder aux commandes
//  */
// export const useCommands = (): Map<string, Command> => {
//   const editor = useEditor();
//   return editor.commands.getCommands();
// };

// /**
//  * Hook pour exécuter une commande
//  */
// export const useCommand = <T = any>(commandId: string) => {
//   const editor = useEditor();

//   return (...args: any[]): T | undefined => {
//     return editor.commands.executeCommand<T>(commandId, ...args);
//   };
// };

/**
 * Hook pour accéder aux panels
 */
export const usePanels = (): Array<PanelDefinition & { id: string }> => {
  const editor = useEditor();
  return editor.getPanels();
};

/**
 * Hook pour accéder aux actions toolbar
 */
export const useToolbarActions = (): ToolbarAction[] => {
  const editor = useEditor();
  return editor.getToolbarActions();
};
