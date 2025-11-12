import type { PluginManager } from "./plugin-manager";
import type {
  CommandHandler,
  IPlugin,
  PanelDefinition,
  ToolbarAction,
} from "./plugin.type";

export abstract class BasePlugin implements IPlugin {
  public abstract id: string;
  public abstract name: string;
  public description?: string;
  public version?: string;
  public manager: PluginManager;

  constructor(manager: PluginManager) {
    this.manager = manager;
  }

  abstract register(): void;

  unregister?(): void;

  /**
   * Helpers pour faciliter l'enregistrement
   */
  protected registerCommand(commandId: string, handler: CommandHandler): void {
    this.manager.registerCommand(commandId, handler, this.id);
  }

  protected registerToolbarAction(
    action: Omit<ToolbarAction, "pluginId">
  ): void {
    this.manager.registerToolbarAction(action, this.id);
  }

  protected registerPanel(
    panelId: string,
    config: Omit<PanelDefinition, "pluginId">
  ): void {
    this.manager.registerPanel(panelId, config, this.id);
  }

  protected executeCommand<T = any>(
    commandId: string,
    ...args: any[]
  ): T | undefined {
    return this.manager.executeCommand<T>(commandId, ...args);
  }
}
