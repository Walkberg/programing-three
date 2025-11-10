# Tasks: Asset System & Custom Components

**Feature**: 002-asset-system  
**Date**: 2025-11-10  
**Total Tasks**: 62  
**Estimated Time**: 20-25 hours

## Overview

This feature adds asset import and custom scripting to the Scene Editor MVP. It implements the two constitutional principles deferred in 001-scene-editor-mvp: Asset Pipeline Integrity (Principle IV) and Extensibility Through Scripting (Principle VI).

## Task Breakdown

### Phase 1: Setup (5 tasks - ~1 hour)

Setup tasks for asset system dependencies and infrastructure.

- [ ] T001 Install dependencies: `idb`, `@monaco-editor/react`, `@babel/standalone`, install with `npm install idb @monaco-editor/react @babel/standalone`
- [ ] T002 Configure Vite for Monaco Editor workers in `vite.config.ts` (add worker plugin config)
- [ ] T003 Create IndexedDB schema in `src/services/AssetService.ts` (define stores for assets)
- [ ] T004 Create types in `src/types/assets.ts` (Asset, AssetType, Model3DData, CodeData)
- [ ] T005 [P] Add GLTFLoader and OBJLoader imports from `three/examples/jsm/loaders/` in `src/services/ModelLoader.ts`

### Phase 2: Foundational (8 tasks - ~2 hours)

Core services and infrastructure needed by all user stories.

- [ ] T006 Implement AssetService with IndexedDB CRUD in `src/services/AssetService.ts` (create, read, update, delete, list)
- [ ] T007 [P] Implement ThumbnailGenerator service in `src/services/ThumbnailGenerator.ts` (render 3D model to canvas, return data URL)
- [ ] T008 [P] Implement ModelLoader service in `src/services/ModelLoader.ts` (async load .glb/.gltf with GLTFLoader)
- [ ] T009 Create asset store with Zustand in `src/state/assetStore.ts` (assets array, selected asset, upload progress)
- [ ] T010 [P] Register Model3DComponent in ComponentRegistry in `src/core/Model3DComponent.ts`
- [ ] T011 [P] Register CodeComponent in ComponentRegistry in `src/core/CodeComponent.ts`
- [ ] T012 [P] Create Web Worker template in `src/workers/codeWorker.ts` (message handler for code execution)
- [ ] T013 Implement CodeExecutor service in `src/services/CodeExecutor.ts` (transpile, execute in worker, timeout handling)

### Phase 3: User Story 1 - Upload and Use 3D Model Asset (18 tasks - ~6 hours)

Enable users to import 3D models and attach them to GameObjects.

**Goal**: Users can upload a .glb file, see it in asset library, and render it on a GameObject.

**Independent Test**: Upload .glb file → see thumbnail in Assets panel → add GameObject → add Model3D component → select asset → see rendered in viewport.

- [ ] T014 [P] [US1] Create AssetsPanel layout component in `src/components/Assets/AssetsPanel.tsx` (collapsible panel at bottom of editor)
- [ ] T015 [P] [US1] Create AssetGrid component in `src/components/Assets/AssetGrid.tsx` (grid layout for asset items)
- [ ] T016 [P] [US1] Create AssetItem component in `src/components/Assets/AssetItem.tsx` (thumbnail, name, size, context menu)
- [ ] T017 [US1] Create AssetUpload component in `src/components/Assets/AssetUpload.tsx` (drag-drop zone + file input button)
- [ ] T018 [US1] Implement file validation in AssetUpload (check file extension .glb/.gltf, size < 50MB)
- [ ] T019 [US1] Implement upload progress indicator in AssetUpload (show progress bar during upload)
- [ ] T020 [US1] Connect AssetUpload to AssetService.createAsset() (save to IndexedDB)
- [ ] T021 [US1] Generate thumbnail after upload using ThumbnailGenerator service
- [ ] T022 [US1] Display uploaded assets in AssetGrid fetched from assetStore
- [ ] T023 [P] [US1] Create Model3DComponent class in `src/core/Model3DComponent.ts` (assetId, scale properties, loadModel method)
- [ ] T024 [US1] Implement Model3DComponent.loadModel() using ModelLoader service
- [ ] T025 [US1] Implement Model3DComponent serialization (assetId, scale to JSON)
- [ ] T026 [P] [US1] Create Model3DEditor component in `src/components/Inspector/ComponentEditors/Model3DEditor.tsx`
- [ ] T027 [US1] Add asset dropdown to Model3DEditor (list assets from assetStore filtered by type='model')
- [ ] T028 [US1] Add scale slider to Model3DEditor (0.1 to 10, default 1.0)
- [ ] T029 [US1] Integrate Model3DComponent into SceneViewport rendering (replace/extend GameObjectMesh)
- [ ] T030 [US1] Handle model loading errors in Model3DComponent (corrupted file, unsupported format)
- [ ] T031 [US1] Add Model3DComponent to ComponentEditor switch statement in `src/components/Inspector/ComponentEditor.tsx`

