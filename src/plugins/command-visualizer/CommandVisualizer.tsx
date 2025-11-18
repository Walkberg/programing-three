import { useEditor } from "@/features/plugin/PlugginProvider";

export const CommandVisualizer = () => {
  const editor = useEditor();

  return (
    <div>
      Command Visualizer Plugin Active
      <div>
        {editor.commands.getCommands().map((command) => (
          <div key={command}>
            <h3>{command}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
