import * as THREE from "three";
import type { Object3D } from "three";

/**
 * ThumbnailGenerator - Generate preview thumbnails for 3D models (T007)
 * Renders model to off-screen canvas and captures as data URL
 */

export class ThumbnailGenerator {
  private static renderer: THREE.WebGLRenderer | null = null;
  private static scene: THREE.Scene | null = null;
  private static camera: THREE.PerspectiveCamera | null = null;
  private static canvas: HTMLCanvasElement | null = null;

  /**
   * Initialize off-screen rendering context
   * Creates a 256x256 canvas for thumbnail generation
   */
  private static initialize(): void {
    if (this.renderer) return;

    // Create off-screen canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = 256;
    this.canvas.height = 256;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // Required for toDataURL
    });
    this.renderer.setSize(256, 256);
    this.renderer.setClearColor(0x1a1a1a, 1); // Dark background

    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(2, 2, 5);
    this.camera.lookAt(0, 0, 0);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
  }

  /**
   * Generate thumbnail for a 3D model object
   * @param object3D Three.js Object3D to render
   * @param size Thumbnail size in pixels (default: 256)
   * @returns Data URL of the thumbnail image (PNG format)
   */
  static async generateThumbnail(
    object3D: Object3D,
    size: number = 256
  ): Promise<string> {
    this.initialize();

    if (!this.renderer || !this.scene || !this.camera || !this.canvas) {
      throw new Error("ThumbnailGenerator failed to initialize");
    }

    // Update canvas size if needed
    if (this.canvas.width !== size) {
      this.canvas.width = size;
      this.canvas.height = size;
      this.renderer.setSize(size, size);
      this.camera.aspect = 1;
      this.camera.updateProjectionMatrix();
    }

    // Clone the object to avoid modifying the original
    const clonedObject = object3D.clone();

    // Calculate bounding box to fit model in view
    const box = new THREE.Box3().setFromObject(clonedObject);
    const center = box.getCenter(new THREE.Vector3());
    const size3D = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size3D.x, size3D.y, size3D.z);

    // Center the model
    clonedObject.position.sub(center);

    // Position camera to fit model
    const cameraDistance = maxDim / Math.tan((this.camera.fov * Math.PI) / 360);
    this.camera.position.set(
      cameraDistance * 0.5,
      cameraDistance * 0.5,
      cameraDistance * 1.2
    );
    this.camera.lookAt(0, 0, 0);

    // Add model to scene
    this.scene.add(clonedObject);

    // Render
    this.renderer.render(this.scene, this.camera);

    // Capture as data URL
    const dataURL = this.canvas.toDataURL("image/png");

    // Clean up
    this.scene.remove(clonedObject);

    return dataURL;
  }

  /**
   * Generate thumbnail from a file blob
   * @param file File or Blob containing 3D model data
   * @param format File format ('gltf', 'glb', 'obj')
   * @returns Data URL of the thumbnail image
   */
  static async generateThumbnailFromFile(
    file: File | Blob,
    format: "gltf" | "glb" | "obj"
  ): Promise<string> {
    // Import ModelLoader dynamically to avoid circular dependency
    const { ModelLoader } = await import("./ModelLoader");

    // Load the model
    const result = await ModelLoader.loadModel(file, format);
    const object3D = "scene" in result ? result.scene : result;

    // Generate thumbnail
    return this.generateThumbnail(object3D);
  }

  /**
   * Clean up resources (call when shutting down app)
   */
  static dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.scene = null;
    this.camera = null;
  }
}
