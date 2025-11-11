# programing-three Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-11

## Active Technologies

- TypeScript 5.3+ + React 18, Three.js r160+, Tailwind CSS 4.1, shadcn/ui, Vite 5 (001-scene-editor-mvp)
- @dnd-kit/core 6+ for drag-and-drop, Zustand 4 for state management (003-docking-panel-system)

## Project Structure

```text
src/
├── components/
│   ├── Docking/          # Panel docking system (003-docking-panel-system)
│   ├── Editor/           # Main editor layout
│   ├── Hierarchy/        # GameObject tree panel
│   ├── Inspector/        # Property editor panel
│   ├── Viewport/         # 3D scene view
│   ├── Console/          # Console panel
│   └── Assets/           # Assets panel
├── state/
│   ├── layoutStore.ts    # Layout configuration (003-docking-panel-system)
│   ├── editorStore.ts    # Editor state
│   └── sceneStore.ts     # Scene hierarchy
tests/
```

## Commands

npm test; npm run lint; npm run dev

## Code Style

TypeScript 5.3+: Follow standard conventions
React: Use functional components with hooks, React.memo for performance
State: Zustand stores with Immer for immutable updates

## Recent Changes

- 003-docking-panel-system: Phase 2 complete - Foundation ready with types, store, registry, and serializer (2025-11-11)
- 003-docking-panel-system: Added flexible docking panel system with drag-and-drop, tabs, splits, and persistence (2025-11-11)
- 001-scene-editor-mvp: Added TypeScript 5.3+ + React 18, Three.js r160+, Tailwind CSS 4.1, shadcn/ui, Vite 5

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