**Tests** (if TDD requested):
- AssetService CRUD operations work with IndexedDB
- ThumbnailGenerator creates valid data URLs
- ModelLoader loads .glb files without errors
- Model3DEditor shows asset dropdown with uploaded models
- Model renders in viewport when asset selected

---

### Phase 4: User Story 2 - Create Custom Code Component (20 tasks - ~8 hours)

Enable users to write JavaScript/TypeScript code that executes during play mode.

**Goal**: Users can write custom scripts, see syntax highlighting, and have code execute in play mode.

**Independent Test**: Add Code component → write `update() { this.transform.rotation.y += deltaTime; }` → click Play → observe rotation.

- [ ] T032 [P] [US2] Create CodeComponent class in `src/core/CodeComponent.ts` (code property, language, executionTime, errors)
- [ ] T033 [US2] Implement CodeComponent serialization (code, language to JSON)
- [ ] T034 [US2] Define CodeContext interface in `src/types/assets.ts` (gameObject, transform, scene, deltaTime)
- [ ] T035 [P] [US2] Create CodeEditor component in `src/components/Inspector/ComponentEditors/CodeEditor.tsx` (Monaco Editor integration)
- [ ] T036 [US2] Configure Monaco Editor with JavaScript syntax highlighting
- [ ] T037 [US2] Add template code to CodeEditor (show lifecycle hooks: start, update, onDestroy)
- [ ] T038 [US2] Implement code saving to component on editor change
- [ ] T039 [US2] Add "Save as Asset" button in CodeEditor (saves code to asset library)
- [ ] T040 [US2] Implement TypeScript transpilation in CodeExecutor.transpile() using @babel/standalone
- [ ] T041 [US2] Implement sandboxed execution in CodeExecutor.execute() (send code to Web Worker)
- [ ] T042 [US2] Create restricted global scope in codeWorker.ts (only allow whitelisted APIs)
- [ ] T043 [US2] Inject CodeContext (`this.gameObject`, `this.transform`, `this.scene`) into execution scope
- [ ] T044 [US2] Implement start() hook execution in CodeComponent (called once on play mode start)
- [ ] T045 [US2] Implement update(deltaTime) hook execution in UpdateLoop (called every frame during play)
- [ ] T046 [US2] Implement onDestroy() hook execution in CodeComponent (called on GameObject deletion)
- [ ] T047 [US2] Add error catching in CodeExecutor (catch runtime errors, return with line numbers)
- [ ] T048 [P] [US2] Create ConsolePanel component in `src/components/Console/ConsolePanel.tsx` (log output display)
- [ ] T049 [P] [US2] Create ConsoleMessage component in `src/components/Console/ConsoleMessage.tsx` (single log entry)
- [ ] T050 [US2] Connect console.log in code to ConsolePanel (intercept in worker, send to main thread)
- [ ] T051 [US2] Highlight error lines in Monaco Editor when execution fails
- [ ] T052 [US2] Measure and display code execution time in Inspector (show warning if > 5ms)
- [ ] T053 [US2] Implement 100ms timeout for code execution (terminate worker if exceeded)
- [ ] T054 [US2] Add CodeComponent to ComponentEditor switch statement in `src/components/Inspector/ComponentEditor.tsx`

