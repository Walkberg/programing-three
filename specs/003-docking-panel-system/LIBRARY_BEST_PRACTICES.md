# Library Best Practices: @dnd-kit & Zustand

**Feature**: 003-docking-panel-system  
**Date**: 2025-11-11  
**Purpose**: Document current best practices and API usage for dnd-kit and Zustand based on latest documentation

## @dnd-kit/core

### Version Information
- **Library ID**: `/clauderic/dnd-kit`
- **Trust Score**: 9.3
- **Code Snippets Available**: 109+
- **Latest Stable**: @dnd-kit/core@6.x (as specified in plan.md)

### Core Concepts

#### 1. DndContext Setup
The root component that enables drag-and-drop functionality.

```typescript
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

function App() {
  return (
    <DndContext 
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {/* Droppable and Draggable components */}
      
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {/* Drag preview component */}
      </DragOverlay>
    </DndContext>
  );
}
```

**Best Practices**:
- Use `DragOverlay` for custom drag previews (better performance than native browser drag image)
- Apply modifiers to `DndContext` for global constraints, to `DragOverlay` for preview-specific constraints
- Modifiers are passed as an array to allow composition

#### 2. Making Elements Draggable
Use the `useDraggable` hook to make components draggable.

```typescript
import { useDraggable } from '@dnd-kit/core';

function DraggableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
```

**Best Practices**:
- Spread `{...listeners}` and `{...attributes}` on the element that should initiate dragging
- Use `transform3d` instead of `translate` for GPU acceleration
- Set `ref={setNodeRef}` on the root draggable element
- Keep drag handles small for better UX (e.g., header bars, icons)

#### 3. Making Elements Droppable
Use the `useDroppable` hook to define drop zones.

```typescript
import { useDroppable } from '@dnd-kit/core';

function DroppableZone({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? '#e0f7fa' : undefined,
    border: isOver ? '2px solid #00bcd4' : '1px solid #ccc',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
```

**Best Practices**:
- Use `isOver` for visual feedback when dragging over a drop zone
- Apply visual changes via CSS for better performance (avoid heavy re-renders)
- Keep drop zone IDs unique and descriptive

#### 4. Custom Modifiers
Create custom modifiers to control drag behavior.

```typescript
import { createSnapModifier } from '@dnd-kit/modifiers';

// Built-in snap-to-grid
const gridSize = 20;
const snapToGridModifier = createSnapModifier(gridSize);

// Custom modifier
function customSnapToGrid(args) {
  const { transform } = args;
  const gridSize = 20;

  return {
    ...transform,
    x: Math.ceil(transform.x / gridSize) * gridSize,
    y: Math.ceil(transform.y / gridSize) * gridSize,
  };
}

<DndContext modifiers={[customSnapToGrid]}>
  {/* ... */}
</DndContext>
```

**Best Practices**:
- Use built-in modifiers when possible (`restrictToVerticalAxis`, `restrictToWindowEdges`, etc.)
- Custom modifiers receive `{ transform, ...other }` and must return a new transform
- Modifiers run on every drag move event, so keep them performant
- Combine modifiers by passing array: `[modifier1, modifier2]`

#### 5. Collision Detection
Control how drop zones are detected during dragging.

```typescript
import { 
  DndContext, 
  rectIntersection,
  closestCenter,
  pointerWithin 
} from '@dnd-kit/core';

<DndContext collisionDetection={rectIntersection}>
  {/* Rectangle intersection (default) */}
</DndContext>

<DndContext collisionDetection={closestCenter}>
  {/* Closest to center */}
</DndContext>

<DndContext collisionDetection={pointerWithin}>
  {/* Pointer must be inside drop zone */}
</DndContext>
```

**Best Practices**:
- `rectIntersection`: Good for overlapping zones, detects any overlap
- `closestCenter`: Best for sortable lists, finds nearest zone center
- `pointerWithin`: Most precise, requires pointer inside zone boundaries
- Choose based on UX needs (our docking system will likely use `pointerWithin` for precise zone targeting)

### TypeScript Best Practices

