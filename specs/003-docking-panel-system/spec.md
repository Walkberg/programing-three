# Feature Specification: Docking Panel System

**Feature Branch**: `003-docking-panel-system`  
**Created**: 2025-11-11  
**Status**: Planning  
**Input**: User request for flexible panel docking system with drag-and-drop, tabs, and configurable layout

## Summary

The user wants to transform the current fixed editor layout into a flexible docking panel system similar to Unity, VS Code, or Unreal Engine. Users should be able to drag panels (Hierarchy, Scene, Game, Code, Inspector, Console, Assets) to different zones of the editor, create tabbed groups, and customize their workspace layout according to their workflow preferences.

## Clarifications

### Session 2025-11-13

- Q: Preferred plugin execution model for extending the editor (trusted / capability-restricted / sandbox / signed)? → A: B (Capabilities-restricted)

## User Scenarios & Testing

### User Story 1 - Default Panel Layout (Priority: P1) 🎯 MVP

A user opens the editor and sees a default workspace layout with panels arranged in a productive configuration. The layout should feel familiar to users of Unity or other game editors.

**Why this priority**: Establishes the foundation - the panel system infrastructure, default configuration, and panel rendering. Without this, no dragging or customization is possible.

**Independent Test**: Open the editor and verify that the default layout displays all panels correctly: Hierarchy (left), Scene (center), Inspector (right), Console and Assets (bottom tabs).

**Acceptance Scenarios**:

1. **Given** the editor loads for the first time, **When** the UI renders, **Then** panels appear in default positions: Hierarchy left, Scene center, Inspector right, Console/Assets bottom as tabs ✅
2. **Given** the default layout is displayed, **When** user views each panel, **Then** each panel displays its correct icon and name in the panel header ✅
3. **Given** the bottom zone has multiple tabs, **When** user clicks on a tab, **Then** the corresponding panel content displays and the tab is highlighted ✅
4. **Given** panels are displayed, **When** user resizes the browser window, **Then** panels scale proportionally and remain visible ✅

---

### User Story 2 - Drag Panel to New Zone (Priority: P2)

A user wants to reorganize their workspace by dragging a panel to a different zone. They can click and hold on a panel's header (name + icon area) to initiate a drag operation, see visual feedback during dragging, and drop the panel into a different zone to move it there.

**Why this priority**: Core functionality - enables workspace customization. Builds on the panel infrastructure from Story 1.

**Independent Test**: Click and drag the Hierarchy panel's header, see drop zones highlight, drop it on the right side, and verify it appears there with the Scene panel now alone on the left.

**Acceptance Scenarios**:

1. **Given** panels are displayed in default layout, **When** user clicks and holds on a panel header (name + icon area), **Then** the panel becomes draggable with visual feedback (opacity change, cursor change) ✅
2. **Given** user is dragging a panel, **When** the panel moves over valid drop zones, **Then** drop zones highlight with a colored border to indicate where the panel can be placed ✅
3. **Given** user is dragging a panel over a valid drop zone, **When** user releases the mouse button, **Then** the panel moves to the new zone and the layout updates ✅
4. **Given** user is dragging a panel, **When** user releases outside valid drop zones, **Then** the panel returns to its original position with a smooth animation ✅
5. **Given** a panel is moved to a new zone, **When** the layout updates, **Then** other panels resize to accommodate the new arrangement ✅

---

### User Story 3 - Create Tabbed Panel Groups (Priority: P3)

A user wants to save screen space by grouping related panels into tabs. They can drag a panel onto an existing panel to create a tabbed group, switch between tabs by clicking, and see which tab is active.

**Why this priority**: Enables advanced workspace organization. Particularly useful for Code, Game, and Scene panels that users might want to switch between. Depends on drag functionality from Story 2.

**Independent Test**: Drag the Game panel onto the Scene panel, verify both appear as tabs in the same zone, click each tab to switch between them.

**Acceptance Scenarios**:

1. **Given** user is dragging a panel, **When** panel hovers over the center of an existing panel, **Then** a drop zone indicator shows "Add as Tab" ✅
2. **Given** user drops a panel onto another panel's center, **When** the drop completes, **Then** both panels appear as tabs in the same zone with the newly added tab active ✅
3. **Given** a zone has multiple tabs, **When** user clicks on a non-active tab, **Then** that panel's content displays and its tab becomes highlighted ✅
4. **Given** a zone has multiple tabs, **When** user views the tab bar, **Then** each tab shows the panel's icon and name ✅
5. **Given** a tabbed group exists, **When** user drags a tab out to a different zone, **Then** the tab separates from the group and moves to the new zone ✅

---

### User Story 4 - Split Zones (Priority: P4)

A user wants to create a more complex layout by splitting existing zones horizontally or vertically. They can drag a panel to the edge of an existing zone to split it, creating side-by-side or top-bottom arrangements.

**Why this priority**: Enables very advanced layouts. Nice-to-have but not essential for MVP. Depends on drag functionality from Story 2.

