import type {
  Command,
  CommandHandler,
  IPlugin,
  PanelDefinition,
  PluginInfo,
  PluginListener,
  PluginManagerOptions,
  ToolbarAction,
} from "./plugin.type";

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private commands: Map<string, Command> = new Map();
  private toolbarActions: ToolbarAction[] = [];
  private panels: Map<string, PanelDefinition> = new Map();
  private listeners: Set<PluginListener> = new Set();
  private options: PluginManagerOptions;

  constructor(options: PluginManagerOptions = {}) {
    this.options = {
      autoCleanup: true,
      enableLogging: false,
      ...options,
    };
  }

  /**
   * Enregistrer un plugin
   */
  public registerPlugin<T extends IPlugin>(
    PluginClass: new (manager: PluginManager) => T
  ): string {
    const plugin = new PluginClass(this);
    const pluginId = plugin.id;

    if (this.plugins.has(pluginId)) {
      this.log("warn", `Plugin ${pluginId} déjà enregistré`);
      return pluginId;
    }

    this.plugins.set(pluginId, plugin);

    // Appeler la méthode register du plugin
    plugin.register();

    this.log("info", `Plugin ${pluginId} enregistré avec succès`);
    this.notifyListeners();
    return pluginId;
  }

  /**
   * Désenregistrer un plugin
   */
  public unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      this.log("warn", `Plugin ${pluginId} introuvable`);
      return false;
    }

    // Appeler la méthode unregister du plugin
    if (plugin.unregister) {
      plugin.unregister();
    }

    if (this.options.autoCleanup) {
      this.cleanupPluginResources(pluginId);
    }

    this.plugins.delete(pluginId);
    this.log("info", `Plugin ${pluginId} désenregistré`);
    this.notifyListeners();
    return true;
  }

  /**
   * Nettoyer toutes les ressources d'un plugin
   */
  private cleanupPluginResources(pluginId: string): void {
    // Nettoyer les commandes
    for (const [cmdId, cmd] of this.commands.entries()) {
      if (cmd.pluginId === pluginId) {
        this.commands.delete(cmdId);
      }
    }

    // Nettoyer les actions toolbar
    this.toolbarActions = this.toolbarActions.filter(
      (a) => a.pluginId !== pluginId
    );

    // Nettoyer les panels
    for (const [panelId, panel] of this.panels.entries()) {
      if (panel.pluginId === pluginId) {
        this.panels.delete(panelId);
      }
    }
  }

  /**
   * Enregistrer une commande
   */
  public registerCommand(
    commandId: string,
    handler: CommandHandler,
    pluginId: string
  ): void {
    if (this.commands.has(commandId)) {
      this.log(
        "warn",
        `Commande ${commandId} déjà enregistrée, elle sera écrasée`
      );
    }
    this.commands.set(commandId, { handler, pluginId });
    this.notifyListeners();
  }

  /**
   * Exécuter une commande
   *
   * Note: `executeCommand` is the canonical API for plugins to invoke editor
   * behavior. Keybinding plugins should map keys to existing command IDs and
   * call `executeCommand(commandId, ...args)` rather than mutating internal
   * stores directly. This keeps the PluginManager surface minimal and stable.
   */
  public executeCommand<T = any>(
    commandId: string,
    ...args: any[]
  ): T | undefined | Promise<T | undefined> {
    const command = this.commands.get(commandId);
    if (!command) {
      this.log("warn", `Commande ${commandId} introuvable`);
      return undefined;
    }

    try {
      return command.handler(...args) as T;
    } catch (error) {
      this.log("error", `Erreur lors de l'exécution de ${commandId}:`, error);
      return undefined;
    }
  }

  /**
   * Vérifier si une commande existe
   */
  public hasCommand(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  /**
   * Obtenir toutes les commandes
   */
  public getCommands(): Map<string, Command> {
    return new Map(this.commands);
  }

  /**
   * Enregistrer une action toolbar
   */
  public registerToolbarAction(
    action: Omit<ToolbarAction, "pluginId">,
    pluginId: string
  ): void {
    this.toolbarActions.push({ ...action, pluginId });
    this.notifyListeners();
  }

  /**
   * Obtenir toutes les actions toolbar
   */
  public getToolbarActions(): ToolbarAction[] {
    return [...this.toolbarActions];
  }

  /**
   * Enregistrer un panel
   */
  public registerPanel(
    panelId: string,
    panelConfig: Omit<PanelDefinition, "pluginId">,
    pluginId: string
  ): void {
    if (this.panels.has(panelId)) {
      this.log("warn", `Panel ${panelId} déjà enregistré, il sera écrasé`);
    }
    this.panels.set(panelId, { ...panelConfig, pluginId });
    this.notifyListeners();
  }

  /**
   * Obtenir tous les panels
   */
  public getPanels(): Array<PanelDefinition & { id: string }> {
    return Array.from(this.panels.entries()).map(([id, config]) => ({
      ...config,
    }));
  }

  /**
   * Obtenir un panel spécifique
   */
  public getPanel(panelId: string): PanelDefinition | undefined {
    return this.panels.get(panelId);
  }

  /**
   * Vérifier si un panel existe
   */
  public hasPanel(panelId: string): boolean {
    return this.panels.has(panelId);
  }

  /**
   * Système de listeners pour notifier les changements
   */
  public subscribe(listener: PluginListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        this.log("error", "Erreur dans un listener:", error);
      }
    });
  }

  /**
   * Obtenir tous les plugins enregistrés
   */
  public getPlugins(): PluginInfo[] {
    return Array.from(this.plugins.entries()).map(([id, plugin]) => ({
      id,
      name: plugin.name,
      description: plugin.description || "",
      enabled: true,
      version: plugin.version,
    }));
  }

  /**
   * Obtenir un plugin spécifique
   */
  public getPlugin(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Vérifier si un plugin est enregistré
   */
  public hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Obtenir le nombre de plugins enregistrés
   */
  public getPluginCount(): number {
    return this.plugins.size;
  }

  /**
   * Logging interne
   */
  private log(level: "info" | "warn" | "error", ...args: any[]): void {
    if (this.options.enableLogging) {
      console[level]("[PluginManager]", ...args);
    }
  }

  /**
   * Réinitialiser complètement le manager
   */
  public reset(): void {
    // Désenregistrer tous les plugins
    const pluginIds = Array.from(this.plugins.keys());
    pluginIds.forEach((id) => this.unregisterPlugin(id));

    // Nettoyer toutes les ressources
    this.plugins.clear();
    this.commands.clear();
    this.toolbarActions = [];
    this.panels.clear();
    this.listeners.clear();

    this.log("info", "PluginManager réinitialisé");
  }
}

export const singletonPluginManager = new PluginManager({
  autoCleanup: true,
  enableLogging: false,
});

export function registerPlugin<T extends IPlugin>(
  PluginClass: new (manager: PluginManager) => T
): string {
  return singletonPluginManager.registerPlugin(PluginClass);
}
