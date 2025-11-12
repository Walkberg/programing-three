import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { useAssetStore } from "@/state/assetStore";
import { PerformanceMonitor } from "./PerformanceMonitor";
import {
  useState,
  memo,
  useRef,
  createContext,
  useContext,
  useEffect,
} from "react"; // T044: added useEffect
import * as THREE from "three";
import { useRef as useReactRef } from "react";
import { useGizmoManager } from "@/engine/useGizmoManager";
import { CodeExecutor } from "@/services/CodeExecutor"; // T044
import type { CodeContext } from "@/types"; // T044
import { GizmosMenu } from "./GizmosMenu";

// Context to share play mode runtime state without modifying store
interface PlayModeState {
  rotationOffsets: Map<string, number>;
}

const PlayModeContext = createContext<PlayModeState>({
  rotationOffsets: new Map(),
});

// Component Update Loop for Play Mode
function UpdateLoop() {
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const mode = useEditorStore((state) => state.mode);
  const assets = useAssetStore((state) => state.assets);
  const lastTimeRef = useRef<number>(0);
  const playModeState = useContext(PlayModeContext);
  const initializedComponentsRef = useRef<Set<string>>(new Set()); // T044: Track initialized components

  // Helper function to get code from component (either inline or from asset)
  const getCodeFromComponent = async (
    component: any
  ): Promise<{
    code: string;
    language: "typescript" | "javascript";
  } | null> => {
    // If component has an assetId, load code from asset
    if (component.assetId) {
      const asset = assets.find((a) => a.id === component.assetId);
      if (asset && asset.data instanceof Blob) {
        const code = await asset.data.text();
        const language = asset.format === ".ts" ? "typescript" : "javascript";
        return { code, language };
      }
    }

    // Otherwise use inline code
    if (component.code && component.code.trim()) {
      return {
        code: component.code,
        language: component.language || "typescript",
      };
    }

    return null;
  };

  // T044: Initialize CodeComponents when play mode starts
  useEffect(() => {
    if (mode === "play") {
      // Find all CodeComponents that haven't been initialized
      gameObjects.forEach((gameObject) => {
        gameObject.components.forEach(async (component: any) => {
          if (
            component.type === "Code" &&
            component.enabled &&
            !initializedComponentsRef.current.has(component.id)
          ) {
            // Create CodeContext for initialization
            const transform = gameObject.components.find(
              (c: any) => c.type === "Transform"
            ) as any;

            const context: CodeContext = {
              gameObject: {
                id: gameObject.id,
                name: gameObject.name,
                components: gameObject.components,
              },
              transform: {
                position: { ...transform.position },
                rotation: { ...transform.rotation },
                scale: { ...transform.scale },
              },
              scene: {
                getGameObjectById: (id: string) =>
                  gameObjects.find((go) => go.id === id) || null,
                getAllGameObjects: () => gameObjects,
              },
              deltaTime: 0,
            };

            // Get code from asset or inline
            const codeData = await getCodeFromComponent(component);
            if (codeData) {
              // Wrap code with start() call
              const initCode = `
${codeData.code}
if (typeof start === 'function') {
  start();
}
              `;

              CodeExecutor.transpileAndExecute(
                initCode,
                codeData.language,
                context
              ).catch((error) => {
                console.error(
                  `[CodeComponent] Failed to initialize ${gameObject.name}:`,
                  error
                );
              });
            }

            initializedComponentsRef.current.add(component.id);
          }
        });
      });
    } else {
      // T046: Clear initialized components when leaving play mode
      initializedComponentsRef.current.clear();
      CodeExecutor.cancelAll();
    }
  }, [mode, gameObjects, assets]);

  useFrame((state) => {
    // Only run update loop in play mode
    if (mode !== "play") {
      lastTimeRef.current = state.clock.getElapsedTime();
      return;
    }

    // Calculate delta time
    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // T045: Call update() on all enabled components
    gameObjects.forEach((gameObject) => {
      gameObject.components.forEach(async (component: any) => {
        if (component.enabled && typeof component.update === "function") {
          component.update(deltaTime);
        }

        // T045: Handle CodeComponent update() lifecycle
        if (component.enabled && component.type === "Code") {
          const transform = gameObject.components.find(
            (c: any) => c.type === "Transform"
          ) as any;

          const context: CodeContext = {
            gameObject: {
              id: gameObject.id,
              name: gameObject.name,
              components: gameObject.components,
            },
            transform: {
              position: { ...transform.position },
              rotation: { ...transform.rotation },
              scale: { ...transform.scale },
            },
            scene: {
              getGameObjectById: (id: string) =>
                gameObjects.find((go) => go.id === id) || null,
              getAllGameObjects: () => gameObjects,
            },
            deltaTime,
          };

          // Get code from asset or inline
          const codeData = await getCodeFromComponent(component);
          if (codeData) {
            // Wrap code with update() call
            const updateCode = `
${codeData.code}
if (typeof update === 'function') {
  update(deltaTime);
}
            `;

            CodeExecutor.transpileAndExecute(
              updateCode,
              codeData.language,
              context
            ).catch((error) => {
              console.error(
                `[CodeComponent] Failed to update ${gameObject.name}:`,
                error
              );
            });
          }
        }

        // Example: Handle RotationComponent updates
        // Accumulate rotation in playModeState instead of modifying store
        if (
          component.enabled &&
          component.type === "RotationComponent" &&
          deltaTime > 0
        ) {
          const currentOffset =
            playModeState.rotationOffsets.get(gameObject.id) || 0;
          playModeState.rotationOffsets.set(
            gameObject.id,
            currentOffset + component.speed * deltaTime
          );
        }
      });
    });
  });

  return null;
}

