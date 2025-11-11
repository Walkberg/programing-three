import { create } from "zustand";
import type { Asset, UploadProgress } from "@/types/assets";

/**
 * AssetStore - Zustand store for asset library state (T009)
 * Manages asset collection, selection, and upload progress
 */

interface AssetStore {
  // State
  assets: Asset[];
  selectedAssetId: string | null;
  uploadProgress: Map<string, UploadProgress>;
  searchQuery: string;
  typeFilter: string | null;

  // Actions - Asset Management
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  clearAssets: () => void;

  // Actions - Selection
  selectAsset: (id: string | null) => void;
  getSelectedAsset: () => Asset | null;

  // Actions - Upload Progress
  setUploadProgress: (fileId: string, progress: UploadProgress) => void;
  removeUploadProgress: (fileId: string) => void;
  clearUploadProgress: () => void;

  // Actions - Filtering
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: string | null) => void;
  getFilteredAssets: () => Asset[];
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  // Initial state
  assets: [],
  selectedAssetId: null,
  uploadProgress: new Map(),
  searchQuery: "",
  typeFilter: null,

  // Asset Management
  setAssets: (assets) => set({ assets }),

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
    })),

  updateAsset: (id, updates) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates } : asset
      ),
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
      selectedAssetId:
        state.selectedAssetId === id ? null : state.selectedAssetId,
    })),

  clearAssets: () =>
    set({
      assets: [],
      selectedAssetId: null,
    }),

  // Selection
  selectAsset: (id) => set({ selectedAssetId: id }),

  getSelectedAsset: () => {
    const state = get();
    if (!state.selectedAssetId) return null;
    return (
      state.assets.find((asset) => asset.id === state.selectedAssetId) || null
    );
  },

  // Upload Progress
  setUploadProgress: (fileId, progress) =>
    set((state) => {
      const newProgress = new Map(state.uploadProgress);
      newProgress.set(fileId, progress);
      return { uploadProgress: newProgress };
    }),

  removeUploadProgress: (fileId) =>
    set((state) => {
      const newProgress = new Map(state.uploadProgress);
      newProgress.delete(fileId);
      return { uploadProgress: newProgress };
    }),

  clearUploadProgress: () => set({ uploadProgress: new Map() }),

  // Filtering
  setSearchQuery: (query) => set({ searchQuery: query }),

  setTypeFilter: (type) => set({ typeFilter: type }),

  getFilteredAssets: () => {
    const state = get();
    let filtered = state.assets;

    // Filter by type
    if (state.typeFilter) {
      filtered = filtered.filter((asset) => asset.type === state.typeFilter);
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter((asset) => {
        const nameMatch = asset.name.toLowerCase().includes(query);
        const descriptionMatch =
          typeof asset.metadata?.description === "string" &&
          asset.metadata.description.toLowerCase().includes(query);
        const tagsMatch =
          Array.isArray(asset.metadata?.tags) &&
          asset.metadata.tags.some((tag: unknown) =>
            typeof tag === "string" ? tag.toLowerCase().includes(query) : false
          );
        return nameMatch || descriptionMatch || tagsMatch;
      });
    }

    return filtered;
  },
}));
