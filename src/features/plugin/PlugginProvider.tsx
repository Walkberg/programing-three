import { PluginManager } from "@/editor/plugin/plugin-manager";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface PluginContextValue {
  manager: PluginManager;
}

const PluginContext = createContext<PluginContextValue | null>(null);

export interface PluginProviderProps {
  children: ReactNode;
  manager?: PluginManager;
}

export const PluginProvider: React.FC<PluginProviderProps> = ({
  children,
  manager: externalManager,
}) => {
  const [manager] = useState(
    () => externalManager || new PluginManager({ enableLogging: true })
  );
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, [manager]);

  return (
    <PluginContext.Provider value={{ manager }}>
      {children}
    </PluginContext.Provider>
  );
};

export const usePluginManager = (): PluginManager => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error("usePluginManager doit être utilisé dans PluginProvider");
  }
  return context.manager;
};
