/**
 * Code Worker - Sandboxed code execution environment (T012)
 * Runs user scripts in isolated Web Worker context
 * Security: No DOM access, no network, 100ms timeout
 */

interface WorkerMessage {
  id: string;
  type: "execute" | "cancel";
  code?: string;
  context?: Record<string, unknown>;
}

interface WorkerResponse {
  id: string;
  success: boolean;
  result?: unknown;
  error?: {
    message: string;
    stack: string | null;
  };
  executionTime: number;
  consoleLogs?: Array<{ type: string; message: string }>; // T050
  // If user code modified the transform in the sandbox, worker will return it here
  modifiedTransform?: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  };
  // Echo back the target gameObject id from context so main thread knows which object to update
  gameObjectId?: string | null;
}

// Global execution state
let activeExecution: {
  id: string;
  timeoutId: number;
} | null = null;

// Message handler
self.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  if (message.type === "cancel") {
    // Cancel active execution
    if (activeExecution && activeExecution.id === message.id) {
      if (activeExecution.timeoutId) {
        clearTimeout(activeExecution.timeoutId);
      }
      activeExecution = null;

      const response: WorkerResponse = {
        id: message.id,
        success: false,
        error: {
          message: "Execution cancelled",
          stack: null,
        },
        executionTime: 0,
      };
      self.postMessage(response);
    }
    return;
  }

  if (message.type === "execute") {
    executeCode(message);
  }
});

function executeCode(message: WorkerMessage): void {
  const startTime = performance.now();
  const { id, code, context } = message;

  if (!code) {
    const response: WorkerResponse = {
      id,
      success: false,
      error: {
        message: "No code provided",
        stack: null,
      },
      executionTime: 0,
    };
    self.postMessage(response);
    return;
  }

  // Set timeout (100ms as per spec)
  const timeoutId = self.setTimeout(() => {
    if (activeExecution && activeExecution.id === id) {
      activeExecution = null;

      const response: WorkerResponse = {
        id,
        success: false,
        error: {
          message: "Execution timeout (100ms limit exceeded)",
          stack: null,
        },
        executionTime: 100,
      };
      self.postMessage(response);
    }
  }, 100);

  activeExecution = { id, timeoutId };

  try {
    // T050: Create sandboxed execution context with console.log intercept
    // User code has access to context but not to Worker APIs
    const consoleLogs: Array<{ type: string; message: string }> = [];

    const sandboxedContext = {
      ...context,
      // T050: Intercept console.log
      console: {
        log: (...args: unknown[]) => {
          consoleLogs.push({
            type: "log",
            message: args.map((arg) => String(arg)).join(" "),
          });
        },
        warn: (...args: unknown[]) => {
          consoleLogs.push({
            type: "warn",
            message: args.map((arg) => String(arg)).join(" "),
          });
        },
        error: (...args: unknown[]) => {
          consoleLogs.push({
            type: "error",
            message: args.map((arg) => String(arg)).join(" "),
          });
        },
        info: (...args: unknown[]) => {
          consoleLogs.push({
            type: "info",
            message: args.map((arg) => String(arg)).join(" "),
          });
        },
      },
      // Prevent access to dangerous APIs
      fetch: undefined,
      XMLHttpRequest: undefined,
      importScripts: undefined,
      postMessage: undefined,
      close: undefined,
    };

    // Execute code with sandboxed context
    // Code is now transpiled with CommonJS module support (exports object)
    const exports: any = {};
    const module = { exports };

    const fn = new Function(
      "exports",
      "module",
      ...Object.keys(sandboxedContext),
      `"use strict";\n${code}\nreturn exports;`
    );
    const result = fn(exports, module, ...Object.values(sandboxedContext));

    // Check if code exported a class (export default class ...)
    const ExportedClass =
      result.default || module.exports.default || module.exports;

    let finalResult = result;

    // If it's a class, instantiate it with the context
    if (typeof ExportedClass === "function" && ExportedClass.prototype) {
      try {
        // Create instance of the exported class
        const instance = new ExportedClass(sandboxedContext);

        // Call initialize if available
        if (typeof instance.initialize === "function") {
          instance.initialize();
        }

        // Call update if available and deltaTime is provided
        if (
          typeof instance.update === "function" &&
          context &&
          (context as any).deltaTime !== undefined
        ) {
          instance.update((context as any).deltaTime);
        }

        finalResult = instance;
      } catch (classError) {
        consoleLogs.push({
          type: "error",
          message: `Failed to instantiate class: ${
            classError instanceof Error
              ? classError.message
              : String(classError)
          }`,
        });
      }
    }

    // Clear timeout
    if (activeExecution && activeExecution.id === id) {
      clearTimeout(activeExecution.timeoutId);
      activeExecution = null;
    }

    const executionTime = performance.now() - startTime;

    // Prepare response, include any modifications to the transform
    const modifiedTransform = (sandboxedContext as any).transform
      ? {
          position: (sandboxedContext as any).transform.position,
          rotation: (sandboxedContext as any).transform.rotation,
          scale: (sandboxedContext as any).transform.scale,
        }
      : undefined;

    const response: WorkerResponse = {
      id,
      success: true,
      result: finalResult,
      executionTime,
      consoleLogs, // T050: Send console logs back
      modifiedTransform,
      gameObjectId: (sandboxedContext as any).gameObject?.id ?? null,
    };
    self.postMessage(response);
  } catch (error) {
    // Clear timeout
    if (activeExecution && activeExecution.id === id) {
      clearTimeout(activeExecution.timeoutId);
      activeExecution = null;
    }

    const executionTime = performance.now() - startTime;

    const response: WorkerResponse = {
      id,
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack ?? null : null,
      },
      executionTime,
    };
    self.postMessage(response);
  }
}

// Notify that worker is ready
self.postMessage({ type: "ready" });
