# Feature Specification: Asset System & Custom Components

**Feature Branch**: `002-asset-system`  
**Created**: 2025-11-10  
**Status**: Draft  
**Prerequisites**: 001-scene-editor-mvp (Phase 1-6 complete)
**Input**: User request: "j'aimerais rajouter un system ou l'utilisateur peut ajouter des assets depuis sont ordinateur /model3D/code ... quand et rajouter des composant qui utilise ces asset pour faire des trucs par un exmaple composant code permet de compiler du code si component est un game object on execute sont code"

## Clarifications

### Session 2025-11-10

- Q: Should code execution happen in a sandbox or have access to the full scene API? → **NEEDS CLARIFICATION**
- Q: What 3D model formats should be supported (.glb, .gltf, .obj, .fbx)? → **NEEDS CLARIFICATION**
- Q: Should uploaded assets be stored in localStorage or IndexedDB? → **NEEDS CLARIFICATION**
- Q: How should code errors be displayed to the user during execution? → **NEEDS CLARIFICATION**
- Q: Should code components support TypeScript or only JavaScript? → **NEEDS CLARIFICATION**

## Implementation Details

### Asset Management System

**Supported Asset Types**:
1. **3D Models**: .glb, .gltf (priority), .obj (optional)
2. **Scripts/Code**: .js, .ts files containing component logic
3. **Future**: Textures, audio, animations (post-MVP)

**Asset Upload Flow**:
- Drag-and-drop zone in new "Assets" panel (bottom or side)
- File browser button as alternative
- Progress indicator for large files
- Automatic file validation and preview generation
- Asset library showing thumbnails with metadata

**Asset Storage**:
- IndexedDB for binary files (models, textures)
- localStorage for small text files (scripts < 100KB)
- Automatic cleanup of unused assets
- Export/import asset bundles (future)

### Custom Code Component System

**CodeComponent Architecture**:
- User writes JavaScript/TypeScript code in editor
- Code has access to:
  - `this.gameObject` - Parent GameObject reference
  - `this.transform` - Quick access to Transform component
  - `this.scene` - Access to scene API (with limitations)
  - Standard lifecycle hooks: `start()`, `update(deltaTime)`, `onDestroy()`

**Code Editor Integration**:
- Monaco Editor (VS Code editor) embedded in Inspector
- Syntax highlighting for JavaScript/TypeScript
- Basic autocomplete for scene API
- Error highlighting in real-time
- Save code to asset library

**Code Execution**:
- Transpile TypeScript to JavaScript using Babel/SWC
- Execute in isolated context (limited `eval` or Web Worker)
- Runtime error catching with user-friendly messages
- Performance monitoring (execution time per frame)
- Sandbox restrictions: no DOM manipulation, no network requests (configurable)

### Model3D Component

**Model3DComponent**:
- References uploaded 3D model asset from library
- Replaces or extends MeshRenderer functionality
- Properties:
  - `modelAsset: AssetReference` - Reference to uploaded model
  - `scale: number` - Uniform scale multiplier
  - `animations: AnimationClip[]` - Available animations
  - `playAnimation: string | null` - Currently playing animation
  
**Integration with Three.js**:
- Use GLTFLoader for .glb/.gltf files
- Use OBJLoader for .obj files
- Automatic material setup
- Bounding box calculation for camera framing
- LOD (Level of Detail) support (future)

### Technology Stack Additions

**New Dependencies**:
- `monaco-editor` - Code editor component
- `@babel/standalone` or `sucrase` - Runtime TypeScript transpilation
- `three/examples/jsm/loaders/GLTFLoader` - 3D model loading
- `three/examples/jsm/loaders/OBJLoader` - Alternative model format
- `idb` - IndexedDB wrapper for asset storage
- `@codemirror/lang-javascript` - Alternative lightweight editor (optional)

**Build Configuration**:
- Vite worker plugin for Web Worker code execution
- Babel preset for TypeScript transpilation
- Three.js tree-shaking optimization

## User Scenarios & Testing

