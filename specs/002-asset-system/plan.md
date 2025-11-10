# Implementation Plan: Asset System & Custom Components

**Branch**: `002-asset-system` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Prerequisites**: Feature 001-scene-editor-mvp must be complete
**Input**: Feature specification from `/specs/002-asset-system/spec.md`

## Summary

Extend the Scene Editor MVP with asset import capabilities and custom scripting. This feature enables users to (1) upload 3D models from their computer and use them in scenes via Model3D components, (2) write custom JavaScript/TypeScript code in Code components to create gameplay logic, and (3) manage uploaded assets through a dedicated asset library panel. The system uses IndexedDB for binary storage, Monaco Editor for code editing, and implements sandboxed code execution for security. This transforms the editor from a primitive-only tool into a fully extensible game development environment.

## Technical Context

**Language/Version**: TypeScript 5.3+ (same as MVP)  
**Primary Dependencies**: 
- **Existing**: React 18, Three.js r160+, Tailwind CSS 4.1, shadcn/ui, Vite 5
- **New**: Monaco Editor, @babel/standalone (transpilation), idb (IndexedDB), GLTFLoader/OBJLoader

**Storage**: IndexedDB for binary assets (models), localStorage for code < 100KB, same JSON serialization for scenes with asset references  
**Testing**: Vitest + React Testing Library (existing), add tests for asset validation, code transpilation, sandboxing  
**Target Platform**: Same as MVP (modern browsers with WebGL 2.0), additional requirement: IndexedDB support  
**Project Type**: Web application (extends existing SPA)  
**Performance Goals**: 60 FPS with 10 Model3D components, <5ms code execution overhead per frame, <2s model load time for 10MB files  
**Constraints**: 50MB max file size per asset, 500MB minimum IndexedDB quota, 100ms max code execution time, client-side only (no backend compilation)  
**Scale/Scope**: Supports 100 assets in library, 20 simultaneous Code components, 10 simultaneous Model3D components per scene

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Component-Based Architecture ✅
**Status**: PASS  
**Evidence**: Extends existing Component system with two new component types: Model3DComponent and CodeComponent. Both follow base Component interface with serialize/deserialize. Asset system is service-layer concern, doesn't violate architecture.  
**Compliance**: Design maintains component-based pattern established in MVP.

### Principle II: Visual-First Development ✅
**Status**: PASS  
**Evidence**: Asset library provides visual thumbnail grid. Drag-and-drop upload is visual-first. Monaco Editor gives visual code editing. Model3D components show instant visual feedback in viewport. All operations accessible via UI.  
**Compliance**: Feature is fully visual, no CLI-only operations.

### Principle III: Real-Time Performance (NON-NEGOTIABLE) ✅
**Status**: PASS  
**Evidence**: Maintains MVP's 60 FPS requirement. Adds constraint: <5ms code execution overhead. Async model loading prevents UI blocking. Performance monitoring for code components. 100ms timeout for runaway code.  
**Compliance**: Performance requirements meet constitutional standards, no degradation allowed.

### Principle IV: Asset Pipeline Integrity ✅
**Status**: NOW IMPLEMENTED  
**Evidence**: This feature directly addresses Principle IV which was deferred in MVP. Implements .glb/.gltf import (industry standard formats). Thumbnail generation for previews. File validation (format, size, corruption). Asset metadata tracking. Storage in IndexedDB (proper binary handling).  
**Compliance**: Feature fulfills constitutional asset pipeline requirements. Formats chosen align with Three.js ecosystem.

### Principle V: Serialization & Scene Persistence ✅
**Status**: PASS  
**Evidence**: Asset references stored as IDs in scene JSON. Assets stored separately in IndexedDB (binary blob storage). Scene serialization includes asset references. Export asset bundle (.zip) for portability. Maintains existing JSON format from MVP.  
**Compliance**: Extends MVP's serialization system without breaking changes.

### Principle VI: Extensibility Through Scripting ✅
**Status**: NOW IMPLEMENTED  
**Evidence**: This feature directly addresses Principle VI which was deferred in MVP. CodeComponent provides full scripting via JavaScript/TypeScript. Lifecycle hooks (start, update, onDestroy). Scene API access via `this.scene`. Sandboxed execution for security. Save/load scripts as reusable assets.  
**Compliance**: Feature fulfills constitutional scripting requirements. Sandbox balances extensibility with safety.

### Overall Assessment
**GATE STATUS**: ✅ PASS - IMPLEMENTS DEFERRED PRINCIPLES

This feature completes the constitutional requirements by implementing the two deferred principles (IV: Asset Pipeline, VI: Scripting). All six principles now satisfied. Performance (III) maintained as NON-NEGOTIABLE. Asset formats (.glb/.gltf) align with industry standards. Scripting provides extensibility while sandboxing maintains security.

## Project Structure

### Documentation (this feature)

```text
specs/002-asset-system/
├── plan.md              # This file
├── research.md          # Asset storage comparison, code sandboxing strategies
├── data-model.md        # Asset entity, CodeComponent schema, Model3D schema
├── quickstart.md        # Upload model + write rotation script scenario
├── contracts/           # API contracts
│   └── asset-api.json   # Asset CRUD operations
└── tasks.md             # Generated by /speckit.tasks
```

