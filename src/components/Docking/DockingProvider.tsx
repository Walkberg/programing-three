import { useEditor } from "@/features/plugin/PlugginProvider";
import { useLayoutStore } from "@/state/layoutStore";
import { useEffect } from "react";

export const DockingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { addDockerPanel } = useLayoutStore();
  const editor = useEditor();

  useEffect(() => {
    editor.registerSimpleCommand("docking.add-panel", (panel: string) => {
      addDockerPanel(panel);
    });
  }, []);

  return <div>{children}</div>;
};
