import type { Vector3 } from "@/types";
import { PluginManager } from "./plugin/plugin-manager";
import type { PanelDefinition } from "./plugin/plugin.type";
import type { GameObject } from "@/core/GameObject";
import { Transform } from "@/core/Transform";

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

export class Editor {
  public plugins: PluginManager = new PluginManager();
  public commands: CommandManager = new CommandManager();

  public listeners: EventManager = new EventManager();

  private panels: Map<string, PanelDefinition> = new Map();

  public hasCommand(commandId: string): boolean {
    return this.plugins.hasCommand(commandId);
  }

  public hasPanel(panelId: string): boolean {
    return this.plugins.hasPanel(panelId);
  }
}

interface ICommand {
  execute(): void;
  undo(): void;
}

class Command implements ICommand {
  protected editor: Editor;
  public commandId: string;
  constructor(editor: Editor) {
    this.commandId = "baseCommand";
    this.editor = editor;
  }

  public execute(): void {
    // Implémentation de l'exécution du déplacement d'objet
  }
  public undo(): void {
    // Implémentation de l'annulation du déplacement d'objet
  }
}

export class MoveObjectCommand extends Command {
  private newPosition: Vector3;
  private oldPosition: Vector3;

  private gameObject: GameObject;

  constructor(editor: Editor, gameObject: GameObject) {
    super(editor);
    this.newPosition = { x: 0, y: 0, z: 0 };
    this.oldPosition = { x: 0, y: 0, z: 0 };
    this.gameObject = gameObject;
    this.commandId = "moveObject";
  }
  execute(): void {
    this.setPositions(this.newPosition);
  }
  undo(): void {
    this.setPositions(this.oldPosition);
  }

  private setPositions(position: Vector3): void {
    const transform = this.gameObject.getComponentByType(Transform);

    if (transform === null) {
      return;
    }
    transform?.setPosition(position.x, position.y, position.z);

    this.editor.listeners.emitEvent("transformChanged");
  }
}

interface Commande {
  hasCommand(commandId: string): boolean;
  executeCommand<T = any>(commandId: string, ...args: any[]): T | undefined;
}

class CommandManager implements Commande {
  hasCommand(commandId: string): boolean {
    throw new Error("Method not implemented.");
  }
  executeCommand<T = any>(commandId: string, ...args: any[]): T | undefined {
    throw new Error("Method not implemented.");
  }
}

/**
 * Type pour les listeners de changements
 */
export type EventListener = () => void;

const editor = new Editor();

//editor.plugins.hasCommand("save");
//editor.commands.executeCommand("properties");
