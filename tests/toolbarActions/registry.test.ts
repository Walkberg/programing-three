import { describe, it, expect, beforeEach } from "vitest";
import { ToolbarActionRegistry } from "@/components/ToolbarActions/ToolbarActionRegistry";
import { useToolbarActionsStore } from "@/state/toolbarActionsStore";

describe("ToolbarActionRegistry", () => {
  beforeEach(() => {
    ToolbarActionRegistry.clearRegisteredActions();
    // clear subscribers
    const state = useToolbarActionsStore.getState();
    // not exposed clear, but we can rely on fresh store between tests in vitest env
  });

  it("registers and lists actions", () => {
    ToolbarActionRegistry.registerToolbarAction("a1", {
      title: "Action 1" as any,
    });
    const list = ToolbarActionRegistry.getRegisteredActions();
    expect(list.find((a) => a.id === "a1")).toBeTruthy();
  });

  it("invokes subscribers when action is invoked", () => {
    let called = false;
    const unsub = useToolbarActionsStore
      .getState()
      .subscribe("test.invoke", () => {
        called = true;
      });

    useToolbarActionsStore.getState().invoke("test.invoke");
    expect(called).toBe(true);
    unsub();
  });
});
