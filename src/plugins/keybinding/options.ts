export interface KeybindingOptions {
  /** Minimum milliseconds between processing key events (simple throttle) */
  minEventIntervalMs?: number;
}

export const defaultKeybindingOptions: KeybindingOptions = {
  minEventIntervalMs: 50,
};

export default defaultKeybindingOptions;
