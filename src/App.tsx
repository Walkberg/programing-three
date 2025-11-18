import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import "./App.css";
import { EditorProvider } from "./features/plugin/PlugginProvider";

import { CodePanelPlugin } from "./plugins/CodePluggin";
import { LayersPanelPlugin } from "./plugins/LayerManagerPlugin";
import { DockingPanelPlugin } from "./plugins/docking/docking.plugin";
import { PluginEditor } from "./plugins/plugin-editor/pluggin-editor.plugin";
import { DockingProvider } from "./components/Docking/DockingProvider";
import { editor } from "./editor/editor";
import { CommandVisualizerPlugin } from "./plugins/command-visualizer/command-visualizer.plugin";

editor.registerPlugin(CodePanelPlugin);
editor.registerPlugin(LayersPanelPlugin);
editor.registerPlugin(DockingPanelPlugin);
editor.registerPlugin(PluginEditor);
editor.registerPlugin(CommandVisualizerPlugin);

const EditorLayout = lazy(() =>
  import("@/components/Editor/EditorLayout").then((module) => ({
    default: module.EditorLayout,
  }))
);

function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <EditorProvider editor={editor}>
          <DockingProvider>
            <EditorLayout />
          </DockingProvider>
        </EditorProvider>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
