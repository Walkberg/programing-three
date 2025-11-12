import { beforeEach, describe, it, expect } from "vitest";
import { useSceneStore } from "@/state/sceneStore";

describe("sceneStore.removeGameObject", () => {
  beforeEach(() => {
    // reset store
    useSceneStore.getState().clear();
  });

  it("deletes descendants when deleteChildren=true", () => {
    const a = useSceneStore.getState().addGameObject("A", null);
    const b = useSceneStore.getState().addGameObject("B", a);
    const c = useSceneStore.getState().addGameObject("C", b);

    expect(useSceneStore.getState().gameObjects.length).toBe(3);

    useSceneStore.getState().removeGameObject(b, true);

    const ids = useSceneStore.getState().gameObjects.map((g: any) => g.id);
    expect(ids).not.toContain(b);
    expect(ids).not.toContain(c);
    expect(ids).toContain(a);
  });

  it("promotes direct children to root when deleteChildren=false", () => {
    const a = useSceneStore.getState().addGameObject("A", null);
    const b = useSceneStore.getState().addGameObject("B", a);
    const c = useSceneStore.getState().addGameObject("C", b);

    // confirm initial parent relationships
    let bObj = useSceneStore.getState().gameObjectMap.get(b);
    let cObj = useSceneStore.getState().gameObjectMap.get(c);
    expect(bObj).toBeDefined();
    expect(cObj).toBeDefined();
    expect((cObj as any).parentId ?? (cObj as any).parent).toBe(b);

    // delete B but promote children
    useSceneStore.getState().removeGameObject(b, false);

    // B should be removed
    expect(useSceneStore.getState().gameObjectMap.get(b)).toBeUndefined();

    // C should still exist and have parentId === null (promoted)
    const cAfter = useSceneStore.getState().gameObjectMap.get(c);
    expect(cAfter).toBeDefined();
    expect(cAfter!.parentId).toBeNull();

    // A should still exist
    expect(useSceneStore.getState().gameObjectMap.get(a)).toBeDefined();
  });

  it("deleting a leaf node removes only that node", () => {
    const a = useSceneStore.getState().addGameObject("Leaf", null);
    expect(useSceneStore.getState().gameObjectMap.get(a)).toBeDefined();
    useSceneStore.getState().removeGameObject(a); // default deletes children
    expect(useSceneStore.getState().gameObjectMap.get(a)).toBeUndefined();
  });
});
