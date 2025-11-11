# Data Model: Docking Panel System

**Feature**: 003-docking-panel-system  
**Date**: 2025-11-11  
**Purpose**: Define panel, zone, and layout entities with relationships and validation

## Entity Diagrams

```
Layout
  └─ rootZone: Zone (tree structure)
  └─ version: string
  └─ timestamp: number

Zone (Recursive Tree)
  ├─ id: string (UUID)
  ├─ type: 'leaf' | 'split'
  ├─ For 'leaf' zones:
  │   ├─ panels: string[] (panel IDs)
  │   └─ activePanel: string (active tab)
  ├─ For 'split' zones:
  │   ├─ orientation: 'horizontal' | 'vertical'
  │   ├─ children: [Zone, Zone] (exactly 2)
  │   └─ sizes: [number, number] (ratios 0-1, sum to 1)

Panel
  ├─ id: string (unique identifier)
  ├─ type: PanelType ('hierarchy' | 'scene' | 'game' | 'code' | 'inspector' | 'console' | 'assets')
  ├─ title: string (display name)
  ├─ icon: IconType
  └─ component: React.ComponentType

DragState
  ├─ draggedPanelId: string | null
  ├─ sourceZoneId: string | null
  ├─ dropTargetZoneId: string | null
  ├─ dropMode: 'move' | 'tab' | 'split-h' | 'split-v' | null
  └─ mousePosition: { x: number, y: number }
```

## Core Entities

### Panel

Represents a UI component that can be docked in zones.

**Properties**:
- `id: string` - Unique identifier (UUID v4), immutable
- `type: PanelType` - Panel type discriminator, one of: 'hierarchy' | 'scene' | 'game' | 'code' | 'inspector' | 'console' | 'assets'
- `title: string` - Display name shown in header and tabs
- `icon: IconType` - Icon component reference (from lucide-react)
- `component: React.ComponentType` - React component to render as panel content
- `defaultZone?: string` - Optional default zone ID for initial placement

**Validation Rules**:
- `id` must be valid UUID v4 format
- `type` must be one of allowed PanelType values
- `title` must be non-empty string, max 32 characters
- `icon` must be valid React component
- `component` must be valid React component

**State Transitions**:
```
[Register] → Registered
Registered → [Mount in Zone] → Visible
Visible → [Drag Start] → Dragging
Dragging → [Drop Success] → Visible (in new zone)
Dragging → [Drop Cancel] → Visible (in original zone)
Visible → [Tab Switch] → Hidden (in background)
Hidden → [Tab Click] → Visible (active)
```

**Panel Types & Icons**:
```typescript
const PANEL_DEFINITIONS = {
  hierarchy: {
    title: 'Hierarchy',
    icon: List,           // lucide-react
    component: HierarchyPanel
  },
  scene: {
    title: 'Scene',
    icon: Box,
    component: SceneViewport
  },
  game: {
    title: 'Game',
    icon: Play,
    component: GameViewport
  },
  code: {
    title: 'Code',
    icon: Code2,
    component: CodeEditorPanel
  },
  inspector: {
    title: 'Inspector',
    icon: Settings,
    component: InspectorPanel
  },
  console: {
    title: 'Console',
    icon: Terminal,
    component: ConsolePanel
  },
  assets: {
    title: 'Assets',
    icon: FolderOpen,
    component: AssetsPanel
  }
};
```

**Invariants**:
- Panel ID must be unique across all zones
- Panel can only exist in one zone at a time
- Panel type determines which component is rendered

### Zone

Represents a region of the editor that contains panels or other zones.

**Properties**:
- `id: string` - UUID v4, immutable after creation
- `type: 'leaf' | 'split'` - Zone type discriminator

**For Leaf Zones** (contain panels):
- `panels: string[]` - Array of panel IDs in this zone
- `activePanel: string | null` - Currently active panel (for tabs), null if panels is empty

**For Split Zones** (contain child zones):
- `orientation: 'horizontal' | 'vertical'` - Split direction
- `children: [Zone, Zone]` - Exactly 2 child zones (tuple)
- `sizes: [number, number]` - Size ratios for children, values 0-1, must sum to 1.0

**Validation Rules**:
- `id` must be valid UUID v4
- `type` must be 'leaf' or 'split'
- For leaf zones:
  - `panels` must be array of valid panel IDs
  - `activePanel` must be in `panels` array or null
  - If `panels.length === 1`, `activePanel` must equal `panels[0]`
  - If `panels.length > 1`, `activePanel` must be set (no null)
