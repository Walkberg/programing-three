import { useGizmoManager } from "@/engine/useGizmoManager";
import { useEditorStore } from "@/state/editorStore";
import { useHistoryStore } from "@/state/historyStore";
import { useSceneStore } from "@/state/sceneStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Gizmo integration inside Canvas: initialize manager and attach to selected object
export function GizmoIntegration() {
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
