import type { ComponentType } from "react";
import type { PluginManager } from "./plugin-manager";
import type { LucideIcon } from "lucide-react";

export interface IPlugin {
  id: string;
  name: string;
  description?: string;
  manager: PluginManager;
  version?: string;
  register(): void;
  unregister?(): void;
}

/**
 * Type pour les handlers de commandes
 */
export type CommandHandler<T = any> = (...args: any[]) => T;

/**
 * Configuration d'une commande
 */
export interface Command {
  handler: CommandHandler;
  pluginId: string;
}

/**
 * Types d'actions disponibles
 */
export type ActionType = "button" | "toggle" | "dropdown" | "custom";

/**
 * Configuration d'une action toolbar
 */
export interface ToolbarAction {
  type: ActionType;
  label: string;
  icon?: string;
  action: string;
  pluginId?: string;
  disabled?: boolean;
  tooltip?: string;
}

/**
 * Panel Types
 * Defines all available panel types in the editor
 */
export type PanelType =
  | "hierarchy"
  | "scene"
  | "game"
  | "code"
  | "inspector"
  | "console"
  | "assets";

/**
 * Panel Definition
 * Metadata and component for a panel type
 */
export interface PanelDefinition {
  id: PanelType;
  title: string;
  pluginId: string;
  icon: LucideIcon;
  component: React.ComponentType;
  defaultSize?: { width?: number; height?: number };
  description?: string;
}

/**
 * Information sur un plugin enregistré
 */
export interface PluginInfo {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version?: string;
}

/**
 * Type pour les listeners de changements
 */
export type PluginListener = () => void;

/**
 * Options pour le PluginManager
 */
export interface PluginManagerOptions {
  autoCleanup?: boolean;
  enableLogging?: boolean;
}