- For split zones:
  - `orientation` must be 'horizontal' or 'vertical'
  - `children` must be array with exactly 2 zones
  - `sizes` must be array of 2 numbers
  - `sizes[0] + sizes[1]` must equal 1.0 (within 0.001 tolerance)
  - Each size must be >= 0.1 (minimum 10% zone size)
  - Child zones must have valid `id` values

**State Transitions**:
```
[Create Leaf] → Leaf (empty)
Leaf (empty) → [Add Panel] → Leaf (single panel)
Leaf (single) → [Add Panel as Tab] → Leaf (multi-panel)
Leaf (multi) → [Remove Panel] → Leaf (single or multi)
Leaf (single) → [Remove Last Panel] → Delete Zone
Leaf → [Split] → Split Zone (with 2 leaf children)
Split → [Resize] → Split (with updated sizes)
Split → [Remove Child] → Collapse to remaining child
```

**Lifecycle**:
1. **Creation**: New zones created when splitting or from default layout
2. **Panel Addition**: Add panel ID to `panels` array, set as `activePanel` if first or only
3. **Panel Removal**: Remove panel ID, update `activePanel` if it was removed
4. **Splitting**: Convert leaf to split, create two child leaf zones, move panels to one child
5. **Collapsing**: When split has only one child (other removed), collapse to child zone
6. **Deletion**: Zone deleted when empty and not root

**Invariants**:
- Root zone always exists (ID: 'root')
- At least one leaf zone must exist with at least one panel (prevent empty editor)
- Split zones always have exactly 2 children
- Leaf zones can have 0-N panels
- Zone tree must be valid (no cycles, no orphans)

### Layout

Top-level container for entire editor workspace configuration.

**Properties**:
- `version: string` - Serialization format version (e.g., "1.0.0")
- `rootZone: Zone` - Root zone of the tree (ID must be 'root')
- `timestamp: number` - Unix timestamp of last modification

**Validation Rules**:
- `version` must match semantic version pattern (e.g., "1.0.0")
- `rootZone` must be valid Zone (passes Zone validation)
- `rootZone.id` must equal 'root'
- `timestamp` must be positive integer

**Serialization**:
```json
{
  "version": "1.0.0",
  "timestamp": 1699488000000,
  "rootZone": {
    "id": "root",
    "type": "split",
    "orientation": "vertical",
    "sizes": [0.75, 0.25],
    "children": [
      {
        "id": "top-split",
        "type": "split",
        "orientation": "horizontal",
        "sizes": [0.2, 0.6, 0.2],
        "children": [
          {
            "id": "left-zone",
            "type": "leaf",
            "panels": ["hierarchy"],
            "activePanel": "hierarchy"
          },
          {
            "id": "center-zone",
            "type": "leaf",
            "panels": ["scene"],
            "activePanel": "scene"
          },
          {
            "id": "right-zone",
            "type": "leaf",
            "panels": ["inspector"],
            "activePanel": "inspector"
          }
        ]
      },
      {
        "id": "bottom-zone",
        "type": "leaf",
        "panels": ["console", "assets"],
        "activePanel": "console"
      }
    ]
  }
}
```

**Operations**:
- `serialize()` - Convert Layout to JSON
- `deserialize(json)` - Load Layout from JSON with validation
- `getDefaultLayout()` - Returns the default layout configuration
- `validateLayout()` - Checks layout integrity (no orphans, valid tree, at least one panel)

### DragState

Represents the current drag operation state.

**Properties**:
- `draggedPanelId: string | null` - ID of panel being dragged, null when not dragging
- `sourceZoneId: string | null` - ID of zone where drag started
- `dropTargetZoneId: string | null` - ID of zone where panel will be dropped
- `dropMode: DropMode | null` - How panel will be dropped: 'move' | 'tab' | 'split-h' | 'split-v' | null
- `mousePosition: { x: number, y: number }` - Current mouse coordinates

**Validation Rules**:
- All fields nullable (null when no drag operation)
- When `draggedPanelId` is not null:
  - `sourceZoneId` must be valid zone ID
  - `dropTargetZoneId` must be valid zone ID or null (no valid drop target)
  - `dropMode` must be valid DropMode or null
  - `mousePosition` must have finite x/y coordinates
- When `draggedPanelId` is null, all other fields must be null

