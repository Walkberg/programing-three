import {
  CommandManager,
  type CommandDefinition,
  type CommandFactory,
  type SimpleCommandHandler,
} from "./command-manager";
import { SaveCommand } from "./commands/save-command";
import { EventManager } from "./event-manager";
import { KeybindingManager, type Shortcut } from "./keybinging-manager";
import { PanelManager } from "./panel-manager";
import { PluginManager } from "./plugin/plugin-manager";
import type {
  IPlugin,
  PanelDefinition,
  ToolbarAction,
} from "./plugin/plugin.type";
import { ToolbarManager } from "./toolbar-manager";

export class Editor {
  public plugins: PluginManager = new PluginManager(this);
  public commands: CommandManager = new CommandManager();
  public listeners: EventManager = new EventManager();
  public panels: PanelManager = new PanelManager();
  public toolbar: ToolbarManager = new ToolbarManager();
  public keybindings: KeybindingManager = new KeybindingManager();

  registerCommand(name: string, factory: CommandFactory): void {
    this.commands.registerCommandPattern(name, factory);
    this.listeners.notifyListeners();
  }

  registerSimpleCommand(name: string, handler: SimpleCommandHandler): void {
    this.commands.registerSimpleCommand(name, handler);
    this.listeners.notifyListeners();
  }

  reg(name: string, command: CommandDefinition): void {
    if (command.type === "command-pattern") {
      this.commands.registerCommandPattern(name, command.factory);
    } else {
      this.commands.registerSimpleCommand(name, command.handler);
    }
  }

  executeCommand(name: string, ...args: any[]): void | Promise<void> {
    return this.commands.executeCommand(name, ...args);
  }

  hasCommand(commandId: string): boolean {
    return this.commands.hasCommand(commandId);
  }

  undo(): void {
    this.commands.undo();
  }

  redo(): void {
    this.commands.redo();
  }

  registerPlugin<T extends IPlugin>(
    PluginClass: new (editor: Editor) => T
  ): string {
    return this.plugins.registerPlugin(PluginClass);
  }

  hasPlugin(pluginId: string): boolean {
    return this.plugins.hasPlugin(pluginId);
  }

  registerPanel(panelId: string, panelConfig: PanelDefinition): void {
    this.panels.registerPanel(panelId, panelConfig);
  }

  /**
   * Vérifier si un panel existe
   */
  hasPanel(panelId: string): boolean {
    return this.panels.hasPanel(panelId);
  }

  /**
   * Obtenir un panel
   */
  getPanel(panelId: string): PanelDefinition | undefined {
    return this.panels.getPanel(panelId);
  }

  /**
   * Obtenir tous les panels
   */
  getPanels(): Array<PanelDefinition & { id: string }> {
    return this.panels.getPanels();
  }

  /**
   * Enregistrer une action toolbar
   */
  registerToolbarAction(action: ToolbarAction): void {
    this.toolbar.registerToolbarAction(action);
  }

  /**
   * Obtenir toutes les actions toolbar
   */
  getToolbarActions(): ToolbarAction[] {
    return this.toolbar.getToolbarActions();
  }

  registerKeybinding(shortcut: Shortcut): () => void {
    return this.keybindings.registerKeybinding(shortcut);
  }

  getKeybindings(): Map<string, Shortcut> {
    return this.keybindings.getKeybindings();
  }
}

export const editor = new Editor();

editor.commands.registerCommandPattern("save", () => new SaveCommand("title"));
