"use client";

import * as React from "react";
import { useWebSocket } from "@/components/WebSocketProvider";
import { fetchAgentMessages } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { ChatMessageList } from "./chat-message-list";
import { ChatMessageProps, MessageType } from "./chat-message";
import type { AgentMessage } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface TaskLiveChatProps {
  taskId: string;
  runId?: string;
  className?: string;
}

export function TaskLiveChat({ taskId, runId, className }: TaskLiveChatProps) {
  const [messages, setMessages] = React.useState<ChatMessageProps[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isTyping, setIsTyping] = React.useState(false);
  const [typingAgentName, setTypingAgentName] = React.useState<string>("Agent");

  const { lastMessage } = useWebSocket();
  const { currentWorkspace, currentProject } = useWorkspace();

  const handlePinToMemory = React.useCallback((messageId: string, content: string, title: string) => {
    // This will be handled by the MemoryInspector component via WebSocket or polling
    // For now, we just refresh the task monitoring view when memory is updated
    console.log("Message pinned to memory:", { messageId, content, title });
  }, []);

  // Convert AgentMessage to ChatMessageProps
  const mapAgentMessageToChat = (msg: AgentMessage): ChatMessageProps => {
    let type: MessageType = "agent";
    if (msg.role === "user") type = "user";
    if (msg.role === "system") type = "system";
    
    // Check for error
    if (msg.actionType === "error") type = "error";

    // Check for tool
    // We assume if actionType is executing/completed and content is structured or marked, it's a tool.
    // Since we don't have explicit tool fields in AgentMessage, we'll try to use heuristics or metadata if available.
    // For now, if role is assistant and actionType is executing, we treat it as tool if possible, or just agent message with status.
    
    // But the ticket requirement says: "tool: Tool name + input/output display"
    // If the backend sends tool calls as agent messages with actionType='executing',
    // we might need to parse the content if it's JSON.
    
    let toolName: string | undefined;
    let toolInput: string | undefined;
    let toolOutput: string | undefined;

    if (msg.actionType === "executing" || msg.actionType === "completed") {
        // Simple heuristic: if content starts with "Tool:", treat as tool
        // This is a placeholder logic. Real logic depends on actual message format.
        if (msg.content.startsWith("Tool:")) {
            type = "tool";
            const parts = msg.content.split("\n");
            toolName = parts[0].replace("Tool:", "").trim();
            // Try to find input/output
            // content could be:
            // Tool: Calculator
            // Input: { "a": 1, "b": 2 }
            // Output: 3
            
            const inputIndex = parts.findIndex(p => p.startsWith("Input:"));
            const outputIndex = parts.findIndex(p => p.startsWith("Output:"));
            
            if (inputIndex !== -1) {
                const end = outputIndex !== -1 ? outputIndex : parts.length;
                toolInput = parts.slice(inputIndex + 1, end).join("\n").trim();
            }
            
            if (outputIndex !== -1) {
                toolOutput = parts.slice(outputIndex + 1).join("\n").trim();
            }
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
    };
  };

  const loadMessages = React.useCallback(async () => {
    try {
      setIsLoading(true);
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
        const mapped = sorted.map(mapAgentMessageToChat);
        setMessages(mapped);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
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
          id: `${Date.now()}-${Math.random()}`,
          taskId,
          runId,
          agentName: payload.agentName || "Agent",
          role: (payload.role as AgentMessage["role"]) || "assistant",
          content: payload.content || "",
          timestamp: payload.timestamp || Date.now(),
          actionType: (payload.actionType as AgentMessage["actionType"]) || undefined,
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
                 // De-duplicate by content and timestamp if needed, but simplified for now
                 // Assuming unique events
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
