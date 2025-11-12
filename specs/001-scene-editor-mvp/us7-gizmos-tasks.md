# Tasks: Gizmos & Scene Manipulation (Translate / Rotate / Scale)

**Feature**: Scene Editor MVP — Gizmos & Scene Manipulation
**Purpose**: Add a Scene menu and in-viewport gizmos to translate, rotate and scale selected GameObjects. Provide UX for world/local toggle, snapping, and keyboard shortcuts. This file adds a standalone user story (US4) for the gizmos feature.

## Notes
- Tech stack: React + TypeScript + Three.js (React Three Fiber) + shadcn/ui + Tailwind (derived from plan.md)
- Where to add code: `src/components/Viewport/SceneViewport.tsx`, `src/components/Editor/Toolbar.tsx`, `src/state/sceneStore.ts`, `src/components/ui/` (new gizmo menu), `src/engine/` (gizmo manager, Render-loop integration), tests in `tests/`.

---

## Phase 1: Setup (global / infra)

 - [x] T171 Install/validate Three.js TransformControls or an alternative gizmo library (e.g., `@react-three/drei` TransformControls) and add to `package.json` if missing (file: package.json)
 - [x] T172 Add TypeScript types and local helper types for gizmo options in `src/types/index.ts` (file: src/types/index.ts)
 - [x] T173 Add `GizmoManager` stub in `src/engine/GizmoManager.ts` (file: src/engine/GizmoManager.ts) - class skeleton, init/dispose API

---

## Phase 2: Foundational engine integration

 - [x] T174 [US4] Integrate `GizmoManager` into engine render loop: provide `attach(object3D)`, `detach()`, `setMode('translate'|'rotate'|'scale')`, `setSpace('world'|'local')`, `setSnap({ translate?: number, rotate?: number, scale?: number })` (file: src/engine/GizmoManager.ts)
 - [x] T175 [US4] Create `useGizmoManager` React hook that exposes the manager to components (file: src/engine/useGizmoManager.ts)
 - [x] T176 [US4] Wire GizmoManager lifecycle in `src/components/Viewport/SceneViewport.tsx`: initialize on mount, dispose on unmount, call `manager.update()` from render loop (file: src/components/Viewport/SceneViewport.tsx)
 - [x] T177 [US4] Add engine-level event forwarding so gizmo transform changes update the scene store (emit `onTransformChange(gameObjectId, partialTransform)` events) (file: src/engine/GizmoManager.ts)

---

## Phase 3: UI - Scene Menu & Toolbar

 - [x] T178 [US4] Add a "Gizmos" dropdown/menu button to the editor toolbar for quick mode selection (Translate / Rotate / Scale / None) (file: src/components/Editor/Toolbar.tsx)
 - [x] T179 [US4] Create a `GizmosMenu` component under `src/components/Viewport/GizmosMenu.tsx` that can also be shown in the SceneViewport top-right corner (file: src/components/Viewport/GizmosMenu.tsx)
 - [x] T180 [US4] Menu must include:
  - mode buttons: Translate | Rotate | Scale | Off
  - space toggle: World / Local
  - snap toggles and inputs for X/Y/Z translate, rotation snap degrees, and scale snap (file: src/components/Viewport/GizmosMenu.tsx)
 - [x] T181 [US4] Add keyboard shortcuts: W = Translate, E = Rotate, R = Scale, Q = Toggle World/Local; document in the toolbar tooltip (file: src/components/Editor/Toolbar.tsx)

<!-- Updated: 2025-11-12 - T171..T181 implemented -->


---

## Phase 4: Selection glue & attaching gizmo to GameObjects

 - [x] T182 [US4] On selection change (editorStore.selectedId), attach GizmoManager to the selected object's Three.js Object3D; detach when selection clears (file: src/components/Viewport/SceneViewport.tsx)
 - [x] T183 [US4] Implement `SceneObjectProvider` or ensure every GameObject rendered has a stable ref to its Three.js Object3D to allow Gizmo attachment (file: src/components/Viewport/SceneObject.tsx or SceneViewport.tsx)
 - [x] T184 [US4] When gizmo edits occur, update the corresponding GameObject's Transform in `sceneStore.updateTransform()` using the `onTransformChange` event from GizmoManager (file: src/state/sceneStore.ts)
 - [x] T185 [US4] Keep inspector in sync: when sceneStore transforms change from gizmo, ensure `TransformEditor` updates its fields (file: src/components/Inspector/TransformEditor.tsx)

---

## Phase 5: Features & UX polish

