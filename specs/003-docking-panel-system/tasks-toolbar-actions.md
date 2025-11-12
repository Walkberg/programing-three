## Feature: Toolbar Actions Registration System (add-on for Docking Panel System)

Contexte

- Feature area: `003-docking-panel-system`
- Goal: Provide a pluggable toolbar actions system where actions can be registered under categories (button names) and nested sub-categories (dropdown menus). Provide an API to register actions and subscribe to action invocations (registerToolbarAction / onToolbarAction). Make it easy to add an action that calls existing layout functions (e.g., addTabToZone).
- Assumption: Adds a new user-story `US7` to the docking-panel feature for the toolbar actions subsystem. This is an incremental, low-risk extension and depends only on the Toolbar component and the layout store API (e.g., `useLayoutStore().addTabToZone`).

Notes & assumptions

- I assume `src/components/Editor/Toolbar.tsx` exists and is the correct place to render toolbar buttons. If your toolbar lives elsewhere, update paths accordingly.
- The minimal viable API is:
  - `registerToolbarAction(id: string, config: ToolbarActionConfig)`
  - `onToolbarAction(id: string, callback: () => void)`
  - `invokeToolbarAction(id: string, payload?: any)` (internal)
- Categories map to top-level toolbar buttons. Nested sub-categories produce dropdown menus. Menus may have arbitrary nesting (2–3 levels supported in MVP via recursion).

---

## Phase 1 — Setup (no story label)

- [ ] T001 Create folder and index for toolbar actions helpers: `src/components/ToolbarActions/` (create `index.ts`) 
- [ ] T002 Add types for toolbar actions (config, category, menu) in `src/components/ToolbarActions/types.ts`
- [ ] T003 Add a small README describing the API and example usage: `src/components/ToolbarActions/README.md`

## Phase 2 — Foundational (blocking prerequisites)

- [ ] T004 [P] Design and document the API surface (types + examples) in `src/components/ToolbarActions/types.ts` and `src/components/ToolbarActions/README.md` — defines `registerToolbarAction`, `onToolbarAction`, `ToolbarActionConfig`, `ToolbarActionMenuItem`.
- [ ] T005 Implement the action registry (in-memory) at `src/components/ToolbarActions/ToolbarActionRegistry.ts` — export functions `registerToolbarAction`, `getRegisteredActions`, `invokeToolbarAction`.
- [ ] T006 Implement persistence-less Zustand store for subscriber callbacks: `src/state/toolbarActionsStore.ts` — store registered actions and subscriptions (lightweight wrapper; persistence optional).
- [ ] T007 Implement React provider/context to expose actions to the UI: `src/components/ToolbarActions/ToolbarActionsProvider.tsx` — provides `getRegisteredActions()` to consumers like `Toolbar`.
- [ ] T008 Implement hook `src/hooks/useToolbarActions.ts` to access registry and provider convenience methods (`register`, `invoke`, `list`, `onAction`).
- [ ] T009 [P] Unit tests for registry and hook: `tests/toolbarActions/registry.test.ts` (Vitest + mocked store) — cover register/invoke/list and subscription invocation.
- [ ] T010 Add an example demo component showing how to `registerToolbarAction('myaction', config)` in `src/examples/RegisterToolbarActionDemo.tsx` (used by devs and tests).
- [ ] T011 Update `src/components/Editor/Toolbar.tsx` to render registered actions from `ToolbarActionsProvider` (safe fallback to existing static buttons). File path: `src/components/Editor/Toolbar.tsx` (modify to call `useToolbarActions()` to get actions)

## Phase 3 — User Story: Toolbar Actions API (US7) (priority: P3) — one phase for this feature

Story goal: Allow registering toolbar actions grouped by category (button), with nested sub-categories (dropdown menus). Allow subscribing to an action invocation in code so actions can call existing layout functions (e.g., `addTabToZone`).

Independent test criteria

- Can register an action with `registerToolbarAction('myaction', config)` and see it rendered in the toolbar.
- Can register a subscriber with `onToolbarAction('myaction', () => { ... })` and, when clicking the toolbar action, the callback is invoked.
- Nested menus render as a dropdown (2 levels in MVP), and clicking sub-items invokes the correct registered action.

Tasks (story labeled):

- [ ] T012 [US7] [P] Add support for categories and nested menu shapes in types: `src/components/ToolbarActions/types.ts` — define `ToolbarActionCategory`, `ToolbarActionMenuItem` with optional `children: ToolbarActionMenuItem[]`.
- [ ] T013 [US7] Implement the UI button + dropdown component: `src/components/ToolbarActions/ToolbarActionButton.tsx` and `src/components/ToolbarActions/ToolbarActionMenu.tsx` — supports nested menus (recursive rendering) and emits `invokeToolbarAction(id)` on click.
- [ ] T014 [US7] Implement subscription helper `onToolbarAction(id, callback)` in `src/hooks/useOnToolbarAction.ts` (or extend `useToolbarActions.ts`) — ensure unsubscribing on unmount.
- [ ] T015 [US7] Integrate example: wire `src/examples/RegisterToolbarActionDemo.tsx` to register an action `myaction` and an `onToolbarAction('myaction', () => useLayoutStore.getState().addTabToZone('hierarchy-1', '<zoneId>'))` example. (File: `src/examples/RegisterToolbarActionDemo.tsx`)
- [ ] T016 [US7] Add integration test: `tests/toolbarActions/integration.test.tsx` — render `Toolbar` with provider, register an action, mock `addTabToZone`, click the action and assert `addTabToZone` called.
- [ ] T017 [US7] Add example usage documentation to `src/components/ToolbarActions/README.md` and append short snippet to `specs/003-docking-panel-system/PLANNING_SUMMARY.md`.

