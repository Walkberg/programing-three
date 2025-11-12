import type { ComponentType } from "react";

export type ToolbarActionId = string;

export interface ToolbarActionMenuItem {
  id: ToolbarActionId;
  title: string;
  icon?: ComponentType<any> | null;
  children?: ToolbarActionMenuItem[];
  order?: number;
  // optional payload for invocation
  payload?: any;
}

export interface ToolbarActionConfig extends ToolbarActionMenuItem {
  category?: string; // top-level category (button group)
}

export interface RegisteredToolbarAction extends ToolbarActionConfig {
  registeredAt: number;
}
