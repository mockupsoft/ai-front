import * as React from "react";
import { User, Bot, Terminal, AlertCircle, Info, Pin, PinOff, ChevronRight, ChevronDown, Sparkles } from "lucide-react";
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
  // Agent coordination metadata
  senderAgentId?: string;
  recipientAgentId?: string;
  llmProvider?: string;
  llmModel?: string;
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
  senderAgentId,
  recipientAgentId,
  llmProvider,
  llmModel,
}: ChatMessageProps) {
  const [isToolExpanded, setIsToolExpanded] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const [isPinning, setIsPinning] = React.useState(false);
  // Format time once and store it - timestamp should NEVER change for a message
  // Use useRef to store the formatted time permanently, preventing any re-renders from changing it
  const formattedTimeRef = React.useRef<string>("");
  
  // Only format once when component mounts or timestamp changes
  if (!formattedTimeRef.current && timestamp && !isNaN(timestamp) && timestamp > 0) {
    try {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        // Format with seconds to show differences between messages
        // This is calculated ONCE and stored permanently
        formattedTimeRef.current = date.toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit" 
        });
      }
    } catch (e) {
      console.warn("Invalid timestamp:", timestamp, e);
      formattedTimeRef.current = "";
    }
  }
  
  const formattedTime = formattedTimeRef.current;

  // Agent color mapping for visual distinction
  const getAgentColor = (agentName: string | undefined): { bg: string; text: string; border: string } => {
    if (!agentName) return { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-900 dark:text-zinc-100", border: "border-zinc-300 dark:border-zinc-700" };
    
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      "Mike": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-900 dark:text-blue-100", border: "border-blue-300 dark:border-blue-700" },
      "Alex": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-900 dark:text-green-100", border: "border-green-300 dark:border-green-700" },
      "Bob": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-900 dark:text-purple-100", border: "border-purple-300 dark:border-purple-700" },
      "Charlie": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-900 dark:text-orange-100", border: "border-orange-300 dark:border-orange-700" },
    };
    
    return colors[agentName] || { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-900 dark:text-zinc-100", border: "border-zinc-300 dark:border-zinc-700" };
  };

  // Get agent avatar/icon
  const getAgentIcon = (agentName: string | undefined, type: MessageType) => {
    if (type === "user") return <User className="h-5 w-5" />;
    if (type === "error") return <AlertCircle className="h-5 w-5" />;
    if (type === "system") return <Info className="h-5 w-5" />;
    if (type === "tool") return <Terminal className="h-5 w-5" />;
    
    // Agent-specific icons
    if (agentName === "Mike") return <Bot className="h-5 w-5" />;
    if (agentName === "Alex") return <Terminal className="h-5 w-5" />;
    if (agentName === "Bob") return <AlertCircle className="h-5 w-5" />;
    if (agentName === "Charlie") return <Sparkles className="h-5 w-5" />;
    
    return <Bot className="h-5 w-5" />;
  };

  const agentColors = getAgentColor(senderName);
  const agentIcon = getAgentIcon(senderName, type);

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

  if (type === "system") {
    return (
      <div className={cn("flex w-full justify-center py-2", className)}>
        <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <Info className="h-3 w-3" />
          <span>{content}</span>
          <span className="opacity-50">{formattedTime || ""}</span>
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
          <div className="mt-1 text-xs opacity-70">{formattedTime || ""}</div>
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
            <span>{formattedTime || ""}</span>
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
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
          isUser
            ? "bg-blue-600 text-white border-blue-700 dark:border-blue-500"
            : cn(agentColors.bg, agentColors.text, agentColors.border)
        )}
      >
        {agentIcon}
      </div>

      <div className={cn("flex max-w-[80%] flex-col", isUser ? "items-end" : "items-start")}>
        <div className="mb-1 flex items-center justify-between w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-xs font-semibold",
              isUser ? "text-blue-600 dark:text-blue-400" : agentColors.text
            )}>
              {senderName || (isUser ? "You" : "Agent")}
            </span>
            {!isUser && llmProvider && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                {llmProvider}
              </span>
            )}
            {!isUser && llmModel && (
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                {llmModel.split('/').pop()?.split(':').shift()}
              </span>
            )}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{formattedTime || ""}</span>
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
            "relative rounded-lg px-4 py-2 text-sm border",
            isUser
              ? "rounded-tr-none bg-blue-600 text-white border-blue-700 dark:border-blue-500"
              : cn("rounded-tl-none", agentColors.bg, agentColors.text, agentColors.border)
          )}
        >
          <div className="whitespace-pre-wrap break-words">{content}</div>
          {/* Agent coordination metadata */}
          {!isUser && (senderAgentId || recipientAgentId || llmProvider) && (
            <div className="mt-2 pt-2 border-t border-zinc-300 dark:border-zinc-700 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              {senderAgentId && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">From:</span>
                  <span className="font-mono">{senderAgentId.substring(0, 8)}...</span>
                </span>
              )}
              {recipientAgentId && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">To:</span>
                  <span className="font-mono">{recipientAgentId.substring(0, 8)}...</span>
                </span>
              )}
              {llmProvider && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">LLM:</span>
                  <span className="font-mono">{llmProvider}</span>
                  {llmModel && <span className="font-mono">/{llmModel}</span>}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
