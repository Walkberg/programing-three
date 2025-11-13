# Tasks: Convert Keybinding System to Plugin

Feature: Keybinding Plugin (extract `useKeybindingStore` + `useGlobalShortcuts` into a plugin)

Context

- Area: `features/keybinding`
- Goal: Extract the existing keybinding system (`src/features/keybinding/useGlobalShortcuts.ts`, `src/features/keybinding/store.ts`) into a capability-restricted plugin so keybindings become an optional, testable, and extendable plugin. Provide a plugin manifest, Plugin API for registering keybindings, and migrate global shortcut registration to plugin lifecycle.
- Assumptions: Current keybinding store and hook are working as-is. Editor currently imports `useKeybindingStore` and `useGlobalShortcuts` directly.

Phase 1 — Setup (project & scaffold)

- [ ] T001 Create plugin folder and index: `src/plugins/keybinding/` (create `index.ts`, `keybinding.plugin.ts`) — scaffold plugin structure
- [ ] T002 Add plugin manifest & types: `src/core/plugin/plugin.manifest.ts` — define `PluginManifest` and `RequestedCapabilities` types
- [ ] T003 Add plugin events/types for commands and lifecycle (if not present): `src/core/plugin/plugin.events.ts` — extendable event union
- [ ] T004 Add README for the keybinding plugin: `src/plugins/keybinding/README.md` — describe usage and manifest

Phase 2 — Foundational (blocking refactors)

- [ ] T005 [P] Extract keybinding store into plugin-scoped module: move `src/features/keybinding/store.ts` → `src/plugins/keybinding/store.ts` and update exports (do not change existing API yet)
- [ ] T006 [P] Extract global shortcuts hook into plugin module: move `src/features/keybinding/useGlobalShortcuts.ts` → `src/plugins/keybinding/useGlobalShortcuts.ts` and preserve behavior
- [ ] T007 Update `src/core/plugin/plugin.type.ts` to document command usage for plugins and plugin manifest expectations (file: `src/core/plugin/plugin.type.ts`) — clarify that keybinding plugins should use `executeCommand` instead of requesting `registerShortcut` capability
- [ ] T008 Update `PluginManager` documentation and typings to clearly document `executeCommand(commandId, ...args)` as the canonical way for plugins to invoke editor commands (file: `src/core/plugin/plugin-manager.ts`) — no new `registerShortcut` capability will be added
- [ ] T009 [P] Add migration shim so existing imports continue to work during transition: add `src/features/keybinding/index.ts` that re-exports from the new plugin paths to avoid app breakage
- [ ] T010 Add unit tests skeleton for plugin store and hook: `tests/keybinding/store.test.ts`, `tests/keybinding/hook.test.ts`

Phase 3 — User Story: Keybinding Plugin (US1) (Priority: P1)

Story goal: Provide a Keybinding Plugin that registers global shortcuts, exposes API for plugins to register shortcut actions, and integrates with the PluginManager command/capabilities model.

Independent test criteria

- App runs with the keybinding plugin loaded and existing shortcuts behave identically to before.
- Plugins can call `pluginManager.executeCommand(...)` and shortcut triggers call registered handlers.
- Removing the plugin disables shortcuts and restores previous behavior when plugin re-registered.

Tasks (story-labeled)

- [ ] T011 [US1] Implement `KeybindingPlugin` class: `src/plugins/keybinding/keybinding.plugin.ts` — register store, hook, and on register hook attach global key listeners
- [ ] T012 [US1] Implement `KeybindingPlugin` mapping: when a shortcut triggers, the plugin should call `pluginManager.executeCommand(commandId, payload)` to invoke the corresponding command (file: `src/plugins/keybinding/keybinding.plugin.ts`)
- [ ] T013 [US1] Implement `PluginManifest` support in `BasePlugin` so plugins can declare `requestedCapabilities`: `src/core/plugin/base-plugin.ts`
- [ ] T014 [US1] Wire plugin registration in app entry: update `src/main.tsx` or plugin bootstrap path to register `KeybindingPlugin` via `singletonPluginManager.registerPlugin(...)` (file: `src/main.tsx` or `src/plugins/index.ts`)
- [ ] T015 [US1] Implement runtime protection: ensure `KeybindingPlugin` validates shortcut mappings and `executeCommand` calls return useful error messages (file: `src/plugins/keybinding/keybinding.plugin.ts` + `src/core/plugin/plugin-manager.ts`)
- [ ] T016 [US1] Add integration test: `tests/keybinding/integration.test.ts` — mount app with plugin, trigger key, assert callback invoked
- [ ] T017 [US1] Update `src/components/Editor/Toolbar.tsx` example (if it registers shortcuts) to use plugin API instead of direct store access (file: `src/components/Editor/Toolbar.tsx`)

