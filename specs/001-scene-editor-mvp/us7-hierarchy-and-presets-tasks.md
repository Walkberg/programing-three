# Tasks: User Story 7 - GameObject Hierarchy & Presets

**Feature**: Scene Editor MVP - Hierarchy & Presets Enhancement  
**Input**: us7-hierarchy-and-presets-spec.md  
**Created**: 2025-11-11

## Format: `- [ ] [ID] [P?] [US7] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US7]**: All tasks belong to User Story 7

---

## Phase 1: Data Model & Store Foundation

**Purpose**: Extend GameObject data model and store to support hierarchy

 - [x] T103 [P] [US7] Extend GameObject interface in src/types/index.ts with parentId (string | null), children (string[]), isExpanded (boolean) fields
 - [x] T104 [P] [US7] Create GameObjectPreset type in src/types/index.ts ('empty' | 'cube' | 'sphere' | 'plane' | 'camera' | 'light')
 - [x] T105 [US7] Implement setParent action in src/state/sceneStore.ts to update parentId and children arrays with validation
 - [x] T106 [US7] Implement canSetParent helper in src/state/sceneStore.ts with circular dependency detection (traverse parent chain)
 - [x] T107 [P] [US7] Implement toggleExpanded action in src/state/sceneStore.ts to toggle isExpanded field
 - [x] T108 [US7] Update SceneSerializer in src/services/SceneSerializer.ts to serialize/deserialize parentId, children, isExpanded fields

**Checkpoint**: Data model ready, hierarchy relationships can be stored

---

## Phase 2: GameObject Presets System

**Purpose**: Define preset configurations and creation logic

- [x] T109 [P] [US7] Create PRESET_CONFIGS constant in src/state/sceneStore.ts mapping preset types to component configurations
- [x] T110 [US7] Implement createGameObjectFromPreset action in src/state/sceneStore.ts accepting preset type and optional parentId
- [x] T111 [US7] Add Empty preset config (only Transform component) with auto-increment naming
- [x] T112 [P] [US7] Add Cube preset config (Transform + MeshRenderer with cube geometry, default color)
- [x] T113 [P] [US7] Add Sphere preset config (Transform + MeshRenderer with sphere geometry, default color)
- [x] T114 [P] [US7] Add Plane preset config (Transform + MeshRenderer with plane geometry, default color)
- [x] T115 [P] [US7] Add Camera and Light preset configs (placeholder - show toast "Coming Soon" when selected)

**Checkpoint**: Preset system ready, can create GameObjects from templates

---

## Phase 3: Toolbar Preset Menu

**Purpose**: Replace "Add GameObject" button with dropdown menu

- [x] T116 [US7] Replace "Add GameObject" button in src/components/Editor/Toolbar.tsx with Popover or DropdownMenu component
- [x] T117 [P] [US7] Add preset menu items (Empty, Cube, Sphere, Plane, Camera, Light) with appropriate icons (Box, Circle, Grid3x3, etc.)
- [x] T118 [US7] Wire preset menu items to sceneStore.createGameObjectFromPreset() action
- [x] T119 [US7] Add toast notification for Camera and Light presets ("Camera/Light components coming soon")

**Checkpoint**: Toolbar preset menu functional, can create GameObjects from menu

---

## Phase 4: Hierarchy Visual Structure

**Purpose**: Update HierarchyPanel to show parent-child relationships

- [ ] T120 [US7] Update GameObjectItem in src/components/Hierarchy/GameObjectItem.tsx to accept depth prop and apply indentation (paddingLeft: depth * 16px)
- [ ] T121 [US7] Add chevron icon (ChevronRight/ChevronDown from lucide-react) before GameObject name, visible only if children exist
- [ ] T122 [US7] Implement chevron click handler to call sceneStore.toggleExpanded()
- [ ] T123 [US7] Update HierarchyPanel in src/components/Hierarchy/HierarchyPanel.tsx to recursively render child GameObjects when parent is expanded
- [ ] T124 [US7] Add getGameObjectHierarchy helper to filter top-level GameObjects (parentId === null) and recursively build tree structure
- [ ] T125 [US7] Update HierarchyPanel to hide children when parent isExpanded === false

**Checkpoint**: Hierarchy visually displays parent-child relationships with expand/collapse

---

## Phase 5: Drag-and-Drop Parenting

**Purpose**: Enable drag-and-drop to create parent-child relationships

- [ ] T126 [US7] Install @dnd-kit/core if not already installed (check package.json - already present per plan.md)
- [ ] T127 [US7] Wrap HierarchyPanel with DndContext from @dnd-kit/core
- [ ] T128 [US7] Make GameObjectItem draggable using useDraggable hook with GameObject ID as drag data
- [ ] T129 [US7] Add drop zones to GameObjectItem using useDroppable hook with three zones: above (prepend sibling), below (append sibling), center (make child)
- [ ] T130 [US7] Implement onDragOver handler to show visual drop indicator (blue line above/below, or highlight background for "as child")
- [ ] T131 [US7] Implement onDragEnd handler in HierarchyPanel to call sceneStore.setParent() with validation
- [ ] T132 [US7] Add circular parenting check before drop, show error toast if invalid ("Cannot create circular parent-child relationship")
- [ ] T133 [US7] Support dropping GameObject outside all items (root level) to un-parent by creating drop zone at HierarchyPanel root

