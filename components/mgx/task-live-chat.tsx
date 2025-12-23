"use client";

import * as React from "react";
import { useWebSocket } from "@/components/WebSocketProvider";
import { fetchAgentMessages, pinMessageToMemory } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { ChatMessageList } from "./chat-message-list";
import { ChatMessageProps, MessageType } from "./chat-message";
import type { AgentMessage } from "@/lib/types";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/mgx/ui/button";

interface TaskLiveChatProps {
  taskId: string;
  runId?: string;
  className?: string;
  onMemoryUpdate?: () => void; // MemoryInspector'ı refresh etmek için callback
}

export function TaskLiveChat({ taskId, runId, className, onMemoryUpdate }: TaskLiveChatProps) {
  const [messages, setMessages] = React.useState<ChatMessageProps[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const [typingAgentName, setTypingAgentName] = React.useState<string>("Agent");

  const { lastMessage } = useWebSocket();
  const { currentWorkspace, currentProject } = useWorkspace();

  const handlePinToMemory = React.useCallback(async (messageId: string, content: string, title: string) => {
    try {
      await pinMessageToMemory(taskId, messageId, "thread", {
        workspaceId: currentWorkspace?.id,
        projectId: currentProject?.id,
      });
      toast.success("Message pinned to memory");
      onMemoryUpdate?.(); // MemoryInspector'ı refresh et
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to pin message");
    }
  }, [taskId, currentWorkspace?.id, currentProject?.id, onMemoryUpdate]);

  // Parse tool message from AgentMessage
  const parseToolMessage = (msg: AgentMessage): { toolName?: string; toolInput?: string; toolOutput?: string } => {
    // 1. Payload içinde tool bilgisi var mı kontrol et
    if (msg.payload) {
      if (msg.payload.tool || msg.payload.toolName) {
        return {
          toolName: msg.payload.toolName || msg.payload.tool,
          toolInput: msg.payload.toolInput || msg.payload.input 
            ? (typeof msg.payload.toolInput === "string" 
                ? msg.payload.toolInput 
                : JSON.stringify(msg.payload.toolInput || msg.payload.input))
            : undefined,
          toolOutput: msg.payload.toolOutput || msg.payload.output || msg.payload.result
            ? (typeof (msg.payload.toolOutput || msg.payload.output || msg.payload.result) === "string"
                ? (msg.payload.toolOutput || msg.payload.output || msg.payload.result)
                : JSON.stringify(msg.payload.toolOutput || msg.payload.output || msg.payload.result))
            : undefined
        };
      }
    }
    
    // 2. Content JSON ise parse et
    if (msg.content.trim().startsWith("{") || msg.content.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.tool || parsed.toolName) {
          return {
            toolName: parsed.toolName || parsed.tool,
            toolInput: parsed.input || parsed.toolInput
              ? (typeof parsed.input === "string" ? parsed.input : JSON.stringify(parsed.input || parsed.toolInput))
              : undefined,
            toolOutput: parsed.output || parsed.toolOutput || parsed.result
              ? (typeof (parsed.output || parsed.toolOutput || parsed.result) === "string"
                  ? (parsed.output || parsed.toolOutput || parsed.result)
                  : JSON.stringify(parsed.output || parsed.toolOutput || parsed.result))
              : undefined
          };
        }
      } catch {
        // Not valid JSON, continue
      }
    }
    
    // 3. Mevcut heuristic (fallback)
    if (msg.content.startsWith("Tool:")) {
      const parts = msg.content.split("\n");
      const toolName = parts[0].replace("Tool:", "").trim();
      const inputIndex = parts.findIndex(p => p.startsWith("Input:"));
      const outputIndex = parts.findIndex(p => p.startsWith("Output:"));
      
      let toolInput: string | undefined;
      let toolOutput: string | undefined;
      
      if (inputIndex !== -1) {
        const end = outputIndex !== -1 ? outputIndex : parts.length;
        toolInput = parts.slice(inputIndex + 1, end).join("\n").trim();
      }
      
      if (outputIndex !== -1) {
        toolOutput = parts.slice(outputIndex + 1).join("\n").trim();
      }
      
      return { toolName, toolInput, toolOutput };
    }
    
    return {};
  };

  // Convert AgentMessage to ChatMessageProps
  const mapAgentMessageToChat = (msg: AgentMessage): ChatMessageProps => {
    let type: MessageType = "agent";
    if (msg.role === "user") type = "user";
    if (msg.role === "system") type = "system";
    
    // Check for error
    if (msg.actionType === "error") type = "error";

    // Check for tool using improved parsing
    let toolName: string | undefined;
    let toolInput: string | undefined;
    let toolOutput: string | undefined;

    if (msg.actionType === "executing" || msg.actionType === "completed") {
      const toolInfo = parseToolMessage(msg);
      if (toolInfo.toolName) {
        type = "tool";
        toolName = toolInfo.toolName;
        toolInput = toolInfo.toolInput;
        toolOutput = toolInfo.toolOutput;
      }
    }

    return {
      type,
      content: msg.content,
      senderName: msg.agentName,
      timestamp: msg.timestamp,
      toolName,
      toolInput,
      toolOutput,
      isThinking: msg.actionType === "thinking" || msg.actionType === "executing",
      messageId: msg.id,
      taskId: taskId,
    };
  };

  const loadMessages = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendMessages = await fetchAgentMessages(
        taskId,
        100,
        0,
        {
          workspaceId: currentWorkspace?.id,
          projectId: currentProject?.id,
        }
      );

      if (backendMessages && Array.isArray(backendMessages)) {
        const sorted = backendMessages.sort((a: AgentMessage, b: AgentMessage) => a.timestamp - b.timestamp);
        
        // Deduplicate messages by ID
        const seenIds = new Set<string>();
        const uniqueMessages = sorted.filter((msg: AgentMessage) => {
          if (seenIds.has(msg.id)) return false;
          seenIds.add(msg.id);
          return true;
        });
        
        const mapped = uniqueMessages.map(mapAgentMessageToChat);
        setMessages(mapped);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load messages");
      setError(error);
      console.error("Failed to load messages:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, currentWorkspace?.id, currentProject?.id]);

  React.useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  React.useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "agent_message" || lastMessage.type === "agent_action") {
      const payload = lastMessage.payload as Partial<AgentMessage>;
      
      if (payload.taskId === taskId && (!runId || payload.runId === runId)) {
        const newMessage: AgentMessage = {
          id: payload.id || `${Date.now()}-${Math.random()}`,
          taskId,
          runId,
          agentName: payload.agentName || "Agent",
          role: (payload.role as AgentMessage["role"]) || "assistant",
          content: payload.content || "",
          timestamp: payload.timestamp || Date.now(),
          actionType: (payload.actionType as AgentMessage["actionType"]) || undefined,
          payload: payload.payload || (payload as any),
        };

        // Handle typing state
        if (newMessage.actionType === "thinking") {
            setIsTyping(true);
            setTypingAgentName(newMessage.agentName);
        } else if (newMessage.actionType === "completed" || newMessage.actionType === "error") {
            setIsTyping(false);
        }

        // Add message if it's not just "thinking" status update, OR if we want to show thinking as a message?
        // Usually thinking is a state, but sometimes it comes with content.
        // If content is present, we add it.
        
        if (newMessage.content) {
             const chatMsg = mapAgentMessageToChat(newMessage);
             setMessages((prev) => {
                 // De-duplicate by message ID first, then by timestamp and content
                 const existsById = prev.some(m => m.messageId === chatMsg.messageId);
                 if (existsById) return prev;
                 
                 // Fallback: check by timestamp and content (within 1 second window)
                 const existsByTimestamp = prev.some(m => 
                   Math.abs(m.timestamp - chatMsg.timestamp) < 1000 &&
                   m.content === chatMsg.content &&
                   m.senderName === chatMsg.senderName
                 );
                 if (existsByTimestamp) return prev;
                 
                 return [...prev, chatMsg];
             });
        }
      }
    }
  }, [lastMessage, taskId, runId]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-500">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Failed to load messages</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{error.message}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadMessages()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (messages.length === 0 && !isTyping) {
      return (
          <div className="flex h-64 items-center justify-center text-zinc-500">
              No messages yet.
          </div>
      );
  }

  return (
    <div className={className}>
      <ChatMessageList 
        messages={messages} 
        isTyping={isTyping} 
        typingAgentName={typingAgentName}
        taskId={taskId}
        onPinToMemory={handlePinToMemory}
        className="h-full"
      />
    </div>
  );
}