Phase 4 — Polish & Cross-cutting concerns

- [ ] T018 Add docs + example for plugin authors: `src/plugins/keybinding/README.md` (extend) and `specs/keybinding-plugin/quickstart.md`
- [ ] T019 [P] Add optional throttling/edge-case handling for high-frequency keys (configurable in plugin options): `src/plugins/keybinding/options.ts`
- [ ] T020 Add E2E playback test (Playwright): `tests/e2e/keybinding.spec.ts` verifying shortcut flows in a running dev server
- [ ] T021 Add migration notes to `README.md` and `specs/keybinding-plugin/tasks-keybinding-plugin.md` (this file) about deprecated import paths

Dependencies (story completion order)

1. Phase 1: T001–T004 (scaffold + types)
2. Phase 2: T005–T010 (extraction + PluginManager API + shims + tests)
3. Phase 3 (US1): T011–T017 (plugin implementation, validation, integration tests)
4. Phase 4: T018–T021 (docs, e2e, polish)

Parallel execution examples

- Example A (parallel team of two):
  - Engineer A: Implement `PluginManager` capability methods and update types (T007, T008)
  - Engineer B: Extract store and hook into plugin folder (T005, T006) and add migration shim (T009)

- Example B (test-first):
  - Engineer A: Write integration tests skeleton (T010, T016)
  - Engineer B: Implement minimal `KeybindingPlugin` to satisfy tests (T011)

Implementation strategy (MVP first)

1. MVP scope (fastest path): T001–T006, T009, T011, T012, T013, T014 — minimal plugin that preserves current behavior and registers via PluginManager. This keeps app behavior stable and provides plugin API surface.
2. Next: Add validation, tests, docs (T015–T018).
3. Final: Add E2E and polish (T019–T021).

Files referenced by tasks (one-line purpose)

- `src/plugins/keybinding/keybinding.plugin.ts` — plugin implementation and lifecycle
- `src/plugins/keybinding/store.ts` — migrated keybinding store
- `src/plugins/keybinding/useGlobalShortcuts.ts` — migrated hook
- `src/core/plugin/plugin.manifest.ts` — plugin manifest types
- `src/core/plugin/plugin.events.ts` — plugin events union (if needed)
- `src/core/plugin/plugin.type.ts` — extend types for capabilities
- `src/core/plugin/plugin-manager.ts` — add `registerShortcut` routing and validation
- `src/core/plugin/base-plugin.ts` — extend to accept manifest
- `src/features/keybinding/index.ts` — migration shim for existing imports
- `tests/keybinding/*.test.ts` — unit + integration tests

Summary & counts

- Total tasks: 21
- Tasks associated to US1: 7 (T011–T017)
- Parallel opportunities identified: T005/T006/T009/T010/T007/T019
- Independent test criteria for US1: plugin registers shortcuts, triggers handlers, and unregistering disables them (integration test T016)
- Suggested MVP scope: Extract store + hook, add plugin skeleton, wire PluginManager routing (T001–T006, T009, T011–T014)

Format validation

- All tasks follow the checklist format: `- [ ] T### [P]? [US#]? Description with file path`

---

If you want, I can now:
- Implement the scaffold files (T001–T004) and the migration shim (T009) — quick, low-risk changes, or
- Implement the PluginManager capability methods (T007–T008) and the `KeybindingPlugin` class (T011) so you can test plugin registration immediately.

Which would you like me to do next? (I recommend starting with the scaffold + shims so the codebase remains runnable while we refactor.)
