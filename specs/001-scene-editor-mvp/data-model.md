# Data Model: Scene Editor MVP

**Feature**: 001-scene-editor-mvp  
**Date**: 2025-11-10  
**Purpose**: Define core entities, relationships, and validation rules

## Entity Diagrams

```
Scene
  └─ gameObjects: GameObject[]
  └─ activeCamera: Camera
  └─ settings: SceneSettings

GameObject
  ├─ id: UUID (unique identifier)
  ├─ name: string (display name)
  ├─ parent: GameObject | null (hierarchy)
  ├─ children: GameObject[] (hierarchy)
  └─ components: Component[] (behaviors)

Component (abstract)
  ├─ id: UUID
  ├─ type: string (discriminator)
  ├─ gameObject: GameObject (parent ref)
  └─ enabled: boolean

Transform extends Component
  ├─ position: Vector3
  ├─ rotation: Euler
  └─ scale: Vector3

MeshRenderer extends Component
  ├─ geometry: GeometryType
  ├─ color: Color
  └─ visible: boolean

EditorState
  ├─ mode: 'edit' | 'play'
  ├─ selectedId: UUID | null
  └─ playStateSnapshot: Scene | null
```

## Core Entities

### GameObject

Represents a game entity in the scene. Container for components.

**Properties**:
- `id: string` - UUID v4, immutable after creation
- `name: string` - Display name, mutable, not required unique (clarification Q3)
- `parent: string | null` - Parent GameObject ID for hierarchy, null for root objects
- `children: string[]` - Child GameObject IDs, computed from parent relationships
- `components: Component[]` - Attached component instances

**Validation Rules**:
- `id` must be valid UUID v4 format
- `name` must be non-empty string, max 64 characters
- `parent` must reference existing GameObject or be null
- `components` must contain at least one Transform component (auto-added on creation)
- Circular parent references forbidden (A parent of B, B parent of A)

**State Transitions**:
```
[Create] → Active
Active → [Select] → Selected
Active → [Delete] → Deleted
Selected → [Deselect] → Active
Edit Mode → [Play] → Play Mode (snapshot taken)
Play Mode → [Stop] → Edit Mode (reverted from snapshot)
```

**Lifecycle**:
1. **Creation**: `GameObject.create(name?)` → assigns UUID, adds default Transform
2. **Selection**: Updates `editorStore.selectedId`
3. **Deletion**: Removes from scene hierarchy, deletes all children recursively (FR-006, FR-007)
4. **Serialization**: Exports to JSON with all components

**Invariants**:
- Every GameObject MUST have exactly one Transform component
- GameObject names auto-increment if duplicate (e.g., "GameObject (1)") per clarification Q3
- Deletion of parent cascades to children

### Component (Abstract Base)

Base class for all component types. Provides serialization interface.

**Properties**:
- `id: string` - UUID v4
- `type: string` - Discriminator for deserialization (e.g., "Transform", "MeshRenderer")
- `gameObject: GameObject` - Parent GameObject reference (not serialized, reconstructed on load)
- `enabled: boolean` - Whether component is active (default: true)

**Abstract Methods**:
```typescript
abstract serialize(): Record<string, unknown>;
abstract deserialize(data: Record<string, unknown>): void;
update?(deltaTime: number): void; // Optional, called in play mode
```

**Validation Rules**:
- `type` must match registered component type
- `gameObject` reference must be valid during runtime

**Lifecycle**:
1. **Initialization**: `component.init()` called after deserialization
2. **Update**: `component.update(dt)` called each frame in play mode (if implemented)
3. **Destruction**: `component.destroy()` called on GameObject deletion

### Transform Component

Stores position, rotation, and scale. Every GameObject has exactly one.

**Properties**:
- `position: Vector3` - World position { x, y, z }, default: (0, 0, 0)
- `rotation: Euler` - Rotation in Euler angles { x, y, z } radians, default: (0, 0, 0)
- `scale: Vector3` - Scale factors { x, y, z }, default: (1, 1, 1)

**Validation Rules** (FR-014, FR-015, FR-016):
- `position.x/y/z` must be finite numbers (no NaN, Infinity)
- `rotation.x/y/z` must be finite numbers
- `scale.x/y/z` must be positive numbers (> 0) - negative scale forbidden per clarification Q5
- All numeric inputs validated with visual feedback (red border on invalid)

**Serialization**:
```json
{
  "type": "Transform",
  "position": { "x": 0, "y": 1, "z": 0 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "scale": { "x": 1, "y": 1, "z": 1 }
}
```

**Operations**:
- `setPosition(x, y, z)` - Updates position, triggers scene re-render
- `setRotation(x, y, z)` - Updates rotation
- `setScale(x, y, z)` - Updates scale, validates > 0

### MeshRenderer Component

Provides visual representation with geometry and material.