**Tests** (if TDD requested):
- CodeExecutor transpiles TypeScript to JavaScript
- Code executes in sandboxed worker without DOM access
- Runtime errors caught and displayed with line numbers
- Execution timeout terminates runaway code
- console.log output appears in ConsolePanel

---

### Phase 5: User Story 3 - Asset Library Management (8 tasks - ~3 hours)

Enable users to organize, search, rename, and delete assets.

**Goal**: Users can manage uploaded assets efficiently.

**Independent Test**: Upload 5 assets → search for name → rename asset → delete unused asset → confirm removal.

- [ ] T055 [P] [US3] Add search input to AssetsPanel in `src/components/Assets/AssetsPanel.tsx`
- [ ] T056 [US3] Implement search filter in assetStore (filter assets by name matching search query)
- [ ] T057 [US3] Add asset type filter dropdown in AssetsPanel (All, Models, Scripts)
- [ ] T058 [US3] Implement rename functionality in AssetItem (double-click to edit, save to AssetService)
- [ ] T059 [US3] Add delete button to AssetItem context menu
- [ ] T060 [US3] Implement usage check in AssetService.deleteAsset() (find components referencing asset)
- [ ] T061 [US3] Show confirmation dialog if asset in use (list GameObjects using it)
- [ ] T062 [US3] Implement export asset bundle in AssetsPanel (zip all assets, trigger download)

**Tests** (if TDD requested):
- Search filters assets by name in real-time
- Rename updates asset name in IndexedDB
- Delete removes asset from storage
- Warning shown when deleting asset in use

---

### Phase 6: Polish & Cross-Cutting Concerns (3 tasks - ~1 hour)

Final refinements and validation.

- [ ] T063 Add storage quota monitoring to AssetService (check IndexedDB usage, warn at 80%)
- [ ] T064 Add loading states to Model3DEditor when model is being loaded
- [ ] T065 Add keyboard shortcut Ctrl+Enter to run code in CodeEditor (convenience feature)

---

## Dependencies

### User Story Completion Order

```
Setup (Phase 1) → Foundational (Phase 2) →
  ├─ US1: Upload Models (Phase 3) ─┐
  ├─ US2: Code Components (Phase 4) ├─ US3: Asset Library (Phase 5) → Polish (Phase 6)
  └─ (US1 & US2 can run in parallel) ─┘
```

**Critical Path**:
1. Phase 1 (Setup) must complete first
2. Phase 2 (Foundational) blocks all user stories
3. US1 and US2 are independent - can be implemented in parallel by different developers
4. US3 depends on both US1 and US2 being complete (manages both model and script assets)
5. Phase 6 (Polish) runs after all user stories

**Parallel Opportunities**:
- While T014-T022 (Asset UI) is being built, T023-T031 (Model3D component) can be worked on
- T032-T054 (Code component) is fully independent of T014-T031 (Model3D)
- T007, T008, T010-T012 can all be developed in parallel after T006

### Blocking Tasks

Tasks that block multiple other tasks:
- **T006 (AssetService)**: Blocks T020, T021, T027, T039, T058, T060
- **T009 (assetStore)**: Blocks T022, T027, T056, T057
- **T013 (CodeExecutor)**: Blocks T040, T041, T047, T052, T053
- **T023 (Model3DComponent class)**: Blocks T024-T031
- **T032 (CodeComponent class)**: Blocks T033-T054

## Parallel Execution Examples

### Sprint 1: Foundations (Days 1-2)
**Developer A**: T001-T004 (setup) → T006, T009 (services)  
**Developer B**: T005 (loaders) → T007, T008 (thumbnail, model)  
**Developer C**: T010-T013 (component registration, worker)

