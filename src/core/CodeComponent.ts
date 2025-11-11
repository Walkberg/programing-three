import { Component, ComponentRegistry } from "./Component";
import type { ComponentData, CodeData, CodeError } from "@/types";

/**
 * CodeComponent - Component for custom user scripts (T011)
 * Executes sandboxed JavaScript/TypeScript code
 */

export interface CodeComponentData extends ComponentData {
  type: "Code";
  assetId: string | null; // Reference to Code asset in asset library
  code: string; // JavaScript/TypeScript source code (deprecated, kept for backward compat)
  language: "javascript" | "typescript"; // Source language
  executionTime: number; // Last execution time in milliseconds
  errors: CodeError[]; // Compilation/runtime errors
  autoRun: boolean; // Execute on scene start
}

export class CodeComponent extends Component {
  assetId: string | null; // Reference to Code asset
  code: string;
  language: "javascript" | "typescript";
  executionTime: number;
  errors: CodeError[];
  autoRun: boolean;

  // Lifecycle hooks available in user code
  private initializeHook?: () => void;
  private updateHook?: (deltaTime: number) => void;
  private renderHook?: () => void;

  constructor(data?: Partial<CodeComponentData>) {
    super("Code", data);

    this.assetId = data?.assetId ?? null;
    this.code = data?.code ?? "// Start coding here\n";
    this.language = data?.language ?? "typescript";
    this.executionTime = data?.executionTime ?? 0;
    this.errors = data?.errors ?? [];
    this.autoRun = data?.autoRun ?? false;
  }

  serialize(): CodeComponentData {
    return {
      ...super.serialize(),
      type: "Code",
      assetId: this.assetId,
      code: this.code,
      language: this.language,
      executionTime: this.executionTime,
      errors: this.errors,
      autoRun: this.autoRun,
    };
  }

  // Update code and clear errors
  setCode(
    code: string,
    language: "javascript" | "typescript" = "typescript"
  ): void {
    this.code = code;
    this.language = language;
    this.errors = [];
  }

  // Update from asset data
  updateFromAsset(codeData: CodeData): void {
    this.code = codeData.code;
    this.language = codeData.language;
    this.executionTime = codeData.executionTime;
    this.errors = codeData.errors;
  }

  // Register lifecycle hooks (called by CodeExecutor after transpilation)
  registerHooks(hooks: {
    initialize?: () => void;
    update?: (deltaTime: number) => void;
    render?: () => void;
  }): void {
    this.initializeHook = hooks.initialize;
    this.updateHook = hooks.update;
    this.renderHook = hooks.render;
  }

  // Lifecycle method overrides
  override initialize(): void {
    if (this.enabled && this.initializeHook) {
      try {
        this.initializeHook();
      } catch (error) {
        this.errors.push({
          message: error instanceof Error ? error.message : String(error),
          line: null,
          column: null,
          stack: error instanceof Error ? error.stack ?? null : null,
        });
      }
    }
  }

  override update(deltaTime: number): void {
    if (this.enabled && this.updateHook) {
      try {
        const startTime = performance.now();
        this.updateHook(deltaTime);
        this.executionTime = performance.now() - startTime;
      } catch (error) {
        this.errors.push({
          message: error instanceof Error ? error.message : String(error),
          line: null,
          column: null,
          stack: error instanceof Error ? error.stack ?? null : null,
        });
      }
    }
  }

  override render(): void {
    if (this.enabled && this.renderHook) {
      try {
        this.renderHook();
      } catch (error) {
        this.errors.push({
          message: error instanceof Error ? error.message : String(error),
          line: null,
          column: null,
          stack: error instanceof Error ? error.stack ?? null : null,
        });
      }
    }
  }

  // Clear all errors
  clearErrors(): void {
    this.errors = [];
  }

  // Check if component has errors
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

// Register component type
ComponentRegistry.register(
  "Code",
  CodeComponent as new (data?: Partial<ComponentData>) => Component
);