**Independent Test**: Drag Console panel to the right edge of the bottom zone, verify the bottom zone splits into two side-by-side sections with Assets on the left and Console on the right.

**Acceptance Scenarios**:

1. **Given** user is dragging a panel, **When** panel hovers near the edge (left/right/top/bottom) of an existing zone, **Then** a split indicator shows where the new zone boundary would be ✅
2. **Given** user drops a panel on a zone edge, **When** the drop completes, **Then** the zone splits into two sections with the new panel in one section ✅
3. **Given** zones are split, **When** user views the layout, **Then** a draggable splitter appears between zones to adjust their relative sizes ✅
4. **Given** zones are split with a splitter, **When** user drags the splitter, **Then** the zones resize proportionally in real-time ✅

---

### User Story 5 - Persist Layout (Priority: P5)

A user customizes their workspace layout and closes the editor. When they return, they want their custom layout to be restored automatically so they don't have to reorganize panels every session.

**Why this priority**: Quality-of-life feature. Makes customization worthwhile. Can be added after core functionality works.

**Independent Test**: Customize the layout, close the editor, reopen it, and verify the custom layout is restored.

**Acceptance Scenarios**:

1. **Given** user has customized their panel layout, **When** the layout changes, **Then** the layout configuration is automatically saved to localStorage ✅
2. **Given** user has a saved custom layout, **When** user reopens the editor, **Then** the custom layout is restored with all panels in their saved positions ✅
3. **Given** user has a custom layout, **When** user wants to reset to default, **Then** a "Reset Layout" button in settings restores the default configuration ✅

---

### User Story 6 - Layout Presets Manager (Priority: P6)

A user wants to save and manage multiple layout configurations (presets) for different workflows. They can access a Layout Manager from the toolbar, see all available preset layouts, save their current layout as a new preset, load any saved preset, and reset to the default layout.

**Why this priority**: Advanced workflow optimization. Allows users to have different layouts for different tasks (e.g., "Coding", "Design", "Testing"). Builds on persistence from Story 5.

**Independent Test**: Open Layout Manager from toolbar, save current layout as "My Coding Setup", modify layout, load the saved preset, verify original layout is restored.

**Acceptance Scenarios**:

1. **Given** the toolbar is displayed, **When** user clicks the Layout Manager button, **Then** a popover opens showing layout management options
2. **Given** the Layout Manager is open, **When** user views the preset section, **Then** they see a list of default preset layouts (e.g., "Default", "Code Focus", "Design Mode")
3. **Given** the Layout Manager is open, **When** user clicks on a preset layout, **Then** the editor applies that layout configuration immediately
4. **Given** the Layout Manager is open, **When** user views the saved layouts section, **Then** they see all their custom saved layout presets with names and dates
5. **Given** user has a custom layout, **When** user clicks "Save Layout" in the manager, **Then** a dialog prompts for a preset name and saves the current configuration
6. **Given** user has saved layouts, **When** user clicks on a saved layout, **Then** that custom layout is applied to the editor
7. **Given** user has saved layouts, **When** user right-clicks or hovers on a saved layout, **Then** they can delete or rename the preset
8. **Given** the Layout Manager is open, **When** user clicks "Reset Layout", **Then** the editor returns to the default layout configuration
9. **Given** any layout operation occurs, **When** the operation completes, **Then** a toast notification confirms the action (loaded, saved, deleted, reset)

---

### Edge Cases

- What happens when user tries to close the last remaining panel? (Should prevent - at least one panel must be visible)
- What happens when user drags a panel from a tabbed group that only has 2 tabs? (Remaining tab becomes a standalone panel)
- How does the layout handle very narrow or very small browser windows? (Minimum panel sizes, possible scroll or collapse behavior)
- What happens if saved layout contains panels that no longer exist? (Skip missing panels, fall back to default for that zone)
- How does the system handle rapid dragging operations? (Debounce/throttle layout recalculations)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a panel system with named panels: Hierarchy, Scene, Game, Code, Inspector, Console, Assets
- **FR-002**: System MUST render each panel with a header showing an icon and panel name
- **FR-003**: System MUST support a default layout with Hierarchy (left), Scene (center), Inspector (right), Console+Assets (bottom tabs)
- **FR-004**: System MUST allow users to initiate panel dragging by clicking and holding on the panel header
- **FR-005**: System MUST provide visual feedback during drag operations (opacity change, cursor change)
- **FR-006**: System MUST highlight valid drop zones when a panel is being dragged over them
- **FR-007**: System MUST support dropping panels into different zones to move them
- **FR-008**: System MUST support dropping panels onto existing panels to create tabbed groups
- **FR-009**: System MUST render tab bars for zones with multiple panels
- **FR-010**: System MUST allow users to switch between tabs by clicking
- **FR-011**: System MUST visually indicate the active tab with highlighting
- **FR-012**: System MUST allow dragging tabs out of tabbed groups to separate them
- **FR-013**: System MUST support splitting zones horizontally or vertically by dropping panels on zone edges
- **FR-014**: System MUST provide draggable splitters between zones for resizing
- **FR-015**: System MUST persist layout configuration to localStorage
- **FR-016**: System MUST restore saved layout on editor load
- **FR-017**: System MUST provide a "Reset Layout" option to restore default configuration
- **FR-018**: System MUST prevent closing the last remaining panel
- **FR-019**: System MUST handle browser window resizing by scaling panels proportionally
- **FR-020**: System MUST enforce minimum panel sizes to prevent unusable layouts

