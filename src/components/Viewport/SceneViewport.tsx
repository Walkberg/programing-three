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
import { useHistoryStore } from "@/state/historyStore";
import { useLayoutEffect } from "react";
import { CodeExecutor } from "@/services/CodeExecutor"; // T044
import type { CodeContext } from "@/types"; // T044
import { GizmosMenu } from "./GizmosMenu";
import { useMemo } from "react";

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

    if (component.code && component.code.trim()) {
      return {
        code: component.code,
        language: component.language || "typescript",
      };
    }

    return null;
  };

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
      initializedComponentsRef.current.clear();
      CodeExecutor.cancelAll();
    }
  }, [mode, gameObjects, assets]);

  useFrame((state) => {
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
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const mode = useEditorStore((s) => s.mode);
  const { scene, camera, gl } = useThree();
  const managerRef = useGizmoManager();
  const manager = managerRef.current;
  const gizmoMode = useEditorStore((s) => s.gizmoMode);
  const gizmoSpace = useEditorStore((s) => s.gizmoSpace);
  const gizmoSnap = useEditorStore((s) => s.gizmoSnap);
  const updateTransform = useSceneStore.getState().updateTransform;
  const pivotMode = useEditorStore((s) => s.pivotMode);
  const beforeTransformsRef = useRef<Record<string, any>>({});
  const multiDummyRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!manager) return;
    // Disable gizmo in non-edit modes
    if (mode !== "edit") {
      // cleanup any multi dummy
      if (multiDummyRef.current) {
        try {
          scene.remove(multiDummyRef.current);
        } catch (err) {
          /* ignore */
        }
        multiDummyRef.current = null;
      }
      manager.detach();
      return;
    }

    // Handle no selection
    if (!selectedIds || selectedIds.length === 0) {
      if (multiDummyRef.current) {
        try {
          scene.remove(multiDummyRef.current);
        } catch (err) {
          /* ignore */
        }
        multiDummyRef.current = null;
      }
      manager.detach();
      return;
    }

    // Single selection: attach to object
    if (selectedIds.length === 1) {
      const id = selectedIds[0];
      let target: THREE.Object3D | null = null;
      target = scene.getObjectByProperty("name", id) as any;
      if (!target) {
        scene.traverse((child) => {
          if (!target && child.userData && child.userData.gameObjectId === id) {
            target = child;
          }
        });
      }

      if (multiDummyRef.current) {
        try {
          scene.remove(multiDummyRef.current);
        } catch (err) {
          /* ignore */
        }
        multiDummyRef.current = null;
      }

      if (target) {
        manager.attach(target, id);
      } else {
        manager.detach();
      }

      return;
    }

    // Multi-selection: attach to invisible dummy at centroid and restrict to translate mode
    try {
      const ids = selectedIds;
      const state = useSceneStore.getState();
      const positions: THREE.Vector3[] = [];
      ids.forEach((id) => {
        const go = state.gameObjectMap.get(id);
        if (!go) return;
        const tf = go.components.find((c: any) => c.type === "Transform");
        if (tf && tf.position)
          positions.push(
            new THREE.Vector3(tf.position.x, tf.position.y, tf.position.z)
          );
      });

      if (positions.length === 0) {
        manager.detach();
        return;
      }

      const centroid = positions
        .reduce((acc, p) => acc.add(p), new THREE.Vector3(0, 0, 0))
        .multiplyScalar(1 / positions.length);

      // create or reuse dummy
      let dummy = multiDummyRef.current;
      if (!dummy) {
        dummy = new THREE.Object3D();
        dummy.name = "multi-selection-dummy";
        scene.add(dummy);
        multiDummyRef.current = dummy;
      }
      dummy.position.copy(centroid);

      // enforce translate-only mode for multi-selection
      try {
        manager.setMode("translate");
        // ensure editor store reflects translate mode
        useEditorStore.getState().setGizmoMode("translate");
      } catch (err) {
        // ignore
      }

      manager.attach(dummy, "multi");
    } catch (err) {
      // fallback: detach
      try {
        if (multiDummyRef.current) scene.remove(multiDummyRef.current);
      } catch (e) {
        /* ignore */
      }
      multiDummyRef.current = null;
      manager.detach();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, manager, mode]);

  // Listen for hover and dragging callbacks from the manager and reflect in editor store
  useEffect(() => {
    if (!manager) return;
    const onHover = (handle: string | null) => {
      const s: any = useEditorStore.getState();
      if (s && typeof s.setHoverHandle === "function") {
        s.setHoverHandle(handle);
      }
    };

    const onDragging = (isDragging: boolean) => {
      const s: any = useEditorStore.getState();
      if (s && typeof s.setIsDragging === "function") {
        s.setIsDragging(isDragging);
      }

      try {
        const sels = useEditorStore.getState().selectedIds || [];
        if (!sels || sels.length === 0) return;

        if (isDragging) {
          // drag start: record before transform for each selected id
          const state = useSceneStore.getState();
          sels.forEach((sel) => {
            const go = state.gameObjectMap.get(sel);
            if (go) {
              const tf = go.components.find((c: any) => c.type === "Transform");
              beforeTransformsRef.current[sel] = JSON.parse(JSON.stringify(tf));
            }
          });
          // also record dummy before if multi
          if (sels.length > 1 && multiDummyRef.current) {
            beforeTransformsRef.current["__multi_dummy"] = {
              position: multiDummyRef.current.position.clone(),
            };
          }
        } else {
          // drag end: if multi-selection, compute delta from dummy and apply to all
          const state = useSceneStore.getState();
          if (sels.length > 1 && multiDummyRef.current) {
            const before = beforeTransformsRef.current["__multi_dummy"];
            if (before) {
              const afterPos = multiDummyRef.current.position;
              const dx = (afterPos.x ?? 0) - (before.position.x ?? 0);
              const dy = (afterPos.y ?? 0) - (before.position.y ?? 0);
              const dz = (afterPos.z ?? 0) - (before.position.z ?? 0);
              // apply translation delta to each selected object
              sels.forEach((sel) => {
                const go = state.gameObjectMap.get(sel);
                if (!go) return;
                const after = go.components.find(
                  (c: any) => c.type === "Transform"
                );
                const beforeTf = beforeTransformsRef.current[sel];
                if (!beforeTf || !after) return;
                const newPos = {
                  x: (beforeTf.position?.x ?? 0) + dx,
                  y: (beforeTf.position?.y ?? 0) + dy,
                  z: (beforeTf.position?.z ?? 0) + dz,
                };
                useSceneStore
                  .getState()
                  .updateTransform(sel, newPos as any, undefined, undefined);
                const entry = {
                  type: "transform",
                  gameObjectId: sel,
                  before: {
                    position: beforeTf.position ?? null,
                    rotation: beforeTf.rotation ?? null,
                    scale: beforeTf.scale ?? null,
                  },
                  after: {
                    position: newPos ?? null,
                    rotation: after.rotation ?? null,
                    scale: after.scale ?? null,
                  },
                  timestamp: Date.now(),
                  description: "Gizmo transform (multi)",
                };
                useHistoryStore.getState().push(entry as any);
                delete beforeTransformsRef.current[sel];
              });
            }
            delete beforeTransformsRef.current["__multi_dummy"];
          } else {
            // single selection fallback
            const sel = sels[0];
            const before = beforeTransformsRef.current[sel];
            const go = useSceneStore.getState().gameObjectMap.get(sel);
            if (go && before) {
              const after = go.components.find(
                (c: any) => c.type === "Transform"
              );
              const entry = {
                type: "transform",
                gameObjectId: sel,
                before: {
                  position: before.position ?? null,
                  rotation: before.rotation ?? null,
                  scale: before.scale ?? null,
                },
                after: {
                  position: after.position ?? null,
                  rotation: after.rotation ?? null,
                  scale: after.scale ?? null,
                },
                timestamp: Date.now(),
                description: "Gizmo transform",
              };
              useHistoryStore.getState().push(entry as any);
              delete beforeTransformsRef.current[sel];
            }
          }
        }
      } catch (err) {
        // ignore
      }
    };

    manager.setHoverCallback(onHover);
    manager.setDraggingCallback(onDragging);

    return () => {
      if (manager) {
        manager.setHoverCallback(null);
        manager.setDraggingCallback(null);
      }
    };
  }, [manager, selectedId]);

  // Apply gizmo options when they change
  useEffect(() => {
    if (!manager) return;
    try {
      manager.setMode(gizmoMode === "none" ? "none" : gizmoMode);
      manager.setSpace(gizmoSpace === "world" ? "world" : "local");
      manager.setSnap(gizmoSnap || {});
      // propagate pivot mode to manager
      if (typeof manager.setPivotMode === "function") {
        try {
          manager.setPivotMode(pivotMode);
        } catch (err) {
          // ignore
        }
      }
    } catch (err) {
      // ignore
    }
  }, [manager, gizmoMode, gizmoSpace, gizmoSnap]);

  // Pointer hover detection against TransformControls handles (basic heuristic)
  useEffect(() => {
    if (!manager) return;
    const controls: any = (manager as any).controls;
    if (!controls) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const collectMeshes = (obj: any, out: any[]) => {
      if (!obj) return;
      if (obj.type === "Mesh" || obj.isMesh) out.push(obj);
      if (obj.children && obj.children.length) {
        obj.children.forEach((c: any) => collectMeshes(c, out));
      }
    };

    const meshes: any[] = [];
    collectMeshes(controls, meshes);
    let lastHovered: any = null;
    let lastOriginalColor: any = null;

    const onPointerMove = (ev: PointerEvent) => {
      const canvas = ev.target as HTMLCanvasElement;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      // use camera from useThree() (captured from outer scope)
      try {
        if (!camera) return;
        raycaster.setFromCamera(mouse, camera as THREE.Camera);
        const hits = raycaster.intersectObjects(meshes, true);
        if (hits && hits.length) {
          const hit = hits[0].object;
          const name = hit.name || hit.parent?.name || "handle";
          manager.reportHover(name);
          // simple highlight: tint material emissive if available
          try {
            if (lastHovered && lastHovered !== hit) {
              // restore previous
              if (lastOriginalColor && lastHovered.material) {
                if (lastHovered.material.emissive) {
                  lastHovered.material.emissive.setHex(lastOriginalColor);
                } else if (lastHovered.material.color) {
                  lastHovered.material.color.setHex(lastOriginalColor);
                }
              }
              lastOriginalColor = null;
              lastHovered = null;
            }

            if (!lastHovered || lastHovered !== hit) {
              if (hit.material) {
                if (hit.material.emissive) {
                  lastOriginalColor = hit.material.emissive.getHex();
                  hit.material.emissive.setHex(0xffff00);
                } else if (hit.material.color) {
                  lastOriginalColor = hit.material.color.getHex();
                  hit.material.color.setHex(0xffff00);
                }
                lastHovered = hit;
              }
            }
          } catch (err) {
            // ignore highlighting errors
          }
        } else {
          manager.reportHover(null);
          if (lastHovered) {
            try {
              if (lastOriginalColor && lastHovered.material) {
                if (lastHovered.material.emissive) {
                  lastHovered.material.emissive.setHex(lastOriginalColor);
                } else if (lastHovered.material.color) {
                  lastHovered.material.color.setHex(lastOriginalColor);
                }
              }
            } catch (err) {
              // ignore
            }
            lastHovered = null;
            lastOriginalColor = null;
          }
        }
      } catch (err) {
        // defensive: swallow any errors
      }
    };

    const canvasEl =
      gl && (gl.domElement as HTMLCanvasElement)
        ? (gl.domElement as HTMLCanvasElement)
        : (document.querySelector("canvas") as HTMLCanvasElement | null);
    if (canvasEl) canvasEl.addEventListener("pointermove", onPointerMove);

    return () => {
      if (canvasEl) canvasEl.removeEventListener("pointermove", onPointerMove);
      manager.reportHover(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager, camera, gl]);

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
  const isDragging = useEditorStore((s) => s.isDragging);
  const selectedId = useEditorStore((s) => s.selectedId);

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

          {/* Component update loop for play mode */}
          <UpdateLoop />

          {/* Snap indicator (3D helper) */}
          <SnapIndicator />

          {/* Performance monitoring */}
          <PerformanceMonitor onFpsUpdate={setFps} />
          {/* Gizmo overlay menu (UI inside Canvas but rendered as HTML overlay via portal) */}
          {/* The actual GizmosMenu is an HTML overlay outside Canvas; render it below Canvas */}
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
