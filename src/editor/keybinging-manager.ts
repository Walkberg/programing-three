export interface Shortcut {
  key: string;
  command: string;
}

export class KeybindingManager {
  private keybindings: Map<string, Shortcut> = new Map();
  private listeners: Set<EventListener> = new Set();

  /**
   * Enregistrer un keybinding
   */

  registerKeybindings(keybinding: Shortcut[]): () => void {
    keybinding.forEach((kb) => {
      this.keybindings.set(kb.key, kb);
    });
    this.notifyListeners();

    return () => {
      keybinding.forEach((kb) => {
        this.unregisterKeybinding(kb.key);
      });
    };
  }

  registerKeybinding(keybinding: Shortcut): () => void {
    this.keybindings.set(keybinding.key, keybinding);
    this.notifyListeners();

    // Retourner une fonction pour désenregistrer
    return () => this.unregisterKeybinding(keybinding.key);
  }

  /**
   * Supprimer un keybinding
   */
  unregisterKeybinding(key: string): boolean {
    const deleted = this.keybindings.delete(key);
    if (deleted) {
      this.notifyListeners();
    }
    return deleted;
  }

  /**
   * Obtenir tous les keybindings
   */
  getKeybindings(): Map<string, Shortcut> {
    return new Map(this.keybindings);
  }

  /**
   * Vérifier si un keybinding existe
   */
  hasKeybinding(key: string): boolean {
    return this.keybindings.has(key);
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
        //listener();
      } catch (error) {
        console.error("Erreur dans un listener de keybinding:", error);
      }
    });
  }
}