### User Story 1 - Upload and Use 3D Model Asset (Priority: P1)

A user has a 3D model file (.glb) on their computer and wants to use it in their scene. They can upload the file, see it in the asset library, and attach it to a GameObject via a Model3D component.

**Why this priority**: Asset import is fundamental to creating custom game content. Without it, users are limited to primitive shapes. This delivers immediate creative value.

**Independent Test**: Create new scene, click "Import Asset", select .glb file, see thumbnail in asset library, add GameObject, attach Model3D component, select uploaded model, see it render in viewport.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** user clicks "Import Asset" or drags a .glb file into the assets panel, **Then** the file uploads with a progress indicator and appears in the asset library with a thumbnail preview
2. **Given** a 3D model asset exists in the library, **When** user selects a GameObject and adds a Model3D component, **Then** they can choose the asset from a dropdown and it renders in the viewport
3. **Given** a Model3D component is attached with a model asset, **When** user adjusts the scale property, **Then** the model scales uniformly in real-time
4. **Given** multiple assets are uploaded, **When** user views the asset library, **Then** each asset shows a thumbnail, filename, file size, and type icon

---

### User Story 2 - Create Custom Code Component (Priority: P2)

A user wants to add custom behavior to a GameObject by writing JavaScript code. They can create a Code component, write logic in an embedded editor, and see it execute during play mode.

**Why this priority**: Code components enable unlimited gameplay mechanics without requiring new component types. This transforms the editor from a static scene builder to a programmable game engine.

**Independent Test**: Add GameObject, attach Code component, write `update() { this.transform.rotation.y += deltaTime; }` in editor, click Play, observe GameObject rotating.

**Acceptance Scenarios**:

1. **Given** a GameObject is selected, **When** user adds a Code component, **Then** a code editor appears in the Inspector with template code showing available lifecycle hooks
2. **Given** a Code component exists, **When** user writes code using `this.transform.position.x += 1`, **Then** syntax highlighting and basic autocomplete work in the editor
3. **Given** a Code component has update logic, **When** user enters play mode, **Then** the code executes every frame and modifies the GameObject as expected
4. **Given** code contains an error, **When** user enters play mode, **Then** execution stops gracefully with an error message in a console panel, highlighting the error line
5. **Given** a Code component is edited, **When** user saves the code to the asset library, **Then** it becomes reusable on other GameObjects

---

### User Story 3 - Asset Library Management (Priority: P3)

A user has uploaded multiple assets and wants to organize, search, and delete them. They can view all assets in a panel, filter by type, rename assets, and delete unused ones.

**Why this priority**: Asset management becomes critical as projects grow. This prevents clutter and helps users find assets quickly.

**Independent Test**: Upload 5 assets (3 models, 2 scripts), view asset library, search for "cube", see filtered results, delete unused asset, confirm it's removed.

**Acceptance Scenarios**:

1. **Given** multiple assets are uploaded, **When** user opens the asset library panel, **Then** assets are displayed in a grid with thumbnails, grouped by type (Models, Scripts)
2. **Given** the asset library is open, **When** user types in the search bar, **Then** assets are filtered in real-time by filename
3. **Given** an asset is selected, **When** user clicks a delete button, **Then** a confirmation dialog appears, and deletion removes the asset from storage
4. **Given** an asset is in use by a component, **When** user attempts to delete it, **Then** a warning shows which GameObjects use it, requiring confirmation
5. **Given** assets are uploaded, **When** user clicks "Export Assets", **Then** a .zip file downloads containing all assets for backup/sharing

---

### Edge Cases

- What happens if a user uploads a corrupted 3D model file?
- How does the system handle code that runs infinitely (while(true) loop)?
- What happens if uploaded assets exceed IndexedDB storage quota?
- How are asset references handled when a scene is saved and loaded?
- What if a Code component tries to access a deleted GameObject in the scene?
- How does the editor prevent malicious code execution (e.g., cryptocurrency mining)?

## Requirements

### Functional Requirements

#### Asset System

