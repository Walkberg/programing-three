import type { PanelDefinition } from "./plugin/plugin.type";

export class PanelManager {
  private panels: Map<string, PanelDefinition> = new Map();
  private listeners: Set<EventListener> = new Set();

  /**
   * Enregistrer un panel
   */
  registerPanel(panelId: string, panelConfig: PanelDefinition): void {
    if (this.panels.has(panelId)) {
      console.warn(`Panel ${panelId} déjà enregistré, il sera écrasé`);
    }
    this.panels.set(panelId, panelConfig);
    this.notifyListeners();
  }

  /**
   * Obtenir tous les panels
   */
  getPanels(): Array<PanelDefinition & { id: string }> {
    return Array.from(this.panels.entries()).map(([id, config]) => ({
      ...config,
      id,
    }));
  }

  /**
   * Obtenir un panel spécifique
   */
  getPanel(panelId: string): PanelDefinition | undefined {
    return this.panels.get(panelId);
  }

  /**
   * Vérifier si un panel existe
   */
  hasPanel(panelId: string): boolean {
    return this.panels.has(panelId);
  }

  /**
   * Supprimer un panel
   */
  unregisterPanel(panelId: string): boolean {
    const deleted = this.panels.delete(panelId);
    if (deleted) {
      this.notifyListeners();
    }
    return deleted;
  }

  /**
   * S'abonner aux changements
   */
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        // listener();
      } catch (error) {
        console.error("Erreur dans un listener de panel:", error);
      }
    });
  }
}
