// Docking System Components
// Feature: 003-docking-panel-system - US4
// Central export point for all docking components

export { DockingLayout } from "./DockingLayout";
export { Zone } from "./Zone";
export { Panel } from "./Panel";
export { PanelHeader } from "./PanelHeader";
export { TabBar } from "./TabBar";
export { Tab } from "./Tab";
export { DropZone } from "./DropZone";
export { Splitter } from "./Splitter";
export {
  getPanelDefinition,
  getAllPanelDefinitions,
  isValidPanelType,
} from "./PanelRegistry";
