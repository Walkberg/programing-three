import { describe, it, expect } from "vitest";
import { GizmoManager } from "../../src/engine/GizmoManager";
import * as THREE from "three";

describe("GizmoManager hover API", () => {
  it("should allow registering a hover callback and reporting hover", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const canvas = {} as any;
    const manager = new GizmoManager(scene, camera, canvas as any);

    let last: string | null = null;
    manager.setHoverCallback((h: string | null) => (last = h));
    manager.reportHover("X");
    expect(last).toBe("X");
  });
});
