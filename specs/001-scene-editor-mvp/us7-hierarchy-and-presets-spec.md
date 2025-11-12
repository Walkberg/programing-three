# User Story 7: GameObject Hierarchy & Presets

**Feature**: Scene Editor MVP  
**Priority**: P4 (Post-MVP Enhancement)  
**Created**: 2025-11-11  
**Status**: Planning

## User Story

**As a** game developer using the editor,  
**I want to** organize GameObjects in parent-child hierarchies via drag-and-drop and quickly create common GameObject types from presets,  
**So that** I can structure complex scenes efficiently and accelerate my workflow with pre-configured objects.

## Description

This user story adds two complementary features to the Scene Editor:

1. **Hierarchical Scene Organization**: Enable drag-and-drop GameObject parenting in the Hierarchy panel, allowing users to create parent-child relationships. Child GameObjects inherit their parent's transform (position, rotation, scale) and move/rotate/scale with the parent.

2. **GameObject Presets**: Provide quick-creation menus with pre-configured GameObject templates (Empty, Cube, Sphere, Plane, Camera, Light) accessible from the Toolbar and Hierarchy panel context menu. Each preset includes appropriate components and default values.

## Functional Requirements

### Hierarchy & Parenting

- **FR-H001**: Users MUST be able to drag a GameObject from the Hierarchy panel and drop it onto another GameObject to make it a child
- **FR-H002**: When a GameObject becomes a child, it MUST visually indent under its parent in the Hierarchy panel
- **FR-H003**: Parent GameObjects MUST show a collapse/expand chevron icon when they have children
- **FR-H004**: Clicking the chevron MUST toggle visibility of child GameObjects in the Hierarchy panel (collapsed/expanded state)
- **FR-H005**: Child GameObjects MUST inherit their parent's transform (world space position = parent world pos + local offset)
- **FR-H006**: Moving/rotating/scaling a parent MUST automatically transform all its children
- **FR-H007**: Deleting a parent GameObject MUST show a confirmation dialog asking whether to delete children or promote them to root level
- **FR-H008**: Users MUST be able to drag a child GameObject to the root level (un-parent) by dropping it outside any GameObject
- **FR-H009**: Drag preview MUST show a visual indicator of where the GameObject will be dropped (above/below/as-child)
- **FR-H010**: System MUST prevent circular parenting (cannot make a GameObject a child of its own descendant)

### GameObject Presets

- **FR-P001**: Toolbar "Add GameObject" button MUST be replaced with a dropdown menu or context menu
- **FR-P002**: The GameObject menu MUST display these preset options:
  - Empty (GameObject with only Transform)
  - Cube (GameObject with Transform + MeshRenderer set to cube geometry)
  - Sphere (GameObject with Transform + MeshRenderer set to sphere geometry)
  - Plane (GameObject with Transform + MeshRenderer set to plane geometry)
  - Camera (future: GameObject with Transform + Camera component)
  - Light (future: GameObject with Transform + Light component)
- **FR-P003**: Right-clicking in the Hierarchy panel MUST open a context menu with the same preset options
- **FR-P004**: Right-clicking on an existing GameObject MUST open a context menu with options:
  - Add Child > [all preset options] (creates child under selected GameObject)
  - Add Component > [component types]
  - Duplicate (future)
  - Delete
- **FR-P005**: Each preset MUST create a GameObject with appropriate default components and sensible default values
- **FR-P006**: Cube/Sphere/Plane presets MUST auto-name as "Cube", "Sphere", "Plane" (with auto-increment if duplicates exist)
- **FR-P007**: Camera and Light presets MUST show a "Coming Soon" toast notification in MVP (components not yet implemented)

## Acceptance Criteria

### Hierarchy & Parenting Scenarios

1. **Given** two GameObjects exist in the Hierarchy, **When** user drags GameObject A onto GameObject B, **Then** A becomes a child of B, indents visually under B, and B shows a chevron icon
2. **Given** a GameObject has children, **When** user clicks the chevron icon, **Then** child GameObjects toggle between visible and hidden in the Hierarchy panel
3. **Given** a child GameObject exists, **When** user changes its parent's position, **Then** the child moves in world space to maintain its relative position to the parent
4. **Given** a child GameObject exists, **When** user drags it to the root level (outside any GameObject), **Then** it becomes a root-level GameObject with no parent
5. **Given** a parent GameObject has children, **When** user attempts to delete the parent, **Then** a confirmation dialog asks whether to delete children or promote them to root
6. **Given** GameObject A has child B, and B has child C, **When** user attempts to make A a child of C, **Then** system prevents the action with an error toast ("Cannot create circular parent-child relationship")

