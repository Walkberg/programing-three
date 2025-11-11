import { AlertCircle, Info, AlertTriangle, Terminal } from "lucide-react";
import type { ConsoleMessage, ConsoleMessageType } from "@/state/consoleStore";

/**
 * ConsoleMessage - Single log entry display (T049)
 * Shows icon, message, and timestamp
 */

interface ConsoleMessageProps {
  message: ConsoleMessage;
}

export function ConsoleMessageComponent({ message }: ConsoleMessageProps) {
  const getIcon = (type: ConsoleMessageType) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "log":
      default:
        return <Terminal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTextColor = (type: ConsoleMessageType) => {
    switch (type) {
      case "error":
        return "text-destructive";
      case "warn":
        return "text-yellow-600 dark:text-yellow-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      case "log":
      default:
        return "text-foreground";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="flex items-start gap-2 px-3 py-1.5 text-xs font-mono border-b border-border/50 hover:bg-accent/30">
      <span className="shrink-0 mt-0.5">{getIcon(message.type)}</span>
      <span className="text-muted-foreground shrink-0 mt-0.5 tabular-nums">
        {formatTime(message.timestamp)}
      </span>
      <span className={`flex-1 break-all ${getTextColor(message.type)}`}>
        {message.message}
      </span>
    </div>
  );
}
