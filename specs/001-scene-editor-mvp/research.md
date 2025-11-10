# Research: Scene Editor MVP

**Feature**: 001-scene-editor-mvp  
**Date**: 2025-11-10  
**Purpose**: Resolve technical unknowns and establish best practices for React + Three.js game editor

## Research Questions

### 1. React-Three.js Integration Approach

**Decision**: Use React Three Fiber (R3F) with separate React UI layer

**Rationale**:
- **React Three Fiber** provides declarative Three.js integration within React's component model
- Enables React state management to drive scene updates naturally
- Eliminates manual cleanup and lifecycle management (auto-disposes geometries/materials)
- Community-proven approach (used by Google, Codesandbox, Figma)
- Alternative considered: vanilla Three.js with React wrapper, but R3F reduces boilerplate by 60%

**Implementation Pattern**:
```typescript
// Scene managed by R3F, UI layer separate
<EditorLayout>
  <Canvas> {/* R3F canvas */}
    <GameObjectRenderer />
  </Canvas>
  <HierarchyPanel /> {/* Regular React */}
  <InspectorPanel />
</EditorLayout>
```

**Alternatives Considered**:
- **Vanilla Three.js with imperative updates**: More control but loses React benefits, manual memory management
- **@react-three/drei helpers**: Adds R3F utilities (OrbitControls, etc.), recommended for MVP
- **TresJS (Vue)**: Rejected due to constitution specifying React

### 2. State Management Architecture

**Decision**: Zustand with separate stores for editor, scene, and history

**Rationale**:
- **Zustand** is lightweight (1KB), minimal boilerplate compared to Redux
- No Context providers needed - direct store access improves performance
- Immutable updates via Immer integration for complex scene graph modifications
- External store works seamlessly with React Three Fiber
- Battle-tested pattern from @poimandres team (same org as R3F)

**Store Architecture**:
```typescript
// editorStore: UI state (mode, selection, panels)
useEditorStore() → { mode, selectedId, setMode, selectObject }

// sceneStore: GameObject hierarchy and components
useSceneStore() → { gameObjects, addGameObject, updateComponent }

// historyStore: Undo/redo state snapshots (Phase 2)
useHistoryStore() → { past, future, undo, redo }
```

**Alternatives Considered**:
- **Redux Toolkit**: More verbose, overkill for MVP scope
- **Jotai atoms**: Excellent but more granular than needed
- **React Context**: Performance issues with frequent scene updates

### 3. Three.js Scene Synchronization

**Decision**: Unidirectional data flow - Zustand stores as source of truth, React Three Fiber as view layer

**Rationale**:
- Scene state lives in Zustand stores (pure data)
- R3F components read from stores and render Three.js objects
- Prevents drift between React state and Three.js scene graph
- Edit mode vs Play mode handled by toggling update sources

**Data Flow**:
```
User Action → Store Update → R3F Re-render → Three.js Scene Update
Inspector input → updateTransform(id, pos) → <mesh position={pos} />
```

**Alternatives Considered**:
- **Bidirectional sync** (Three.js → React): Causes infinite loops, rejected
- **Ref-based imperative updates**: Loses React benefits, hard to debug

### 4. Component System Design

**Decision**: ECS-lite pattern with TypeScript classes and JSON serialization

**Rationale**:
- Not full ECS (Entity-Component-System) - simpler GameObject-owns-Components model
- Each Component extends base class with `serialize()` / `deserialize()` methods
- Type-safe component properties via TypeScript interfaces
- Update loop iterates GameObjects, calls `component.update(deltaTime)`

**Component Structure**:
```typescript
abstract class Component {
  abstract type: string;
  serialize(): ComponentData;
  deserialize(data: ComponentData): void;
  update?(deltaTime: number): void;
}

class Transform extends Component {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}
```

**Alternatives Considered**:
- **Full ECS with bitECS**: Over-engineered for 50 GameObject MVP
- **Prototype-based components**: Loses TypeScript type safety
- **Functional components (hooks-style)**: Doesn't fit object-oriented GameObject model

### 5. Performance Optimization Strategy

**Decision**: React.memo + shallow equality checks + requestAnimationFrame render loop

