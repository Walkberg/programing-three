import { openDB, type IDBPDatabase } from "idb";
import type { Asset } from "@/types/assets";

/**
 * AssetService - IndexedDB wrapper for asset storage (T003)
 * Manages binary assets (3D models, scripts) with metadata
 */

const DB_NAME = "SceneEditorAssets";
const DB_VERSION = 1;
const ASSET_STORE = "assets";

export class AssetService {
  private static dbPromise: Promise<IDBPDatabase> | null = null;

  /**
   * Initialize IndexedDB database with schema
   * Creates 'assets' object store with indexes for efficient querying
   */
  private static async getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create assets store if it doesn't exist
          if (!db.objectStoreNames.contains(ASSET_STORE)) {
            const store = db.createObjectStore(ASSET_STORE, {
              keyPath: "id",
            });

            // Indexes for efficient filtering and searching
            store.createIndex("name", "name", { unique: false });
            store.createIndex("type", "type", { unique: false });
            store.createIndex("uploadedAt", "uploadedAt", { unique: false });
          }
        },
      });
    }
    return this.dbPromise;
  }

  /**
   * Create a new asset in IndexedDB
   */
  static async createAsset(asset: Asset): Promise<void> {
    const db = await this.getDB();
    await db.add(ASSET_STORE, asset);
  }

  /**
   * Read an asset by ID
   */
  static async getAsset(id: string): Promise<Asset | undefined> {
    const db = await this.getDB();
    return db.get(ASSET_STORE, id);
  }

  /**
   * Update an existing asset
   */
  static async updateAsset(asset: Asset): Promise<void> {
    const db = await this.getDB();
    await db.put(ASSET_STORE, asset);
  }

  /**
   * Delete an asset by ID
   */
  static async deleteAsset(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(ASSET_STORE, id);
  }

  /**
   * List all assets (optionally filtered by type)
   */
  static async listAssets(type?: string): Promise<Asset[]> {
    const db = await this.getDB();

    if (type) {
      // Use index for efficient type filtering
      return db.getAllFromIndex(ASSET_STORE, "type", type);
    }

    return db.getAll(ASSET_STORE);
  }

  /**
   * Search assets by name (case-insensitive partial match)
   */
  static async searchAssets(query: string): Promise<Asset[]> {
    const allAssets = await this.listAssets();
    const lowerQuery = query.toLowerCase();

    return allAssets.filter((asset) =>
      asset.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get storage usage info
   * Returns estimated usage in bytes and percentage (if quota available)
   */
  static async getStorageInfo(): Promise<{
    usage: number;
    quota: number | null;
    usagePercent: number;
  }> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || null;
      const usagePercent = quota ? (usage / quota) * 100 : 0;

      return { usage, quota, usagePercent };
    }

    // Fallback if storage estimate not available
    const allAssets = await this.listAssets();
    const usage = allAssets.reduce((total, asset) => {
      if (typeof asset.data === "string") {
        return total + asset.data.length;
      }
      return total + asset.size;
    }, 0);

    return { usage, quota: null, usagePercent: 0 };
  }

  /**
   * Clear all assets (use with caution)
   */
  static async clearAllAssets(): Promise<void> {
    const db = await this.getDB();
    await db.clear(ASSET_STORE);
  }

  /**
   * T060: Find which GameObjects are using an asset
   * Checks Model3D and Code components for asset references
   */
  static findAssetUsage(
    assetId: string,
    gameObjects: Array<{
      id: string;
      name: string;
      components: Array<{ type: string; assetId?: string }>;
    }>
  ): Array<{ gameObjectId: string; gameObjectName: string }> {
    const usage: Array<{ gameObjectId: string; gameObjectName: string }> = [];

    gameObjects.forEach((gameObject) => {
      const hasAsset = gameObject.components.some(
        (component) =>
          (component.type === "Model3D" || component.type === "Code") &&
          component.assetId === assetId
      );

      if (hasAsset) {
        usage.push({
          gameObjectId: gameObject.id,
          gameObjectName: gameObject.name,
        });
      }
    });

    return usage;
  }
}