## Phase 4 — Polish & Cross-cutting concerns

- [ ] T018 Add accessibility attributes and keyboard navigation to `ToolbarActionButton` and `ToolbarActionMenu` (`aria-haspopup`, `role=menu`, keyboard arrow handling) — file: `src/components/ToolbarActions/ToolbarActionMenu.tsx`.
- [ ] T019 [P] Add docs + Storybook or a dev example page: `src/examples/RegisterToolbarActionDemo.tsx` and optionally `public/examples/ToolbarActionsExample.tsx`.
- [ ] T020 Improve type-safety and exports: export actions API from `src/components/ToolbarActions/index.ts` and add reexports to `src/components/ToolbarActions/types.ts`.
- [ ] T021 Add an E2E scenario (Playwright): `tests/e2e/toolbar-actions.spec.ts` verifying nested menu clicks and callback invocation in a running dev server (optional but recommended).
- [ ] T022 Update `specs/003-docking-panel-system/tasks.md` to reference this new `US7` tasks file and include a cross-link: `specs/003-docking-panel-system/tasks-toolbar-actions.md`.

---

## Dependencies (story completion order)

1. Phase 1: T001–T003 (create files, types stub)
2. Phase 2: T004–T011 (registry & provider & hook + tests + integrate into Toolbar)
3. Phase 3 (US7): T012–T017 (menu UI, subscriptions, integration test, example usage)
4. Phase 4: T018–T022 (accessibility, docs, e2e, final references)

Notes: Many foundational tasks are parallelizable (registry, store, types, unit tests) — marked [P] where safe.

## Parallel execution examples

- Example A (Frontend dev parallel):
  - Engineer A: Implement `ToolbarActionRegistry.ts` and `types.ts` (T005, T004)
  - Engineer B: Implement `toolbarActionsStore.ts` and `useToolbarActions.ts` (T006, T008)
  - Engineer C: Implement UI `ToolbarActionButton.tsx` (T013) and example `RegisterToolbarActionDemo.tsx` (T010)

- Example B (Test-first):
  - Engineer A: Write unit tests for registry and hook (T009)
  - Engineer B: Implement registry to satisfy tests (T005)

## Implementation strategy (MVP first)

1. MVP scope: T001–T011 + T013+T014+T015 minimal integration (ability to register an action, render a button, and invoke a callback). This gives a developer-facing API immediately usable to call `useLayoutStore` functions.
2. Next: Add nested menus (T012/T013), examples and docs (T010/T017), and tests (T016/T009).
3. Final: Accessibility and E2E tests (T018, T021) and polishing exports (T020).

## Files referenced by tasks (one-line purpose)

- `src/components/ToolbarActions/types.ts` — action and menu types
- `src/components/ToolbarActions/ToolbarActionRegistry.ts` — registry API (register/invoke/list)
- `src/components/ToolbarActions/ToolbarActionButton.tsx` — toolbar button + dropdown UI
- `src/components/ToolbarActions/ToolbarActionMenu.tsx` — recursive menu renderer
- `src/components/ToolbarActions/README.md` — docs and examples
- `src/components/ToolbarActions/index.ts` — main exports
- `src/state/toolbarActionsStore.ts` — optional store for subscribers
- `src/hooks/useToolbarActions.ts` — hook wrapper for registry/provider
- `src/hooks/useOnToolbarAction.ts` — subscription helper (onToolbarAction)
- `src/examples/RegisterToolbarActionDemo.tsx` — example registration and sample callback
- `src/components/Editor/Toolbar.tsx` — integrate registry to render registered actions
- `tests/toolbarActions/*.test.ts` — unit + integration tests
- `tests/e2e/toolbar-actions.spec.ts` — optional E2E test

---

## Summary & counts

- Total tasks: 22
- Tasks associated to US7: 6 (T012–T017)
- Parallel opportunities identified: T004/T005/T006/T009/T019/T020
- Independent test criteria for US7: register → render → click → subscriber called (integration test: `tests/toolbarActions/integration.test.tsx`)
- Suggested MVP scope: Implement registry + provider + hook + minimal UI + one example (T001–T011, T013–T015)

## Format validation

- All tasks follow the checklist format: `- [ ] T### [P]? [US#]? Description with file path` (setup & foundation tasks have no story label; US7 tasks are labeled `[US7]`).

---

If you want I can:
- Create the skeleton files for the minimal MVP (T001–T003, T005, T006, T008, T010, T013) and run unit tests for the registry (quick Vitest run), or
- Open a PR patch implementing `registerToolbarAction` + a tiny demo that calls `useLayoutStore.getState().addTabToZone(...)` when the action is clicked.

Which do you prefer ? (I can start by creating the skeleton files and tests now.)
