import { create } from "zustand";

/**
 * Console message types for logging
 */
export type ConsoleMessageType = "log" | "warn" | "error" | "info";

/**
 * Console message interface
 */
export interface ConsoleMessage {
  id: string;
  type: ConsoleMessageType;
  message: string;
  timestamp: Date;
  gameObjectId?: string;
  componentId?: string;
}

/**
 * ConsoleStore - Zustand store for console messages (T048-T050)
 * Manages console output from code execution
 */
interface ConsoleStore {
  messages: ConsoleMessage[];
  maxMessages: number;

  // Actions
  addMessage: (message: Omit<ConsoleMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setMaxMessages: (max: number) => void;
}

export const useConsoleStore = create<ConsoleStore>((set) => ({
  messages: [],
  maxMessages: 100,

  addMessage: (message) =>
    set((state) => {
      const newMessage: ConsoleMessage = {
        ...message,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };

      const newMessages = [...state.messages, newMessage];

      // Trim to max messages
      if (newMessages.length > state.maxMessages) {
        newMessages.splice(0, newMessages.length - state.maxMessages);
      }

      return { messages: newMessages };
    }),

  clearMessages: () => set({ messages: [] }),

  setMaxMessages: (max) => set({ maxMessages: max }),
}));