```typescript
import { DndContext, DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';

// Type drag events properly
const handleDragStart = (event: DragStartEvent) => {
  const { active } = event;
  console.log('Dragging:', active.id);
};

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (over) {
    // Type-safe access to IDs
    const draggedId: string = active.id.toString();
    const dropTargetId: string = over.id.toString();
  }
};

// Use proper types for modifiers
import { Modifier } from '@dnd-kit/core';

const customModifier: Modifier = ({ transform }) => {
  return {
    x: Math.round(transform.x),
    y: Math.round(transform.y),
    scaleX: 1,
    scaleY: 1,
  };
};
```

### Performance Optimization

```typescript
// ✅ Good: Memoize drag handlers
const handleDragEnd = useCallback((event: DragEndEvent) => {
  // Handle drag end
}, [dependencies]);

// ✅ Good: Throttle drag move updates
const handleDragMove = useMemo(() => 
  throttle((event: DragMoveEvent) => {
    // Update drop zones
  }, 16), // 60 FPS
[]);

// ✅ Good: Use CSS transforms for drag feedback
const style = transform ? {
  transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  opacity: 0.5, // Visual feedback
} : undefined;

// ❌ Bad: Heavy computation in drag handlers
const handleDragMove = (event) => {
  // Don't do expensive calculations here
  const result = expensiveCalculation(); // ❌
};
```

---

## Zustand

### Version Information
- **Library ID**: `/pmndrs/zustand`
- **Trust Score**: 9.6
- **Code Snippets Available**: 462+
- **Current Version**: 4.x (as specified in plan.md)

### Core Concepts

#### 1. Basic Store Creation with TypeScript

```typescript
import { create } from 'zustand';

interface BearState {
  bears: number;
  increase: (by: number) => void;
  decrease: (by: number) => void;
}

// ✅ Recommended: Use curried create for TypeScript
const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  decrease: (by) => set((state) => ({ bears: state.bears - by })),
}));

// Usage in components
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);
  
  return <button onClick={() => increase(1)}>{bears}</button>;
}
```

**Best Practices**:
- Use curried syntax `create<Type>()((set) => ...)` for proper TypeScript inference
- Define separate interfaces for state and actions for clarity
- Keep stores focused on a single domain
- Use selector functions to prevent unnecessary re-renders

#### 2. Combining Middleware (Recommended Pattern)

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {} from '@redux-devtools/extension'; // For devtools typing

interface LayoutState {
  rootZone: Zone;
  dragState: DragState | null;
  updateZone: (zoneId: string, updates: Partial<Zone>) => void;
}

// ✅ Best Practice: Chain middleware in this order
const useLayoutStore = create<LayoutState>()(
  devtools(
    persist(
      immer((set) => ({
        rootZone: getDefaultLayout(),
        dragState: null,
        
        updateZone: (zoneId, updates) => set((state) => {
          // Immer allows direct "mutation"
          const zone = findZone(state.rootZone, zoneId);
          if (zone) {
            Object.assign(zone, updates);
          }
        }),
      })),
      {
        name: 'layout-storage',
        version: 1,
      }
    ),
    { name: 'LayoutStore' } // For Redux DevTools
  )
);
```

**Middleware Order**:
1. **Outermost**: `devtools` (for debugging)
2. **Middle**: `persist` (for storage)
3. **Inner**: `immer` (for mutations)
4. **Innermost**: Store creator function

#### 3. Persist Middleware with Best Practices

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PositionStore {
  position: { x: number; y: number };
  setPosition: (pos: { x: number; y: number }) => void;
}

const usePositionStore = create<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage', // localStorage key (required)
      version: 1, // For migrations
      
      // ✅ Partialize: Only persist specific fields
      partialize: (state) => ({
        position: state.position,
        // Exclude setPosition function from storage
      }),
      
      // ✅ Custom storage (default is localStorage)
      storage: createJSONStorage(() => sessionStorage),
      
      // ✅ Migration strategy for version changes
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Transform old state to new format
          return {
            position: {
              x: persistedState.x,
              y: persistedState.y,
            },
          };
        }
        return persistedState;
      },
      
      // ✅ Hydration callbacks
      onRehydrateStorage: (state) => {
        console.log('Hydration starts');
        return (state, error) => {
          if (error) console.error('Hydration failed:', error);
          else console.log('Hydration complete');
        };
      },
    }
  )
);

// Access persist API
usePositionStore.persist.clearStorage(); // Clear persisted data
usePositionStore.persist.rehydrate(); // Manually rehydrate
const hasHydrated = usePositionStore.persist.hasHydrated(); // Check status
```

