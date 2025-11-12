import { usePluginManager } from "@/features/plugin/PlugginProvider";
import { useLayoutStore } from "@/state/layoutStore";
import { useEffect } from "react";

export const DockingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { addDockerPanel } = useLayoutStore();
  const manager = usePluginManager();

  useEffect(() => {
    manager.registerCommand(
      "docking.add-panel",
      (panel: string) => {
        addDockerPanel(panel);
      },
      "docking-provider"
    );
  }, []);

  return <div>{children}</div>;
};
