# Implementation Plan: Docking Panel System

**Branch**: `003-docking-panel-system` | **Date**: 2025-11-11 | **Spec**: [spec.md](./spec.md)

## Summary

Build a flexible docking panel system that replaces the current fixed editor layout. Users can drag panels (Hierarchy, Scene, Game, Code, Inspector, Console, Assets) to different zones, create tabbed groups by dropping panels on each other, split zones for side-by-side layouts, and have their custom configurations persist across sessions. The system provides a Unity/VS Code-like workspace experience with visual drop zone indicators, smooth animations, and a sensible default layout.

## Technical Context

**Language/Version**: TypeScript 5.3+  
**Primary Dependencies**: React 18, @dnd-kit/core 6+ (drag and drop), Zustand 4 (state), Tailwind CSS 4.1, shadcn/ui  
**Storage**: Browser localStorage (layout configuration), JSON serialization  
**Testing**: Vitest (unit tests for layout logic), React Testing Library (drag interaction tests), Playwright (E2E layout scenarios)  
**Target Platform**: Desktop browsers (Chrome/Edge 90+, Firefox 88+, Safari 15+) with mouse input  
**Performance Goals**: 60 FPS during drag operations, <300ms layout transitions, <100ms drop zone highlighting  
**Constraints**: Minimum panel sizes (200px width, 150px height), at least one panel must be visible  
**Scale/Scope**: 7 panels (Hierarchy, Scene, Game, Code, Inspector, Console, Assets), unlimited zones/tabs, MVP targets 5 user stories

## Constitution Check

*GATE: Must pass before implementation*

### Principle I: Component-Based Architecture ✅
**Status**: PASS  
**Evidence**: Panel system follows component architecture. Each panel (Hierarchy, Scene, etc.) is a self-contained React component. Panel registration via PanelRegistry allows new panels to be added without modifying core docking logic. Zone and Layout entities separate concerns (presentation vs state).  
**Compliance**: Aligns with component-based principles.

### Principle II: Visual-First Development ✅
**Status**: PASS  
**Evidence**: Entire feature is visual-first. Users interact through drag-and-drop (visual), drop zones provide visual feedback (highlighting, indicators), tab switching is visual (clicking tabs). No programmatic APIs required - all operations accessible through UI.  
**Compliance**: 100% visual interaction.

### Principle III: Real-Time Performance (NON-NEGOTIABLE) ✅
**Status**: PASS  
**Evidence**: Performance goals explicitly set at 60 FPS during drag operations (SC-007). Drop zone highlighting within 100ms (SC-003). Layout transitions within 300ms (SC-004). Drag position updates throttled to 16ms (60 FPS). Panel components memoized to prevent unnecessary re-renders.  
**Compliance**: Meets real-time performance requirements.

### Principle IV: Asset Pipeline Integrity ⚠️
**Status**: NOT APPLICABLE  
**Evidence**: This feature doesn't interact with assets. It's a UI/layout system.  
**Justification**: N/A for this feature. Asset pipeline remains unchanged.

### Principle V: Serialization & Scene Persistence ✅
**Status**: PASS  
**Evidence**: Layout configuration serialized to JSON (FR-015). Persisted to localStorage with versioning for migration. Restored on load (FR-016). Similar pattern to scene persistence from MVP.  
**Compliance**: Follows established serialization patterns.

### Principle VI: Extensibility Through Scripting ⚠️
**Status**: NOT APPLICABLE  
**Evidence**: Feature focuses on editor UI, not game scripting. Panel registration system allows adding new panels programmatically, which supports extensibility.  
**Justification**: Scripting not relevant to layout system. Panel extensibility achieved through PanelRegistry.

### Overall Assessment
**GATE STATUS**: ✅ PASS

All applicable principles satisfied. Feature is primarily UI/UX focused, so asset pipeline and scripting principles are not relevant. Performance requirements strictly enforced per NON-NEGOTIABLE status.

## Project Structure

### Documentation (this feature)