**Checkpoint**: Drag-and-drop parenting functional with visual feedback

---

## Phase 6: Transform Hierarchy System

**Purpose**: Make child transforms inherit from parent transforms

- [ ] T134 [US7] Add worldPosition getter to Transform in src/core/Transform.ts that calculates world position from parent chain
- [ ] T135 [US7] Add worldRotation getter to Transform in src/core/Transform.ts that calculates world rotation from parent chain
- [ ] T136 [US7] Add worldScale getter to Transform in src/core/Transform.ts that calculates world scale from parent chain
- [ ] T137 [US7] Create getParentTransform helper in src/core/Transform.ts to traverse parent chain via sceneStore
- [ ] T138 [US7] Update GameObjectRenderer in src/components/Viewport/SceneViewport.tsx to use worldPosition/worldRotation/worldScale instead of local values
- [ ] T139 [US7] Update Three.js scene graph to use hierarchy: wrap each GameObject mesh in a group, nest child groups inside parent groups
- [ ] T140 [US7] Test transform inheritance with 3-level hierarchy (parent > child > grandchild) - verify grandchild moves when grandparent moves

**Checkpoint**: Transform hierarchy functional, children move/rotate/scale with parents

---

## Phase 7: Hierarchy Context Menu

**Purpose**: Add right-click context menu to Hierarchy panel

- [ ] T141 [P] [US7] Create GameObjectContextMenu component in src/components/Hierarchy/GameObjectContextMenu.tsx using shadcn/ui ContextMenu
- [ ] T142 [US7] Add context menu trigger to HierarchyPanel empty space (right-click on panel background)
- [ ] T143 [US7] Add preset menu items to empty-space context menu (Empty, Cube, Sphere, Plane, Camera, Light)
- [ ] T144 [US7] Wire empty-space context menu to sceneStore.createGameObjectFromPreset()
- [ ] T145 [US7] Add context menu trigger to GameObjectItem (right-click on GameObject)
- [ ] T146 [US7] Add "Add Child >" submenu to GameObject context menu with all preset options
- [ ] T147 [US7] Wire "Add Child >" submenu to sceneStore.createGameObjectFromPreset(preset, selectedGameObjectId)
- [ ] T148 [US7] Add "Add Component >" submenu to GameObject context menu with ComponentRegistry types
- [ ] T149 [US7] Wire "Add Component >" submenu to sceneStore.addComponent()
- [ ] T150 [US7] Add "Delete" option to GameObject context menu, wire to sceneStore.removeGameObject()

**Checkpoint**: Context menus functional for quick GameObject/component creation

---

## Phase 8: Parent Deletion Handling

**Purpose**: Handle deletion of GameObjects with children

- [ ] T151 [US7] Create DeleteGameObjectDialog component in src/components/Hierarchy/DeleteGameObjectDialog.tsx using shadcn/ui Dialog
- [ ] T152 [US7] Add radio button options: "Delete children" vs "Promote children to root level"
- [ ] T153 [US7] Update sceneStore.removeGameObject() to accept deleteChildren boolean parameter
- [ ] T154 [US7] Implement child deletion logic: if deleteChildren=true, recursively delete all descendants
- [ ] T155 [US7] Implement child promotion logic: if deleteChildren=false, set children's parentId to null
- [ ] T156 [US7] Show DeleteGameObjectDialog when user attempts to delete GameObject with children (from context menu or Delete key)
- [ ] T157 [US7] Skip dialog and delete immediately if GameObject has no children (current behavior)

**Checkpoint**: Parent deletion safely handled with user confirmation

---

## Phase 9: Inspector Updates

**Purpose**: Update Inspector to reflect hierarchy

- [ ] T158 [P] [US7] Add "Parent" field to InspectorPanel showing parent GameObject name (read-only for MVP)
- [ ] T159 [P] [US7] Add "Children Count" field to InspectorPanel showing number of children (read-only)
- [ ] T160 [US7] Update TransformEditor to show both local and world space values (toggle or separate sections)
- [ ] T161 [US7] Add "(Local)" and "(World)" labels to position/rotation/scale sections in TransformEditor

**Checkpoint**: Inspector shows hierarchy information and transform spaces

---

## Phase 10: Polish & Validation

**Purpose**: Final polish and testing

