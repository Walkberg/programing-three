# Tasks: Docking Panel System

**Feature**: 003-docking-panel-system  
**Branch**: `003-docking-panel-system`  
**Input**: Design documents from `/specs/003-docking-panel-system/`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create basic project structure

- [X] T001 Install @dnd-kit/core dependency: `npm install @dnd-kit/core@6`
- [X] T002 Install additional lucide-react icons: `npm install lucide-react` (if not already installed)
- [X] T003 [P] Create directory structure: `src/components/Docking/`, `src/types/layout.ts`, `src/hooks/useDragAndDrop.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and state management that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Define Panel, Zone, Layout types in `src/types/layout.ts`
- [X] T005 [P] Create layoutStore with Zustand in `src/state/layoutStore.ts`
- [X] T006 Create default layout configuration in `src/state/layoutStore.ts`
- [X] T007 [P] Create PanelRegistry with panel definitions in `src/components/Docking/PanelRegistry.tsx`
- [X] T008 Create LayoutSerializer service in `src/services/LayoutSerializer.ts`

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Default Panel Layout (Priority: P1) 🎯 MVP

**Goal**: Render panels in a default workspace layout with zones and panel headers

**Independent Test**: Open the editor and verify all panels (Hierarchy, Scene, Inspector, Console, Assets) appear in default positions with proper headers and icons

### Implementation for User Story 1

- [X] T009 [P] [US1] Create Zone component in `src/components/Docking/Zone.tsx` (renders leaf and split zones)
- [X] T010 [P] [US1] Create Panel wrapper component in `src/components/Docking/Panel.tsx` (wraps panel content)
- [X] T011 [P] [US1] Create PanelHeader component in `src/components/Docking/PanelHeader.tsx` (icon + name)
- [X] T012 [P] [US1] Create TabBar component in `src/components/Docking/TabBar.tsx` (renders tabs for multi-panel zones)
- [X] T013 [P] [US1] Create Tab component in `src/components/Docking/Tab.tsx` (individual tab with icon + name)
- [X] T014 [US1] Create DockingLayout component in `src/components/Docking/DockingLayout.tsx` (root layout manager, renders zone tree)
- [X] T015 [US1] Update EditorLayout to use DockingLayout in `src/components/Editor/EditorLayout.tsx` (replace fixed CSS grid)
- [X] T016 [US1] Add panel type metadata (icons, titles) to PanelRegistry in `src/components/Docking/PanelRegistry.tsx`
- [X] T017 [US1] Implement zone tree rendering with CSS Flexbox in `src/components/Docking/Zone.tsx`
- [X] T018 [US1] Add zone size calculations (flex-basis from zone.sizes) in `src/components/Docking/Zone.tsx`
- [X] T019 [US1] Implement tab switching logic in TabBar onClick handler
- [X] T020 [US1] Add React.memo optimization to Panel, Zone, TabBar components
- [X] T021 [US1] Style panel headers with Tailwind in `src/components/Docking/PanelHeader.tsx`
- [X] T022 [US1] Verify default layout renders with all 7 panels visible

**Checkpoint**: ✅ Default layout fully functional - panels render in zones with tabs

---

## Phase 4: User Story 2 - Drag Panel to New Zone (Priority: P2)

**Goal**: Enable dragging panels to different zones with visual drop zone feedback

**Independent Test**: Drag Hierarchy panel to right side, see drop zones highlight, verify it moves there after dropping

### Implementation for User Story 2

- [X] T023 [P] [US2] Add DragState to layoutStore in `src/state/layoutStore.ts`
- [X] T024 [P] [US2] Create useDragAndDrop hook in `src/hooks/useDragAndDrop.ts` (integrates @dnd-kit)
- [X] T025 [US2] Make PanelHeader draggable with @dnd-kit useDraggable in `src/components/Docking/PanelHeader.tsx`
- [X] T026 [US2] Add drag overlay with DndContext in `src/components/Docking/DockingLayout.tsx`
- [X] T027 [P] [US2] Create DropZone component in `src/components/Docking/DropZone.tsx` (visual indicators)
- [X] T028 [US2] Implement collision detection in useDragAndDrop hook (calculate drop target zone)
- [X] T029 [US2] Add drop zone highlighting logic in DropZone component (show on hover)
- [X] T030 [US2] Implement movePanel action in layoutStore (remove from source, add to target)
- [X] T031 [US2] Handle drag end with layout commit in DockingLayout onDragEnd
- [X] T032 [US2] Add drag visual feedback (opacity, cursor) in PanelHeader CSS
- [X] T033 [US2] Implement drag cancel (Escape key or invalid drop) with animation back to source
- [X] T034 [US2] Throttle drag move events to 60 FPS in useDragAndDrop hook
- [X] T035 [US2] Add layout transition animation (300ms) with CSS transitions in Zone component
- [X] T036 [US2] Test dragging panel to empty zone, between zones, and invalid drops

**Checkpoint**: ✅ Panel dragging fully functional - panels can be moved between zones

---

## Phase 5: User Story 3 - Create Tabbed Panel Groups (Priority: P3)

**Goal**: Allow grouping panels as tabs by dropping on existing panels

**Independent Test**: Drag Game panel onto Scene panel center, verify both appear as tabs, click each tab to switch

### Implementation for User Story 3

- [X] T037 [P] [US3] Detect center drop zone (tab mode) in useDragAndDrop collision detection
- [X] T038 [P] [US3] Show "Add as Tab" indicator in DropZone for center drops
- [X] T039 [US3] Implement addTabToZone action in layoutStore (add panel to zone.panels array)
- [X] T040 [US3] Update drag end handler to support tab mode in DockingLayout
- [X] T041 [US3] Implement setActiveTab action in layoutStore (update zone.activePanel)
- [X] T042 [US3] Add tab click handler in Tab component (calls setActiveTab)
- [X] T043 [US3] Render only active tab content in Zone component (unmount inactive tabs)
- [X] T044 [US3] Style active tab with highlight in TabBar CSS
- [X] T045 [US3] Add tab icons from PanelRegistry to Tab component
- [X] T046 [US3] Implement drag tab out of group (separate to new zone) logic
- [X] T047 [US3] Handle removing panel from multi-tab zone (update activePanel if removed)
- [X] T048 [US3] Test creating tabbed groups, switching tabs, and dragging tabs out

**Checkpoint**: ✅ Tabbed panel groups fully functional - panels can be grouped and ungrouped

---

## Phase 6: User Story 4 - Split Zones (Priority: P4)

**Goal**: Enable splitting zones horizontally/vertically by dropping panels on zone edges

**Independent Test**: Drag Console to right edge of bottom zone, verify zone splits into two side-by-side sections

### Implementation for User Story 4

- [X] T049 [P] [US4] Detect edge drop zones (split-h, split-v) in useDragAndDrop collision detection
- [X] T050 [P] [US4] Show split line indicators in DropZone for edge drops
- [X] T051 [P] [US4] Create Splitter component in `src/components/Docking/Splitter.tsx` (draggable divider)
- [X] T052 [US4] Implement splitZone action in layoutStore (convert leaf to split with children)
- [X] T053 [US4] Update drag end handler to support split modes in DockingLayout
- [X] T054 [US4] Render Splitter between child zones in Zone component (for split zones)
- [X] T055 [US4] Implement splitter drag logic in Splitter component (updates zone.sizes)
- [X] T056 [US4] Add updateZoneSizes action in layoutStore (clamp to 0.1-0.9, normalize to 1.0)
- [X] T057 [US4] Apply zone sizes via CSS flex-basis in Zone component
- [X] T058 [US4] Add cursor change (col-resize/row-resize) on splitter hover
- [X] T059 [US4] Handle minimum zone sizes (200px width, 150px height) in splitter drag
- [X] T060 [US4] Test splitting zones horizontally and vertically, resizing with splitter

**Checkpoint**: ✅ Zone splitting fully functional - zones can be split and resized

---

## Phase 7: User Story 5 - Persist Layout (Priority: P5)

**Goal**: Save and restore custom layouts across browser sessions

**Independent Test**: Customize layout, close editor, reopen, verify layout is restored

### Implementation for User Story 5

- [X] T061 [P] [US5] Implement serialize method in LayoutSerializer (Layout to JSON)
- [X] T062 [P] [US5] Implement deserialize method in LayoutSerializer (JSON to Layout with validation)
- [X] T063 [US5] Add saveLayout action in layoutStore (calls LayoutSerializer + StorageService)
- [X] T064 [US5] Add loadLayout action in layoutStore (loads from storage, validates, applies)
- [X] T065 [US5] Debounce saveLayout calls (500ms) in layoutStore after layout changes
- [X] T066 [US5] Call loadLayout on app initialization in `src/main.tsx` or EditorLayout
- [X] T067 [US5] Add "Reset Layout" button in Toolbar or settings menu
- [X] T068 [US5] Implement resetLayout action in layoutStore (resets to default layout)
- [X] T069 [US5] Add layout migration logic in LayoutSerializer (version check)
- [X] T070 [US5] Handle invalid saved layouts (fall back to default)
- [X] T071 [US5] Add toast notifications for successful save/load/reset
- [ ] T072 [US5] Test persistence: save, reload, verify layout matches

**Checkpoint**: Layout persistence fully functional - custom layouts survive browser restarts

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T073 [P] Add comprehensive error handling (invalid panel IDs, corrupted layouts)
- [ ] T074 [P] Add unit tests for layoutStore actions in `tests/unit/layoutStore.test.ts`
- [ ] T075 [P] Add unit tests for LayoutSerializer in `tests/unit/LayoutSerializer.test.ts`
- [ ] T076 Add component tests for drag interactions in `tests/component/DockingLayout.test.tsx`
- [ ] T077 [P] Add component tests for tab switching in `tests/component/TabBar.test.tsx`
- [ ] T078 [P] Add component tests for zone rendering in `tests/component/Zone.test.tsx`
- [ ] T079 Add E2E tests for complete docking workflow in `tests/e2e/docking-workflow.spec.ts`
- [ ] T080 Add Zod validation schemas for Layout, Zone, Panel types in `src/types/layout.ts`
- [ ] T081 Optimize performance with React.memo on all docking components
- [ ] T082 Add FPS monitoring during drag operations (reuse PerformanceMonitor)
- [ ] T083 [P] Document docking system API in `specs/003-docking-panel-system/quickstart.md`
- [ ] T084 Add accessibility attributes (aria-labels) to panel headers and tabs
- [ ] T085 Ensure minimum panel sizes enforced (200px x 150px)
- [ ] T086 Test responsive behavior with small browser windows
- [ ] T087 Code cleanup and refactoring of docking components
- [ ] T088 Run full test suite and verify all acceptance criteria pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Default Layout): Can start after Foundational
  - User Story 2 (Drag): Can start after US1 (needs Zone components)
  - User Story 3 (Tabs): Can start after US2 (needs drag functionality)
  - User Story 4 (Splits): Can start after US2 (needs drag functionality), independent of US3
  - User Story 5 (Persist): Can start after US1 (needs layout structure), works with any layout
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (needs Zone and Panel components)
- **User Story 3 (P3)**: Depends on US2 completion (needs drag system)
- **User Story 4 (P4)**: Depends on US2 completion (needs drag system), independent of US3
- **User Story 5 (P5)**: Depends on US1 completion (needs layout structure), can work with partial features

### Within Each User Story

- **US1**: Zone → Panel/PanelHeader → TabBar/Tab → DockingLayout → EditorLayout integration
- **US2**: DragState → useDragAndDrop → DropZone → drag handlers in parallel → integration
- **US3**: Tab detection → addTabToZone → setActiveTab → tab rendering
- **US4**: Split detection → splitZone → Splitter → resize logic
- **US5**: Serialization → saveLayout → loadLayout → reset → migration

### Parallel Opportunities

- **Setup (Phase 1)**: All tasks can run in parallel
- **Foundational (Phase 2)**: T004, T005, T007, T008 can run in parallel after T006 (needs layout structure)
- **US1**: T009, T010, T011, T012, T013 can all run in parallel (different components)
- **US2**: T023, T024, T027 can run in parallel initially
- **US3**: T037, T038 can run in parallel
- **US4**: T049, T050, T051 can run in parallel initially
- **US5**: T061, T062 can run in parallel
- **Polish**: T073, T074, T075, T077, T078, T083 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component creation tasks together:
Task: "Create Zone component in src/components/Docking/Zone.tsx"
Task: "Create Panel wrapper component in src/components/Docking/Panel.tsx"
Task: "Create PanelHeader component in src/components/Docking/PanelHeader.tsx"
Task: "Create TabBar component in src/components/Docking/TabBar.tsx"
Task: "Create Tab component in src/components/Docking/Tab.tsx"

# After components exist, integrate them:
Task: "Create DockingLayout component in src/components/Docking/DockingLayout.tsx"
Task: "Update EditorLayout to use DockingLayout"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Default Layout)
4. **VALIDATE**: Test default layout with all panels
5. Complete Phase 4: User Story 2 (Drag to Zone)
6. **VALIDATE**: Test dragging panels between zones
7. Complete Phase 5: User Story 3 (Tabs)
8. **VALIDATE**: Test creating and switching tabs
9. **MVP COMPLETE**: Editor has flexible layout with drag-and-drop

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Basic structure ready
2. **Default Layout** (Phase 3) → All panels visible in zones (baseline for current functionality)
3. **Drag & Drop** (Phase 4) → Customizable layout (big UX improvement)
4. **Tabs** (Phase 5) → Space-efficient layout (advanced organization)
5. **Splits** (Phase 6) → Complex layouts (power user feature)
6. **Persistence** (Phase 7) → Layout survives restarts (quality of life)

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. **Developer A**: User Story 1 (Default Layout) - Priority 1
2. **Developer B**: User Story 5 (Persistence infrastructure) - Can start in parallel, doesn't need drag
3. After US1 completes:
   - **Developer A**: User Story 2 (Drag)
   - **Developer B**: Finish US5 (integrate with layout system)
4. After US2 completes:
   - **Developer A**: User Story 3 (Tabs)
   - **Developer C**: User Story 4 (Splits) - Independent of tabs

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 must be complete before US2 (drag needs zones to exist)
- US2 must be complete before US3 and US4 (both need drag system)
- US5 can start early (only needs layout structure, not drag)
- Zone splitting (US4) and tabbing (US3) are independent of each other
