import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { useState, useRef, createContext, useEffect } from "react";
import * as THREE from "three";
import { useLayoutEffect } from "react";
import type { MeshRendererData, TransformData } from "@/types";
import { GizmosMenu } from "./GizmosMenu";
import { useMemo } from "react";
import { GizmoIntegration } from "./GizmoIntegration";

// Context to share play mode runtime state without modifying store
interface PlayModeState {
  rotationOffsets: Map<string, number>;
}

const PlayModeContext = createContext<PlayModeState>({
  rotationOffsets: new Map(),
});

// Component Update Loop for Play Mode
function UpdateLoop() {
  const mode = useEditorStore((state) => state.mode);
  const lastTimeRef = useRef<number>(0);

  const startPlayMode = useSceneStore((state) => state.startPlayMode);
  const stopPlayMode = useSceneStore((state) => state.stopPlayMode);

  useEffect(() => {
    if (mode === "play") {
      startPlayMode();
    } else {
      stopPlayMode();
    }
  }, [mode, startPlayMode, stopPlayMode]);

  useFrame((state) => {
    if (mode !== "play") {
      lastTimeRef.current = state.clock.getElapsedTime();
      return;
    }
  });

  return null;
}

function GameObjectRenderer() {
  const gameObjects = useSceneStore((state) => state.gameObjects);
  const selectedId = useEditorStore((state) => state.selectedId);
  const mode = useEditorStore((state) => state.mode);
  const selectGameObject = useEditorStore((state) => state.selectGameObject);

  return (
    <>
      {gameObjects.map((gameObject) => {
        const transform = gameObject.components.find(
          (c) => c.type === "Transform"
        ) as TransformData;
        const meshRenderer = gameObject.components.find(
          (c) => c.type === "MeshRenderer"
        ) as MeshRendererData;

        if (!transform || !meshRenderer?.visible) return null;

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

        const isSelected = gameObject.id === selectedId;

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
          <group key={gameObject.id} name={gameObject.id}>
            <mesh
              position={position}
              rotation={rotation}
              scale={scale}
              onClick={handleClick}
            >
              {geometry}
              <meshStandardMaterial color={meshRenderer.color} />
            </mesh>
            {isSelected && (
              <mesh position={position} rotation={rotation} scale={scale}>
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
      })}
    </>
  );
}

// 3D snap indicator rendered inside the Canvas
function SnapIndicator() {
  const isDragging = useEditorStore((s) => s.isDragging);
  const selectedId = useEditorStore((s) => s.selectedId);
  const gizmoSnap = useEditorStore((s) => s.gizmoSnap);
  const gameObject = useSceneStore((s) =>
    s.gameObjectMap.get(selectedId ?? "")
  );

  const pos = useMemo(() => {
    if (!gameObject) return null;
    const tf = gameObject.components.find(
      (c: any) => c.type === "Transform"
    ) as any;
    if (!tf) return null;
    const p = tf.position;
    const snap = gizmoSnap?.translate;
    if (typeof snap === "number" && snap > 0) {
      return [
        Math.round(p.x / snap) * snap,
        Math.round(p.y / snap) * snap,
        Math.round(p.z / snap) * snap,
      ] as [number, number, number];
    }
    return [p.x, p.y, p.z] as [number, number, number];
  }, [gameObject, gizmoSnap]);

  if (!isDragging || !pos) return null;

  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color="#00ffff" wireframe opacity={0.6} />
      </mesh>
    </group>
  );
}

export function SceneViewport() {
  const [fps, setFps] = useState(60);
  // tooltip state
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );
  const hoverHandle = useEditorStore((s) => s.hoverHandle);
  const gizmoMode = useEditorStore((s) => s.gizmoMode);

  useLayoutEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);
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
          <UpdateLoop />
          <SnapIndicator />

          {/* Performance monitoring */}
          <PerformanceMonitor onFpsUpdate={setFps} />
        </Canvas>
      </PlayModeContext.Provider>

      {/* Render Gizmos Menu overlay */}
      <GizmosMenu />

      {/* When in Play mode, show a small tooltip that gizmos are disabled */}
      {mode === "play" && (
        <div className="absolute top-16 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Gizmos are disabled in Play mode
        </div>
      )}

      {/* Hover tooltip overlay */}
      {hoverHandle && mousePos && (
        <div
          className="pointer-events-none absolute z-50 bg-black/80 text-white text-xs px-2 py-1 rounded"
          style={{ left: mousePos.x + 12, top: mousePos.y + 12 }}
        >
          <div className="font-medium">{hoverHandle}</div>
          <div className="text-xs text-muted-foreground">{gizmoMode}</div>
        </div>
      )}

      {/* Snap indicator overlay removed in favor of 3D SnapIndicator rendered inside Canvas */}

      {/* Viewport info overlay */}
      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        <div>Left Click + Drag: Rotate</div>
        <div>Right Click + Drag: Pan</div>
        <div>Scroll: Zoom</div>
      </div>

      {/* FPS display */}
      <FpsDisplay fps={fps} />
    </div>
  );
}

export const FpsDisplay: React.FC<{ fps: number }> = ({ fps }) => {
  return (
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
  );
};
