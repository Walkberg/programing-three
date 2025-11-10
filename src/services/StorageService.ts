import type { SceneData } from "@/types";

export class StorageService {
  private static readonly SCENE_KEY = "scene-editor-scene";
  private static readonly QUOTA_WARNING_THRESHOLD = 0.8; // 80%

  /**
   * Save scene data to localStorage
   */
  static save(sceneData: SceneData): void {
    try {
      const jsonString = JSON.stringify(sceneData);

      // Check quota before saving
      this.checkQuota(jsonString.length);

      localStorage.setItem(this.SCENE_KEY, jsonString);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        throw new Error(
          "Storage quota exceeded. Please free up space or use a smaller scene."
        );
      }
      throw error;
    }
  }

  /**
   * Load scene data from localStorage
   */
  static load(): SceneData | null {
    try {
      const jsonString = localStorage.getItem(this.SCENE_KEY);

      if (!jsonString) {
        return null;
      }

      return JSON.parse(jsonString) as SceneData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Corrupted scene data. Unable to load scene.");
      }
      throw error;
    }
  }

  /**
   * Clear saved scene data
   */
  static clear(): void {
    localStorage.removeItem(this.SCENE_KEY);
  }

  /**
   * Check if a saved scene exists
   */
  static hasSavedScene(): boolean {
    return localStorage.getItem(this.SCENE_KEY) !== null;
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    used: number;
    total: number;
    available: number;
    usagePercent: number;
  } {
    // Estimate storage usage (not all browsers support navigator.storage.estimate)
    let used = 0;
    let total = 5 * 1024 * 1024; // Default 5MB estimate for localStorage

    // Calculate used space
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        used += key.length + (value?.length || 0);
      }
    }

    const available = total - used;
    const usagePercent = (used / total) * 100;

    return { used, total, available, usagePercent };
  }

  /**
   * Check quota and warn if approaching limit
   */
  private static checkQuota(_dataSize: number): void {
    const { usagePercent, used } = this.getStorageInfo();

    if (usagePercent >= this.QUOTA_WARNING_THRESHOLD * 100) {
      console.warn(
        `Storage quota warning: Using ${usagePercent.toFixed(1)}% (${(
          used / 1024
        ).toFixed(1)}KB)`
      );
    }
  }

  /**
   * Export scene as downloadable JSON file
   */
  static exportToFile(
    sceneData: SceneData,
    filename: string = "scene.json"
  ): void {
    const jsonString = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import scene from file
   */
  static async importFromFile(file: File): Promise<SceneData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const sceneData = JSON.parse(jsonString) as SceneData;
          resolve(sceneData);
        } catch (error) {
          reject(new Error("Invalid scene file format"));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }
}