```text
specs/003-docking-panel-system/
├── plan.md              # This file
├── spec.md              # User stories and requirements
├── data-model.md        # Panel, Zone, Layout entities
├── quickstart.md        # Testing scenarios
└── tasks.md             # Implementation task list
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Editor/
│   │   ├── EditorLayout.tsx        # MODIFIED: Use DockingLayout instead of fixed layout
│   │   ├── Toolbar.tsx             # EXISTING
│   │   └── ModeIndicator.tsx       # EXISTING
│   ├── Docking/                    # NEW: Panel docking system
│   │   ├── DockingLayout.tsx       # Root layout manager
│   │   ├── Zone.tsx                # Zone component (container for panels/tabs)
│   │   ├── Panel.tsx               # Panel wrapper with drag handle
│   │   ├── PanelHeader.tsx         # Panel header (icon + name + drag handle)
│   │   ├── TabBar.tsx              # Tab bar for multi-panel zones
│   │   ├── Tab.tsx                 # Individual tab component
│   │   ├── DropZone.tsx            # Drop zone indicator overlay
│   │   ├── Splitter.tsx            # Resizable splitter between zones
│   │   └── PanelRegistry.tsx       # Panel type registration
│   ├── Hierarchy/                  # EXISTING PANELS (unchanged content)
│   │   └── HierarchyPanel.tsx
│   ├── Inspector/
│   │   └── InspectorPanel.tsx
│   ├── Viewport/
│   │   └── SceneViewport.tsx
│   ├── Console/
│   │   └── ConsolePanel.tsx
│   └── Assets/
│       └── AssetsPanel.tsx
├── state/
│   ├── layoutStore.ts              # NEW: Zustand store for layout configuration
│   ├── editorStore.ts              # EXISTING
│   └── sceneStore.ts               # EXISTING
├── services/
│   ├── LayoutSerializer.ts         # NEW: Serialize/deserialize layout
│   └── StorageService.ts           # EXISTING: localStorage wrapper
├── types/
│   └── layout.ts                   # NEW: Panel, Zone, Layout types
└── hooks/
    └── useDragAndDrop.ts           # NEW: Custom hook for drag operations

tests/
├── unit/
│   ├── layoutStore.test.ts         # Layout state management
│   └── LayoutSerializer.test.ts    # Serialization logic
├── component/
│   ├── DockingLayout.test.tsx      # Drag and drop interactions
│   ├── Zone.test.tsx               # Zone rendering and tabs
│   └── TabBar.test.tsx             # Tab switching
└── e2e/
    └── docking-workflow.spec.ts    # Complete drag, tab, persist scenarios
```

**Structure Decision**: New `Docking/` component folder for all docking-related UI. Existing panel components (Hierarchy, Scene, etc.) remain unchanged - they're wrapped by the new `Panel` component. `layoutStore` manages layout state separately from scene state for clean separation. `PanelRegistry` allows dynamic panel registration for extensibility.

**Migration Path**: EditorLayout.tsx will be refactored from fixed CSS Grid layout to using the new DockingLayout component. Existing panel components are simply passed as children to DockingLayout with panel type identifiers.

## Complexity Tracking

No constitutional violations. No additional complexity beyond normal feature implementation.

## Technical Approach

### Drag and Drop Library Selection

**Choice**: `@dnd-kit/core` 6+

**Rationale**:
- Modern, performant, React-first library
- Built-in accessibility support
- Supports custom drag overlays for visual feedback
- Collision detection algorithms for drop zones
- No jQuery dependency (unlike React DnD classic)
- Active maintenance and TypeScript support

**Alternative Considered**: HTML5 Drag API (native) - Rejected due to browser inconsistencies, difficult styling of drag ghost, and limited customization of drop zones.

### Layout Representation

**Choice**: Tree structure with nested zones

**Model**:
```typescript
interface Zone {
  id: string;
  type: 'leaf' | 'split';
  
  // For leaf zones (contain panels)
  panels?: string[];        // Panel IDs
  activePanel?: string;     // Active tab (if multiple panels)
  
  // For split zones (contain child zones)
  orientation?: 'horizontal' | 'vertical';
  children?: [Zone, Zone];  // Always exactly 2 children for splits
  sizes?: [number, number]; // Size ratios (0-1, must sum to 1)
}
```

**Rationale**: Tree structure naturally represents nested splits. Leaf nodes hold panels, branch nodes represent split boundaries. Easy to traverse for rendering and updates. Similar to VS Code's grid system.