### GameObject Presets Scenarios

1. **Given** the Toolbar "Add GameObject" button exists, **When** user clicks it, **Then** a dropdown/context menu appears with preset options (Empty, Cube, Sphere, Plane, Camera, Light)
2. **Given** the preset menu is open, **When** user clicks "Cube", **Then** a new GameObject named "Cube" is created with MeshRenderer component set to cube geometry
3. **Given** user right-clicks in empty space of Hierarchy panel, **When** context menu appears, **Then** it shows the same preset options as the Toolbar menu
4. **Given** user right-clicks on an existing GameObject, **When** context menu appears, **Then** it shows "Add Child >" submenu with all preset options, plus "Add Component >", "Delete"
5. **Given** user clicks "Add Child > Sphere" on a GameObject, **When** the child is created, **Then** it appears indented under the selected GameObject as a child
6. **Given** user clicks "Add Component >" on a GameObject, **When** submenu appears, **Then** it shows all available component types from ComponentRegistry

## Technical Design

### Data Model Changes

```typescript
// src/types/index.ts - Extend GameObject interface
interface GameObjectData {
  id: string;
  name: string;
  parentId: string | null; // NEW: Reference to parent GameObject
  components: ComponentData[];
  children?: string[]; // NEW: Optional array of child IDs for quick lookup
  isExpanded?: boolean; // NEW: Hierarchy panel expand/collapse state
}
```

### Store Changes

```typescript
// src/state/sceneStore.ts - New actions
interface SceneStore {
  // Existing actions...
  
  // NEW: Hierarchy actions
  setParent: (childId: string, parentId: string | null) => void;
  toggleExpanded: (gameObjectId: string) => void;
  canSetParent: (childId: string, parentId: string) => boolean; // Circular check
  
  // NEW: Preset actions
  createGameObjectFromPreset: (preset: GameObjectPreset, parentId?: string) => string;
}

// NEW: Preset definitions
type GameObjectPreset = 'empty' | 'cube' | 'sphere' | 'plane' | 'camera' | 'light';

const PRESET_CONFIGS: Record<GameObjectPreset, {
  name: string;
  components: ComponentData[];
}> = {
  empty: {
    name: 'GameObject',
    components: [/* only Transform */]
  },
  cube: {
    name: 'Cube',
    components: [/* Transform + MeshRenderer(cube) */]
  },
  // ... etc
};
```

### Component Changes

#### HierarchyPanel Component
- Add drag-and-drop zones using `@dnd-kit/core` (already in dependencies)
- Implement drop handlers for parenting logic
- Add chevron icon for expand/collapse
- Show indentation based on hierarchy depth
- Add context menu on right-click

#### Toolbar Component
- Replace "Add GameObject" button with Popover/DropdownMenu
- Render preset options with icons
- Wire to `createGameObjectFromPreset` action

#### Context Menus
- Create `GameObjectContextMenu.tsx` component
- Use shadcn/ui ContextMenu primitive
- Show "Add Child >", "Add Component >", "Delete" options
- Submenu for preset options

### Transform System Changes

```typescript
// src/core/Transform.ts - Add world space calculations
class Transform extends Component {
  // Existing: local position, rotation, scale
  
  // NEW: World space getters (calculated)
  get worldPosition(): Vector3 {
    if (!this.gameObject.parentId) return this.position;
    const parent = getParentTransform(this.gameObject.parentId);
    return parent.worldPosition.add(this.position); // Simplified
  }
  
  get worldRotation(): Vector3 { /* ... */ }
  get worldScale(): Vector3 { /* ... */ }
}
```

### Three.js Scene Graph Sync

