import { describe, it, expect } from "vitest";
import { useSceneStore } from "../../src/state/sceneStore";
import { useHistoryStore } from "../../src/state/historyStore";

describe("historyStore basic push/undo/redo", () => {
  it("pushes and undoes scene snapshots", () => {
    // initialize scene
    useSceneStore.getState().setScene([]);
    useHistoryStore.getState().clear();

    // Add a game object to scene
    const id = useSceneStore.getState().addGameObject("Test");
    // push snapshot
    useHistoryStore.getState().push();

    // Make another change
    const id2 = useSceneStore.getState().addGameObject("Test2");

    // Undo should restore to snapshot with 1 object
    useHistoryStore.getState().undo();
    const gos = useSceneStore.getState().gameObjects;
    expect(gos.length).toBe(1);
  });
});