**State Transitions**:
```
Idle (all null) → [Drag Start] → Dragging
Dragging → [Mouse Move] → Dragging (updated position/target)
Dragging → [Drop Success] → Idle (commit layout change)
Dragging → [Drop Cancel] → Idle (revert)
Dragging → [Escape Key] → Idle (revert)
```

**Drop Modes**:
- `move`: Replace target zone's panels with dragged panel (zone becomes single-panel)
- `tab`: Add dragged panel to target zone's panels (create or join tab group)
- `split-h`: Split target zone horizontally, create new zone with dragged panel
- `split-v`: Split target zone vertically, create new zone with dragged panel

**Lifecycle**:
1. **Drag Start**: User mousedown on panel header
   - Set `draggedPanelId`, `sourceZoneId`
   - Capture initial `mousePosition`
2. **Drag Move**: User moves mouse (throttled to 60 FPS)
   - Update `mousePosition`
   - Calculate drop target via collision detection
   - Determine `dropMode` based on mouse position within target zone
   - Update `dropTargetZoneId` and `dropMode`
3. **Drop**: User releases mouse
   - If `dropTargetZoneId` is valid, commit layout change based on `dropMode`
   - Reset all DragState fields to null
4. **Cancel**: User presses Escape or releases outside valid zones
   - Reset all fields to null, no layout change

## Relationships

### Layout → Zone (Composition)
- **Type**: Tree structure (root-child hierarchy)
- **Cardinality**: One root zone, many child zones (recursive)
- **Constraint**: Must form valid tree (no cycles)
- **Cascade**: Delete layout → delete all zones
- **Implementation**: `rootZone: Zone` with recursive `children` arrays

### Zone → Panel (Reference)
- **Type**: Reference (weak - panels defined separately)
- **Cardinality**: Zero or many panels per leaf zone
- **Constraint**: Panel ID must exist in PanelRegistry
- **Cascade**: Delete zone → panels become orphaned (available for other zones)
- **Implementation**: `panels: string[]` array of panel IDs

### Zone ↔ Zone (Parent-Child)
- **Type**: Tree hierarchy (split zones have child zones)
- **Cardinality**: Split zone has exactly 2 children
- **Constraint**: Children must be valid zones
- **Cascade**: Delete parent → delete children (recursive)
- **Implementation**: `children: [Zone, Zone]` tuple for split zones

### DragState → Panel (Reference)
- **Type**: Temporary reference during drag
- **Cardinality**: Zero or one dragged panel
- **Constraint**: Panel ID must exist in some zone
- **Cascade**: None (DragState is ephemeral)
- **Implementation**: `draggedPanelId: string | null`

### DragState → Zone (Reference)
- **Type**: Temporary reference during drag
- **Cardinality**: One source zone, zero or one target zone
- **Constraint**: Zone IDs must exist in layout
- **Cascade**: None
- **Implementation**: `sourceZoneId`, `dropTargetZoneId`

## Validation Schemas (Zod)

### Panel Schema
```typescript
const panelTypeSchema = z.enum([
  'hierarchy', 'scene', 'game', 'code', 
  'inspector', 'console', 'assets'
]);

const panelMetadataSchema = z.object({
  id: z.string().uuid(),
  type: panelTypeSchema,
  title: z.string().min(1).max(32),
  defaultZone: z.string().uuid().optional()
});
```

### Zone Schema
```typescript
const leafZoneSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('leaf'),
  panels: z.array(z.string()),
  activePanel: z.string().nullable()
}).refine(
  (data) => !data.activePanel || data.panels.includes(data.activePanel),
  { message: "activePanel must be in panels array or null" }
).refine(
  (data) => data.panels.length === 0 || data.activePanel !== null,
  { message: "activePanel must be set when panels exist" }
);

const splitZoneSchema: z.ZodType<SplitZone> = z.object({
  id: z.string().uuid(),
  type: z.literal('split'),
  orientation: z.enum(['horizontal', 'vertical']),
  children: z.tuple([
    z.lazy(() => zoneSchema),
    z.lazy(() => zoneSchema)
  ]),
  sizes: z.tuple([
    z.number().min(0.1).max(0.9),
    z.number().min(0.1).max(0.9)
  ])
}).refine(
  (data) => Math.abs(data.sizes[0] + data.sizes[1] - 1.0) < 0.001,
  { message: "sizes must sum to 1.0" }
);

const zoneSchema = z.discriminatedUnion('type', [
  leafZoneSchema,
  splitZoneSchema
]);
```

