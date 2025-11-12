import type { PanelDefinition } from "@/core/plugin/plugin.type";
import { usePanels } from "@/features/plugin/pluggin-hook";

// temporary replace registry
export const usePanelDefinition = (panelId: string): PanelDefinition => {
  const panel = usePanels();

  const baseType = panelId.split("-")[0];

  const targetPanel = panel.find((p) => p.id === baseType);

  if (!targetPanel) {
    throw new Error(`Panel definition not found for id: ${baseType}`);
  }

  return targetPanel;
};
