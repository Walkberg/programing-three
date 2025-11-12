import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import "./App.css";
import { useGlobalShortcuts } from "@/features/keybinding/useGlobalShortcuts";
import { RegisterToolbarActionDemo } from "./examples/RegisterToolbarActionDemo";
import { PluginProvider } from "./features/plugin/PlugginProvider";
import { singletonPluginManager } from "./core/plugin/plugin-manager";
import { CodePanelPlugin } from "./plugins/CodePluggin";
import { LayersPanelPlugin } from "./plugins/LayerManagerPlugin";
import { DockingPanelPlugin } from "./plugins/docking/docking.plugin";

singletonPluginManager.registerPlugin(CodePanelPlugin);
singletonPluginManager.registerPlugin(LayersPanelPlugin);
singletonPluginManager.registerPlugin(DockingPanelPlugin);

const EditorLayout = lazy(() =>
  import("@/components/Editor/EditorLayout").then((module) => ({
    default: module.EditorLayout,
  }))
);

function App() {
  useGlobalShortcuts();

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <PluginProvider manager={singletonPluginManager}>
          <EditorLayout />
          <RegisterToolbarActionDemo />
        </PluginProvider>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
