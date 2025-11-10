# Quickstart Guide: Scene Editor MVP

**Feature**: 001-scene-editor-mvp  
**Last Updated**: 2025-11-10  
**Prerequisites**: Node.js 18+, npm 9+, modern browser with WebGL 2.0

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone repository (if not already cloned)
git clone <repository-url>
cd programing-three

# Checkout feature branch
git checkout 001-scene-editor-mvp

# Install dependencies
npm install
```

### 2. Install shadcn/ui Components

```bash
# Initialize shadcn/ui (if not already done)
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add collapsible
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add toast
```

### 3. Project Configuration

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
```

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Development

### Start Development Server

```bash
npm run dev
```

Opens at `http://localhost:3000`. Hot module replacement (HMR) enabled.

### Project Structure Overview

```
src/
├── components/         # React UI components
│   ├── Editor/         # Main editor layout
│   ├── Hierarchy/      # GameObject tree panel
│   ├── Inspector/      # Property editor panel
│   └── Viewport/       # 3D scene view (React Three Fiber)
├── core/               # GameObject/Component system
├── engine/             # Three.js rendering
├── state/              # Zustand stores
├── services/           # Serialization, storage, validation
├── utils/              # Utilities
└── types/              # TypeScript types
```

## Building a Scene (User Flow)

### Scenario: Create a Simple 3-Object Scene

**Goal**: Create a ground plane + two cubes in 2 minutes (Success Criteria SC-001)

1. **Open Editor**
   - Navigate to `http://localhost:3000`
   - You see three panels: Hierarchy (left), Viewport (center), Inspector (right)
   - Toolbar at top with Play/Stop buttons

2. **Add Ground Plane**
   - Click "Add GameObject" button in toolbar
   - New "GameObject" appears in Hierarchy panel
   - GameObject automatically selected, shown in Inspector
   - In Inspector, click "Add Component" → Select "MeshRenderer"
   - Change geometry dropdown to "plane"
   - Set Transform position Y to `-1`
   - Ground plane renders in Viewport

3. **Add First Cube**
   - Click "Add GameObject" again
   - New "GameObject (1)" created
   - Select MeshRenderer geometry: "cube" (default)
   - Set Transform position: X=`-2`, Y=`0`, Z=`0`
   - Change color to red: `#ff0000`

4. **Add Second Cube**
   - Click "Add GameObject" again
   - New "GameObject (2)" created
   - Keep geometry as "cube"
   - Set Transform position: X=`2`, Y=`0`, Z=`0`
   - Change color to blue: `#0000ff`

5. **Save Scene**
   - Click "Save Scene" button in toolbar
   - Toast notification: "Scene saved successfully"
   - Scene persisted to localStorage

6. **Test Play Mode**
   - Click "Play" button
   - Mode indicator changes to "Playing"
   - Inspector inputs disabled
   - Scene continues rendering (no component behaviors yet)
   - Click "Stop" button
   - Returns to edit mode

**Expected Duration**: < 2 minutes (validates SC-001)

## Testing

### Run Unit Tests

```bash
npm run test
```

Uses Vitest. Tests in `tests/unit/`.

### Run Component Tests

```bash
npm run test:component
```

React Testing Library tests in `tests/component/`.

### Run E2E Tests

```bash
npm run test:e2e
```

Playwright tests in `tests/e2e/`. Requires dev server running.

## Key Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected GameObject |
| `Space` | Toggle Play/Stop mode (future) |
| `Ctrl+S` | Save scene (future) |
| `Ctrl+Z` | Undo (future) |

## Troubleshooting

### Scene Not Rendering

**Problem**: Viewport shows black screen or white screen  
**Solutions**:
- Check browser console for WebGL errors
- Verify browser supports WebGL 2.0: visit `https://get.webgl.org/webgl2/`
- Try different browser (Chrome/Edge recommended)
- Check if GameObjects have MeshRenderer components attached

### Performance Issues (< 60 FPS)

**Problem**: Editor feels laggy, frame rate drops  
**Solutions**:
- Check number of GameObjects (MVP limit: 50)
- Open Chrome DevTools → Performance tab → Record session
- Look for long tasks (> 50ms) in flame chart
- Verify React components are memoized (check with React DevTools Profiler)
- Reduce scene complexity (fewer triangles)

### Save/Load Not Working

**Problem**: Scene doesn't persist after page refresh  
**Solutions**:
- Check browser console for localStorage errors
- Verify localStorage not disabled (private browsing mode)
- Check storage quota: `StorageService.getQuotaUsage()`
- Try clearing localStorage: `localStorage.clear()` in console
- Re-save scene after clearing

### Invalid Input Not Blocked

