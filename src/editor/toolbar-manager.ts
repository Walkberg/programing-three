import type { ToolbarAction } from "./plugin/plugin.type";

export class ToolbarManager {
  private toolbarActions: ToolbarAction[] = [];
  private listeners: Set<EventListener> = new Set();

  /**
   * Enregistrer une action toolbar
   */
  registerToolbarAction(action: ToolbarAction): void {
    this.toolbarActions.push(action);
    this.notifyListeners();
  }

  /**
   * Obtenir toutes les actions toolbar
   */
  getToolbarActions(): ToolbarAction[] {
    return [...this.toolbarActions];
  }

  /**
   * Supprimer une action toolbar par ID
   */
  unregisterToolbarAction(actionId: string): boolean {
    const initialLength = this.toolbarActions.length;
    this.toolbarActions = this.toolbarActions.filter((a) => a.id !== actionId);

    if (this.toolbarActions.length < initialLength) {
      this.notifyListeners();
      return true;
    }
    return false;
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
        console.error("Erreur dans un listener de toolbar:", error);
      }
    });
  }
}
