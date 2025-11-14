type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args));
    }
  }

  clear(): void {
    this.events.clear();
  }
}

export type SceneEvent =
  | { type: "transform:updated"; gameObjectId: string; transform: any }
  | { type: "gameObject:added"; gameObjectId: string }
  | { type: "gameObject:removed"; gameObjectId: string }
  | { type: "component:added"; gameObjectId: string; componentId: string }
  | { type: "component:removed"; gameObjectId: string; componentId: string }
  | { type: "component:updated"; gameObjectId: string; componentId: string };
