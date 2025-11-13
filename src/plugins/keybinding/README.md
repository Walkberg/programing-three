# Keybinding Plugin

Small plugin scaffold that provides global shortcut management for the editor.

Files in this folder:

- `store.ts` — Zustand store for shortcut bindings (migrated from `features/keybinding`).
- `useGlobalShortcuts.ts` — Hook that installs global `keydown` listener and maps keys to editor actions.
- `index.ts` — Re-exports for easy imports.

Usage (developer):

1. During Phase 3 the plugin will register itself via `singletonPluginManager.registerPlugin(KeybindingPlugin)`.
2. Plugins should call editor commands via `pluginManager.executeCommand(commandId, payload)` rather than manipulating stores directly.

Available commands (registered by the plugin):

- `gizmo.setMode` (payload: `"translate" | "rotate" | "scale" | "none"`) — set active gizmo mode
- `gizmo.toggleSpace` — toggle gizmo space between `world` and `local`
- `gizmo.off` — set gizmo mode to `none`

The plugin listens to the migrated `useKeybindingStore` for shortcut bindings and maps default keys (e.g. `t`, `r`, `s`, `q`, `Escape`) to the commands above.