### Source Code (repository root - extensions to MVP structure)

```text
src/
├── components/
│   ├── Assets/          # NEW: Asset management UI
│   │   ├── AssetsPanel.tsx
│   │   ├── AssetGrid.tsx
│   │   ├── AssetItem.tsx
│   │   ├── AssetUpload.tsx
│   │   └── AssetPreview.tsx
│   ├── Inspector/
│   │   └── ComponentEditors/
│   │       ├── Model3DEditor.tsx        # NEW
│   │       └── CodeEditor.tsx           # NEW
│   ├── Console/         # NEW: Code execution output
│   │   ├── ConsolePanel.tsx
│   │   └── ConsoleMessage.tsx
│   └── [existing MVP components...]
├── core/
│   ├── Model3DComponent.ts              # NEW
│   ├── CodeComponent.ts                 # NEW
│   └── [existing MVP core...]
├── services/
│   ├── AssetService.ts                  # NEW: IndexedDB wrapper
│   ├── ThumbnailGenerator.ts            # NEW: Preview generation
│   ├── CodeExecutor.ts                  # NEW: Sandbox runner
│   ├── ModelLoader.ts                   # NEW: GLTF/OBJ loading
│   └── [existing MVP services...]
├── workers/
│   └── codeWorker.ts                    # NEW: Web Worker for code execution
├── types/
│   ├── assets.ts                        # NEW
│   └── [existing MVP types...]
└── [existing MVP structure...]

public/
└── monaco-workers/      # NEW: Monaco Editor workers
    └── [built by Vite]
```

**Structure Decision**: Extends MVP structure with new folders for asset management (`components/Assets/`), code execution (`workers/`, `components/Console/`), and services for binary storage. Maintains MVP's clean separation. Monaco Editor requires special Vite configuration for web workers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Feature implements previously deferred principles (IV, VI) as intended. Complexity justified by user value: asset import and custom scripting are essential for any real game development workflow.

## Dependencies & Risks

### Technical Dependencies

**Critical Path**:
1. MVP Feature 001 must be 100% complete (all 7 phases)
2. Model3DComponent requires GameObject-Component system
3. CodeComponent requires scene state management
4. Asset references require scene serialization system

**New Library Integration**:
- **Monaco Editor**: Large bundle (~5MB), requires special Vite worker config
- **@babel/standalone**: 2MB, needed for TypeScript transpilation, client-side only
- **idb**: Lightweight IndexedDB wrapper, minimal risk
- **GLTFLoader**: Already part of Three.js examples, low risk

### Implementation Risks

**HIGH RISK**:
- **Code Sandboxing**: Preventing malicious code while allowing useful scene API access is complex. Mitigation: Use Web Worker + restricted global scope. No `eval`, no `Function` constructor.
- **IndexedDB Quota**: Browser may reject large uploads. Mitigation: Check quota before upload, show clear error, implement quota monitoring UI.
- **Monaco Bundle Size**: 5MB editor impacts load time. Mitigation: Lazy load Monaco only when Code component is added, not on app start.

**MEDIUM RISK**:
- **Model Loading Performance**: Large .glb files can block UI. Mitigation: Async loading with progress bar, worker-based parsing if needed.
- **Code Execution Performance**: Poorly written user code can drop FPS. Mitigation: Execution time monitoring, 5ms warning, 100ms hard timeout.

**LOW RISK**:
- **Asset Thumbnail Generation**: Rendering 3D models to canvas is well-supported. Mitigation: Use off-screen canvas, fallback to file icon if fails.
- **TypeScript Transpilation**: Babel standalone is mature. Mitigation: Catch transpilation errors, show in editor UI.

### Mitigation Strategy

1. **Phased Implementation**: Asset upload (US1) first, then Code components (US2), finally library management (US3). Each independently valuable.
2. **Performance Monitoring**: Add telemetry for code execution time, model triangle count, storage usage. Show in dev console.
3. **Graceful Degradation**: If IndexedDB unavailable, disable asset upload but keep core editor functional.
4. **User Education**: Show warning tooltips about code sandbox limitations (no network, no DOM). Provide API documentation in editor.

## Next Steps

1. **Research Phase** (`/speckit.plan research`):
   - Compare IndexedDB libraries (idb vs Dexie.js)
   - Evaluate code sandboxing approaches (Web Worker vs Realm API vs vm2)
   - Test GLTFLoader performance with various model sizes
   - Compare Monaco vs CodeMirror (bundle size, features)

2. **Design Phase** (`/speckit.plan design`):
   - Define Asset entity schema (data-model.md)
   - Design CodeComponent execution context API
   - Create asset storage strategy (contracts/asset-api.json)
   - Design thumbnail generation pipeline

3. **Task Generation** (`/speckit.tasks`):
   - Generate ordered task list organized by user story
   - Identify parallelizable tasks (e.g., UI + backend)
   - Define test criteria for each user story

4. **Implementation**:
   - Follow tasks.md sequentially
   - Run quickstart.md validation after each user story
   - Profile performance after US2 (code components most critical)