**Alternative Considered**: CSS Grid with absolute positioning - Rejected because grid doesn't handle arbitrary nesting well, and zone splitting would be more complex to calculate.

### Panel Registration

**Pattern**: Registry pattern with React Context

```typescript
// Panel registry maps panel type to component
const PanelRegistry = {
  hierarchy: HierarchyPanel,
  scene: SceneViewport,
  game: GameViewport,        // NEW: Future panel for play mode
  code: CodeEditor,           // NEW: Future code editor panel
  inspector: InspectorPanel,
  console: ConsolePanel,
  assets: AssetsPanel,
};

// Each panel has metadata
interface PanelMetadata {
  id: string;
  type: keyof typeof PanelRegistry;
  title: string;
  icon: React.ComponentType;
  defaultZone?: string;       // Where it goes in default layout
}
```

**Rationale**: Decouples panel implementation from docking system. New panels can be added by registering them. Context provides panel components to DockingLayout for rendering.

### Default Layout

```text
┌──────────────────────────────────────────────────────┐
│                      Toolbar                         │
├──────────┬───────────────────────┬───────────────────┤
│          │                       │                   │
│ Hierachy │        Scene          │     Inspector     │
│          │                       │                   │
│          │                       │                   │
│          │                       │                   │
├──────────┴───────────────────────┴───────────────────┤
│         Console | Assets (tabs)                      │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Zone Tree**:
```typescript
{
  id: 'root',
  type: 'split',
  orientation: 'vertical',
  sizes: [0.75, 0.25],
  children: [
    {
      id: 'top',
      type: 'split',
      orientation: 'horizontal',
      sizes: [0.2, 0.6, 0.2],
      children: [
        { id: 'left', type: 'leaf', panels: ['hierarchy'] },
        { id: 'center', type: 'leaf', panels: ['scene'] },
        { id: 'right', type: 'leaf', panels: ['inspector'] }
      ]
    },
    {
      id: 'bottom',
      type: 'leaf',
      panels: ['console', 'assets'],
      activePanel: 'console'
    }
  ]
}
```

### Drag Operation Flow

1. **Drag Start**: User clicks and holds panel header
   - `onDragStart`: Capture dragged panel ID, store in `dragState`
   - Show drag overlay (semi-transparent panel representation)
   - Set cursor to `grabbing`

2. **Drag Move**: User moves mouse
   - `onDragMove`: Throttled to 60 FPS (16ms intervals)
   - Calculate drop zones: Iterate all zones, check collision with mouse position
   - Determine drop mode: center = tab, edges = split, full zone = move
   - Highlight active drop zone with overlay

3. **Drag End**: User releases mouse
   - `onDragEnd`: Commit layout change based on drop target
   - **Move**: Remove panel from source zone, add to target zone
   - **Tab**: Add panel to target zone's panel list
   - **Split**: Split target zone, create two child zones
   - Animate layout transition (300ms)
   - Clear `dragState`, remove overlays

4. **Drag Cancel**: User presses Escape or releases outside valid zones
   - Animate panel back to original position
   - Clear `dragState`

### Drop Zone Detection

**Collision Detection**: @dnd-kit's rectangle intersection

**Drop Modes**:
- **Center (Tab)**: Mouse within 60% of zone center → Add as tab
- **Left/Right Edge (Split Horizontal)**: Mouse within 20% of left/right edge → Split horizontally
- **Top/Bottom Edge (Split Vertical)**: Mouse within 20% of top/bottom edge → Split vertically
- **Full Zone (Move)**: If zone is empty or single panel, replace entirely

**Visual Indicators**:
- Tab mode: Center rectangle with blue border + "Add as Tab" text
- Split mode: Line at split boundary showing where divider will appear
- Move mode: Blue border around entire zone

### State Management

**layoutStore** (Zustand):
```typescript
interface LayoutState {
  rootZone: Zone;
  dragState: DragState | null;
  
  // Actions
  setLayout: (zone: Zone) => void;
  movePanel: (panelId: string, targetZoneId: string) => void;
  addTabToZone: (panelId: string, targetZoneId: string) => void;
  splitZone: (zoneId: string, orientation: 'horizontal' | 'vertical', panelId: string) => void;
  updateZoneSizes: (zoneId: string, sizes: [number, number]) => void;
  setActiveTab: (zoneId: string, panelId: string) => void;
  resetLayout: () => void;
  
