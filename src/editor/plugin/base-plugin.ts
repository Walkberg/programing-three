import { Editor } from "../editor";
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

  public editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Return the requested capabilities declared in the manifest.
   * Plugins may override by setting `this.manifest` in their constructor.
   */
  public getRequestedCapabilities(): string[] {
    return this.manifest?.requestedCapabilities || [];
  }

  abstract register(editor: Editor): void;

  unregister?(): void;

  /**
   * Helpers pour faciliter l'enregistrement
   */
  protected registerCommand(commandId: string, handler: CommandHandler): void {
    this.editor.registerCommand(commandId, handler);
  }

  protected registerToolbarAction(
    action: Omit<ToolbarAction, "pluginId">
  ): void {
    this.editor.registerToolbarAction(action);
  }

  protected registerPanel(
    panelId: string,
    config: Omit<PanelDefinition, "pluginId">
  ): void {
    this.editor.registerPanel(panelId, config);
  }
}
