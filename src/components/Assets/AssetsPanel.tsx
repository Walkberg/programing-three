import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // T055
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // T057
import { ChevronUp, ChevronDown, Search, Download } from "lucide-react"; // T055, T062
import { AssetGrid } from "./AssetGrid";
import { AssetUpload } from "./AssetUpload";
import { useAssetStore } from "@/state/assetStore"; // T055, T057
import { useToast } from "@/hooks/use-toast"; // T062

/**
 * AssetsPanel - Collapsible panel for asset library (T014)
 * Displays at bottom of editor with upload, search, filter, and grid views
 * T055: Search input, T057: Type filter dropdown
 */
export function AssetsPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const searchQuery = useAssetStore((state) => state.searchQuery);
  const setSearchQuery = useAssetStore((state) => state.setSearchQuery);
  const typeFilter = useAssetStore((state) => state.typeFilter);
  const setTypeFilter = useAssetStore((state) => state.setTypeFilter);
  const assets = useAssetStore((state) => state.assets); // T062
  const { toast } = useToast(); // T062

  // T062: Export all assets as zip bundle
  const handleExportBundle = async () => {
    if (assets.length === 0) {
      toast({
        title: "No Assets",
        description: "There are no assets to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Dynamic import of JSZip to reduce initial bundle size
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add all assets to zip
      for (const asset of assets) {
        const blob =
          asset.data instanceof Blob ? asset.data : new Blob([asset.data]);
        zip.file(asset.name, blob);
      }

      // Generate zip and trigger download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assets-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${assets.length} asset${
          assets.length !== 1 ? "s" : ""
        } to zip file.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-border bg-card"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50">
          <h2 className="text-sm font-semibold">Assets</h2>
          <div className="flex items-center gap-2">
            {/* T062: Export button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleExportBundle();
              }}
              title="Export all assets as zip"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-border">
        <div className="h-64 flex flex-col">
          {/* Upload zone */}
          <div className="p-3 border-b border-border">
            <AssetUpload />
          </div>

          {/* T055: Search and T057: Filter controls */}
          <div className="px-3 py-2 border-b border-border flex gap-2">
            {/* Search input */}
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>

            {/* Type filter dropdown */}
            <Select
              value={typeFilter || "all"}
              onValueChange={(value) =>
                setTypeFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="model">Models</SelectItem>
                <SelectItem value="code">Scripts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asset grid */}
          <div className="flex-1 overflow-auto p-3">
            <AssetGrid />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
