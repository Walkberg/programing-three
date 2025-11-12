import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import "./App.css";
import { useGlobalShortcuts } from "@/features/keybinding/useGlobalShortcuts";
import { PluginProvider } from "./features/plugin/PlugginProvider";
import {
  registerPlugin,
  singletonPluginManager,
} from "./core/plugin/plugin-manager";
import { CodePanelPlugin } from "./plugins/CodePluggin";
import { LayersPanelPlugin } from "./plugins/LayerManagerPlugin";
import { DockingPanelPlugin } from "./plugins/docking/docking.plugin";
import { PluginEditor } from "./plugins/plugin-editor/pluggin-editor.plugin";

registerPlugin(CodePanelPlugin);
registerPlugin(LayersPanelPlugin);
registerPlugin(DockingPanelPlugin);
registerPlugin(PluginEditor);

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
        </PluginProvider>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
