import { KeybindingManager, type Shortcut } from "./keybinging-manager";
import { PanelManager } from "./panel-manager";
import { PluginManager } from "./plugin/plugin-manager";
import type {
  IPlugin,
  PanelDefinition,
  ToolbarAction,
} from "./plugin/plugin.type";
import { ToolbarManager } from "./toolbar-manager";

class EventManager {
  private listeners: Set<EventListener> = new Set();

  public addListener(listener: EventListener): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: EventListener): void {
    this.listeners.delete(listener);
  }

  public notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Erreur dans un listener:", error);
      }
    });
  }

  public emitEvent(event: string): void {
    this.notifyListeners();
  }
}

export class Editor implements PluginAPI {
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

interface ICommand {
  execute(): void;
  undo(): void;
  redo?(): void;
  label: string;
}

type CommandFactory = (...args: any[]) => ICommand;

type SimpleCommandHandler = (...args: any[]) => void | Promise<void>;

type CommandDefinition =
  | {
      type: "command-pattern";
      factory: CommandFactory;
    }
  | {
      type: "simple";
      handler: SimpleCommandHandler;
    };

export class SaveCommand implements ICommand {
  private id: string | null = null;
  private title: string;
  private savedState: any;

  constructor(title: string) {
    this.title = title;
  }

  execute() {
    // Sauvegarder l'état actuel
    this.savedState = { title: this.title, timestamp: Date.now() };
    this.id = `save-${Date.now()}`;
    console.log(`✅ Projet "${this.title}" sauvegardé (ID: ${this.id})`);
  }

  undo() {
    if (this.id) {
      console.log(
        `⏪ Annulation de la sauvegarde du projet "${this.title}" (ID: ${this.id})`
      );
      this.id = null;
    }
  }

  redo() {
    console.log(`⏩ Refaire la sauvegarde du projet "${this.title}"`);
    this.execute();
  }

  label = "Sauvegarder le projet";
}

class CommandManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private commandDefinitions: Map<string, CommandDefinition> = new Map();

  registerCommandPattern(name: string, factory: CommandFactory): void {
    this.commandDefinitions.set(name, {
      type: "command-pattern",
      factory,
    });
  }

  registerSimpleCommand(name: string, handler: SimpleCommandHandler): void {
    this.commandDefinitions.set(name, {
      type: "simple",
      handler,
    });
  }

  executeCommand(name: string, ...args: any[]): void | Promise<void> {
    const definition = this.commandDefinitions.get(name);

    if (!definition) {
      console.warn(`Commande "${name}" non trouvée`);
      return;
    }

    if (definition.type === "command-pattern") {
      const command = definition.factory(...args);
      command.execute();
      this.undoStack.push(command);
      this.redoStack = [];
    } else {
      return definition.handler(...args);
    }
  }

  undo(): void {
    const cmd = this.undoStack.pop();
    if (!cmd) {
      console.log("Rien à annuler");
      return;
    }

    cmd.undo();
    this.redoStack.push(cmd);
  }

  redo(): void {
    const cmd = this.redoStack.pop();
    if (!cmd) {
      console.log("Rien à refaire");
      return;
    }

    cmd.redo ? cmd.redo() : cmd.execute();
    this.undoStack.push(cmd);
  }

  hasCommand(name: string): boolean {
    return this.commandDefinitions.has(name);
  }

  getCommands(): string[] {
    return Array.from(this.commandDefinitions.keys());
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

export interface PluginAPI {
  registerCommand(name: string, factory: (...args: any[]) => ICommand): void;
  executeCommand(name: string, ...args: any[]): void;
}

/**
 * Type pour les listeners de changements
 */
export type EventListener = () => void;

export const editor = new Editor();
