type Callback = (payload?: any) => void;

const subscribers = new Map<string, Set<Callback>>();

export const useToolbarActionsStore = {
  getState() {
    return {
      subscribe(id: string, cb: Callback) {
        if (!subscribers.has(id)) subscribers.set(id, new Set());
        const set = subscribers.get(id)!;
        set.add(cb);
        return () => set.delete(cb);
      },

      invoke(id: string, payload?: any) {
        const set = subscribers.get(id);
        if (!set) return;
        for (const cb of Array.from(set)) {
          try {
            cb(payload);
          } catch (err) {
            // ignore subscriber errors
          }
        }
      },
    };
  },
};

export default useToolbarActionsStore;