**Problem**: Can enter invalid values (e.g., text in number fields)  
**Solutions**:
- Verify Zod schemas are applied to form inputs
- Check React Hook Form validation setup
- Inspect input field props: `type="number"` should be set
- Verify `ValidationService` functions are called

### Play Mode Not Reverting Scene

**Problem**: Changes during play mode persist after Stop  
**Solutions**:
- Check `editorStore.playStateSnapshot` is populated on Play
- Verify `sceneStore.replaceScene()` is called on Stop
- Inspect scene serialization: does it include all GameObjects?
- Check for errors in console during mode transition

## Architecture Quick Reference

### State Management (Zustand)

```typescript
// Access editor state
const { mode, selectedId } = useEditorStore();

// Access scene data
const gameObjects = useSceneStore((state) => state.gameObjects);

// Update scene
useSceneStore.getState().addGameObject('Cube');
```

### Component Lifecycle

```typescript
class CustomComponent extends Component {
  // Called after deserialization
  init() {
    // Setup code
  }

  // Called every frame in play mode
  update(deltaTime: number) {
    // Game logic
  }

  // Called on GameObject deletion
  destroy() {
    // Cleanup code
  }

  // Serialize to JSON
  serialize() {
    return { type: 'CustomComponent', ...this.data };
  }
}
```

### Three.js via React Three Fiber

```tsx
// Render GameObject as Three.js mesh
function GameObjectRenderer({ gameObject }: Props) {
  const transform = gameObject.getComponent(Transform);
  const meshRenderer = gameObject.getComponent(MeshRenderer);

  return (
    <mesh position={transform.position.toArray()}>
      <boxGeometry />
      <meshStandardMaterial color={meshRenderer.color} />
    </mesh>
  );
}
```

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Frame Rate | 60 FPS | Chrome DevTools → Rendering → Frame Rendering Stats |
| Property Update | < 16ms | React DevTools Profiler → Component render time |
| Mode Transition | < 500ms | Console.time('play') → Console.timeEnd('play') |
| Scene Save | < 1s | Time save button click to toast notification |
| Memory Usage | < 500MB baseline | Chrome Task Manager → JavaScript Memory |

## Browser Compatibility

| Browser | Minimum Version | WebGL 2.0 | Status |
|---------|----------------|-----------|--------|
| Chrome | 90+ | ✅ | Recommended |
| Edge | 90+ | ✅ | Recommended |
| Firefox | 88+ | ✅ | Supported |
| Safari | 15+ | ✅ | Supported |
| Opera | 76+ | ✅ | Supported |

## Common Patterns

### Adding a New Component Type

1. **Define component class** in `src/core/`:
```typescript
export class MyComponent extends Component {
  type = 'MyComponent';
  myProperty = 'default';

  serialize() {
    return { type: this.type, myProperty: this.myProperty };
  }

  deserialize(data: any) {
    this.myProperty = data.myProperty;
  }
}
```

2. **Register in ComponentRegistry**:
```typescript
ComponentRegistry.register('MyComponent', MyComponent);
```

3. **Add to Inspector UI** in `src/components/Inspector/ComponentEditor.tsx`

4. **Add Zod schema** in `src/services/ValidationService.ts`

### Implementing Component Update Logic

```typescript
class RotatorComponent extends Component {
  type = 'Rotator';
  speed = 1; // Revolutions per second

  update(deltaTime: number) {
    const transform = this.gameObject.getComponent(Transform);
    if (transform) {
      transform.rotation.y += this.speed * Math.PI * 2 * deltaTime;
    }
  }
}
```

### Custom Validation

```typescript
const myComponentSchema = z.object({
  type: z.literal('MyComponent'),
  myProperty: z.string().min(1).max(50)
});

ValidationService.validateMyComponent = (data: unknown) => {
  return myComponentSchema.parse(data);
};
```

## Next Steps

After validating MVP functionality:

1. **Extend Component System**: Add Physics, Camera, Light components
2. **Asset Import**: Support loading .gltf/.glb 3D models
3. **Undo/Redo**: Implement history via `historyStore`
4. **Prefabs**: Reusable GameObject templates
5. **Custom Scripting**: Allow users to write custom component behaviors in TypeScript
6. **Drag-and-Drop**: Hierarchy rearrangement, viewport object placement
7. **Multi-Scene**: Support multiple scene files with scene selector

## Resources

- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **Zustand**: https://docs.pmnd.rs/zustand/
- **Zod**: https://zod.dev/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

## Support

For issues specific to this MVP:
- Check `data-model.md` for entity schemas
- Check `contracts/scene-api.json` for API interfaces
- Review `research.md` for architectural decisions
- Search issues in repository

For Three.js/React Three Fiber questions:
- Discord: https://discord.gg/poimandres
- Stack Overflow: `[three.js]` or `[react-three-fiber]` tags
