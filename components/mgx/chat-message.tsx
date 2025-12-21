import * as React from "react";
import { User, Bot, Terminal, AlertCircle, Info, Pin, PinOff, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { pinMessageToMemory } from "@/lib/api";

export type MessageType = "user" | "agent" | "tool" | "system" | "error";

export interface ChatMessageProps {
  type: MessageType;
  content: string;
  senderName?: string;
  timestamp: number;
  toolName?: string;
  toolInput?: string;
  toolOutput?: string;
  isThinking?: boolean;
  messageId?: string; // For pinning functionality
  taskId?: string; // For pinning functionality
  className?: string;
  onPinToMemory?: (messageId: string, content: string, title: string) => void;
}

export function ChatMessage({
  type,
  content,
  senderName,
  timestamp,
  toolName,
  toolInput,
  toolOutput,
  isThinking,
  messageId,
  taskId,
  className,
  onPinToMemory,
}: ChatMessageProps) {
  const [isToolExpanded, setIsToolExpanded] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const [isPinning, setIsPinning] = React.useState(false);

  const handlePinToMemory = async () => {
    if (!messageId || !taskId) return;

    setIsPinning(true);
    try {
      const title = `${senderName || (isUser ? "You" : "Agent")}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`;
      await pinMessageToMemory(taskId, messageId);
      setIsPinned(true);
      toast.success("Message pinned to memory");
      onPinToMemory?.(messageId, content, title);
    } catch {
      toast.error("Failed to pin message");
    } finally {
      setIsPinning(false);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (type === "system") {
    return (
      <div className={cn("flex w-full justify-center py-2", className)}>
        <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <Info className="h-3 w-3" />
          <span>{content}</span>
          <span className="opacity-50">{formatTime(timestamp)}</span>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className={cn("flex w-full justify-center py-2", className)}>
        <div className="flex w-full max-w-2xl flex-col gap-1 rounded-md border border-red-200 bg-red-50 p-3 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4" />
            <span>Error</span>
          </div>
          <div className="text-sm">{content}</div>
          <div className="mt-1 text-xs opacity-70">{formatTime(timestamp)}</div>
        </div>
      </div>
    );
  }

  if (type === "tool") {
    return (
      <div className={cn("flex w-full py-2", className)}>
        <div className="flex w-full max-w-2xl flex-col gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <button
            onClick={() => setIsToolExpanded(!isToolExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            <Terminal className="h-4 w-4" />
            <span>Used tool: {toolName}</span>
            {isToolExpanded ? (
              <ChevronDown className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronRight className="h-4 w-4 opacity-50" />
            )}
          </button>
          
          {isToolExpanded && (
            <div className="space-y-3 pl-6">
              {toolInput && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-zinc-500">Input</div>
                  <pre className="overflow-x-auto rounded bg-zinc-100 p-2 font-mono text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                    {toolInput}
                  </pre>
                </div>
              )}
              {toolOutput && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-zinc-500">Output</div>
                  <pre className="overflow-x-auto rounded bg-zinc-100 p-2 font-mono text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                    {toolOutput}
                  </pre>
                </div>
              )}
              {!toolInput && !toolOutput && (
                 <div className="text-xs text-zinc-500 italic">No input/output details available</div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pl-6 text-xs text-zinc-500">
            <span>{isThinking ? "Executing..." : "Completed"}</span>
            <span>{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  const isUser = type === "user";

  return (
    <div className={cn("flex w-full gap-3 py-2", isUser ? "flex-row-reverse" : "flex-row", className)}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      <div className={cn("flex max-w-[80%] flex-col", isUser ? "items-end" : "items-start")}>
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {senderName || (isUser ? "You" : "Agent")}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatTime(timestamp)}</span>
          </div>
          {messageId && taskId && (type === "user" || type === "agent") && (
            <button
              onClick={handlePinToMemory}
              disabled={isPinning}
              className={cn(
                "opacity-0 group-hover:opacity-100 p-1 rounded transition-all",
                isPinned 
                  ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
              title={isPinned ? "Pinned to memory" : "Pin to memory"}
            >
              {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </button>
          )}
        </div>

        <div
          className={cn(
            "relative rounded-lg px-4 py-2 text-sm",
            isUser
              ? "rounded-tr-none bg-blue-600 text-white"
              : "rounded-tl-none bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          )}
        >
          <div className="whitespace-pre-wrap break-words">{content}</div>
        </div>
      </div>
    </div>
  );
}