- **FR-AS-001**: System MUST provide an "Assets" panel in the editor UI for asset management
- **FR-AS-002**: System MUST support drag-and-drop file upload for 3D models (.glb, .gltf)
- **FR-AS-003**: System MUST provide a file browser button as alternative upload method
- **FR-AS-004**: System MUST display upload progress indicator for files > 1MB
- **FR-AS-005**: System MUST validate uploaded files (format, size limits, corruption check)
- **FR-AS-006**: System MUST generate thumbnail previews for 3D model assets
- **FR-AS-007**: System MUST store asset metadata (filename, size, type, upload date, usage count)
- **FR-AS-008**: System MUST use IndexedDB for binary asset storage (3D models)
- **FR-AS-009**: System MUST display all uploaded assets in a grid layout with thumbnails
- **FR-AS-010**: System MUST allow users to search/filter assets by name and type
- **FR-AS-011**: System MUST allow users to rename assets via double-click or context menu
- **FR-AS-012**: System MUST allow users to delete assets with confirmation dialog
- **FR-AS-013**: System MUST warn users if attempting to delete an asset currently in use
- **FR-AS-014**: System MUST track asset usage (which components reference which assets)
- **FR-AS-015**: System MUST export asset bundle as .zip file for backup/sharing

#### Model3D Component

- **FR-M3D-001**: System MUST provide a Model3D component type that can be added to GameObjects
- **FR-M3D-002**: System MUST allow users to select an uploaded model asset via dropdown
- **FR-M3D-003**: System MUST load and render .glb files using Three.js GLTFLoader
- **FR-M3D-004**: System MUST load and render .gltf files using Three.js GLTFLoader
- **FR-M3D-005**: System MUST display loading indicator while model is being parsed
- **FR-M3D-006**: System MUST handle model loading errors gracefully (corrupted files, unsupported formats)
- **FR-M3D-007**: System MUST provide scale property to uniformly resize loaded models
- **FR-M3D-008**: System MUST calculate and display model bounding box dimensions
- **FR-M3D-009**: System MUST support models with embedded textures and materials
- **FR-M3D-010**: System MUST list available animations if model contains animation clips
- **FR-M3D-011**: System MUST allow users to play/stop animations via Inspector controls

#### Code Component

- **FR-CODE-001**: System MUST provide a Code component type that can be added to GameObjects
- **FR-CODE-002**: System MUST embed a code editor (Monaco or CodeMirror) in the Inspector for Code components
- **FR-CODE-003**: System MUST provide syntax highlighting for JavaScript
- **FR-CODE-004**: System MUST provide template code showing lifecycle hooks (start, update, onDestroy)
- **FR-CODE-005**: System MUST provide `this.gameObject` reference in code execution context
- **FR-CODE-006**: System MUST provide `this.transform` quick access to Transform component
- **FR-CODE-007**: System MUST provide `this.scene` access to scene API (getGameObjectById, etc.)
- **FR-CODE-008**: System MUST call `start()` hook once when play mode begins
- **FR-CODE-009**: System MUST call `update(deltaTime)` hook every frame during play mode
- **FR-CODE-010**: System MUST call `onDestroy()` hook when GameObject is deleted
- **FR-CODE-011**: System MUST transpile TypeScript code to JavaScript before execution
- **FR-CODE-012**: System MUST catch and display runtime errors with line numbers
- **FR-CODE-013**: System MUST display a console panel showing code output (console.log)
- **FR-CODE-014**: System MUST highlight error lines in the code editor when errors occur
- **FR-CODE-015**: System MUST measure and display code execution time per frame
- **FR-CODE-016**: System MUST warn users if code execution exceeds 5ms per frame
- **FR-CODE-017**: System MUST terminate code execution after 100ms to prevent infinite loops
- **FR-CODE-018**: System MUST provide "Save as Asset" button to store code in asset library
- **FR-CODE-019**: System MUST allow loading code from asset library into Code component
- **FR-CODE-020**: System MUST sandbox code execution (no DOM access, no network requests)

#### Safety & Performance

