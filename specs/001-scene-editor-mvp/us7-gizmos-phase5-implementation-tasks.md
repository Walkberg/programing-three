# Implementation Tasks: Phase 5 — Features & UX polish (Gizmos)

This file breaks down Phase 5 (T186 - T190) from `us7-gizmos-tasks.md` into implementation-grade tasks. Each task follows the strict checklist format and includes exact file paths so an LLM or developer can complete them without additional context.

## Goal
Polish the gizmos UX: persist snap configuration, add pivot display and toggle, provide axis hover highlights and tooltips, show a snap visual indicator, and record undo history for gizmo drag-end operations.

## Acceptance criteria (overall)
- Given the user configures snap values, they persist across reloads.
- The Gizmos menu shows current pivot mode and allows toggling pivot (center/local).
- Hovering gizmo axes shows visual highlight and a small tooltip with axis name.
- When snap is enabled, a small snap indicator appears in the viewport while dragging.
- Drag-end of a gizmo operation creates an undo entry available in `historyStore`.

---

## Phase 5 tasks (detailed)

Notes:
- These tasks assume existing files: `src/components/Viewport/GizmosMenu.tsx`, `src/state/editorStore.ts`, `src/engine/GizmoManager.ts`, `src/components/Viewport/SceneViewport.tsx`, and `src/state/historyStore.ts`.

- [ ] T200 [US4] Persist gizmo snap settings in `editorStore` and expose setters in `src/state/editorStore.ts`
  - Add typed fields `gizmoSnap: { translate?: number; rotate?: number; scale?: number }`, `setGizmoSnap`, and persistence to localStorage in `src/state/editorStore.ts`.

- [ ] T201 [US4] Wire `GizmosMenu` snap inputs to the persisted `editorStore.gizmoSnap` (file: `src/components/Viewport/GizmosMenu.tsx`)
  - Read values from `useEditorStore` and call `setGizmoSnap` on change.
  - Validate numeric inputs and allow clearing the value (empty string -> unset).

- [ ] T202 [US4] Add pivot mode state in `editorStore` (`pivotMode: 'center'|'local'`) and setter (file: `src/state/editorStore.ts`)
  - Expose `setPivotMode`.

- [ ] T203 [US4] Update `GizmosMenu` to display current pivot mode and add a pivot toggle control (file: `src/components/Viewport/GizmosMenu.tsx`)
  - Show label `Pivot: Center` or `Pivot: Local` and a toggle button that calls `setPivotMode`.

- [ ] T204 [US4] Make `GizmoManager` support pivot mode: expose `setPivotMode(mode: 'center'|'local')` and apply it to transforms when attaching (file: `src/engine/GizmoManager.ts`)
  - Implement API surface and ensure `TransformControls` uses local vs world pivot if possible (or emulate pivot by offsetting attach target).

- [ ] T205 [US4] Add axis hover highlight and tooltip support in `GizmoManager` (file: `src/engine/GizmoManager.ts`)
  - When pointer hovers a gizmo handle, add a visual highlight (change handle color/intensity) and emit an event `onHandleHover(axis: 'X'|'Y'|'Z')`.
  - Provide a callback registration `setHandleHoverCallback(cb)` to forward hover events to UI.

- [ ] T206 [US4] Render small tooltip/label in the viewport near mouse when `onHandleHover` fires (file: `src/components/Viewport/SceneViewport.tsx`)
  - Tooltip content: axis name (X, Y, Z) and mode (Translate / Rotate / Scale).
  - Tooltip should be keyboard-accessible (appear when handle receives focus via tabbing if feasible).

- [ ] T207 [US4] Implement snapping visual indicator in `SceneViewport` (file: `src/components/Viewport/SceneViewport.tsx`)
  - When snap is active and the user is dragging a gizmo (GizmoManager exposes dragging state via events), display a temporary grid/snapping marker at the snapped position.
  - The indicator should disappear on drag-end.

- [ ] T208 [US4] On gizmo drag-end, push an undo entry to `historyStore` with before/after transform data (file: `src/state/historyStore.ts`, `src/engine/GizmoManager.ts`)
  - Add `historyStore.push(entry)` where entry contains: gameObjectId, beforeTransform, afterTransform, timestamp, description.
  - Ensure `GizmoManager` calls a drag-start callback to record `beforeTransform` and drag-end to record `afterTransform` and push to history.

- [ ] T209 [US4] Expose a simple Undo action in the Editor toolbar that calls `historyStore.undo()` (file: `src/components/Editor/Toolbar.tsx`, `src/state/historyStore.ts`)
  - Implement `historyStore.undo()` to apply last entry reverse transform via `sceneStore.updateTransform`.

- [ ] T210 [US4] Add unit tests for key pieces:
  - T210.1 [US4] Unit test: `GizmoManager` calls handle-hover callback when hovering axis (file: `tests/engine/GizmoManager.hover.test.ts`)
  - T210.2 [US4] Unit test: `historyStore` push and undo with transform application (file: `tests/state/historyStore.test.ts`)

---

## Dependencies & Execution Order

1. T200 → T201 (snap persistence before UI binding)
2. T202 → T203 → T204 (pivot state then menu then manager support)
3. T205 → T206 (GizmoManager hover API then viewport tooltip)
4. T207 depends on T200/T201 (snap values) and T205 (drag state)
5. T208 → T209 (history entries then toolbar undo)
6. Tests (T210.*) can be written in parallel once the respective features exist

## Parallel opportunities

- T201 (UI binding) and T204 (manager pivot impl) can be implemented in parallel if their public API contract is respected.
- T205 (hover API) and T206 (tooltip UI) can be implemented in parallel with a small mock event during integration.
- Tests (T210.*) can be written while implementation occurs.

## Implementation strategy (MVP-first)

1. Implement persistence (T200), wire UI (T201), so users can persist snap configuration immediately.
2. Add history support (T208) with a minimal entry shape and toolbar undo (T209) to give immediate value when moving objects.
3. Pivot toggle UI (T203) + manager hook (T204).
4. Visual polish: axis hover (T205/T206) and snapping indicator (T207).
5. Add unit tests (T210.*) to cover the main integration points.

---

## Output

- File created: `specs/001-scene-editor-mvp/us7-gizmos-phase5-implementation-tasks.md`

Total new actionable tasks: 11 (T200-T210.x)