// Memoized GameObject renderer for performance (FR-013: 16ms updates)
const GameObjectRenderer = memo(function GameObjectRenderer() {
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const selectedId = useEditorStore((state) => state.selectedId);

  return (
    <>
      {gameObjects.map((gameObject) => (
        <GameObjectMesh
          key={gameObject.id}
          gameObject={gameObject}
          isSelected={gameObject.id === selectedId}
        />
      ))}
    </>
  );
});

// Gizmo integration inside Canvas: initialize manager and attach to selected object
function GizmoIntegration() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const scene = useThree((s) => s.scene);
  const managerRef = useGizmoManager();
  const manager = managerRef.current;
  const gizmoMode = useEditorStore((s) => s.gizmoMode);
  const gizmoSpace = useEditorStore((s) => s.gizmoSpace);
  const gizmoSnap = useEditorStore((s) => s.gizmoSnap);
  const updateTransform = useSceneStore.getState().updateTransform;

  useEffect(() => {
    if (!manager) return;
    if (!selectedId) {
      manager.detach();
      return;
    }

    // Find object by name or userData.gameObjectId
    let target: THREE.Object3D | null = null;
    target = scene.getObjectByProperty("name", selectedId) as any;
    if (!target) {
      scene.traverse((child) => {
        if (
          !target &&
          child.userData &&
          child.userData.gameObjectId === selectedId
        ) {
          target = child;
        }
      });
    }

    if (target) {
      manager.attach(target, selectedId);
    } else {
      manager.detach();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Apply gizmo options when they change
  useEffect(() => {
    if (!manager) return;
    try {
      manager.setMode(gizmoMode === "none" ? "none" : gizmoMode);
      manager.setSpace(gizmoSpace === "world" ? "world" : "local");
      manager.setSnap(gizmoSnap || {});
    } catch (err) {
      // ignore
    }
  }, [manager, gizmoMode, gizmoSpace, gizmoSnap]);

  // Forward transform changes from the gizmo to the scene store
  useEffect(() => {
    if (!manager) return;
    manager.setTransformCallback((id, partial) => {
      // map partial to updateTransform call
      const pos = partial.position
        ? {
            x: partial.position.x,
            y: partial.position.y,
            z: partial.position.z,
          }
        : undefined;
      const rot = partial.rotation
        ? {
            x: partial.rotation.x,
            y: partial.rotation.y,
            z: partial.rotation.z,
          }
        : undefined;
      const scl = partial.scale
        ? { x: partial.scale.x, y: partial.scale.y, z: partial.scale.z }
        : undefined;
      try {
        updateTransform(id, pos as any, rot as any, scl as any);
      } catch (err) {
        // ignore
      }
    });

    return () => {
      if (manager) manager.setTransformCallback(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager]);

  // update manager each frame (no-op for now but kept for extensibility)
  useFrame(() => {
    if (manager) manager.update();
  });

  return null;
}

interface GameObjectMeshProps {
  gameObject: any;
  isSelected: boolean;
}

// Individual GameObject mesh with play mode animation support
function GameObjectMesh({ gameObject, isSelected }: GameObjectMeshProps) {
  const selectGameObject = useEditorStore((state) => state.selectGameObject);
  const mode = useEditorStore((state) => state.mode);
  const playModeState = useContext(PlayModeContext);
  const meshRef = useRef<THREE.Mesh>(null);
  const highlightRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const transform = gameObject.components.find(
    (c: any) => c.type === "Transform"
  ) as any;
  const meshRenderer = gameObject.components.find(
    (c: any) => c.type === "MeshRenderer"
  ) as any;
  const model3D = gameObject.components.find(
    (c: any) => c.type === "Model3D"
  ) as any;
  const rotationComponent = gameObject.components.find(
    (c: any) => c.type === "RotationComponent"
  ) as any;

  // Update mesh rotation every frame in play mode
  useFrame(() => {
    if (mode === "play" && rotationComponent) {
      const rotationOffset =
        playModeState.rotationOffsets.get(gameObject.id) || 0;

      const targetRef = meshRef.current || groupRef.current;
      if (targetRef) {
        targetRef.rotation.set(
          transform.rotation.x,
          transform.rotation.y + rotationOffset,
          transform.rotation.z,
          transform.rotation.order || "XYZ"
        );

        // Also update highlight if selected
        if (highlightRef.current) {
          highlightRef.current.rotation.copy(targetRef.rotation);
        }
      }
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.name = gameObject.id;
      groupRef.current.userData = {
        ...(groupRef.current.userData || {}),
        gameObjectId: gameObject.id,
      };
    }
  }, [gameObject.id]);

  if (!transform) {
    return null;
  }

  // T029: Handle Model3D component (prioritize over MeshRenderer)
  if (model3D && model3D.loadedModel) {
    const position = new THREE.Vector3(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );

    const rotation = new THREE.Euler(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z,
      transform.rotation.order || "XYZ"
    );

    const scale = new THREE.Vector3(
      transform.scale.x,
      transform.scale.y,
      transform.scale.z
    );

    const handleClick = () => {
      if (mode === "edit") {
        selectGameObject(gameObject.id);
      }
    };

    return (
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        <primitive object={model3D.loadedModel.clone()} />
        {isSelected && (
          <mesh ref={highlightRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color="#ffff00"
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </group>
    );
  }

  // Fall back to MeshRenderer if no Model3D
  if (!meshRenderer || !meshRenderer.visible) {
    return null;
  }

  const position = new THREE.Vector3(
    transform.position.x,
    transform.position.y,
    transform.position.z
  );

  const rotation = new THREE.Euler(
    transform.rotation.x,
    transform.rotation.y,
    transform.rotation.z,
    transform.rotation.order || "XYZ"
  );

  const scale = new THREE.Vector3(
    transform.scale.x,
    transform.scale.y,
    transform.scale.z
  );

  // Determine geometry
  let geometry: JSX.Element;
  switch (meshRenderer.geometry) {
    case "sphere":
      geometry = <sphereGeometry args={[0.5, 32, 32]} />;
      break;
    case "plane":
      geometry = <planeGeometry args={[1, 1]} />;
      break;
    case "cube":
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />;
  }

  const handleClick = () => {
    if (mode === "edit") {
      selectGameObject(gameObject.id);
    }
  };

  return (
    <group ref={groupRef} name={gameObject.id}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        {geometry}
        <meshStandardMaterial color={meshRenderer.color} />
      </mesh>
      {isSelected && (
        <mesh
          ref={highlightRef}
          position={position}
          rotation={rotation}
          scale={scale}
        >
          {geometry}
          <meshBasicMaterial
            color="#ffff00"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

export function SceneViewport() {
  const [fps, setFps] = useState(60);
  const mode = useEditorStore((state) => state.mode);

  // Create play mode state that persists across renders but clears on mode change
  const playModeStateRef = useRef<PlayModeState>({
    rotationOffsets: new Map(),
  });

  // Clear play mode state when exiting play mode
  if (mode === "edit") {
    playModeStateRef.current.rotationOffsets.clear();
  }

  return (
    <div className="w-full h-full relative">
      <PlayModeContext.Provider value={playModeStateRef.current}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          gl={{ antialias: true }}
          shadows
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

          {/* Grid helper */}
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6e6e6e"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />

          {/* Camera controls */}
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={50}
          />

          {/* Gizmo manager integration */}
          <GizmoIntegration />

          {/* Render GameObjects */}
          <GameObjectRenderer />

          {/* Component update loop for play mode */}
          <UpdateLoop />

          {/* Performance monitoring */}
          <PerformanceMonitor onFpsUpdate={setFps} />
          {/* Gizmo overlay menu (UI inside Canvas but rendered as HTML overlay via portal) */}
          {/* The actual GizmosMenu is an HTML overlay outside Canvas; render it below Canvas */}
        </Canvas>
      </PlayModeContext.Provider>

      {/* Render Gizmos Menu overlay */}
      <GizmosMenu />

      {/* Viewport info overlay */}
      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        <div>Left Click + Drag: Rotate</div>
        <div>Right Click + Drag: Pan</div>
        <div>Scroll: Zoom</div>
      </div>

      {/* FPS display */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">FPS:</span>
          <span
            className={`font-bold ${
              fps >= 55
                ? "text-green-500"
                : fps >= 30
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {fps}
          </span>
        </div>
        {fps < 55 && (
          <div className="text-xs text-yellow-400 mt-1">
            {fps < 30 ? "⚠ Poor performance" : "⚡ Acceptable"}
          </div>
        )}
      </div>
    </div>
  );
}
