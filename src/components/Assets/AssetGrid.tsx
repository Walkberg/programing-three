import { useAssetStore } from "@/state/assetStore";
import { AssetItem } from "./AssetItem";

/**
 * AssetGrid - Grid layout for displaying assets (T015)
 * Shows filtered assets from assetStore (filters in AssetsPanel)
 */
export function AssetGrid() {
  const assets = useAssetStore((state) => state.getFilteredAssets());
  const searchQuery = useAssetStore((state) => state.searchQuery);
  const typeFilter = useAssetStore((state) => state.typeFilter);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Grid */}
      {assets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {searchQuery || typeFilter
            ? "No assets match your filters"
            : "No assets yet. Upload some files to get started."}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-3 auto-rows-max">
          {assets.map((asset) => (
            <AssetItem key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
