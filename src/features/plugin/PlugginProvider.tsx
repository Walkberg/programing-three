import { Editor } from "@/editor/editor";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface EditorContextValue {
  editor: Editor;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export interface EditorProviderProps {
  children: ReactNode;
  editor?: Editor;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  editor: externalEditor,
}) => {
  const [editor] = useState(() => externalEditor || new Editor());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = editor.plugins.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, [editor]);

  return (
    <EditorContext.Provider value={{ editor }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): Editor => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor doit être utilisé dans EditorProvider");
  }
  return context.editor;
};