### Layout Schema
```typescript
const layoutSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  timestamp: z.number().int().positive(),
  rootZone: zoneSchema.refine(
    (zone) => zone.id === 'root',
    { message: "rootZone must have id 'root'" }
  )
});
```

### DragState Schema
```typescript
const dropModeSchema = z.enum(['move', 'tab', 'split-h', 'split-v']);

const dragStateSchema = z.object({
  draggedPanelId: z.string().nullable(),
  sourceZoneId: z.string().uuid().nullable(),
  dropTargetZoneId: z.string().uuid().nullable(),
  dropMode: dropModeSchema.nullable(),
  mousePosition: z.object({
    x: z.number().finite(),
    y: z.number().finite()
  })
}).refine(
  (data) => {
    const isDragging = data.draggedPanelId !== null;
    const hasSource = data.sourceZoneId !== null;
    return isDragging === hasSource;
  },
  { message: "draggedPanelId and sourceZoneId must both be null or both be set" }
);
```

## Data Flow

### Default Layout Initialization Flow
```
App starts
  → layoutStore.init()
  → Check localStorage for saved layout
  → If found: deserialize and validate
  → If not found or invalid: getDefaultLayout()
  → Set rootZone in layoutStore
  → DockingLayout renders zones recursively
  → Each leaf zone renders panels from PanelRegistry
```

### Drag Panel Flow
```
User mousedown on panel header
  → onDragStart(panelId, zoneId)
  → layoutStore.setDragState({ draggedPanelId, sourceZoneId, mousePosition })
  → Show drag overlay (semi-transparent panel)

User moves mouse (throttled 60 FPS)
  → onDragMove(mousePosition)
  → Calculate collision with all leaf zones
  → Determine dropTargetZoneId and dropMode
  → layoutStore.updateDragState({ dropTargetZoneId, dropMode, mousePosition })
  → Highlight drop zone with overlay

User releases mouse
  → onDragEnd()
  → Read dragState from layoutStore
  → If dropTargetZoneId exists:
    → layoutStore.commitDragOperation()
    → Update zone tree based on dropMode
    → Animate layout transition (300ms)
  → Else:
    → Animate panel back to source (200ms)
  → layoutStore.clearDragState()
  → Save layout to localStorage (debounced 500ms)
```

### Add Panel as Tab Flow
```
User drags Panel A over Panel B's center
  → dropMode = 'tab'
  → User releases mouse
  → layoutStore.commitDragOperation()
  → Get target zone (contains Panel B)
  → Add Panel A's ID to zone.panels array
  → Set zone.activePanel = Panel A's ID
  → Remove Panel A from source zone
  → If source zone now empty, delete it (if not root)
  → Trigger re-render with TabBar for target zone
  → Save layout
```

### Split Zone Flow
```
User drags Panel A over Zone B's left edge
  → dropMode = 'split-h'
  → User releases mouse
  → layoutStore.commitDragOperation()
  → Get target zone
  → Create two new child zones: newLeft, newRight
  → newLeft.panels = [Panel A's ID]
  → newRight = copy of target zone's current state
  → Convert target zone to split:
    → type = 'split'
    → orientation = 'horizontal'
    → children = [newLeft, newRight]
    → sizes = [0.3, 0.7] (default split ratio)
  → Remove Panel A from source zone
  → Trigger re-render with new split layout
  → Save layout
```

### Tab Switch Flow
```
User clicks on Tab B in zone with multiple panels
  → onTabClick(zoneId, panelId)
  → layoutStore.setActiveTab(zoneId, panelId)
  → Find zone in tree
  → Set zone.activePanel = panelId
  → Trigger re-render
  → Only Panel B's content renders (others unmounted)
  → Tab B highlighted in TabBar
```

### Resize Split Flow
```
User drags splitter between zones
  → onSplitterDrag(zoneId, delta)
  → layoutStore.updateZoneSizes(zoneId, delta)
  → Find split zone
  → Calculate new sizes: [size1 + delta, size2 - delta]
  → Clamp to min/max (0.1 to 0.9)
  → Normalize to sum to 1.0
  → Update zone.sizes
  → Trigger re-render with new sizes
  → Apply via CSS flex-basis or grid-template-columns
  → Debounce localStorage save
```

## Storage

### LocalStorage Keys
- `editor:layout:v1` - Current layout configuration (JSON)
- `editor:layout:backup` - Backup of last known good layout (future)

### Size Constraints
- Target: <5KB per layout (very small - just zone tree structure)
- localStorage limit: 5-10MB (more than sufficient)
- Layout includes only IDs and structure, not panel component code

