export type PluginEvent =
  | { type: "plugin:registered"; payload: { id: string; name: string } }
  | { type: "plugin:unregistered"; payload: { id: string } }
  | { type: "command:registered"; payload: { id: string; pluginId: string } }
  | {
      type: "command:executed";
      payload: { id: string; args: any[]; result?: any };
    }
  | {
      type: "panel:registered";
      payload: { id: string; title?: string; pluginId?: string };
    }
  | { type: "panel:opened"; payload: { panelId: string; zoneId?: string } }
  | { type: "panel:closed"; payload: { panelId: string; zoneId?: string } }
  | {
      type: "toolbar:actionInvoked";
      payload: { actionId: string; pluginId?: string; payload?: any };
    }
  | { type: "layout:changed"; payload: { rootZone: any; source?: string } }
  | { type: "plugin:error"; payload: { pluginId?: string; error: any } };
