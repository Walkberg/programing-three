import { useState, useRef, useEffect } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSceneStore } from "@/state/sceneStore";
import { useAssetStore } from "@/state/assetStore";
import { AssetService } from "@/services/AssetService";
import type { CodeComponent, CodeComponentData } from "@/core/CodeComponent";
import type { Asset } from "@/types/assets";
import { AlertCircle, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

/**
 * CodeEditor - Monaco Editor integration for Code component (T035-T039)
 * Syntax highlighting, template code, save functionality
 */

interface CodeEditorProps {
  component: CodeComponent;
  gameObjectId: string;
}

// T037: Template code with lifecycle hooks
const TEMPLATE_CODE = `// Lifecycle hooks available:
// - start(): Called once when play mode begins
// - update(deltaTime): Called every frame (deltaTime in seconds)
// - onDestroy(): Called when GameObject is destroyed

// Access game state via 'this':
// - this.gameObject (id, name, components)
// - this.transform (position, rotation, scale)
// - this.scene (getGameObjectById, getAllGameObjects)
// - this.deltaTime (in update hook)

function start() {
  // Initialization code here
  console.log("Starting:", this.gameObject.name);
}

function update(deltaTime: number) {
  // Update code here (runs every frame)
  // Example: Rotate object
  // this.transform.rotation.y += deltaTime;
}

function onDestroy() {
  // Cleanup code here
  console.log("Destroying:", this.gameObject.name);
}
`;

export function CodeEditor({ component, gameObjectId }: CodeEditorProps) {
  const [code, setCode] = useState(component.code || TEMPLATE_CODE);
  const [localLanguage, setLocalLanguage] = useState(component.language);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    component.assetId
  );
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const updateGameObject = useSceneStore((state) => state.updateGameObject);
  const addAsset = useAssetStore((state) => state.addAsset);
  const assets = useAssetStore((state) => state.assets);
  const { toast } = useToast();

  // Filter assets to show only Code/script type
  const codeAssets = assets.filter(
    (asset) =>
      asset.type === "script" ||
      asset.format === ".ts" ||
      asset.format === ".js"
  );

  // Load code from selected asset
  useEffect(() => {
    if (selectedAssetId) {
      const asset = assets.find((a) => a.id === selectedAssetId);
      if (asset && asset.data instanceof Blob) {
        asset.data.text().then((text) => {
          setCode(text);
          // Detect language from file extension
          const lang = asset.format === ".ts" ? "typescript" : "javascript";
          setLocalLanguage(lang);
        });
      }
    }
  }, [selectedAssetId, assets]);
  // T051: Update error decorations when errors change
  useEffect(() => {
    if (editorRef.current && monacoRef.current && component.errors.length > 0) {
      const monaco = monacoRef.current;
      const model = editorRef.current.getModel();

      if (model) {
        const markers = component.errors
          .filter((error) => error.line !== null)
          .map((error) => ({
            startLineNumber: error.line!,
            startColumn: error.column || 1,
            endLineNumber: error.line!,
            endColumn: error.column ? error.column + 1 : 1000,
            message: error.message,
            severity: monaco.MarkerSeverity.Error,
          }));

        monaco.editor.setModelMarkers(model, "code-component", markers);
      }
    }
  }, [component.errors]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // T036: Configure Monaco Editor with JavaScript/TypeScript syntax
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Configure compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });
  };

  // T038: Save code to component on change (debounced)
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);

      // Debounced save
      const timeoutId = setTimeout(() => {
        component.setCode(value, localLanguage);
        const updatedComponent: CodeComponentData = component.serialize();

        updateGameObject(gameObjectId, {
          components: [updatedComponent],
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleLanguageChange = (value: "javascript" | "typescript") => {
    setLocalLanguage(value);
    component.language = value;

    const updatedComponent: CodeComponentData = component.serialize();
    updateGameObject(gameObjectId, {
      components: [updatedComponent],
    });
  };

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    component.assetId = assetId;

    const updatedComponent: CodeComponentData = component.serialize();
    updateGameObject(gameObjectId, {
      components: [updatedComponent],
    });
  };

  // T039: Save code as asset
  const handleSaveAsAsset = async () => {
    try {
      const assetId = uuidv4();
      const fileName = `${gameObjectId}_script.${
        localLanguage === "typescript" ? "ts" : "js"
      }`;
      const blob = new Blob([code], { type: "text/plain" });

      const asset: Asset = {
        id: assetId,
        name: fileName,
        type: "script",
        format: localLanguage === "typescript" ? ".ts" : ".js",
        size: blob.size,
        data: blob,
        thumbnail: null,
        metadata: {
          gameObjectId,
          language: localLanguage,
        },
        uploadedAt: new Date(),
        usedBy: [gameObjectId],
      };

      await AssetService.createAsset(asset);
      addAsset(asset);

      toast({
        title: "Script Saved",
        description: `Saved as ${fileName} in asset library`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // T065: Keyboard shortcut Ctrl+Enter to run (will be implemented later)
  // Note: Monaco Editor doesn't support onKeyDown directly, need to use editor commands
  // This will be implemented when integrating with play mode

  return (
    <div className="space-y-3">
      {/* Asset selector */}
      <div className="flex items-center gap-2">
        <Label htmlFor="code-asset" className="text-xs">
          Script Asset
        </Label>
        <Select
          value={selectedAssetId || "none"}
          onValueChange={(value) =>
            value !== "none" && handleAssetChange(value)
          }
        >
          <SelectTrigger id="code-asset" className="h-7 flex-1 text-xs">
            <SelectValue placeholder="Select asset or write inline..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (inline code)</SelectItem>
            {codeAssets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language selector and actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="code-language" className="text-xs">
            Language
          </Label>
          <Select value={localLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger id="code-language" className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleSaveAsAsset}
          className="h-7 text-xs"
        >
          <Save className="h-3 w-3 mr-1" />
          Save as Asset
        </Button>
      </div>

      {/* Monaco Editor */}
      <div className="border border-border rounded-md overflow-hidden">
        <Editor
          height="300px"
          language={localLanguage}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>

      {/* T052: Execution time display */}
      {component.executionTime > 0 && (
        <div
          className={`flex items-center gap-2 text-xs ${
            component.executionTime > 5
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-muted-foreground"
          }`}
        >
          <Clock className="h-3 w-3" />
          Last execution: {component.executionTime.toFixed(2)}ms
          {component.executionTime > 5 && " (⚠️ Slow)"}
        </div>
      )}

      {/* T051: Error display */}
      {component.hasErrors() && (
        <div className="space-y-1">
          {component.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs"
            >
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">
                  {error.line !== null ? `Line ${error.line}: ` : ""}
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-destructive/80 mt-1 text-[10px] overflow-x-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Define <code className="bg-accent px-1 py-0.5 rounded">start()</code>,{" "}
        <code className="bg-accent px-1 py-0.5 rounded">update(deltaTime)</code>
        , or <code className="bg-accent px-1 py-0.5 rounded">onDestroy()</code>{" "}
        functions. Code executes in Play mode.
      </p>
    </div>
  );
}
