import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useSceneStore } from "@/state/sceneStore";
import { useEditorStore } from "@/state/editorStore";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { useState, memo } from "react";
import * as THREE from "three";

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

interface GameObjectMeshProps {
  gameObject: any;
  isSelected: boolean;
}

// Memoized individual GameObject mesh to prevent unnecessary re-renders
const GameObjectMesh = memo(function GameObjectMesh({
  gameObject,
  isSelected,
}: GameObjectMeshProps) {
  const selectGameObject = useEditorStore((state) => state.selectGameObject);
  const mode = useEditorStore((state) => state.mode);

  const transform = gameObject.components.find(
    (c: any) => c.type === "Transform"
  ) as any;
  const meshRenderer = gameObject.components.find(
    (c: any) => c.type === "MeshRenderer"
  ) as any;

  if (!transform || !meshRenderer || !meshRenderer.visible) {
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
    <group>
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
});

export function SceneViewport() {
  const [fps, setFps] = useState(60);

  return (
    <div className="w-full h-full relative">
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

        {/* Render GameObjects */}
        <GameObjectRenderer />

        {/* Performance monitoring */}
        <PerformanceMonitor onFpsUpdate={setFps} />
      </Canvas>

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
