import { Editor } from "../editor";
import type { PluginManager } from "./plugin-manager";
import type {
  CommandHandler,
  IPlugin,
  PanelDefinition,
  ToolbarAction,
  PluginManifest,
} from "./plugin.type";

export abstract class BasePlugin implements IPlugin {
  public abstract id: string;
  public abstract name: string;
  public description?: string;
  public version?: string;
  /** Optional manifest describing requested capabilities */
  public manifest?: PluginManifest;
  public manager: PluginManager;

  public editor: Editor;

  constructor(manager: PluginManager) {
    this.manager = manager;
    this.editor = new Editor();
  }

  /**
   * Return the requested capabilities declared in the manifest.
   * Plugins may override by setting `this.manifest` in their constructor.
   */
  public getRequestedCapabilities(): string[] {
    return this.manifest?.requestedCapabilities || [];
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
