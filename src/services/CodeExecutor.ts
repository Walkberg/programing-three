import { transform } from "@babel/standalone";
import type { CodeContext, CodeError } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useConsoleStore } from "@/state/consoleStore"; // T050
import { useSceneStore } from "@/state/sceneStore"; // apply transform patches returned from worker

/**
 * CodeExecutor - Transpile and execute user code in sandboxed worker (T013)
 * Handles TypeScript -> JavaScript transpilation and Web Worker management
 */

interface ExecutionResult {
  success: boolean;
  result?: unknown;
  error?: CodeError;
  executionTime: number;
}

export class CodeExecutor {
  private static worker: Worker | null = null;
  private static pendingExecutions = new Map<
    string,
    {
      resolve: (result: ExecutionResult) => void;
      reject: (error: Error) => void;
    }
  >();

  /**
   * Initialize Web Worker for code execution
   */
  private static initializeWorker(): void {
    if (this.worker) return;

    // Create worker from separate file
    this.worker = new Worker(
      new URL("../workers/codeWorker.ts", import.meta.url),
      { type: "module" }
    );

    // Handle messages from worker
    this.worker.addEventListener("message", (event) => {
      const response = event.data;

      if (response.type === "ready") {
        console.log("[CodeExecutor] Worker ready");
        return;
      }

      // T050: Forward console logs to consoleStore
      if (response.consoleLogs && Array.isArray(response.consoleLogs)) {
        const { addMessage } = useConsoleStore.getState();
        response.consoleLogs.forEach(
          (log: { type: string; message: string }) => {
            addMessage({
              type: log.type as "log" | "warn" | "error" | "info",
              message: log.message,
            });
          }
        );
      }

      // Apply transform modifications sent back from worker (if any)
      if (response.modifiedTransform && response.gameObjectId) {
        const { updateTransform } = useSceneStore.getState();
        const mt = response.modifiedTransform as {
          position?: { x: number; y: number; z: number };
          rotation?: { x: number; y: number; z: number };
          scale?: { x: number; y: number; z: number };
        };

        try {
          updateTransform(
            response.gameObjectId,
            mt.position,
            mt.rotation,
            mt.scale
          );
        } catch (e) {
          console.warn("[CodeExecutor] Failed to apply transform patch:", e);
        }
      }

      // Handle execution response
      const pending = this.pendingExecutions.get(response.id);
      if (pending) {
        this.pendingExecutions.delete(response.id);

        if (response.success) {
          pending.resolve({
            success: true,
            result: response.result,
            executionTime: response.executionTime,
          });
        } else {
          pending.resolve({
            success: false,
            error: {
              message: response.error?.message || "Unknown error",
              line: null,
              column: null,
              stack: response.error?.stack || null,
            },
            executionTime: response.executionTime,
          });
        }
      }
    });
  }

  /**
   * Transpile TypeScript to JavaScript using Babel
   * @param code Source code (TypeScript or JavaScript)
   * @param language Source language
   * @returns Transpiled JavaScript code or error
   */
  static transpile(
    code: string,
    language: "typescript" | "javascript"
  ): { success: true; code: string } | { success: false; error: CodeError } {
    try {
      if (language === "javascript") {
        // No transpilation needed for JS, but still transform modules
        const result = transform(code, {
          filename: "user-script.js",
          plugins: [
            // Transform ES modules to make exports accessible
            ["transform-modules-commonjs", { strict: false }],
          ],
          retainLines: true,
        });

        if (!result.code) {
          return {
            success: false,
            error: {
              message: "Transpilation produced no output",
              line: null,
              column: null,
              stack: null,
            },
          };
        }

        return { success: true, code: result.code };
      }

      // Transpile TypeScript to JavaScript
      const result = transform(code, {
        filename: "user-script.ts",
        presets: ["typescript"],
        plugins: [
          // Transform ES modules (export/import) to CommonJS
          ["transform-modules-commonjs", { strict: false }],
        ],
        retainLines: true, // Preserve line numbers for error reporting
      });

      if (!result.code) {
        return {
          success: false,
          error: {
            message: "Transpilation produced no output",
            line: null,
            column: null,
            stack: null,
          },
        };
      }

      return { success: true, code: result.code };
    } catch (error) {
      // Parse Babel error for line/column info
      let line: number | null = null;
      let column: number | null = null;

      if (error && typeof error === "object" && "loc" in error) {
        const loc = (error as { loc?: { line?: number; column?: number } }).loc;
        line = loc?.line ?? null;
        column = loc?.column ?? null;
      }

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
          line,
          column,
          stack: error instanceof Error ? error.stack ?? null : null,
        },
      };
    }
  }

  /**
   * Execute code in sandboxed Web Worker
   * @param code Transpiled JavaScript code
   * @param context Execution context (gameObject, transform, scene, deltaTime)
   * @returns Execution result with success/error and timing
   */
  static async execute(
    code: string,
    context: CodeContext
  ): Promise<ExecutionResult> {
    this.initializeWorker();

    if (!this.worker) {
      return {
        success: false,
        error: {
          message: "Worker not available",
          line: null,
          column: null,
          stack: null,
        },
        executionTime: 0,
      };
    }

    const id = uuidv4();

    return new Promise<ExecutionResult>((resolve, reject) => {
      // Store promise handlers
      this.pendingExecutions.set(id, { resolve, reject });

      // Send execution request to worker
      this.worker!.postMessage({
        id,
        type: "execute",
        code,
        context,
      });

      // Backup timeout (should not be needed as worker has its own)
      setTimeout(() => {
        const pending = this.pendingExecutions.get(id);
        if (pending) {
          this.pendingExecutions.delete(id);
          resolve({
            success: false,
            error: {
              message: "Execution timeout (fallback)",
              line: null,
              column: null,
              stack: null,
            },
            executionTime: 150,
          });
        }
      }, 150);
    });
  }

  /**
   * Transpile and execute user code
   * @param code Source code
   * @param language Source language
   * @param context Execution context
   * @returns Execution result
   */
  static async transpileAndExecute(
    code: string,
    language: "typescript" | "javascript",
    context: CodeContext
  ): Promise<ExecutionResult> {
    // Transpile first
    const transpileResult = this.transpile(code, language);

    if (!transpileResult.success) {
      return {
        success: false,
        error: transpileResult.error,
        executionTime: 0,
      };
    }

    // Execute transpiled code
    return this.execute(transpileResult.code, context);
  }

  /**
   * Cancel all pending executions
   */
  static cancelAll(): void {
    this.pendingExecutions.forEach((pending, id) => {
      if (this.worker) {
        this.worker.postMessage({ id, type: "cancel" });
      }
      pending.resolve({
        success: false,
        error: {
          message: "Execution cancelled",
          line: null,
          column: null,
          stack: null,
        },
        executionTime: 0,
      });
    });
    this.pendingExecutions.clear();
  }

  /**
   * Terminate worker and clean up
   */
  static dispose(): void {
    this.cancelAll();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
