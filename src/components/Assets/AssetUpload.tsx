import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useAssetStore } from "@/state/assetStore";
import { AssetService } from "@/services/AssetService";
import { ThumbnailGenerator } from "@/services/ThumbnailGenerator";
import type { Asset } from "@/types/assets";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

/**
 * AssetUpload - Drag-and-drop zone + file input for uploads (T017-T022)
 * Handles file validation, upload progress, thumbnail generation
 */

const ALLOWED_EXTENSIONS = {
  model: [".glb", ".gltf", ".obj"],
  script: [".js", ".ts"],
  texture: [".png", ".jpg", ".jpeg"],
  audio: [".mp3", ".wav", ".ogg"],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function AssetUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addAsset = useAssetStore((state) => state.addAsset);
  const setUploadProgress = useAssetStore((state) => state.setUploadProgress);
  const removeUploadProgress = useAssetStore(
    (state) => state.removeUploadProgress
  );
  const uploadProgress = useAssetStore((state) => state.uploadProgress);
  const { toast } = useToast();

  // T018: File validation
  const validateFile = (
    file: File
  ): { valid: boolean; error?: string; type?: Asset["type"] } => {
    // Check size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit (${(
          file.size /
          (1024 * 1024)
        ).toFixed(1)}MB)`,
      };
    }

    // Check extension and determine type
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;

    for (const [type, extensions] of Object.entries(ALLOWED_EXTENSIONS)) {
      if (extensions.includes(ext)) {
        return { valid: true, type: type as Asset["type"] };
      }
    }

    return {
      valid: false,
      error: `Unsupported file format: ${ext}. Allowed: ${Object.values(
        ALLOWED_EXTENSIONS
      )
        .flat()
        .join(", ")}`,
    };
  };

  // T019-T022: Upload with progress, save to IndexedDB, generate thumbnail
  const handleUpload = async (file: File) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    const fileId = uuidv4();
    const assetType = validation.type!;

    // T019: Set initial progress
    setUploadProgress(fileId, {
      fileName: file.name,
      progress: 0,
      status: "uploading",
    });

    try {
      // Read file as blob
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });

      // Update progress
      setUploadProgress(fileId, {
        fileName: file.name,
        progress: 50,
        status: "uploading",
      });

      // T021: Generate thumbnail for models
      let thumbnail: string | null = null;
      if (assetType === "model") {
        try {
          const format = file.name.endsWith(".glb")
            ? "glb"
            : file.name.endsWith(".gltf")
            ? "gltf"
            : "obj";
          thumbnail = await ThumbnailGenerator.generateThumbnailFromFile(
            blob,
            format
          );
        } catch (error) {
          console.warn("Failed to generate thumbnail:", error);
          // Continue without thumbnail
        }
      }

      // Update progress
      setUploadProgress(fileId, {
        fileName: file.name,
        progress: 75,
        status: "uploading",
      });

      // T020: Create asset and save to IndexedDB
      const asset: Asset = {
        id: fileId,
        name: file.name,
        type: assetType,
        format: `.${file.name.split(".").pop()?.toLowerCase()}`,
        size: file.size,
        data: blob,
        thumbnail,
        metadata: {
          originalName: file.name,
          mimeType: file.type,
        },
        uploadedAt: new Date(),
        usedBy: [],
      };

      await AssetService.createAsset(asset);

      // Update progress
      setUploadProgress(fileId, {
        fileName: file.name,
        progress: 100,
        status: "complete",
      });

      // T022: Add to store
      addAsset(asset);

      // Remove progress after delay
      setTimeout(() => {
        removeUploadProgress(fileId);
      }, 2000);

      toast({
        title: "Upload Complete",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      setUploadProgress(fileId, {
        fileName: file.name,
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });

      // Remove progress after delay
      setTimeout(() => {
        removeUploadProgress(fileId);
      }, 5000);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      handleUpload(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const uploadsArray = Array.from(uploadProgress.entries());

  return (
    <div className="space-y-2">
      {/* Upload zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-accent"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Drag & drop files or
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.values(ALLOWED_EXTENSIONS).flat().join(",")}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* T019: Upload progress indicators */}
      {uploadsArray.length > 0 && (
        <div className="space-y-1">
          {uploadsArray.map(([id, progress]) => (
            <div
              key={id}
              className="flex items-center gap-2 text-xs bg-accent/50 rounded p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{progress.fileName}</p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      progress.status === "error"
                        ? "bg-destructive"
                        : progress.status === "complete"
                        ? "bg-green-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                {progress.error && (
                  <p className="text-destructive mt-0.5">{progress.error}</p>
                )}
              </div>
              {progress.status === "complete" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => removeUploadProgress(id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
