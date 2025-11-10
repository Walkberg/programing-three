import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import "./App.css";

// Lazy load EditorLayout for code splitting (T079)
const EditorLayout = lazy(() =>
  import("@/components/Editor/EditorLayout").then((module) => ({
    default: module.EditorLayout,
  }))
);

function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <EditorLayout />
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