**Properties**:
- `geometry: GeometryType` - Enum: 'cube' | 'sphere' | 'plane', default: 'cube'
- `color: string` - Hex color string (e.g., "#ff0000"), default: "#808080"
- `visible: boolean` - Render visibility toggle, default: true

**Validation Rules**:
- `geometry` must be one of allowed types
- `color` must be valid hex color format (#RRGGBB)
- `visible` must be boolean

**Serialization**:
```json
{
  "type": "MeshRenderer",
  "geometry": "cube",
  "color": "#ff0000",
  "visible": true
}
```

**Operations**:
- `setGeometry(type)` - Changes geometry, triggers scene update
- `setColor(hex)` - Updates material color
- `setVisible(bool)` - Toggles rendering

### Scene

Top-level container for entire game world.

**Properties**:
- `version: string` - Serialization format version (e.g., "1.0.0")
- `gameObjects: GameObject[]` - Flat array of all GameObjects
- `rootIds: string[]` - IDs of root-level GameObjects (parent === null)
- `metadata: SceneMetadata` - Created date, modified date, name

**Validation Rules**:
- `version` must match current serialization version (migration required if mismatch)
- `gameObjects` IDs must be unique
- All parent references must point to existing GameObjects

**Serialization**:
```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "Untitled Scene",
    "created": "2025-11-10T12:00:00Z",
    "modified": "2025-11-10T12:30:00Z"
  },
  "gameObjects": [
    {
      "id": "uuid-1",
      "name": "GameObject",
      "parent": null,
      "components": [...]
    }
  ]
}
```

**Operations**:
- `addGameObject(name?)` - Creates new GameObject, adds to scene (FR-002)
- `removeGameObject(id)` - Deletes GameObject and children (FR-006)
- `serialize()` - Exports to JSON (FR-028)
- `deserialize(json)` - Loads from JSON

### EditorState

UI state separate from scene data.

**Properties**:
- `mode: 'edit' | 'play'` - Current editor mode (FR-025)
- `selectedId: string | null` - Currently selected GameObject ID (FR-010)
- `playStateSnapshot: Scene | null` - Scene snapshot taken on Play, used for Stop reversion (FR-026)
- `showGrid: boolean` - Grid visibility toggle
- `cameraPosition: Vector3` - Saved camera position
- `cameraTarget: Vector3` - Saved camera look-at target

**Operations**:
- `setMode(mode)` - Switches between edit/play (FR-022, FR-024)
- `selectGameObject(id)` - Updates selection (FR-010)
- `clearSelection()` - Deselects all

## Relationships

### Hierarchy (GameObject ↔ GameObject)
- **Type**: Tree structure (parent-child)
- **Cardinality**: One parent, many children
- **Constraint**: No circular references
- **Cascade**: Delete parent → delete all children
- **Implementation**: `parent: string | null` on each GameObject

### Composition (GameObject → Component)
- **Type**: Composition (strong ownership)
- **Cardinality**: One GameObject, many Components
- **Constraint**: At least one Transform required
- **Cascade**: Delete GameObject → delete all Components
- **Implementation**: `components: Component[]` array on GameObject

### Selection (EditorState → GameObject)
- **Type**: Reference (weak)
- **Cardinality**: Zero or one selected GameObject
- **Constraint**: Selected ID must exist in scene
- **Cascade**: Delete selected GameObject → clear selection
- **Implementation**: `selectedId: string | null` in EditorState

## Validation Schemas (Zod)

### GameObject Schema
```typescript
const gameObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(64),
  parent: z.string().uuid().nullable(),
  components: z.array(componentSchema).min(1)
});
```

### Transform Schema
```typescript
const vector3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite()
});

const transformSchema = z.object({
  type: z.literal('Transform'),
  position: vector3Schema,
  rotation: vector3Schema,
  scale: z.object({
    x: z.number().positive(),
    y: z.number().positive(),
    z: z.number().positive()
  })
});
```

### MeshRenderer Schema
```typescript
const meshRendererSchema = z.object({
  type: z.literal('MeshRenderer'),
  geometry: z.enum(['cube', 'sphere', 'plane']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  visible: z.boolean()
});
```

### Scene Schema
```typescript
const sceneSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  metadata: z.object({
    name: z.string(),
    created: z.string().datetime(),
    modified: z.string().datetime()
  }),
  gameObjects: z.array(gameObjectSchema)
});
```

## Data Flow

### Create GameObject Flow
```
User clicks "Add GameObject" button
  → editorStore.addGameObject()
  → Generate UUID + default name
  → Create Transform component
  → Add to sceneStore.gameObjects[]
  → Auto-select new GameObject
  → Trigger React re-render
  → R3F renders new mesh in viewport
```

### Update Property Flow
```
User edits position.x in Inspector
  → React Hook Form validates input (Zod)
  → If valid: updateTransform(id, { position: { x } })
  → sceneStore updates GameObject.components[0].position.x
  → React re-renders Inspector (optimistic update)
  → R3F re-renders mesh with new position
  → Elapsed time < 16ms (FR-013)
```

### Save Scene Flow
```
User clicks "Save Scene" button
  → SceneSerializer.serialize(scene)
  → Iterate gameObjects, call component.serialize()
  → Generate JSON with version field
  → StorageService.save(key, json)
  → localStorage.setItem('scene', json)
  → Show success toast notification (FR-031)
```

### Load Scene Flow
```
User clicks "Load Scene" button
  → StorageService.load('scene')
  → localStorage.getItem('scene')
  → Parse JSON
  → Validate with sceneSchema
  → SceneSerializer.deserialize(json)
  → Create GameObjects, reconstruct hierarchy
  → Instantiate components via type discriminator
  → Replace sceneStore state
  → Clear editor selection
  → Show success toast (FR-031)
```

### Play Mode Flow
```
User clicks "Play" button
  → editorStore.setMode('play')
  → Snapshot current scene: JSON.parse(JSON.stringify(scene))
  → Store in editorStore.playStateSnapshot
  → Start render loop: components.forEach(c => c.update?.(dt))
  → Disable Inspector editing (FR-027)
  → Show "Playing" indicator (FR-025)

User clicks "Stop" button
  → editorStore.setMode('edit')
  → Restore from playStateSnapshot
  → sceneStore.replaceScene(snapshot)
  → Stop render loop
  → Enable Inspector editing
  → Show "Edit" indicator
```

## Storage

### LocalStorage Keys
- `scene:current` - Current active scene JSON
- `scene:autosave` - Auto-saved backup (future)
- `editor:preferences` - UI preferences (future)

### Size Constraints
- localStorage limit: 5-10 MB (browser-dependent)
- Target: <1MB per scene for 50 GameObjects
- Monitor usage, warn at 80% capacity

### Migration Strategy
Scene JSON includes `version` field. On load:
1. Check version against current
2. If mismatch, run migration function
3. Update version field
4. Save migrated scene

Example migration:
```typescript
if (sceneData.version === '1.0.0' && CURRENT_VERSION === '1.1.0') {
  // Add new 'visible' property to all MeshRenderers
  sceneData.gameObjects.forEach(go => {
    go.components.forEach(c => {
      if (c.type === 'MeshRenderer' && !('visible' in c)) {
        c.visible = true;
      }
    });
  });
  sceneData.version = '1.1.0';
}
```

## Performance Considerations

### Data Structure Choices
- **Flat array vs tree**: Store GameObjects in flat array with parent IDs, compute tree on-demand
  - Rationale: Easier serialization, faster iteration for updates
- **Component array vs map**: Array for components (typically <5 per GameObject)
  - Rationale: Small count, array iteration faster than Map lookup
- **Immutable updates**: Use Immer for nested scene updates
  - Rationale: Simplifies Zustand store updates, prevents mutation bugs

### Optimization Targets
- GameObject lookup by ID: O(1) via Map cache (built on scene load)
- Hierarchy traversal: O(n) for n children (acceptable for <50 objects)
- Serialization: O(n) for n GameObjects (target: <100ms for 50 objects)
- Component update loop: O(n×m) for n objects × m components (16ms budget)

### Memoization Strategy
- `getGameObjectById`: Memoized with Map cache
- `getRootGameObjects`: Memoized, recompute on hierarchy change
- `getSelectedGameObject`: Zustand selector with shallow comparison

## Edge Cases

### Deleting Selected GameObject
When user deletes currently selected GameObject:
1. Remove from scene
2. Clear selection: `editorStore.selectedId = null`
3. Inspector shows "No selection" placeholder

### Deleting GameObject in Play Mode
Per clarification Q4 edge case, behavior TBD. Recommendation:
- **Option A**: Prevent deletion, show "Cannot delete in play mode" error
- **Option B**: Allow deletion, modify snapshot so Stop doesn't restore it
- **Decision deferred to implementation**: Mark in code with TODO

### Invalid Parent Reference
If deserialized scene has GameObject with non-existent parent ID:
1. Log validation error
2. Set parent to null (make it root GameObject)
3. Continue loading rest of scene
4. Show warning toast: "Scene partially corrupted, some hierarchy lost"

### Component Type Mismatch
If scene JSON contains unrecognized component type:
1. Log warning
2. Skip component (don't instantiate)
3. Continue loading rest of GameObject
4. User loses unrecognized component on save (acceptable for MVP)

### Scale = 0 Edge Case
User tries to set scale to 0:
1. Input validation prevents (scale.min(0.001) in Zod schema)
2. Show error message: "Scale must be greater than 0"
3. Red border on input field
4. Previous valid value retained

## Future Extensions (Post-MVP)

- **Parent-child transform inheritance** (local vs world space)
- **Component dependencies** (e.g., Rigidbody requires Collider)
- **Prefab system** (reusable GameObject templates)
- **Component removal** (currently only add is supported)
- **Custom component types** (user-defined scripts)
- **Scene graph optimization** (spatial indexing for large scenes)
