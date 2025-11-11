# US3 Test Guide - Tabbed Panel Groups

## Test Cases

### ✅ Test 1: Add Panel as Tab (Center Drop)
**Goal**: Drag a panel to the center of another zone to add it as a tab

**Steps**:
1. Open the application at http://localhost:5175
2. Drag the "Hierarchy" panel header (grab the grip icon)
3. Drag it to the CENTER of the "Inspector" zone (right side)
4. You should see a **BLUE** drop indicator saying "Add as Tab"
5. Release the mouse
6. **Expected**: Hierarchy becomes a tab in the Inspector zone

### ✅ Test 2: Move Panel (Edge Drop)
**Goal**: Drag a panel to the edge to replace zone content

**Steps**:
1. Drag the "Scene" panel header
2. Drag it to the EDGE of the "Inspector" zone
3. You should see a **PRIMARY** (default color) drop indicator saying "Move Here"
4. Release the mouse
5. **Expected**: Scene replaces the Inspector zone content

### ✅ Test 3: Tab Switching
**Goal**: Switch between tabs in a multi-tab zone

**Steps**:
1. Create a multi-tab zone (use Test 1 if not already done)
2. Click on different tabs in the tab bar
3. **Expected**: Active tab highlights with blue underline, content switches

### ✅ Test 4: Drag Tab Out
**Goal**: Separate a tab from a group by dragging it to another zone

**Steps**:
1. Create a multi-tab zone (use Test 1 if not already done)
2. Drag a TAB (not the panel header) from the tab bar
3. Drag it to another zone
4. **Expected**: Tab moves to the target zone, removed from source zone

### ✅ Test 5: Drop Detection Visual Feedback
**Goal**: Verify different drop modes show different colors

**Colors**:
- **Blue**: "Add as Tab" (center 50% of zone)
- **Primary**: "Move Here" (edge of zone)
- **Green**: "Split Horizontal" (US4 - not yet implemented)
- **Purple**: "Split Vertical" (US4 - not yet implemented)

## Known Issues

None currently - all US3 functionality implemented!

## Implementation Status

- ✅ Center drop zone detection (25%-75% on both axes)
- ✅ Tab mode in drag end handler
- ✅ addTabToZone action (already existed)
- ✅ Tab switching (already existed)
- ✅ Active tab rendering (already existed)
- ✅ Draggable tabs (made Tab component draggable)
- ✅ Visual indicators with colors

## Next Steps (US4)

- Split zones (horizontal/vertical)
- Edge detection for split modes
- Resizable splitters