**Rationale**:
- **React.memo** on components re-rendering on every frame (Viewport)
- **Shallow comparison** in Zustand selectors prevents unnecessary re-renders
- **RAF loop** outside React for consistent 60 FPS (R3F's `useFrame` hook)
- **Object pooling** deferred to post-MVP (premature optimization)

**Performance Checklist**:
- [ ] Memoize inspector property inputs to prevent re-render on unrelated changes
- [ ] Use `useShallow` from Zustand to prevent object reference changes triggering re-renders
- [ ] Batch scene updates in single frame with `scheduler.schedule()`
- [ ] Profile with React DevTools + Chrome Performance tab

**Alternatives Considered**:
- **Web Workers for scene updates**: Adds complexity, Three.js not thread-safe
- **OffscreenCanvas**: Browser support incomplete, deferred

### 6. Serialization Format

**Decision**: JSON with explicit version field and type discriminators

**Rationale**:
- Human-readable for debugging and version control
- Type discriminators enable polymorphic deserialization (`{ type: 'Transform', ... }`)
- Version field supports future migration logic
- localStorage has 5-10MB limit, JSON compresses well

**Format Example**:
```json
{
  "version": "1.0.0",
  "gameObjects": [
    {
      "id": "uuid-1234",
      "name": "GameObject",
      "components": [
        { "type": "Transform", "position": [0,0,0], "rotation": [0,0,0], "scale": [1,1,1] },
        { "type": "MeshRenderer", "geometry": "cube", "color": "#ff0000" }
      ]
    }
  ]
}
```

**Alternatives Considered**:
- **Binary format (MessagePack)**: Faster but not human-readable, fails constitution's version control requirement
- **IndexedDB instead of localStorage**: More complex API, localStorage sufficient for MVP

### 7. Input Validation Approach

**Decision**: Zod schemas + React Hook Form for inspector inputs

**Rationale**:
- **Zod** provides TypeScript-first schema validation with type inference
- **React Hook Form** handles form state, validation, and error display
- Visual feedback via form errors (red border) per clarification Q5
- Clamping via Zod `.min()` / `.max()` methods

**Validation Example**:
```typescript
const transformSchema = z.object({
  position: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
    z: z.number().finite()
  }),
  scale: z.object({
    x: z.number().positive(), // Clamps negative scale
    y: z.number().positive(),
    z: z.number().positive()
  })
});
```

**Alternatives Considered**:
- **Manual validation**: Error-prone, no type safety
- **Yup schemas**: Similar to Zod but less TypeScript-native

### 8. Testing Strategy

**Decision**: Vitest (unit) + React Testing Library (components) + Playwright (E2E)

**Rationale**:
- **Vitest**: Vite-native, faster than Jest, ESM support out of box
- **React Testing Library**: User-centric testing (query by role/label)
- **Playwright**: Cross-browser E2E, built-in screenshot comparison for visual regression
- Focus on testing user workflows per constitution's "testable and testable" principle

**Test Priorities**:
1. **Unit**: Serialization, validation, math utilities
2. **Component**: Inspector input handling, hierarchy selection
3. **E2E**: Full user stories (create object → add component → play mode)

**Alternatives Considered**:
- **Cypress**: Slower than Playwright, less TypeScript-friendly
- **Storybook for component testing**: Adds dev overhead, deferred

## Best Practices Summary

### React + Three.js
- Use React Three Fiber for declarative scene management
- Keep UI layer (panels) separate from 3D canvas
- Store Three.js objects in refs, not state (except via R3F)

### State Management
- Single source of truth in Zustand stores
- Unidirectional data flow: Store → React → Three.js
- Memoize selectors to prevent re-renders

### Performance
- Target 60 FPS (16ms frame budget)
- Profile early and often with React DevTools
- Use `React.memo` on expensive components
- Batch updates within single frame

### Serialization
- JSON with version field for future migrations
- Type discriminators for polymorphic deserialization
- Human-readable for debugging and version control

### Code Organization
- Separate core (GameObject/Component logic) from UI (React components)
- Services layer for cross-cutting concerns (serialization, storage)
- Keep engine (Three.js) isolated from React components

## Open Questions for Implementation

1. **GameObject naming uniqueness**: Should names be forced unique, or allow duplicates? (Recommendation: Allow duplicates, use IDs internally)
2. **Play mode scene isolation**: Deep clone scene or shallow copy with change tracking? (Recommendation: Deep clone via JSON serialize/deserialize)
3. **Camera controls during play mode**: Locked or user-controllable? (Recommendation: User-controllable for debugging)
4. **Component add UI**: Dropdown, modal, or searchable list? (Recommendation: Dropdown for MVP, searchable later)
5. **Hierarchy drag-and-drop**: MVP or deferred? (Recommendation: Defer - complex interaction, not in user stories)

## Dependencies

### Production
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.93.0",
  "zustand": "^4.4.7",
  "zod": "^3.22.4",
  "react-hook-form": "^7.49.0",
  "@hookform/resolvers": "^3.3.3",
  "uuid": "^9.0.1"
}
```

### Development
```json
{
  "typescript": "^5.3.3",
  "vite": "^5.0.8",
  "tailwindcss": "^4.1.0",
  "@tailwindcss/vite": "^4.1.0",
  "vitest": "^1.1.0",
  "@testing-library/react": "^14.1.2",
  "@playwright/test": "^1.40.1",
  "@types/three": "^0.160.0"
}
```

### shadcn/ui Components Needed
- Button
- Input
- Label
- Select
- Dialog
- Separator
- Collapsible
- Tooltip

## Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Performance degradation with 50 objects | Medium | High | Profile early, optimize render loop, use React.memo |
| localStorage quota exceeded | Low | Medium | Add size monitoring, warn at 80% capacity |
| Three.js/React state drift | Medium | High | Strict unidirectional flow, automated tests |
| Complex component lifecycle bugs | Medium | Medium | Clear lifecycle documentation, unit tests |
| Browser compatibility (WebGL 2.0) | Low | Low | Feature detection + graceful degradation message |

## Next Steps

Phase 1 will generate:
1. **data-model.md**: GameObject, Component, Scene entity schemas
2. **contracts/scene-api.json**: Internal API contracts for scene operations
3. **quickstart.md**: Developer setup and first-run instructions
