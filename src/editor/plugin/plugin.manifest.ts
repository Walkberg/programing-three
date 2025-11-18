export type RequestedCapabilities =
  | "panels"
  | "commands"
  | "toolbar"
  | "keybindings"
  | string;

export interface PluginManifest {
  id: string;
  name: string;
  version?: string;
  description?: string;
  requestedCapabilities?: RequestedCapabilities[];
}