### Key Entities

- **Panel**: Represents a UI component (Hierarchy, Scene, Game, Code, Inspector, Console, Assets). Contains a unique ID, type (panel type), title (display name), icon, and content component reference.

- **Zone**: Represents a region of the editor that can contain one or more panels. Contains a unique ID, list of panel IDs, active panel ID (for tabbed groups), orientation (horizontal/vertical for splits), and size ratio.

- **Layout**: Represents the entire workspace configuration. Contains root zone ID, zone tree (nested zones for splits), panel-to-zone mapping, and version for migration.

- **DragState**: Represents the current drag operation state. Contains dragged panel ID, current mouse position, drop target zone ID, and drop mode (move/tab/split).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can see all 7 panels (Hierarchy, Scene, Game, Code, Inspector, Console, Assets) in the default layout on first load
- **SC-002**: Users can successfully drag and drop a panel to a new zone within 5 seconds
- **SC-003**: Drop zone highlighting appears within 100ms of hovering over a valid target
- **SC-004**: Panel movement and layout updates complete within 300ms for smooth UX
- **SC-005**: Tabbed groups correctly display all tabs and switch content within 50ms of tab click
- **SC-006**: Custom layouts persist across browser sessions without data loss
- **SC-007**: The system maintains 60 FPS during drag operations and layout updates

### Assumptions

- Users are familiar with docking UI patterns from IDEs like VS Code, Unity, or Visual Studio
- The editor runs on desktop browsers with mouse input (touch support is future enhancement)
- Users want to customize their workspace but also appreciate a sensible default
- Panel content components (Hierarchy, Scene, etc.) exist and are working from previous MVP
- Browser localStorage is available and sufficient for layout persistence (<1KB per layout)

## Implementation Details

### UI/UX Enhancements

**Panel Header Design**:
- Consistent header bar: `[Icon] Panel Name [Actions?]`
- Drag handle: Entire header acts as drag handle (cursor: grab/grabbing)
- Active state: Highlighted when panel is focused or tab is active
- Hover state: Subtle background color change to indicate interactivity

**Drop Zone Indicators**:
- **Zone replacement**: Blue border around entire target zone
- **Tab creation**: Center indicator with "Add as Tab" label
- **Zone split**: Line indicator showing where split would occur (left/right/top/bottom)

**Tab Bar Design**:
- Horizontal tab list at top of zone
- Each tab: `[Icon] Name [Close?]` (close button optional - may prevent in MVP)
- Active tab: Highlighted background, bottom border accent
- Scrollable if too many tabs (horizontal scroll)

**Splitter Design**:
- Draggable divider between zones (3-5px width)
- Hover cursor: `col-resize` or `row-resize`
- Minimum zone sizes: 200px width, 150px height

**Technology Stack**:
- **Drag and Drop**: React DnD library or custom HTML5 Drag API
- **Layout Management**: CSS Grid or Flexbox with dynamic calculations
- **State Management**: Zustand store for layout configuration
- **Persistence**: localStorage with JSON serialization
- **Animation**: CSS transitions for smooth panel movements
- **UI Components**: shadcn/ui components for tab bars, headers, buttons

### Plugin Architecture

Decision: **Capability-restricted plugin model** (see Clarifications session above).

- Overview: Plugins will run inside the application process but must interact with the editor only through a small, well-documented capabilities API exposed by the `PluginManager` (for example: `registerPanel`, `registerCommand`, `registerToolbarAction`, `getPanels`, `getCommands`).
- Rules & rationale:
	- Plugins SHOULD NOT access internal Zustand stores or directly manipulate internal components. Instead, expose targeted API methods on `PluginManager` which encapsulate store interactions and side effects.
	- Each plugin must provide a minimal manifest when registering (id, name, version, requestedCapabilities). `PluginManager` will validate requested capabilities and may refuse registration if unsupported.
	- `PluginManager` methods must perform input validation and catch plugin-origin errors to avoid crashing the host app.
	- Prefer exposing higher-level commands (e.g., `commands.execute('layout.addTab', { panelId, zoneId })`) rather than raw store mutation, improving testability and future policy enforcement.

Benefits: Balances developer ergonomics and safety — allows rich extension without the complexity of full sandboxing while reducing risk of arbitrary state corruption by plugins.

### Performance Considerations

- Memoize panel components to prevent unnecessary re-renders during layout changes
- Throttle drag position updates to 60 FPS (16ms)
- Use CSS transforms for drag feedback (hardware accelerated)
- Lazy load panel content for tabs that aren't active
- Debounce localStorage writes (500ms after last layout change)
