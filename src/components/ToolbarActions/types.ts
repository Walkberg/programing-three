export interface ToolbarActionConfig {
  title?: string;
  label?: string;
  icon?: string;
  action?: string;
  disabled?: boolean;
  tooltip?: string;
}

export interface ToolbarActionItem extends ToolbarActionConfig {
  id: string;
  pluginId?: string;
}
