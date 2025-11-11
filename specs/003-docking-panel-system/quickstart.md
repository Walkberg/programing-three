# Quickstart: Docking Panel System

**Feature**: 003-docking-panel-system  
**Date**: 2025-11-11  
**Purpose**: Quick testing scenarios to validate feature functionality

## Prerequisites

- Feature branch: `003-docking-panel-system`
- Dependencies installed: `@dnd-kit/core`, `lucide-react`
- Development server running: `npm run dev`

## Test Scenario 1: Default Layout (US1)

**Goal**: Verify default panel layout renders correctly

**Steps**:
1. Open the editor in browser: `http://localhost:5173`
2. Observe the layout structure

**Expected Results**:
- ✅ Hierarchy panel visible on the left with folder icon and "Hierarchy" name
- ✅ Scene panel visible in the center with box icon and "Scene" name
- ✅ Inspector panel visible on the right with settings icon and "Inspector" name
- ✅ Bottom section shows two tabs: Console (terminal icon) and Assets (folder icon)
- ✅ Console is the active tab (highlighted)
- ✅ All panels display their respective content (hierarchy list, 3D scene, inspector properties, console messages, asset grid)
- ✅ Panels scale proportionally when browser window resizes
- ✅ No console errors

**Validation**:
```bash
# Visual inspection - all panels render
# Check browser console for errors (F12)
# Resize window - panels should adapt smoothly
```

---

## Test Scenario 2: Drag Panel to New Zone (US2)

**Goal**: Verify panels can be dragged and dropped into different zones

**Steps**:
1. Open the editor
2. Click and hold on the Hierarchy panel header (where it says "Hierarchy" with icon)
3. Drag the panel toward the right side of the screen
4. Observe drop zone highlighting on the right zone (Inspector area)
5. Release the mouse over the right zone
6. Observe the layout change

**Expected Results**:
- ✅ Panel header shows grab cursor on hover
- ✅ Panel becomes semi-transparent during drag
- ✅ Drop zone highlights with colored border when hovering over valid target
- ✅ Releasing over valid zone moves the panel there
- ✅ Layout transitions smoothly (300ms animation)
- ✅ Hierarchy panel now appears on the right
- ✅ Inspector panel remains in the right zone (if multiple panels fit) or moves elsewhere
- ✅ Left zone is either empty or removed from layout

**Validation**:
```bash
# Drag Hierarchy from left to right - should move
# Drag Inspector from right to center - should move
# Try dragging outside editor - panel should return to source
# Press Escape during drag - panel should cancel and return
```

**Rollback**:
- Drag panels back to original positions manually
- Or refresh page (layout persists only after US5)

---

## Test Scenario 3: Create Tabbed Groups (US3)

**Goal**: Verify panels can be grouped as tabs by dropping on existing panels

