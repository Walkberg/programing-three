import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PluginState {
  enabledPlugins: Set<string>;
  togglePlugin: (pluginId: string) => void;
  isPluginEnabled: (pluginId: string) => boolean;
  enablePlugin: (pluginId: string) => void;
  disablePlugin: (pluginId: string) => void;
}

export const usePluginStateStore = create<PluginState>()(
  persist(
    (set, get) => ({
      enabledPlugins: new Set<string>(),

      togglePlugin: (pluginId: string) => {
        set((state) => {
          const newSet = new Set(state.enabledPlugins);
          if (newSet.has(pluginId)) {
            newSet.delete(pluginId);
          } else {
            newSet.add(pluginId);
          }
          return { enabledPlugins: newSet };
        });
      },

      isPluginEnabled: (pluginId: string) => {
        return get().enabledPlugins.has(pluginId);
      },

      enablePlugin: (pluginId: string) => {
        set((state) => {
          const newSet = new Set(state.enabledPlugins);
          newSet.add(pluginId);
          return { enabledPlugins: newSet };
        });
      },

      disablePlugin: (pluginId: string) => {
        set((state) => {
          const newSet = new Set(state.enabledPlugins);
          newSet.delete(pluginId);
          return { enabledPlugins: newSet };
        });
      },
    }),
    {
      name: "plugin-state-storage",
      partialize: (state) => ({
        enabledPlugins: Array.from(state.enabledPlugins),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        enabledPlugins: new Set(persistedState?.enabledPlugins || []),
      }),
    }
  )
);
