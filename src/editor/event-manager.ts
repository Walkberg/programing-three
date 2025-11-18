/**
 * Type pour les listeners de changements
 */
export type EventListener = () => void;

export class EventManager {
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