- [ ] T162 [US7] Add hover effect to drop zones (blue border/background when dragging over)
- [ ] T163 [US7] Add drag ghost/preview showing GameObject name while dragging
- [ ] T164 [US7] Ensure hierarchy expand/collapse state persists in scene save/load
- [ ] T165 [US7] Test all acceptance scenarios from spec (hierarchy creation, presets, transform inheritance)
- [ ] T166 [US7] Profile performance: ensure hierarchy operations don't drop below 60 FPS with 50 GameObjects
- [ ] T167 [US7] Add keyboard shortcut documentation for Delete key (if not already present)
- [ ] T168 [US7] Test circular parenting prevention with complex hierarchy
- [ ] T169 [US7] Test un-parenting (drag child to root level)
- [ ] T170 [US7] Verify context menu appears within 200ms (SC-P002)

**Checkpoint**: All features polished and validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Data Model)**: Can start immediately - foundational for all other phases
- **Phase 2 (Presets System)**: Can start after Phase 1 - depends on types
- **Phase 3 (Toolbar Menu)**: Can start after Phase 2 - depends on preset system
- **Phase 4 (Hierarchy Visual)**: Can start after Phase 1 - depends on data model
- **Phase 5 (Drag-and-Drop)**: Can start after Phase 4 - depends on hierarchy UI
- **Phase 6 (Transform Hierarchy)**: Can start after Phase 1 - depends on data model
- **Phase 7 (Context Menu)**: Can start after Phase 2 - depends on preset system
- **Phase 8 (Parent Deletion)**: Can start after Phase 5 - depends on parenting logic
- **Phase 9 (Inspector)**: Can start after Phase 6 - depends on transform hierarchy
- **Phase 10 (Polish)**: Can start after all previous phases complete

### Parallel Opportunities

- **Phase 1**: T103, T104, T107 can be done in parallel
- **Phase 2**: T112, T113, T114, T115 can be done in parallel
- **Phase 3**: T117 can be done while T116 is in progress
- **Phase 9**: T158, T159 can be done in parallel

### Critical Path

1. Complete Phase 1 (Data Model) - BLOCKS everything
2. Complete Phase 2 (Presets) - BLOCKS Phase 3 and Phase 7
3. Complete Phase 4 (Hierarchy Visual) - BLOCKS Phase 5
4. Complete Phase 5 (Drag-and-Drop) - BLOCKS Phase 8
5. Complete Phase 6 (Transform Hierarchy) - BLOCKS Phase 9
6. Complete remaining phases
7. Final polish (Phase 10)

---

## Task Count Summary

- **Phase 1 (Data Model)**: 6 tasks
- **Phase 2 (Presets System)**: 7 tasks
- **Phase 3 (Toolbar Menu)**: 4 tasks
- **Phase 4 (Hierarchy Visual)**: 6 tasks
- **Phase 5 (Drag-and-Drop)**: 8 tasks
- **Phase 6 (Transform Hierarchy)**: 7 tasks
- **Phase 7 (Context Menu)**: 10 tasks
- **Phase 8 (Parent Deletion)**: 7 tasks
- **Phase 9 (Inspector)**: 4 tasks
- **Phase 10 (Polish)**: 9 tasks

**Total: 68 tasks (T103-T170)**

**Parallel Opportunities**: 11 tasks marked [P]

**Estimated Completion**: 5-7 days for single developer, 3-4 days with 2-3 developers in parallel

---

## Implementation Strategy

### Recommended Order (Incremental Delivery)

1. **Quick Win (Presets)**: Complete Phases 1-3 first
   - Users can immediately benefit from quick GameObject creation
   - Independent from hierarchy system
   - Fast to implement (17 tasks)
   - Demo-able in ~2 days

2. **Hierarchy Foundation**: Complete Phases 4-6
   - Core hierarchy functionality
   - Visual structure + drag-and-drop + transform inheritance
   - 21 tasks, ~3 days

3. **Context Menus**: Complete Phase 7
   - Enhances both presets and hierarchy
   - 10 tasks, ~1 day

4. **Final Polish**: Complete Phases 8-10
   - Parent deletion, Inspector updates, final polish
   - 20 tasks, ~2 days

### Parallel Team Strategy

With 2 developers:

1. **Developer A**: Phases 1, 2, 3 (Presets system + Toolbar)
2. **Developer B**: Phases 1, 4, 5, 6 (Data model + Hierarchy UI + Transforms)
3. Both converge on Phase 7 (Context Menus)
4. Divide Phase 8, 9, 10 tasks

### Validation Checkpoints

- After Phase 3: Demo preset creation from Toolbar
- After Phase 5: Demo drag-and-drop parenting with visual feedback
- After Phase 6: Demo child movement when parent is transformed
- After Phase 7: Demo context menu workflows
- After Phase 10: Full validation of all acceptance scenarios

---

## Notes

- [P] tasks can run in parallel within their phase
- [US7] label marks all tasks as belonging to User Story 7
- Depends on User Stories 1, 2, 3 being complete (GameObject system, components, Inspector)
- Uses existing @dnd-kit/core dependency (already in package.json per plan.md)
- Transform hierarchy calculations should be optimized for performance (cache world transforms)
- Context menus use shadcn/ui ContextMenu component (already available)
- All file paths are absolute from repository root (C:\Users\samue\Documents\Code\programing-three\)
