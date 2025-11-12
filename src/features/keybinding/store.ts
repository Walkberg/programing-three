import { create } from "zustand";

// Namespaced shortcut actions to allow feature-scoped bindings, e.g.:
// - viewport.translate
// - viewport.rotate
// - viewport.scale
// This keeps keys grouped by feature/context.
export type ShortcutAction =
  | "viewport.translate"
  | "viewport.rotate"
  | "viewport.scale"
  | "viewport.toggleSpace"
  | "viewport.off";

export type ShortcutBindings = Record<ShortcutAction, string>;

const SHORTCUTS_STORAGE_KEY = "editor.shortcuts";

const defaultShortcuts: ShortcutBindings = {
  "viewport.translate": "t",
  "viewport.rotate": "r",
  "viewport.scale": "s",
  "viewport.toggleSpace": "q",
  "viewport.off": "escape",
};

interface KeybindingStore {
  shortcuts: ShortcutBindings;
  setShortcut: (action: ShortcutAction, key: string) => void;
  setShortcuts: (shortcuts: ShortcutBindings) => void;
  resetShortcuts: () => void;
}

export const useKeybindingStore = create<KeybindingStore>((set) => ({
  shortcuts:
    typeof window !== "undefined" && window.localStorage
      ? (() => {
          try {
            const raw = window.localStorage.getItem(SHORTCUTS_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw) as Partial<ShortcutBindings>;
              return { ...defaultShortcuts, ...parsed };
            }
          } catch (err) {
            // ignore parse errors
          }
          return defaultShortcuts;
        })()
      : defaultShortcuts,

  setShortcut: (action, key) =>
    set((state) => {
      const newShortcuts = {
        ...(state.shortcuts || defaultShortcuts),
      } as ShortcutBindings;
      newShortcuts[action as ShortcutAction] = key;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(
            SHORTCUTS_STORAGE_KEY,
            JSON.stringify(newShortcuts)
          );
        }
      } catch (err) {
        // ignore
      }
      return { shortcuts: newShortcuts } as any;
    }),

  setShortcuts: (shortcuts) =>
    set(() => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(
            SHORTCUTS_STORAGE_KEY,
            JSON.stringify(shortcuts)
          );
        }
      } catch (err) {
        // ignore
      }
      return { shortcuts } as any;
    }),

  resetShortcuts: () =>
    set(() => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(SHORTCUTS_STORAGE_KEY);
        }
      } catch (err) {
        // ignore
      }
      return { shortcuts: defaultShortcuts } as any;
    }),
}));

export { defaultShortcuts };
