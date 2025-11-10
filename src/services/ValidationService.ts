import { z } from "zod";

// Vector3 schema
export const Vector3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

// Euler schema
export const EulerSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
  order: z.enum(["XYZ", "YXZ", "ZXY", "ZYX", "YZX", "XZY"]).optional(),
});

// Transform component schema
export const TransformSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("Transform"),
  enabled: z.boolean(),
  position: Vector3Schema,
  rotation: EulerSchema,
  scale: Vector3Schema.refine(
    (scale) => scale.x > 0 && scale.y > 0 && scale.z > 0,
    { message: "Scale values must be positive" }
  ),
});

// MeshRenderer component schema
export const MeshRendererSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("MeshRenderer"),
  enabled: z.boolean(),
  geometry: z.enum(["cube", "sphere", "plane"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  visible: z.boolean(),
});

// Generic Component schema
export const ComponentSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  enabled: z.boolean(),
});

// GameObject schema
export const GameObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  parent: z.string().uuid().nullable(),
  components: z.array(ComponentSchema),
});

// Scene schema
export const SceneSchema = z.object({
  version: z.string(),
  gameObjects: z.array(GameObjectSchema),
  metadata: z.object({
    createdAt: z.string().datetime(),
    modifiedAt: z.string().datetime(),
    editorVersion: z.string(),
  }),
});

export class ValidationService {
  /**
   * Validate Transform component data
   */
  static validateTransform(data: unknown): z.infer<typeof TransformSchema> {
    return TransformSchema.parse(data);
  }

  /**
   * Validate MeshRenderer component data
   */
  static validateMeshRenderer(
    data: unknown
  ): z.infer<typeof MeshRendererSchema> {
    return MeshRendererSchema.parse(data);
  }

  /**
   * Validate GameObject data
   */
  static validateGameObject(data: unknown): z.infer<typeof GameObjectSchema> {
    return GameObjectSchema.parse(data);
  }

  /**
   * Validate Scene data
   */
  static validateScene(data: unknown): z.infer<typeof SceneSchema> {
    return SceneSchema.parse(data);
  }

  /**
   * Safe validation that returns result object instead of throwing
   */
  static safeValidateTransform(data: unknown): {
    success: boolean;
    data?: z.infer<typeof TransformSchema>;
    error?: z.ZodError;
  } {
    const result = TransformSchema.safeParse(data);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error };
  }

  static safeValidateMeshRenderer(data: unknown): {
    success: boolean;
    data?: z.infer<typeof MeshRendererSchema>;
    error?: z.ZodError;
  } {
    const result = MeshRendererSchema.safeParse(data);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error };
  }

  static safeValidateScene(data: unknown): {
    success: boolean;
    data?: z.infer<typeof SceneSchema>;
    error?: z.ZodError;
  } {
    const result = SceneSchema.safeParse(data);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error };
  }

  /**
   * Get user-friendly error messages from Zod errors
   */
  static getErrorMessages(error: z.ZodError): string[] {
    return error.errors.map((err) => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });
  }
}
