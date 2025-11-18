import type { ICommand } from "../command-manager";

/*
Here for testing purposes only
*/
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