### Sprint 2: US1 Models (Days 3-5)
**Developer A**: T014-T022 (Assets UI)  
**Developer B**: T023-T031 (Model3D component + editor)  
**Developer C**: Can start US2 in parallel (T032-T037)

### Sprint 3: US2 Code (Days 6-9)
**Developer A**: T038-T046 (Code execution)  
**Developer B**: T047-T054 (Console, errors, monitoring)  
**Developer C**: Can start US3 if US1 done (T055-T062)

### Sprint 4: US3 + Polish (Days 10-11)
**Developer A**: T055-T062 (Asset management)  
**Developer B**: T063-T065 (Polish)  
**Developer C**: Testing and documentation

## Implementation Strategy

### MVP-First Approach

**Minimum Viable Product (US1 only)**:
- Just Model3D component with .glb support
- Basic upload (no drag-drop)
- No thumbnails (use file icon)
- Delivers: Users can import and render custom 3D models

**MVP+1 (US1 + US2)**:
- Add Code components
- Console output
- Basic sandbox (no full security hardening yet)
- Delivers: Users can write custom gameplay scripts

**Complete Feature (US1 + US2 + US3)**:
- Full asset library management
- Search, rename, delete
- Export bundles
- Production-ready security
- Delivers: Professional asset management

### Incremental Delivery

After each user story completion:
1. Run independent test scenario
2. Validate success criteria
3. Deploy to staging (if applicable)
4. Gather user feedback before next story

This allows early validation and course correction.

## Testing Strategy

### Unit Tests (Vitest)

Priority test files to create:
- `AssetService.test.ts` - CRUD operations with IndexedDB mock
- `CodeExecutor.test.ts` - Transpilation, execution, timeout
- `ModelLoader.test.ts` - .glb loading with Three.js mock
- `ThumbnailGenerator.test.ts` - Canvas rendering mock

### Component Tests (React Testing Library)

- `AssetUpload.test.tsx` - File validation, upload flow
- `Model3DEditor.test.tsx` - Asset selection, scale input
- `CodeEditor.test.tsx` - Monaco integration, save functionality
- `ConsolePanel.test.tsx` - Message display, log filtering

### Integration Tests (Playwright E2E)

- Upload .glb file → attach to GameObject → verify viewport render
- Write code component → enter play mode → verify execution
- Search assets → rename → delete → verify persistence

### Performance Tests

- Measure model load time for 10MB .glb file (target: <2s)
- Measure code execution overhead (target: <5ms avg)
- Verify 60 FPS with 10 Model3D components
- Verify 60 FPS with 20 Code components running

## Validation

### Success Criteria Checklist

After completing all tasks, verify:

- [ ] **SC-AS-001**: Upload .glb, see rendered in <30s
- [ ] **SC-AS-002**: 100 assets display without lag (<100ms)
- [ ] **SC-AS-003**: Write rotation script works first try (90% users)
- [ ] **SC-CODE-001**: Code execution <5ms overhead
- [ ] **SC-CODE-002**: Syntax errors visible in <2s
- [ ] **SC-MODEL-001**: Models load in <2s (10MB files)
- [ ] **SC-MODEL-002**: 60 FPS with 10 models (5K triangles each)
- [ ] **SC-SAFE-001**: Network requests blocked in sandbox
- [ ] **SC-SAFE-002**: Infinite loops terminated in <100ms

### Quickstart Scenario

Follow `quickstart.md` to validate end-to-end workflow:
1. Upload spaceship.glb (provided test asset)
2. Create GameObject, add Model3D component, select asset
3. Write code: `update() { this.transform.rotation.y += deltaTime; }`
4. Click Play, verify rotation
5. Save scene, reload, verify persistence

Target completion time: <5 minutes (indicates good UX).

## Notes

- **Bundle Size**: Monaco Editor adds ~5MB. Lazy load only when needed.
- **IndexedDB**: Fallback to disabled asset upload if not available (rare).
- **Security**: Code sandbox is not foolproof. Document limitations clearly.
- **Future**: Consider server-side transpilation for stronger security (post-MVP).

