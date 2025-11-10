<!--
Sync Impact Report - Constitution v1.0.0
========================================
Version Change: Initial version → 1.0.0
Created: 2025-11-10

Summary:
- New constitution for Three.js Game Editor project
- 6 core principles established
- Technology stack and performance standards defined
- Development workflow and quality gates documented

Templates Status:
✅ plan-template.md - Verified compatible (constitution checks aligned)
✅ spec-template.md - Verified compatible (user stories and requirements aligned)
✅ tasks-template.md - Verified compatible (phase structure and testing approach aligned)
✅ Command files - No agent-specific references found

Follow-up TODOs: None
-->

# Three.js Game Editor Constitution

## Core Principles

### I. Component-Based Architecture
Every feature MUST be built as modular, reusable components following a hierarchical entity-component system similar to Unity's GameObject model. Components MUST be:
- Self-contained with clear interfaces
- Independently testable without requiring a full scene graph
- Composable with other components without tight coupling
- Serializable to JSON for save/load functionality

**Rationale**: Game editors require flexible, non-destructive workflows where designers can add, remove, and modify behaviors without touching code. A component architecture enables rapid prototyping and non-programmer accessibility.

### II. Visual-First Development
Every editor feature MUST provide a visual interface before exposing programmatic APIs. The editor UI MUST enable:
- Drag-and-drop scene composition
- Real-time property manipulation with immediate visual feedback
- WYSIWYG editing without requiring code compilation
- Visual debugging tools (gizmos, bounding boxes, ray visualizations)

**Rationale**: Unity's success stems from empowering designers and artists to build games visually. Code-first approaches create barriers for non-programmers and slow iteration cycles.

### III. Real-Time Performance (NON-NEGOTIABLE)
The editor MUST maintain 60 FPS during editing and runtime preview modes under normal usage conditions. Performance requirements:
- Scene rendering at 60 FPS with up to 10,000 triangles and 50 game objects
- Property updates MUST reflect visually within 16ms
- Asset loading MUST be asynchronous and non-blocking
- Performance profiling tools MUST be integrated into the editor

**Rationale**: Real-time feedback is critical for game development. Laggy editors break creative flow and make iteration painful. This is non-negotiable because poor performance renders the tool unusable.

### IV. Asset Pipeline Integrity
All assets (models, textures, materials, scripts) MUST follow a defined import, validation, and optimization pipeline. Asset handling requires:
- Automatic format validation and conversion
- Dependency tracking (textures → materials → meshes)
- Version control compatibility (text-based formats where possible)
- Hot-reload capability during development

**Rationale**: Asset corruption and broken references are the primary source of frustration in game engines. A robust pipeline prevents these issues and enables collaborative workflows.

### V. Serialization & Scene Persistence
Every game object, component, and scene state MUST be serializable to human-readable JSON format. Serialization requirements:
- Complete scene state can be saved/loaded without data loss
- Prefab system for reusable object templates
- Undo/redo support through state snapshots
- Cross-session persistence (save editor state on close)

**Rationale**: Designers need reliable save/load, undo/redo, and prefab systems. JSON enables version control, human inspection, and compatibility with web technologies.

### VI. Extensibility Through Scripting
The engine MUST support custom game logic through JavaScript/TypeScript scripting with:
- Component lifecycle hooks (init, update, render, destroy)
- Access to scene graph, input, physics, and rendering APIs
- Hot-reloading of scripts without editor restart
- Sandboxed execution to prevent editor crashes

**Rationale**: Pre-built components can't cover every game mechanic. Scripting enables custom behavior while maintaining the visual editing workflow.

## Technology Stack

**Core Technologies** (NON-NEGOTIABLE):
- **Rendering**: Three.js (r160+) for 3D rendering and scene management
- **Language**: TypeScript for type safety and developer experience
- **UI Framework**: React or Vue.js for editor interface (decision required in plan phase)
- **Build System**: Vite for fast development builds and hot module replacement

**Optional/Recommended**:
- Physics: Rapier or Cannon.js for physics simulation
- UI (in-game): HTML/CSS overlay or custom Three.js UI components
- State Management: Zustand or Redux for editor state
- Testing: Vitest for unit tests, Playwright for E2E editor tests

## Performance Standards

**Editor Performance Requirements**:
- Initial load time: <3 seconds for empty scene
- Scene save/load: <1 second for scenes with <100 objects
- Asset import: <5 seconds for typical 3D models (<50MB)
- Memory usage: <500MB for editor baseline, <2GB with large scene

**Runtime Performance Requirements**:
- Target: 60 FPS on mid-range hardware (4-core CPU, integrated GPU)
- Triangle budget: 10,000-50,000 per scene (configurable)
- Draw calls: <100 per frame (use instancing for repeated objects)
- Texture memory: <256MB total

## Development Workflow

**Feature Development Process**:
1. **Specification**: User scenarios with visual mockups (not just text)
2. **Prototyping**: Interactive prototype in editor before full implementation
3. **Implementation**: Component/feature development with visual testing
4. **Integration**: Test in real game scenarios, not just isolated tests
5. **Documentation**: User-facing docs with screenshots/videos, API docs for scripts

**Quality Gates**:
- All editor UI changes MUST include screenshots/videos in pull requests
- Performance regression tests MUST pass (FPS, memory, load times)
- Breaking changes to serialization format MUST include migration tools
- New components MUST include example scenes demonstrating usage

**Testing Strategy**:
- Unit tests for core engine logic (math, serialization, asset loading)
- Integration tests for component interactions
- Visual regression tests for UI changes (screenshot comparison)
- Manual QA for creative workflows (can't automate "ease of use")

## Governance

This constitution supersedes all other practices and standards. All features, code reviews, and design decisions MUST comply with these principles.

**Amendment Process**:
- Amendments require documented rationale and impact analysis
- Breaking changes (especially to serialization format) require migration plan
- Complexity violations MUST be justified with "Complexity Tracking" section

**Compliance Review**:
- Constitution check MUST be performed at spec and plan phases
- Pull requests MUST verify compliance with relevant principles
- Performance standards MUST be validated before merging

**Living Document**:
- Constitution evolves with project needs
- Regular review (quarterly) to assess if principles still serve the vision
- Version history preserved for understanding architectural decisions

**Version**: 1.0.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