**Steps**:
1. Open the editor with default layout
2. Drag the Assets tab from the bottom (if it's already a tab, drag it out first to separate it)
3. Drag Assets panel over the CENTER of the Scene panel
4. Observe "Add as Tab" indicator
5. Release the mouse
6. Observe Scene and Assets appear as tabs in the center zone
7. Click on the Assets tab
8. Click back on the Scene tab

**Expected Results**:
- ✅ When hovering over panel center, "Add as Tab" indicator appears
- ✅ Dropping on center creates a tab group
- ✅ Tab bar appears at top of zone showing both panel icons and names
- ✅ Initially dropped panel becomes active tab (highlighted)
- ✅ Clicking a tab switches the active panel content
- ✅ Only active tab's content is visible
- ✅ Tab switches occur within 50ms (smooth)

**Validation**:
```bash
# Create tab group: Drag Game onto Scene - both should appear as tabs
# Switch tabs: Click Scene, then Game - content should switch
# Drag tab out: Drag Game tab to left zone - should separate into its own panel
# Tab remains: Scene tab should remain in center zone
```

---

## Test Scenario 4: Split Zones (US4)

**Goal**: Verify zones can be split horizontally or vertically

**Steps**:
1. Open the editor with default layout
2. Drag Console panel from the bottom
3. Drag it toward the RIGHT EDGE of the bottom zone
4. Observe split line indicator at the right edge
5. Release the mouse
6. Observe the bottom zone splits into two side-by-side sections
7. Drag the splitter between Console and Assets to resize

**Expected Results**:
- ✅ When hovering over zone edge (within 20%), split indicator line appears
- ✅ Dropping on edge splits the zone
- ✅ New zone boundaries appear with draggable splitter between them
- ✅ Splitter shows col-resize or row-resize cursor on hover
- ✅ Dragging splitter resizes zones in real-time
- ✅ Minimum zone size enforced (200px width, 150px height)
- ✅ Split zones scale proportionally with window resize

**Validation**:
```bash
# Split bottom zone horizontally: Drag Console to right edge - zone should split
# Split center zone vertically: Drag Game to top edge of Scene - zone should split
# Resize split: Drag splitter left/right or up/down - zones should resize
# Minimum size: Try to make zone too small - should clamp at minimum
```

---

## Test Scenario 5: Persist Layout (US5)

**Goal**: Verify custom layouts are saved and restored across sessions

**Steps**:
1. Open the editor
2. Customize the layout:
   - Move Hierarchy to the right
   - Create a tab group with Scene and Game in the center
   - Split the bottom zone to have Console on left, Assets on right
3. Note the current layout state
4. Close the browser tab
5. Reopen the editor: `http://localhost:5173`
6. Observe the layout

**Expected Results**:
- ✅ Custom layout is automatically restored on reload
- ✅ All panels appear in their customized positions
- ✅ Tab groups are preserved with correct active tabs
- ✅ Split ratios are preserved
- ✅ No flash of default layout before restore

**Validation**:
```bash
# Customize layout, close tab, reopen - layout should match
# Open editor in new browser window - layout should be restored (same localStorage)
# Click "Reset Layout" button - layout should return to default
# Customize again, close, reopen - new customization should be saved
```

**Reset Layout**:
- Look for "Reset Layout" button in Toolbar or settings
- Click to restore default layout
- Confirm via dialog if implemented

---

## Test Scenario 6: Edge Cases

**Goal**: Verify system handles edge cases gracefully

### 6a. Prevent Closing Last Panel
**Steps**:
1. Create a layout with only one visible panel
2. Try to drag that panel out of the editor or close it

**Expected**:
- ✅ System prevents action or shows warning toast: "Cannot remove last panel"

### 6b. Drag from Tabbed Group
**Steps**:
1. Create a tab group with Scene and Game
2. Drag Scene tab out to a different zone
3. Observe the original zone

**Expected**:
- ✅ Scene separates into new zone
- ✅ Game remains as a single panel (no longer tabbed)
- ✅ Game automatically becomes active if it was the only remaining tab

### 6c. Split Zone with Multiple Tabs
**Steps**:
1. Create a tab group with 3 panels: Scene, Game, Code
2. Drag Console panel to the edge of that zone to split it
3. Observe the result

**Expected**:
- ✅ Zone splits into two
- ✅ Original zone keeps all 3 tabbed panels (Scene, Game, Code)
- ✅ New zone gets Console panel
- ✅ Both zones are functional

### 6d. Very Small Window
**Steps**:
1. Resize browser window to very small size (e.g., 800x600)
2. Observe panel behavior

**Expected**:
- ✅ Panels scale down to minimum sizes (200px x 150px)
- ✅ Layout may show scrollbars if needed
- ✅ No panels disappear or become unusable

### 6e. Rapid Drag Operations
**Steps**:
1. Drag multiple panels quickly in succession
2. Observe performance and layout updates

**Expected**:
- ✅ Drag operations remain smooth (60 FPS)
- ✅ No visual glitches or lag
- ✅ Layout updates are batched and smooth

---

## Performance Validation

**Goal**: Verify system maintains performance targets

### Frame Rate During Drag
**Steps**:
1. Open PerformanceMonitor (should show FPS in viewport)
2. Drag panels around the editor
3. Observe FPS counter

**Expected**:
- ✅ FPS stays at or near 60 during drag operations
- ✅ No significant frame drops or stuttering
- ✅ Drop zone highlighting appears within 100ms

### Layout Transition Speed
**Steps**:
1. Drop a panel in a new zone
2. Observe transition animation timing

**Expected**:
- ✅ Layout transitions complete within 300ms
- ✅ Animation is smooth (CSS transform based)
- ✅ No jank or jumpy movements

### Tab Switch Speed
**Steps**:
1. Create a tab group with multiple panels
2. Rapidly click between tabs
3. Observe content switching

**Expected**:
- ✅ Tab switches occur within 50ms (feels instant)
- ✅ No flash of incorrect content
- ✅ Tab highlighting updates immediately

---

## Debug & Troubleshooting

### Layout Not Persisting
**Check**:
1. Open browser DevTools → Application → Local Storage
2. Look for key: `editor:layout:v1`
3. Verify JSON value is present and valid

**Fix**:
- Clear localStorage: `localStorage.clear()` in console
- Reload page - should use default layout
- Customize and save again

### Drag Not Working
**Check**:
1. Browser console for errors (F12)
2. Verify @dnd-kit is installed: `npm list @dnd-kit/core`
3. Check DragState in layoutStore (using React DevTools)

**Fix**:
- Reinstall dependencies: `npm install`
- Clear browser cache and reload
- Check for conflicting event handlers

### Panels Not Rendering
**Check**:
1. Browser console for errors
2. Verify PanelRegistry has all 7 panel definitions
3. Check Zone component renders panel components correctly

**Fix**:
- Verify imports: All panel components (HierarchyPanel, SceneViewport, etc.) must be imported
- Check panel IDs match between layout and PanelRegistry

### Performance Issues
**Check**:
1. Open React DevTools Profiler
2. Record a drag operation
3. Identify components with unnecessary re-renders

**Fix**:
- Ensure React.memo is applied to Panel, Zone, TabBar
- Verify drag updates are throttled (16ms max)
- Check for expensive calculations in render functions

---

## Success Criteria Checklist

After completing all test scenarios, verify:

- [ ] **SC-001**: All 7 panels visible in default layout ✅
- [ ] **SC-002**: Panel drag completes within 5 seconds ✅
- [ ] **SC-003**: Drop zone highlighting within 100ms ✅
- [ ] **SC-004**: Layout updates within 300ms ✅
- [ ] **SC-005**: Tab switch within 50ms ✅
- [ ] **SC-006**: Custom layouts persist across sessions ✅
- [ ] **SC-007**: 60 FPS during drag operations ✅

If all checkboxes pass, the Docking Panel System is ready for production! 🎉