  // Persistence
  saveLayout: () => void;
  loadLayout: () => void;
}
```

**State Immutability**: Use Immer (built into Zustand) for nested zone tree updates

### Performance Optimizations

1. **Memoization**: 
   - `React.memo` on Panel, Zone, TabBar components
   - Only re-render affected zones during drag
   - Memoize zone tree traversal functions

2. **Drag Throttling**:
   - Throttle mouse move events to 16ms (60 FPS)
   - Use `requestAnimationFrame` for smooth updates

3. **CSS Transforms**:
   - Use `transform: translate()` for drag overlay (GPU accelerated)
   - CSS transitions for panel movement animations

4. **Lazy Tab Content**:
   - Only render active tab content
   - Unmount inactive tabs to save memory
   - Re-mount when tab becomes active (panels handle their own state)

5. **Layout Debouncing**:
   - Debounce localStorage writes (500ms after last change)
   - Batch multiple zone updates in single state update

### Persistence

**Storage Key**: `editor:layout:v1`

**Serialization**:
```typescript
interface SerializedLayout {
  version: string;          // "1.0.0" for migration
  rootZone: Zone;
  timestamp: number;
}
```

**Migration Strategy**:
- Check version on load
- If mismatch, run migration function
- Fall back to default layout if migration fails
- Log warning to console

**Default Fallback**:
- If no saved layout or load fails, use default layout
- User can always reset to default via "Reset Layout" button

### Accessibility

- **Keyboard Navigation**: Not in MVP (future enhancement)
- **Screen Readers**: Panel headers have aria-labels
- **Focus Management**: Active tab receives focus outline
- **Semantic HTML**: Use `<section>` for zones, `<button>` for tabs

### Browser Compatibility

**Tested Browsers**:
- Chrome/Edge 90+ (primary target)
- Firefox 88+ (Flexbox/Grid support)
- Safari 15+ (modern CSS features)

**Not Supported**:
- IE11 (no longer supported by React 18)
- Mobile browsers (touch drag not in MVP scope)

## Implementation Phases

### Phase 1: Foundation (US1)
- Set up docking component structure
- Implement Zone and Panel components
- Create default layout configuration
- Render panels in zones with headers

### Phase 2: Basic Drag (US2)
- Integrate @dnd-kit
- Implement drag start/move/end handlers
- Add drop zone detection and highlighting
- Support moving panels between zones

### Phase 3: Tabs (US3)
- Implement TabBar and Tab components
- Support adding panels as tabs
- Implement tab switching
- Handle dragging tabs out of groups

### Phase 4: Splits (US4)
- Implement zone splitting logic
- Add Splitter component
- Support horizontal/vertical splits
- Implement splitter dragging for resizing

### Phase 5: Persistence (US5)
- Implement layout serialization
- Add localStorage save/load
- Implement "Reset Layout" button
- Add migration system

## Risk Analysis

### High Risk
- **Complex state updates**: Nested zone tree updates could have bugs → Mitigation: Comprehensive unit tests, Immer for immutability
- **Performance during drag**: Many zones could slow down collision detection → Mitigation: Throttle updates, optimize collision algorithm

### Medium Risk
- **Edge cases in splits**: Splitting zones with tabs, dragging during splits → Mitigation: Clear decision tree for edge cases, E2E tests
- **Browser compatibility**: Drag behavior differs across browsers → Mitigation: Test on all target browsers, use @dnd-kit abstractions

### Low Risk
- **localStorage limits**: Complex layouts exceed 10MB → Mitigation: Monitor size, layouts are small (<10KB expected)
- **Animation jank**: Layout transitions could stutter → Mitigation: Use CSS transforms, GPU acceleration

## Success Metrics

- Default layout renders correctly in <100ms
- Drag operations maintain 60 FPS (measured with PerformanceMonitor)
- Drop zone highlighting appears in <100ms
- Layout transitions complete in <300ms
- Custom layouts persist without data loss
- All 7 panels can be arranged in any configuration
- Users can complete drag-drop-tab workflow in <10 seconds
