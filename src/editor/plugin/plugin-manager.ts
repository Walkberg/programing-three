import type { Editor } from "../editor";
import type {
  IPlugin,
  PluginInfo,
  PluginListener,
  PluginManagerOptions,
} from "./plugin.type";

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private listeners: Set<PluginListener> = new Set();
  private options: PluginManagerOptions;
  private editor: Editor;

  constructor(editor: Editor, options: PluginManagerOptions = {}) {
    this.editor = editor;
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
    PluginClass: new (editor: Editor) => T
  ): string {
    const plugin = new PluginClass(this.editor);
    const pluginId = plugin.id;

    if (this.plugins.has(pluginId)) {
      this.log("warn", `Plugin ${pluginId} déjà enregistré`);
      return pluginId;
    }

    this.plugins.set(pluginId, plugin);

    // Appeler la méthode register du plugin
    plugin.register(this.editor);

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

    this.plugins.delete(pluginId);
    this.log("info", `Plugin ${pluginId} désenregistré`);
    this.notifyListeners();
    return true;
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
    this.listeners.clear();

    this.log("info", "PluginManager réinitialisé");
  }
}
