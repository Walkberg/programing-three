export interface ICommand {
  execute(): void;
  undo(): void;
  redo?(): void;
  label: string;
}

export type CommandFactory = (...args: any[]) => ICommand;

export type SimpleCommandHandler = (...args: any[]) => void | Promise<void>;

export type CommandDefinition =
  | {
      type: "command-pattern";
      factory: CommandFactory;
    }
  | {
      type: "simple";
      handler: SimpleCommandHandler;
    };

export class CommandManager {
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
