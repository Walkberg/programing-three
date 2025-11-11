// Docking System Components
// Feature: 003-docking-panel-system
// Central export point for all docking components

export { DockingLayout } from "./DockingLayout";
export { Zone } from "./Zone";
export { Panel } from "./Panel";
export { PanelHeader } from "./PanelHeader";
export { TabBar } from "./TabBar";
export { Tab } from "./Tab";
export {
  getPanelDefinition,
  getAllPanelDefinitions,
  isValidPanelType,
} from "./PanelRegistry";
export type { PanelDefinition } from "./PanelRegistry";
