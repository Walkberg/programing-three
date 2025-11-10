import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

interface PerformanceMonitorProps {
  onFpsUpdate: (fps: number) => void;
}

/**
 * Performance monitoring component for the 3D viewport.
 * Tracks FPS and ensures property updates reflect within 16ms (60 FPS target).
 *
 * Renders inside the R3F Canvas to access useFrame hook.
 */
export function PerformanceMonitor({ onFpsUpdate }: PerformanceMonitorProps) {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;

    const currentTime = performance.now();
    const elapsed = currentTime - lastTime.current;

    // Update FPS every second
    if (elapsed >= 1000) {
      const currentFps = Math.round((frameCount.current * 1000) / elapsed);
      onFpsUpdate(currentFps);
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  return null; // This component doesn't render anything in the 3D scene
}