```typescript
// src/components/Viewport/SceneViewport.tsx
// Update GameObjectRenderer to respect hierarchy
function GameObjectRenderer({ gameObject, allGameObjects }) {
  const parent = allGameObjects.find(go => go.id === gameObject.parentId);
  
  return (
    <group>
      {/* Apply parent transform first if exists */}
      {parent && <primitive object={getParentGroup(parent)} />}
      
      {/* Then apply local transform */}
      <mesh position={transform.position} rotation={transform.rotation} scale={transform.scale}>
        {/* ... */}
      </mesh>
      
      {/* Render children recursively */}
      {gameObject.children?.map(childId => (
        <GameObjectRenderer key={childId} gameObjectId={childId} />
      ))}
    </group>
  );
}
```

## Implementation Phases

### Phase 1: Data Model & Store Foundation (T103-T108)
- Extend GameObject interface with parentId, children, isExpanded
- Implement setParent, toggleExpanded, canSetParent in sceneStore
- Add circular dependency check logic
- Update SceneSerializer to handle hierarchy

### Phase 2: Hierarchy UI (T109-T115)
- Add drag-and-drop to HierarchyPanel with @dnd-kit
- Implement visual indentation based on depth
- Add chevron icons for expand/collapse
- Implement drop zones (above, below, as-child)
- Add drag preview indicator

### Phase 3: Transform Hierarchy (T116-T120)
- Implement world space transform calculations
- Update Three.js scene graph to respect hierarchy
- Ensure child transforms update when parent moves
- Test with nested hierarchies (parent > child > grandchild)

### Phase 4: GameObject Presets (T121-T128)
- Replace Toolbar "Add GameObject" with dropdown/popover
- Define preset configurations (Empty, Cube, Sphere, Plane)
- Implement createGameObjectFromPreset action
- Add Hierarchy panel context menu (right-click)
- Add GameObject context menu (right-click on item)
- Add "Add Child >" submenu with presets
- Add "Add Component >" submenu

### Phase 5: Polish & Validation (T129-T132)
- Add parent deletion confirmation dialog
- Prevent circular parenting with error toast
- Add "Coming Soon" toasts for Camera/Light presets
- Test all scenarios from Acceptance Criteria

## Dependencies

- **Requires**: User Stories 1, 2, 3 complete (GameObject creation, component system, Inspector)
- **Requires**: Docking panel system (003-docking-panel-system) complete (context menus)
- **Blocks**: Nothing (this is an enhancement feature)

## Testing Strategy

### Manual Testing Scenarios

1. **Hierarchy Creation**: Drag GameObject A onto B, verify A becomes child, indents visually
2. **Expand/Collapse**: Click chevron, verify children hide/show
3. **Transform Inheritance**: Move parent, verify child moves in world space
4. **Un-parenting**: Drag child to root, verify it becomes top-level
5. **Circular Prevention**: Try to make parent a child of its own descendant, verify error
6. **Parent Deletion**: Delete parent with children, verify confirmation dialog
7. **Presets from Toolbar**: Click "Add GameObject" dropdown, select "Cube", verify GameObject with MeshRenderer(cube) created
8. **Presets from Context Menu**: Right-click in Hierarchy, select "Sphere", verify creation
9. **Add Child Preset**: Right-click GameObject, select "Add Child > Plane", verify child created
10. **Add Component from Context**: Right-click GameObject, select "Add Component > MeshRenderer", verify component added

## Success Criteria

- **SC-H001**: Users can create 3-level nested hierarchies (parent > child > grandchild) with correct visual indentation
- **SC-H002**: Child transforms update in real-time when parent is moved/rotated/scaled (<16ms)
- **SC-H003**: Expand/collapse state persists when scene is saved and reloaded
- **SC-H004**: Circular parenting attempts are prevented with clear error message
- **SC-P001**: Users can create a Cube GameObject from preset in <5 seconds (click → select → object appears)
- **SC-P002**: Context menu appears within 200ms of right-click
- **SC-P003**: All preset GameObjects are created with correct components and default values

## Future Enhancements (Post-US7)

- Multi-select drag (move multiple GameObjects to new parent at once)
- Drag to reorder siblings (change order within same parent)
- Prefabs (save GameObject hierarchy as reusable template)
- Keyboard shortcuts (Ctrl+D to duplicate, Alt+P to parent to selected)
- Hierarchy search/filter
- Show/hide GameObject in viewport (eye icon)
- Lock GameObject from selection (lock icon)
**Important:** Code in the `src/core/` directory must remain pure and independent. It must never call the store, React hooks, or any part of the application outside the core itself. Any dependency on state or hierarchy must be injected or handled at the application/service layer.
