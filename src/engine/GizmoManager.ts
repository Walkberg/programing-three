import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import type { GizmoManagerOptions, SnapSettings } from "@/types";

export type TransformChangeCallback = (
  id: string,
  partial: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  }
) => void;

export class GizmoManager {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private scene: THREE.Scene;
  private controls: TransformControls | null = null;
  private attachedObject: THREE.Object3D | null = null;
  private attachedId: string | null = null;
  private options: GizmoManagerOptions = {};
  private transformCallback: TransformChangeCallback | null = null;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    options?: GizmoManagerOptions
  ) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.options = options || {};

    this.initControls();
  }

  private initControls() {
    this.disposeControls();
    try {
      this.controls = new TransformControls(this.camera, this.domElement);
      this.controls.addEventListener("change", this.onChange);
      this.controls.addEventListener(
        "dragging-changed",
        this.onDraggingChanged
      );
      this.scene.add(this.controls);

      // Apply initial options
      if (this.options.mode) this.setMode(this.options.mode as any);
      if (this.options.space) this.setSpace(this.options.space as any);
      if (this.options.snap) this.setSnap(this.options.snap as any);
    } catch (err) {
      // If TransformControls isn't available, fail gracefully
      // eslint-disable-next-line no-console
      console.error(
        "[GizmoManager] Failed to initialize TransformControls",
        err
      );
      this.controls = null;
    }
  }

  private onChange = () => {
    // Called frequently while dragging; we forward transform changes
    if (!this.attachedObject || !this.attachedId) return;
    const obj = this.attachedObject;
    const partial = {
      position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
      rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
      scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
    };

    if (this.transformCallback) {
      this.transformCallback(this.attachedId, partial);
    }
  };

  private onDraggingChanged = (event: any) => {
    // When dragging starts/stops we can pause orbit controls if needed.
    // Event.detail === true when dragging starts per TransformControls implementation
    // Forward a final change on drag end
    if (event.value === false) {
      // drag ended
      this.onChange();
    }
  };

  setTransformCallback(cb: TransformChangeCallback | null) {
    this.transformCallback = cb;
  }

  attach(object: THREE.Object3D | null, gameObjectId?: string | null) {
    if (!this.controls) return;
    if (object) {
      this.controls.attach(object);
      this.attachedObject = object;
      this.attachedId =
        gameObjectId ||
        (object.userData && object.userData.gameObjectId) ||
        null;
    } else {
      this.controls.detach();
      this.attachedObject = null;
      this.attachedId = null;
    }
  }

  detach() {
    if (this.controls) {
      this.controls.detach();
    }
    this.attachedObject = null;
    this.attachedId = null;
  }

  setMode(mode: "translate" | "rotate" | "scale" | "none") {
    if (!this.controls) return;
    if (mode === "none") {
      this.controls.enabled = false;
    } else {
      this.controls.enabled = true;
      this.controls.setMode(
        mode === "translate"
          ? "translate"
          : mode === "rotate"
          ? "rotate"
          : "scale"
      );
    }
  }

  setSpace(space: "world" | "local") {
    if (!this.controls) return;
    this.controls.setSpace(space === "world" ? "world" : "local");
  }

  setSnap(snap: SnapSettings) {
    if (!this.controls) return;
    if (typeof snap.translate === "number") {
      this.controls.setTranslationSnap(snap.translate);
    } else {
      this.controls.setTranslationSnap(null as any);
    }
    if (typeof snap.rotate === "number") {
      // TransformControls expects radians
      this.controls.setRotationSnap(THREE.MathUtils.degToRad(snap.rotate));
    } else {
      this.controls.setRotationSnap(null as any);
    }
    if (typeof snap.scale === "number") {
      this.controls.setScaleSnap(snap.scale);
    } else {
      this.controls.setScaleSnap(null as any);
    }
  }

  update() {
    // No-op for now; kept for future needs
    // TransformControls updates itself via event listeners
  }

  disposeControls() {
    if (this.controls) {
      try {
        this.controls.removeEventListener("change", this.onChange);
        this.controls.removeEventListener(
          "dragging-changed",
          this.onDraggingChanged
        );
        this.scene.remove(this.controls);
        this.controls.dispose();
      } catch (err) {
        // ignore
      }
      this.controls = null;
    }
  }

  dispose() {
    this.disposeControls();
    this.transformCallback = null;
    this.attachedObject = null;
    this.attachedId = null;
  }
}
