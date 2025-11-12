import React, { useEffect } from "react";
import { useToolbarActions } from "@/hooks/useToolbarActions";
import { useLayoutStore } from "@/state/layoutStore";

export function RegisterToolbarActionDemo() {
  const { register, onAction, unregister } = useToolbarActions();

  useEffect(() => {
    register("demo.addHierarchyTab", {
      title: "Add Hierarchy Tab",
      category: "Layouts",
      order: 10,
    });

    const unsub = onAction("demo.addHierarchyTab", () => {
      // pick first leaf zone to add a panel (reuse existing helper pattern)
      const root = useLayoutStore.getState().rootZone;
      // find first leaf id
      const findFirstLeaf = (zone: any): any => {
        if (zone.type === "leaf") return zone;
        if (zone.type === "split") return findFirstLeaf(zone.children[0]);
        return null;
      };
      const leaf = findFirstLeaf(root);
      if (leaf) {
        // use a deterministic panel id for demo
        useLayoutStore.getState().addTabToZone("hierarchy-demo", leaf.id);
      }
    });

    return () => {
      unsub();
      unregister("demo.addHierarchyTab");
    };
  }, [register, onAction, unregister]);

  return null;
}
