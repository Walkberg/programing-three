import { create } from "zustand";

type Callback = (payload?: any) => void;

interface ToolbarActionsState {
  // Map actionId -> set of callbacks
  subscribers: Record<string, Callback[]>;
  subscribe: (id: string, cb: Callback) => () => void;
  invoke: (id: string, payload?: any) => void;
}

export const useToolbarActionsStore = create<ToolbarActionsState>(
  (set, get) => ({
    subscribers: {},
    subscribe: (id: string, cb: Callback) => {
      set((state) => {
        const list = state.subscribers[id]
          ? [...state.subscribers[id], cb]
          : [cb];
        return { subscribers: { ...state.subscribers, [id]: list } };
      });

      let unsubscribed = false;
      return () => {
        if (unsubscribed) return;
        unsubscribed = true;
        set((state) => {
          const list = (state.subscribers[id] || []).filter((c) => c !== cb);
          const next = { ...state.subscribers };
          if (list.length === 0) delete next[id];
          else next[id] = list;
          return { subscribers: next };
        });
      };
    },
    invoke: (id: string, payload?: any) => {
      const subs = get().subscribers[id] || [];
      subs.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          // swallow to avoid failing others
          // logging can be added later
        }
      });
    },
  })
);
