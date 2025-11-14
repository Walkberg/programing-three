# Tasks: UpdateLoop & Component Compute

Feature: Improve play-mode update pipeline so components can `compute` their derived state, and the scene/store automatically subscribes and persists modifications.

Phase 1: Setup
- [ ] T001 Run test suite and ensure working baseline (`npx vitest run`) - project root
- [ ] T002 [P] Add spec file for update-loop feature `specs/001-scene-editor-mvp/tasks-update-loop.md` (this file) - `specs/001-scene-editor-mvp/tasks-update-loop.md`

Phase 2: Foundational
- [ ] T003 Add `compute()` lifecycle method to component base in `src/core/Component.ts` - modify class to declare `compute(deltaTime?: number): void`
- [ ] T004 [P] Implement `compute()` stub in `src/core/Transform.ts` to compute derived matrix or normalized values (no store writes) - `src/core/Transform.ts`
- [ ] T005 [P] Update `src/core/RotationComponent.ts` to implement `compute()` which calculates rotation delta but does not directly mutate the store - `src/core/RotationComponent.ts`

Phase 3: User Story - US1 (Component-driven compute and scene subscription)
Story goal: Components produce computed changes; UpdateLoop applies them and persists minimal patches to `sceneStore`, causing subscribers (renderers) to update automatically.
Independent test criteria: After refactor, play mode animations should update transforms visible in the viewport without manual store updates inside individual components.
- [ ] T006 [US1] Refactor `UpdateLoop` in `src/components/Viewport/SceneViewport.tsx` to run the following per-frame in play mode: 1) call `compute(deltaTime)` on all enabled components; 2) collect any produced patches; 3) apply patches via `useSceneStore.getState().updateTransform()` or `updateComponent()` as appropriate - `src/components/Viewport/SceneViewport.tsx`
- [ ] T007 [US1] Add a simple `Component.setComputedPatch(patch)` API or return value convention so components can expose their computed modifications (e.g., transform deltas) without mutating store directly - `src/core/Component.ts`
- [ ] T008 [US1] Update `RotationComponent.compute()` to return a transform delta object `{ rotation?: { x,y,z } }` and ensure `UpdateLoop` applies it via `updateTransform` - `src/core/RotationComponent.ts` and `src/components/Viewport/SceneViewport.tsx`
- [ ] T009 [US1] Ensure `GameObjectMesh` renders updated transforms by using `useSceneStore` selectors that observe the store changes (no code change if selectors already used) - `src/components/Viewport/SceneViewport.tsx` (GameObjectMesh)

Phase 4: User Story - US2 (CodeComponent lifecycle integration)
Story goal: CodeComponents can participate in compute/update lifecycle and request store updates via returned patches.
Independent test criteria: Inline or asset code `update()` functions can return patch objects that are applied to the scene store automatically.
- [ ] T010 [US2] Update `CodeExecutor` usage in `UpdateLoop` so that executed `update()` code can return an object of patches (or call a provided `applyPatch(patch)` helper) and `UpdateLoop` will apply them - `src/components/Viewport/SceneViewport.tsx` and `src/services/CodeExecutor.ts`
- [ ] T011 [US2] Add tests: simulate a CodeComponent that returns a transform patch; verify `useSceneStore` gets updated after one frame - `tests/keybinding/integration.test.ts` or new test `tests/scene/updateLoop.compute.test.ts`

Phase 5: Polish & Cross-cutting
- [ ] T012 [P] Add a small performance guard: batch patches and apply them once per frame to reduce store churn - `src/components/Viewport/SceneViewport.tsx`
- [ ] T013 Update docs: add short doc in `specs/001-scene-editor-mvp/` describing the compute->patch->store flow - `specs/001-scene-editor-mvp/README.md`
- [ ] T014 [P] Add TypeScript types for `ComputedPatch` and export from `src/types/index.ts` - `src/types/index.ts`

Dependencies
- US1 depends on Foundational tasks T003-T005
- US2 depends on US1 being implemented

Parallel opportunities
- T004 and T005 can be done in parallel (component-specific compute implementations)
- T012 and T014 are parallelizable polish tasks

Implementation strategy (MVP-first)
- Implement `compute()` stub (T003) and UpdateLoop patching (T006) first so the runtime pipeline exists.
- Implement one real component (`RotationComponent`) compute + UpdateLoop application (T005 and T008) to validate the flow.
- Then add CodeComponent integration (T010) and tests (T011).

Files to change (summary)
- `src/core/Component.ts`
- `src/core/Transform.ts`
- `src/core/RotationComponent.ts`
- `src/components/Viewport/SceneViewport.tsx`
- `src/services/CodeExecutor.ts` (optional for CodeComponent patch apply)
- `src/types/index.ts` (add `ComputedPatch`)
- New tests under `tests/scene/`

Output
- Path to task file: `specs/001-scene-editor-mvp/tasks-update-loop.md`
- Total tasks: 14
- Tasks per story: Foundational 3, US1 4, US2 2, Polish 5

MVP suggestion
- Implement T003, T006, T005, T008 (Component compute base + UpdateLoop + RotationComponent compute + applying rotation patch). This provides visible animation in the viewport and validates the pipeline.

Format validation
- All tasks above follow the required checklist format with Task IDs and file paths.

If you confirm, I will:
1) Implement T003 (add `compute()` to `Component` and types) and commit changes.
2) Then implement T006 (UpdateLoop refactor) and run tests.

Which task should I start with? (recommended: T003 then T006)