- **FR-SAFE-001**: System MUST limit uploaded file size to 50MB per asset
- **FR-SAFE-002**: System MUST monitor IndexedDB storage usage and warn at 80% capacity
- **FR-SAFE-003**: System MUST prevent execution of code with known malicious patterns
- **FR-SAFE-004**: System MUST isolate code execution in Web Worker or restricted context
- **FR-SAFE-005**: System MUST validate all user-provided code before execution
- **FR-PERF-001**: System MUST load 3D models asynchronously without blocking UI
- **FR-PERF-002**: System MUST maintain 60 FPS with up to 10 Model3D components in scene
- **FR-PERF-003**: System MUST maintain 60 FPS with up to 20 Code components executing per frame

### Key Entities

#### Asset

**Properties**:
- `id: string` - UUID
- `name: string` - User-editable filename
- `type: AssetType` - Enum: 'model' | 'script' | 'texture' | 'audio'
- `format: string` - File extension (.glb, .js, etc.)
- `size: number` - File size in bytes
- `data: Blob | string` - Raw asset data
- `thumbnail: string | null` - Data URL for preview image
- `metadata: Record<string, unknown>` - Format-specific metadata
- `uploadedAt: Date` - Upload timestamp
- `usedBy: string[]` - GameObject IDs using this asset

**Operations**:
- `upload(file: File)` - Import asset from user's filesystem
- `generateThumbnail()` - Create preview for 3D models
- `delete()` - Remove from storage (with usage check)
- `export()` - Download asset file

#### Model3DComponent extends Component

**Properties**:
- `assetId: string | null` - Reference to Asset in library
- `scale: number` - Uniform scale multiplier (default: 1.0)
- `animations: AnimationClip[]` - Loaded from model
- `activeAnimation: string | null` - Currently playing animation
- `animationSpeed: number` - Playback speed multiplier

**Methods**:
- `loadModel(assetId: string)` - Fetch and parse 3D model
- `playAnimation(name: string)` - Start animation playback
- `stopAnimation()` - Stop current animation

#### CodeComponent extends Component

**Properties**:
- `code: string` - JavaScript/TypeScript source code
- `language: 'javascript' | 'typescript'` - Language mode
- `assetId: string | null` - Optional reference to saved script asset
- `executionTime: number` - Last frame execution duration (ms)
- `errors: Error[]` - Runtime errors from last execution

**Context**:
```typescript
interface CodeContext {
  gameObject: GameObject;
  transform: Transform;
  scene: Scene;
  deltaTime: number;
}
```

**Methods**:
- `compile()` - Transpile TypeScript to JavaScript
- `execute(context: CodeContext)` - Run code in isolated context
- `saveAsAsset(name: string)` - Store code in asset library

## Success Criteria

### Measurable Outcomes

- **SC-AS-001**: Users can upload a .glb 3D model and see it rendered on a GameObject within 30 seconds
- **SC-AS-002**: The asset library displays up to 100 assets without performance degradation (<100ms to render grid)
- **SC-AS-003**: Users can write a rotation script (`this.transform.rotation.y += deltaTime`) and see it work on first try in 90% of cases
- **SC-CODE-001**: Code components execute with <5ms overhead per frame on average
- **SC-CODE-002**: Users can identify syntax errors within 2 seconds via editor highlighting
- **SC-MODEL-001**: 3D models load and display within 2 seconds for files <10MB
- **SC-MODEL-002**: The editor maintains 60 FPS with 10 custom models (average 5000 triangles each)
- **SC-SAFE-001**: Code sandbox prevents all network requests and DOM manipulation attempts
- **SC-SAFE-002**: Infinite loops are terminated within 100ms without crashing the editor

### Assumptions

- Users have 3D models in .glb or .gltf format (industry standard)
- Users have basic JavaScript knowledge for code components
- Browser supports IndexedDB with at least 500MB available storage
- Models are reasonably optimized (< 100K triangles each)
- Code execution happens client-side only (no server compilation)
- Users understand that code runs in a sandbox with API limitations