- [ ] T186 [US4] Implement snap configuration persistence in `editorStore` or `sceneStore` (persist per-editor session) and bind controls from `GizmosMenu` (file: src/state/editorStore.ts)
- [ ] T187 [US4] Add world/local pivot toggle and display the current pivot (center vs local pivot) in the menu (file: src/components/Viewport/GizmosMenu.tsx)
- [ ] T188 [US4] Display gizmo axis hover highlights and show tooltips (X, Y, Z) when hovering handles (file: src/engine/GizmoManager.ts and styles in src/components/ui)
- [ ] T189 [US4] Add snapping visual indicator when snap is active (small grid lines or overlay) in the viewport (file: src/components/Viewport/SceneViewport.tsx)
- [ ] T190 [US4] Implement undo support for gizmo operations via `historyStore` (create a history entry on drag-end) (file: src/state/historyStore.ts)

---

## Phase 6: Edge cases, accessibility, and keyboard flows

- [ ] T191 [US4] Handle multi-selection: when multiple GameObjects are selected, attaching gizmo should (a) attach to group-root object, or (b) disable some modes; define behavior and document it (file: src/components/Hierarchy/HierarchyPanel.tsx and SceneViewport.tsx)
- [ ] T192 [US4] When in Play mode, disable gizmos and show tooltip explaining they are disabled (file: src/components/Viewport/SceneViewport.tsx)
- [ ] T193 [US4] Accessibility: ensure menu is keyboard navigable and has ARIA labels; provide alternative numeric inputs for precision movement (file: src/components/Viewport/GizmosMenu.tsx)
 - [x] T191 [US4] Handle multi-selection: when multiple GameObjects are selected, attaching gizmo should (a) attach to group-root object, or (b) disable some modes; define behavior and document it (file: src/components/Hierarchy/HierarchyPanel.tsx and SceneViewport.tsx)
 - [x] T192 [US4] When in Play mode, disable gizmos and show tooltip explaining they are disabled (file: src/components/Viewport/SceneViewport.tsx)
 - [x] T193 [US4] Accessibility: ensure menu is keyboard navigable and has ARIA labels; provide alternative numeric inputs for precision movement (file: src/components/Viewport/GizmosMenu.tsx)

---

## Phase 7: Tests & Validation

- [ ] T194 [US4] Unit tests for `GizmoManager` core functions (attach/detach/setMode) using Vitest (file: tests/engine/GizmoManager.test.ts)
- [ ] T195 [US4] Integration tests: verify selecting an object attaches gizmo and modifying gizmo updates `sceneStore` (file: tests/integration/gizmos.integration.test.ts)
- [ ] T196 [US4] E2E test: simulate user pressing W/E/R, dragging gizmo in viewport, and asserting GameObject moved (Playwright test under tests/e2e/editor-workflow.spec.ts)

---

## Phase 8: Polish & Performance

- [ ] T197 [US4] Profile gizmo performance under 50 GameObjects and ensure <16ms property update latency; optimize by throttling high-frequency updates (file: src/engine/GizmoManager.ts)
- [ ] T198 [US4] Add settings to disable gizmo rendering for low-power devices (file: src/components/Viewport/GizmosMenu.tsx)
- [ ] T199 [US4] Final UI polish: small animations for menu, consistent spacing, and Tailwind utility classes (files: src/components/Viewport/GizmosMenu.tsx, src/components/Editor/Toolbar.tsx)

---

## Dependencies & Execution Order

1. Phase 1 (Install / types) → Phase 2 (engine integration)
2. Phase 2 → Phase 3 (UI) and Phase 4 (selection glue)
3. Phase 4 → Phase 5 (snap, undo)
4. Tests (Phase 7) should run after Phase 4 + Phase 5

### Parallel opportunities
- T178 (Toolbar menu UI) and T179 (GizmosMenu) can be implemented in parallel (UI-only)
- T174 (GizmoManager API) and T176 (SceneViewport wiring) can be worked on by two devs in parallel if the API contract is respected
- Unit tests (T194) can be written in parallel while the manager is implemented

---

## Implementation Notes & Acceptance Criteria

- Acceptance test for US4 (independent):
  - Given a selected GameObject, when user presses `W` and drags the translate handle, the GameObject's position values in the inspector update to reflect the new position and the scene renders the change in real-time.
  - When user toggles space to `Local`, gizmo movement respects local axes.
  - When snap is enabled (e.g., translate snap = 1 unit), dragging moves in increments of 1 unit.

- Minimal viable implementation for acceptance (MVP):
  1. Add basic GizmoManager using `TransformControls` (Translate/Rotate/Scale)
  2. Attach to selected GameObject and update transforms in store
  3. Provide toolbar/menu to switch modes and a world/local toggle

---

## File created
- `specs/001-scene-editor-mvp/us7-gizmos-tasks.md` (this file)

---

## Summary
- Total tasks added: 29 (T171 - T199)
- Story: US4 (Gizmos & Scene Manipulation) — independent user story, testable after Phase 4
- Parallel opportunities: Toolbar & menu UI work, unit tests while manager implemented

If you want these tasks generated in French or need me to also apply initial starter files (GizmoManager stub, GizmosMenu component), tell me which language and I will create the initial code files next.