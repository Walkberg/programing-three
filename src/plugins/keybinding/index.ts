export * from "./store";
// Do not re-export `useGlobalShortcuts` here to avoid eager loading it
// through the plugin barrel. Import it directly from
// `@/plugins/keybinding/useGlobalShortcuts` where needed.

// Export KeybindingPlugin class (Phase 3)
export { KeybindingPlugin } from "./keybinding.plugin";

export default {};
