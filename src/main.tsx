import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { registerPlugin } from "@/core/plugin/plugin-manager";
import { KeybindingPlugin } from "@/plugins/keybinding";

// WebGL 2.0 feature detection (T077)
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("experimental-webgl2");
    return !!gl;
  } catch (e) {
    return false;
  }
}

const rootElement = document.getElementById("root")!;

if (!checkWebGLSupport()) {
  // Show graceful degradation message
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
      padding: 2rem;
      background: #0a0a0a;
      color: #ffffff;
    ">
      <div style="max-width: 500px;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">
          WebGL 2.0 Not Supported
        </h1>
        <p style="font-size: 1.125rem; line-height: 1.75; margin-bottom: 1.5rem; color: #a3a3a3;">
          This application requires WebGL 2.0 to render 3D content. 
          Your browser or device doesn't support WebGL 2.0.
        </p>
        <div style="
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 0.5rem;
          padding: 1rem;
          text-align: left;
        ">
          <h2 style="font-size: 1rem; margin-bottom: 0.5rem; color: #ffffff;">
            To use this application:
          </h2>
          <ul style="
            list-style: disc;
            padding-left: 1.5rem;
            margin: 0;
            color: #d4d4d4;
            line-height: 1.75;
          ">
            <li>Update your browser to the latest version</li>
            <li>Try a modern browser (Chrome 90+, Firefox 88+, Safari 15+)</li>
            <li>Enable hardware acceleration in browser settings</li>
            <li>Check if your graphics drivers are up to date</li>
          </ul>
        </div>
      </div>
    </div>
  `;
} else {
  // Register core plugins before mounting the app so their lifecycle
  // hooks are active during initial render (Keybinding plugin provides
  // global keyboard behavior mapped to editor commands).
  try {
    registerPlugin(KeybindingPlugin);
  } catch (err) {
    // Do not block application startup on plugin registration failure
    console.warn("Plugin registration failed:", err);
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
