````markdown
# Implementation Plan: Scene Editor MVP

**Branch**: `001-scene-editor-mvp` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-scene-editor-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Unity-like game editor as a web application that enables users to create 3D game scenes visually. The MVP provides three core capabilities: (1) creating and positioning GameObjects in a 3D scene with real-time rendering, (2) attaching and configuring components to GameObjects through an inspector panel, and (3) testing game behavior via Play/Stop mode. The editor uses a component-based architecture with manual save/load to browser localStorage. Technical approach: React UI with Three.js scene rendering, TypeScript for type safety, Tailwind + shadcn/ui for styling, and a JSON serialization system for scene persistence.

## Technical Context

**Language/Version**: TypeScript 5.3+  
**Primary Dependencies**: React 18, Three.js r160+, Tailwind CSS 4.1, shadcn/ui, Vite 5  
**Storage**: Browser localStorage (manual save/load), JSON serialization format  
**Testing**: Vitest (unit tests), React Testing Library (component tests), Playwright (E2E tests)  
**Target Platform**: Modern web browsers with WebGL 2.0 support (Chrome/Edge 90+, Firefox 88+, Safari 15+)  
**Project Type**: Web application (single-page app with React frontend)  
**Performance Goals**: 60 FPS scene rendering with up to 50 GameObjects, <16ms property update latency, <500ms mode transitions  
**Constraints**: <500MB baseline memory, <2GB with large scenes, <3 second initial load, client-side only (no backend)  
**Scale/Scope**: MVP targets single-user editor sessions, scenes up to 50 GameObjects, 3 core user stories, desktop-first (mouse + keyboard)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Component-Based Architecture ✅
**Status**: PASS  
**Evidence**: Architecture designed around GameObject-Component pattern. GameObjects are containers, Components provide behavior. Transform and MeshRenderer components defined. All components serializable to JSON (FR-028). Base Component class for extensibility (FR-018).  
**Compliance**: Design aligns with constitution's entity-component system requirements.

### Principle II: Visual-First Development ✅
**Status**: PASS  
**Evidence**: Three main panels defined: scene viewport (3D view), hierarchy panel (object tree), inspector panel (property editor) per FR-001. Drag-and-drop not in MVP but visual editing via inspector is present. Real-time property updates within 16ms (FR-013). GameObject selection via clicking in hierarchy or viewport (FR-010).  
**Compliance**: MVP provides visual interface for all core operations. Programmatic APIs deferred post-MVP.

### Principle III: Real-Time Performance (NON-NEGOTIABLE) ✅
**Status**: PASS  
**Evidence**: Success criteria SC-002 mandates 60 FPS with 50 GameObjects. SC-003 requires property changes within 16ms. Performance goal explicitly set at 60 FPS in Technical Context. Triangle budget and draw call limits align with constitution's 10,000 triangles / 100 draw calls targets.  
**Compliance**: Performance requirements meet constitutional standards.

### Principle IV: Asset Pipeline Integrity ⚠️
**Status**: DEFERRED TO POST-MVP  
**Evidence**: MVP focuses on primitive geometry (cube, sphere, plane) via MeshRenderer. No external asset import in scope. Asset pipeline (model loading, texture management, validation) explicitly excluded from MVP.  
**Justification**: Asset import adds significant complexity. MVP validates core editor mechanics first. Asset pipeline will follow in subsequent iterations once editor foundation is stable.  
**Compliance**: Acceptable deferral - constitution allows incremental implementation.

### Principle V: Serialization & Scene Persistence ✅
**Status**: PASS  
**Evidence**: JSON serialization required (FR-028). Manual save/load buttons (FR-029, FR-030, clarification Q1 answer). Scene state preservation for play mode reversion (FR-026). All GameObjects and components must be serializable.  
**Compliance**: Undo/redo and prefabs deferred to post-MVP, but core persistence requirements met.

### Principle VI: Extensibility Through Scripting ⚠️
**Status**: DEFERRED TO POST-MVP  
**Evidence**: Base Component class designed for extensibility (FR-018). Component lifecycle hooks (initialize, update, render) planned in architecture. Custom scripting system not in MVP scope.  
**Justification**: Scripting requires runtime VM, hot-reload infrastructure, and sandboxing - significant scope addition. MVP establishes component system foundation. Custom scripts added once core editor workflow validated.  
**Compliance**: Acceptable deferral - base architecture supports future scripting.

### Overall Assessment
**GATE STATUS**: ✅ PASS WITH JUSTIFIED DEFERRALS

Two principles (IV: Asset Pipeline, VI: Scripting) deferred to post-MVP with valid justification. Core architectural principles (I, II, III, V) fully satisfied. Performance requirements (III) strictly enforced per NON-NEGOTIABLE status. MVP scope deliberately constrained to validate editor fundamentals before adding complexity.

## Project Structure

### Documentation (this feature)

```text
specs/001-scene-editor-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── scene-api.json   # Internal API contracts for scene management
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/          # React UI components
│   ├── Editor/          # Main editor layout
│   │   ├── EditorLayout.tsx
│   │   ├── Toolbar.tsx
│   │   └── ModeIndicator.tsx
│   ├── Hierarchy/       # GameObject tree panel
│   │   ├── HierarchyPanel.tsx
│   │   └── GameObjectItem.tsx
│   ├── Inspector/       # Property editor panel
│   │   ├── InspectorPanel.tsx
│   │   ├── TransformEditor.tsx
│   │   ├── ComponentEditor.tsx
│   │   └── PropertyInput.tsx
│   ├── Viewport/        # 3D scene view
│   │   ├── SceneViewport.tsx
│   │   └── CameraControls.tsx
│   └── ui/              # shadcn/ui components
│       └── [button, input, dialog, etc.]
├── core/                # Engine core (GameObject, Component system)
│   ├── GameObject.ts
│   ├── Component.ts
│   ├── Transform.ts
│   ├── MeshRenderer.ts
│   └── Scene.ts
├── engine/              # Three.js rendering engine
│   ├── SceneManager.ts
│   ├── RenderLoop.ts
│   └── CameraController.ts
├── state/               # State management (Zustand stores)
│   ├── editorStore.ts   # Editor mode, selection state
│   ├── sceneStore.ts    # Scene hierarchy, GameObjects
│   └── historyStore.ts  # Undo/redo (future)
├── services/            # Business logic services
│   ├── SceneSerializer.ts
│   ├── StorageService.ts
│   └── ValidationService.ts
├── utils/               # Utility functions
│   ├── math.ts
│   └── validation.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Root React component
├── main.tsx             # Vite entry point
└── index.css            # Tailwind base styles

public/
└── [static assets]

tests/
├── unit/                # Vitest unit tests
│   ├── core/
│   ├── services/
│   └── utils/
├── component/           # React component tests
│   ├── Hierarchy.test.tsx
│   ├── Inspector.test.tsx
│   └── Viewport.test.tsx
└── e2e/                 # Playwright E2E tests
    └── editor-workflow.spec.ts

package.json
vite.config.ts
tailwind.config.js
tsconfig.json
```

**Structure Decision**: Web application structure selected based on React + TypeScript + Three.js stack. Single-page app architecture with clear separation between UI components (React), engine core (Three.js), and state management (Zustand). Component-based organization aligns with Principle I (Component-Based Architecture). State management centralized in stores for predictable data flow and future undo/redo support.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. Two principles deferred with rationale in Constitution Check section above.