**Best Practices**:
- Always set `name` (required for localStorage key)
- Use `partialize` to exclude functions and transient state
- Implement `migrate` for backward compatibility when schema changes
- Set `version` and increment when making breaking changes
- Use `skipHydration: true` if you need manual control over rehydration

#### 4. Immer Middleware for Complex State

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface NestedState {
  nested: {
    deep: {
      value: number;
    };
  };
  increment: () => void;
}

// ✅ Immer allows direct "mutation" syntax
const useStore = create<NestedState>()(
  immer((set) => ({
    nested: {
      deep: {
        value: 0,
      },
    },
    
    increment: () => set((state) => {
      // Direct mutation (Immer handles immutability)
      state.nested.deep.value += 1;
    }),
  }))
);

// ❌ Without Immer, you'd need:
const incrementWithoutImmer = () => set((state) => ({
  nested: {
    ...state.nested,
    deep: {
      ...state.nested.deep,
      value: state.nested.deep.value + 1,
    },
  },
}));
```

**Best Practices**:
- Use Immer for deeply nested state structures
- Immer adds minimal overhead and greatly improves readability
- Compatible with other middleware (apply Immer innermost)
- Don't mix mutation and return syntax within same action

#### 5. Combine Middleware for Separation of Concerns

```typescript
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

// ✅ Separate initial state from actions
const useStore = create(
  combine(
    // Initial state
    { count: 0, text: 'hello' },
    
    // Action creators
    (set) => ({
      inc: () => set((state) => ({ count: state.count + 1 })),
      dec: () => set((state) => ({ count: state.count - 1 })),
      setText: (text: string) => set({ text }),
    })
  )
);

// Full TypeScript inference for both state and actions
function Counter() {
  const count = useStore((state) => state.count);
  const inc = useStore((state) => state.inc);
  
  return <button onClick={inc}>{count}</button>;
}
```

**Best Practices**:
- Use `combine` for better code organization
- TypeScript inference works automatically
- Separates data from behavior clearly
- Easier to test and maintain

### Advanced Patterns

#### 1. Vanilla Stores with React Context

```typescript
import { createStore, useStore } from 'zustand';
import { createContext, useContext } from 'react';

// Create vanilla store factory
const createLayoutStore = (initialLayout: Layout) =>
  createStore<LayoutStore>()((set) => ({
    layout: initialLayout,
    updateLayout: (updates) => set((state) => ({
      layout: { ...state.layout, ...updates },
    })),
  }));

// Context for dependency injection
const LayoutStoreContext = createContext<ReturnType<typeof createLayoutStore> | null>(null);

function App() {
  const store = createLayoutStore(getDefaultLayout());
  
  return (
    <LayoutStoreContext.Provider value={store}>
      <Editor />
    </LayoutStoreContext.Provider>
  );
}

function Editor() {
  const store = useContext(LayoutStoreContext);
  const layout = useStore(store!, (state) => state.layout);
  
  return <div>{/* Use layout */}</div>;
}
```

**Use Cases**:
- Props-based initialization
- Multiple independent store instances
- Testing with different initial states
- Server-side rendering with dynamic data

#### 2. Subscribe to Specific State Changes

```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const useStore = create<State>()(
  subscribeWithSelector((set) => ({
    count: 0,
    text: 'hello',
    increment: () => set((state) => ({ count: state.count + 1 })),
  }))
);

// Subscribe to specific field changes
const unsub = useStore.subscribe(
  (state) => state.count, // Selector
  (count) => {
    console.log('Count changed to:', count);
  }
);

// Cleanup
unsub();
```

**Best Practices**:
- Use for side effects (logging, analytics, external syncing)
- Requires `subscribeWithSelector` middleware
- Remember to unsubscribe to avoid memory leaks

### Performance Optimization

```typescript
// ✅ Good: Use shallow equality for primitive selectors
const bears = useBearStore((state) => state.bears);

// ✅ Good: Memoize object/array selectors
const position = useBearStore(
  useCallback((state) => state.position, [])
);

// ✅ Good: Split selectors for better re-render control
const x = usePositionStore((state) => state.position.x);
const y = usePositionStore((state) => state.position.y);
// Only re-renders when x changes

// ❌ Bad: Selecting entire state
const state = useBearStore((state) => state);
// Re-renders on ANY state change

