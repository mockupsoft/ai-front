"use client";

import * as React from "react";
import { useWebSocket } from "@/components/WebSocketProvider";
import { fetchAgentMessages, pinMessageToMemory, createPlanFromChat, approvePlan } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { ChatMessageList } from "./chat-message-list";
import { ChatMessageProps, MessageType } from "./chat-message";
import { ChatInput } from "./chat-input";
import { PlanPreview, type PlanItem } from "./plan-preview";
import type { AgentMessage } from "@/lib/types";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/mgx/ui/button";
import { cn } from "@/lib/utils";

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
  const [inputValue, setInputValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [pendingPlan, setPendingPlan] = React.useState<{
    plan: string;
    outputs: string[];
    commands: string[];
    checklist: PlanItem[];
    runId: string;
  } | null>(null);

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

  const handleSendMessage = React.useCallback(async (message: string) => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      // Add user message to chat
      const userMessage: ChatMessageProps = {
        type: "user",
        content: message,
        senderName: "You",
        timestamp: Date.now(),
        taskId: taskId,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Create plan from chat message
      const planResponse = await createPlanFromChat(
        taskId,
        {
          message,
          task_description: message,
        },
        {
          workspaceId: currentWorkspace?.id,
          projectId: currentProject?.id,
        }
      );

      // Parse plan to extract outputs, commands, and checklist
      const planText = planResponse.plan || "";
      const outputs: string[] = [];
      const commands: string[] = [];
      const checklist: PlanItem[] = [];

      // Extract outputs section (look for "Çıktılar" or "Outputs" heading)
      const outputsSection = planText.match(/(?:Çıktılar|Outputs)[:\s]*\n((?:\d+\.\s+[^\n]+\n?)+)/i);
      if (outputsSection) {
        const outputLines = outputsSection[1].match(/\d+\.\s+([^\n]+)/g);
        if (outputLines) {
          outputs.push(...outputLines.map((m) => m.replace(/^\d+\.\s+/, "").trim()));
        }
      }

      // Extract commands section (look for code blocks)
      const commandBlocks = planText.match(/```(?:bash|sh|python|javascript|typescript)?\n([\s\S]*?)```/g);
      if (commandBlocks) {
        commands.push(...commandBlocks.map((m) => m.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim()));
      }

      // Extract checklist items (look for various patterns)
      const checklistPatterns = [
        /[-*]\s*[✓✔✅]\s*([^\n]+)/g,  // - ✓ item
        /[-*]\s*\[[xX ]\]\s*([^\n]+)/g,  // - [ ] item
        /[-*]\s*([^\n]+)/g,  // - item (fallback)
      ];

      for (const pattern of checklistPatterns) {
        const matches = planText.match(pattern);
        if (matches && matches.length > 0) {
          checklist.push(
            ...matches.map((m, idx) => ({
              id: `item-${idx}`,
              text: m.replace(/[-*✓✔✅\[\]xX ]\s*/g, "").trim(),
              completed: /[✓✔✅xX]/.test(m),
            }))
          );
          break; // Use first pattern that matches
        }
      }

      // If no checklist found, create default one based on plan content
      if (checklist.length === 0) {
        checklist.push(
          { id: "item-1", text: "Plan oluşturuldu", completed: true },
          { id: "item-2", text: "Task başlatılacak", completed: false },
          { id: "item-3", text: "Execution başlayacak", completed: false }
        );
      }

      // If no outputs found, try to extract from plan text
      if (outputs.length === 0) {
        const numberedItems = planText.match(/\d+\.\s+([^\n]+)/g);
        if (numberedItems && numberedItems.length > 0) {
          outputs.push(...numberedItems.slice(0, 4).map((m) => m.replace(/^\d+\.\s+/, "").trim()));
        }
      }

      // Show plan preview
      setPendingPlan({
        plan: planText,
        outputs: outputs.length > 0 ? outputs : ["Plan detayları yukarıda gösterilecek"],
        commands: commands.length > 0 ? commands : [],
        checklist,
        runId: planResponse.run_id,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create plan");
      console.error("Plan creation error:", error);
    } finally {
      setIsSending(false);
    }
  }, [taskId, currentWorkspace?.id, currentProject?.id, isSending]);

  const handleApprovePlan = React.useCallback(async () => {
    if (!pendingPlan) return;

    try {
      await approvePlan(
        taskId,
        pendingPlan.runId,
        {
          workspaceId: currentWorkspace?.id,
          projectId: currentProject?.id,
        }
      );

      toast.success("Plan approved, task starting...");
      setPendingPlan(null);
      setInputValue("");
      
      // Reload messages to see new agent messages
      loadMessages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve plan");
    }
  }, [pendingPlan, taskId, currentWorkspace?.id, currentProject?.id, loadMessages]);

  const handleRejectPlan = React.useCallback(() => {
    setPendingPlan(null);
    setInputValue("");
    toast.info("Plan rejected");
  }, []);

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
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <svg
                          className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                      </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      Start a conversation
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Ask me anything about your task or project. I'm here to help!
                  </p>
              </div>
              
              <div className="w-full max-w-md space-y-3">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-900">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          💡 Example questions:
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <li>• "Create a new feature for user authentication"</li>
                          <li>• "Analyze the codebase and suggest improvements"</li>
                          <li>• "Help me debug this error..."</li>
                      </ul>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Plan Preview */}
      {pendingPlan && (
        <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <PlanPreview
            title="Plan Preview"
            outputs={pendingPlan.outputs}
            commands={pendingPlan.commands}
            checklist={pendingPlan.checklist}
            onApprove={handleApprovePlan}
            onReject={handleRejectPlan}
            isSubmitting={isSending}
          />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessageList 
          messages={messages} 
          isTyping={isTyping} 
          typingAgentName={typingAgentName}
          taskId={taskId}
          onPinToMemory={handlePinToMemory}
          className="h-full"
        />
      </div>

      {/* Chat Input */}
      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSendMessage}
          disabled={isSending || !!pendingPlan}
          placeholder="How can I help you?"
        />
      </div>
    </div>
  );
}