### Migration Strategy
Layout includes `version` field. On load:
1. Parse JSON from localStorage
2. Check `version` field
3. If version < current, run migration function
4. Update `version` to current
5. Save migrated layout

Example migration:
```typescript
if (layout.version === '1.0.0' && CURRENT_VERSION === '1.1.0') {
  // Add new 'game' panel to default zones if present
  const addGamePanel = (zone: Zone): Zone => {
    if (zone.type === 'leaf' && zone.panels.includes('scene')) {
      return { ...zone, panels: [...zone.panels, 'game'] };
    }
    if (zone.type === 'split') {
      return {
        ...zone,
        children: [
          addGamePanel(zone.children[0]),
          addGamePanel(zone.children[1])
        ] as [Zone, Zone]
      };
    }
    return zone;
  };
  layout.rootZone = addGamePanel(layout.rootZone);
  layout.version = '1.1.0';
}
```

### Backup & Recovery
- On every successful layout save, keep previous layout as backup
- If current layout fails validation, attempt to load backup
- If backup also fails, fall back to default layout
- Log errors to console for debugging

## Performance Considerations

### Data Structure Choices
- **Zone Tree**: Recursive structure with pointers (IDs) for flexibility
  - Rationale: Easy to traverse, modify, serialize
  - Trade-off: Traversal is O(n) but n is small (<20 zones expected)
- **Panel Array**: Simple array in leaf zones
  - Rationale: Small count (<5 panels per zone), array iteration fast
- **Zone Lookup**: Build ID->Zone Map on layout load for O(1) access
  - Rationale: Faster than tree traversal during drag operations

### Optimization Targets
- Zone lookup by ID: O(1) via Map cache
- Zone tree traversal: O(n) for n zones (acceptable for <20 zones)
- Panel render: O(1) - only active panel content rendered
- Drag update: O(n) for collision detection with n zones, throttled to 60 FPS
- Layout transition animation: 300ms target via CSS transforms

### Memoization Strategy
- `getZoneById`: Memoized with Map cache, rebuilt on layout change
- `getRootZone`: Selector from store, no memoization needed
- Panel components: React.memo to prevent re-renders when not affected
- TabBar: React.memo, only re-renders when zone's panels/activePanel change

## Edge Cases

### Dragging Last Panel from Zone
When user drags the only panel from a zone:
1. If zone is not root: Delete zone after drag completes
2. If zone is root: Prevent drag (must have at least one panel in editor)
3. Show warning toast: "Cannot remove last panel"

### Splitting Zone with Multiple Tabs
When user splits a zone that has multiple tabs:
1. New zone gets only the dragged panel
2. Original zone keeps all remaining tabs
3. If original zone had dragged panel as active, set activePanel to first remaining tab

### Invalid Panel ID in Saved Layout
If deserialized layout references non-existent panel IDs:
1. Log warning to console
2. Filter out invalid panel IDs from zone.panels arrays
3. If zone.activePanel is invalid, set to first valid panel or null
4. If zone becomes empty (all panels invalid), delete zone
5. If deletion leaves invalid tree, fall back to default layout

### Browser Window Too Small
If browser window is smaller than minimum panel sizes:
1. Panels scale down to minimum (200px width, 150px height)
2. Layout may overflow and show scrollbars (acceptable)
3. Responsive behavior: Consider collapsing panels to icon-only mode (future)

### Rapid Drag Operations
If user drags multiple panels quickly:
1. Throttle drag updates to 60 FPS (16ms)
2. Debounce layout saves to 500ms after last change
3. Cancel ongoing drag if new drag starts (shouldn't happen but safeguard)

### Concurrent Modifications (Future)
If layout changes while dragging (e.g., from another window):
1. MVP: Assume single window, ignore
2. Future: Add version/timestamp check, prompt user to reload or keep local changes

## Future Extensions (Post-MVP)

- **Panel Floating**: Detach panels into separate browser windows (Window API)
- **Panel Minimization**: Collapse panels to icon-only strip (save space)
- **Custom Panel Registration**: API for plugins to add new panel types
- **Layout Presets**: Save/load multiple named layouts ("Debug", "Design", "Code")
- **Keyboard Shortcuts**: Focus panel by hotkey (Ctrl+1-7), cycle tabs (Ctrl+Tab)
- **Touch Support**: Drag on mobile/tablet devices
- **Accessibility**: Full keyboard navigation, screen reader support
- **Collaborative Layouts**: Sync layout across team members (requires backend)