// ✅ Good: Batch updates
set((state) => ({
  position: newPosition,
  velocity: newVelocity,
  // Both updated in single render
}));

// ❌ Bad: Multiple set calls
set({ position: newPosition });
set({ velocity: newVelocity });
// Triggers two re-renders
```

### Testing Patterns

```typescript
import { act, renderHook } from '@testing-library/react';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounterStore());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment(1);
  });
  
  expect(result.current.count).toBe(1);
});

// Reset store between tests
afterEach(() => {
  useCounterStore.setState({ count: 0 });
});
```

---

## Integration Best Practices: @dnd-kit + Zustand

### Recommended Architecture

```typescript
// 1. Define types
interface DragState {
  draggedPanelId: string | null;
  sourceZoneId: string | null;
  dropTargetZoneId: string | null;
  dropMode: 'move' | 'tab' | 'split-h' | 'split-v' | null;
}

// 2. Create Zustand store with drag state
const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      immer((set) => ({
        rootZone: getDefaultLayout(),
        dragState: null,
        
        startDrag: (panelId, zoneId) => set((state) => {
          state.dragState = {
            draggedPanelId: panelId,
            sourceZoneId: zoneId,
            dropTargetZoneId: null,
            dropMode: null,
          };
        }),
        
        updateDragTarget: (targetZoneId, dropMode) => set((state) => {
          if (state.dragState) {
            state.dragState.dropTargetZoneId = targetZoneId;
            state.dragState.dropMode = dropMode;
          }
        }),
        
        endDrag: () => set((state) => {
          // Commit layout change based on dragState
          const { dragState } = state;
          if (dragState?.dropTargetZoneId) {
            // Apply layout transformation
          }
          state.dragState = null;
        }),
      })),
      {
        name: 'layout-storage',
        partialize: (state) => ({
          rootZone: state.rootZone,
          // Exclude dragState from persistence
        }),
      }
    )
  )
);

// 3. Use in DndContext
function DockingLayout() {
  const startDrag = useLayoutStore((state) => state.startDrag);
  const updateDragTarget = useLayoutStore((state) => state.updateDragTarget);
  const endDrag = useLayoutStore((state) => state.endDrag);
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    startDrag(event.active.id, event.active.data.current?.zoneId);
  }, [startDrag]);
  
  const handleDragMove = useMemo(() =>
    throttle((event: DragMoveEvent) => {
      // Detect drop target and mode
      const { targetZoneId, dropMode } = detectDropTarget(event);
      updateDragTarget(targetZoneId, dropMode);
    }, 16),
  [updateDragTarget]);
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    endDrag();
  }, [endDrag]);
  
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      {/* Render zones and panels */}
    </DndContext>
  );
}
```

### Key Principles

1. **State in Zustand**: All layout state lives in Zustand store
2. **Events in @dnd-kit**: Drag events handled by DndContext callbacks
3. **Memoization**: Use `useCallback` and `useMemo` for drag handlers
4. **Throttling**: Throttle drag move updates to 60 FPS
5. **Immer for Updates**: Use Immer middleware for complex state updates
6. **Persistence**: Use persist middleware but exclude transient drag state
7. **Performance**: Selector-based subscriptions prevent unnecessary re-renders

---

## Summary

### @dnd-kit/core
- Modern, performant drag-and-drop for React
- Use `DragOverlay` for custom drag previews
- Apply modifiers for behavior constraints
- Choose collision detection based on UX needs
- Throttle drag events to maintain 60 FPS

### Zustand
- Lightweight, unopinionated state management
- Curried syntax for TypeScript: `create<Type>()((set) => ...)`
- Combine middleware: devtools → persist → immer
- Use `partialize` to control what gets persisted
- Implement `migrate` for schema versioning
- Immer for complex nested state updates

### Integration
- Zustand manages application state (zones, panels, layout)
- @dnd-kit handles drag-and-drop interactions
- Store drag events in Zustand temporarily (don't persist)
- Memoize and throttle for 60 FPS performance
- Use Immer for clean layout tree modifications

---

## References

- @dnd-kit Documentation: https://docs.dndkit.com/
- Zustand Documentation: https://docs.pmnd.rs/zustand/
- Context7 Library IDs:
  - `/clauderic/dnd-kit` (Trust Score: 9.3)
  - `/pmndrs/zustand` (Trust Score: 9.6)
