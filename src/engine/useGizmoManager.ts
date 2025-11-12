import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { GizmoManager } from "./GizmoManager";
import type { GizmoManagerOptions } from "@/types";

export function useGizmoManager(options?: GizmoManagerOptions) {
  const managerRef = useRef<GizmoManager | null>(null);
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    if (!managerRef.current) {
      // create manager using current scene, camera, and canvas dom element
      managerRef.current = new GizmoManager(
        scene,
        camera,
        gl.domElement,
        options
      );
    }

    const mgr = managerRef.current;
    return () => {
      if (mgr) {
        mgr.dispose();
        managerRef.current = null;
      }
    };
    // options intentionally omitted from deps to avoid re-instantiation on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return managerRef;
}
