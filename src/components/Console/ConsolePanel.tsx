import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Terminal } from "lucide-react";
import { useConsoleStore } from "@/state/consoleStore";
import { ConsoleMessageComponent } from "./ConsoleMessage";

/**
 * ConsolePanel - Log output display panel (T048)
 * Shows console.log output from code execution
 */

export function ConsolePanel() {
  const messages = useConsoleStore((state) => state.messages);
  const clearMessages = useConsoleStore((state) => state.clearMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setAutoScroll(isAtBottom);
    }
  };

  return (
    <div className="flex flex-col h-48 bg-card border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Console</h3>
          <span className="text-xs text-muted-foreground">
            ({messages.length} {messages.length === 1 ? "message" : "messages"})
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={clearMessages}
          disabled={messages.length === 0}
          className="h-7 px-2"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Console output will appear here during Play mode
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message) => (
              <ConsoleMessageComponent key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {!autoScroll && (
        <div className="px-3 py-1 bg-accent/50 border-t border-border text-xs text-center text-muted-foreground">
          Auto-scroll disabled. Scroll to bottom to re-enable.
        </div>
      )}
    </div>
  );
}
