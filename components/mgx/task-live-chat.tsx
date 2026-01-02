"use client";

import * as React from "react";
import { useWebSocket } from "@/components/WebSocketProvider";
import { fetchAgentMessages, pinMessageToMemory, approvePlan } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { useAgentForTask } from "@/hooks/useAgents";
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
  // Pagination state
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [oldestMessageId, setOldestMessageId] = React.useState<string | null>(null);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = React.useState<number | null>(null);
  const [pendingPlan, setPendingPlan] = React.useState<{
    plan: string;
    outputs: string[];
    commands: string[];
    checklist: PlanItem[];
    runId: string;
  } | null>(null);

  const { lastMessage, subscribe } = useWebSocket();
  const { currentWorkspace, currentProject } = useWorkspace();
  const { agents, isLoading: isAgentsLoading } = useAgentForTask(taskId, runId);
  
  // Get the first agent ID for fetching messages
  // If no agents found for this task, try to get any agent from workspace/project
  const agentId = React.useMemo(() => {
    if (agents && agents.length > 0) {
      return agents[0].id;
    }
    return null;
  }, [agents]);

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

    // Extract agent coordination metadata from payload
    const payload = msg.payload || {};
    const senderAgentId = payload.sender_agent_id;
    const recipientAgentId = payload.recipient_agent_id;
    const llmProvider = payload.llm_provider;
    const llmModel = payload.llm_model;

    // Extract agent name from payload (Bob, Mike, Alex, Charlie)
    // Priority: payload.agent_name > msg.agentName > msg.agent_name > role mapping > "Agent"
    let agentName = payload.agent_name || msg.agentName || (msg as any).agent_name;
    
    // If no agent name, try to map from role
    if (!agentName && payload.role) {
      const roleNameMap: Record<string, string> = {
        "TeamLeader": "Mike",
        "Engineer": "Alex",
        "Tester": "Bob",
        "Reviewer": "Charlie",
      };
      agentName = roleNameMap[payload.role] || payload.role;
    }
    
    // Also check msg.role directly (from backend AgentMessageResponse)
    if (!agentName && msg.role && msg.role !== "user" && msg.role !== "system") {
      const roleNameMap: Record<string, string> = {
        "TeamLeader": "Mike",
        "Engineer": "Alex",
        "Tester": "Bob",
        "Reviewer": "Charlie",
      };
      agentName = roleNameMap[msg.role] || msg.role;
    }
    
    // Final fallback
    if (!agentName) {
      agentName = "Agent";
    }
    
    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.debug("Agent name mapping:", {
        payload_agent_name: payload.agent_name,
        msg_agentName: msg.agentName,
        payload_role: payload.role,
        msg_role: msg.role,
        final_agentName: agentName,
      });
    }

    // Extract content from various sources
    let content = msg.content || "";
    
    // If content is empty, try to get it from payload
    if (!content && payload) {
      if (typeof payload === "string") {
        content = payload;
      } else if (payload.content) {
        // Prefer content field (set by backend for execution results)
        content = typeof payload.content === "string" ? payload.content : JSON.stringify(payload.content);
      } else if (payload.message) {
        content = typeof payload.message === "string" ? payload.message : JSON.stringify(payload.message);
      } else if (payload.text) {
        content = typeof payload.text === "string" ? payload.text : JSON.stringify(payload.text);
      } else if (payload.result && typeof payload.result === "string") {
        // Show execution result directly
        content = payload.result;
      } else if (Object.keys(payload).length > 0 && !toolName) {
        // If payload has data but no tool, try to stringify it
        content = JSON.stringify(payload, null, 2);
      }
    }
    
    // Fallback: if still empty, show a default message
    if (!content && !toolName) {
      content = payload.type || msg.actionType || "Message";
    }

    // Ensure timestamp is properly parsed - use msg.timestamp if available, otherwise parse from created_at
    let messageTimestamp = msg.timestamp;
    if (!messageTimestamp || messageTimestamp === 0 || isNaN(messageTimestamp)) {
      // If timestamp is not set or invalid, try to parse from created_at (if it exists in the message)
      // This is a fallback for messages that might not have timestamp set correctly
      if ((msg as any).created_at) {
        try {
          const created_at = (msg as any).created_at;
          let dateValue: Date;
          if (typeof created_at === 'string') {
            dateValue = new Date(created_at);
          } else if (typeof created_at === 'number') {
            dateValue = new Date(created_at);
          } else {
            dateValue = new Date(String(created_at));
          }
          
          if (!isNaN(dateValue.getTime())) {
            messageTimestamp = dateValue.getTime();
          } else {
            console.warn("[mapAgentMessageToChat] Invalid created_at:", created_at, "for message:", msg.id);
            messageTimestamp = Date.now();
          }
        } catch (e) {
          console.warn("[mapAgentMessageToChat] Error parsing created_at:", (msg as any).created_at, "for message:", msg.id, e);
          messageTimestamp = Date.now();
        }
      } else {
        // Last resort: use current time (but this should not happen if backend is working correctly)
        console.warn("[mapAgentMessageToChat] No timestamp or created_at for message:", msg.id, "using current time");
        messageTimestamp = Date.now();
      }
    }
    
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      const date = new Date(messageTimestamp);
      console.debug("[mapAgentMessageToChat] Final timestamp:", {
        messageId: msg.id.substring(0, 8),
        timestamp: messageTimestamp,
        formattedTime: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        created_at: (msg as any).created_at,
      });
    }
    
    return {
      type,
      content: content,
      senderName: agentName, // Use extracted agent name (Bob, Mike, Alex, Charlie)
      timestamp: messageTimestamp,
      toolName,
      toolInput,
      toolOutput,
      isThinking: msg.actionType === "thinking" || msg.actionType === "executing",
      messageId: msg.id,
      taskId: taskId,
      senderAgentId,
      recipientAgentId,
      llmProvider,
      llmModel,
    };
  };

  const loadMessages = React.useCallback(async (clearExisting: boolean = false) => {
    // Early return if no taskId - don't load messages without a task
    if (!taskId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Only clear messages when explicitly requested (e.g., task/run change)
      // Don't clear on every load to prevent page refresh effect
      if (clearExisting) {
        setMessages([]);
      }
      
      // ALWAYS use taskId/runId based endpoint to ensure we only get messages for this specific task
      // This prevents loading messages from other tasks
      const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
      
      if (isDev) {
        console.debug("[loadMessages] Starting to load messages. taskId:", taskId, "runId:", runId);
      }
      
      let backendMessages: AgentMessage[] = [];
      
      if (runId) {
        // Fetch messages for the specific run
        if (isDev) {
          console.debug("[loadMessages] Fetching messages for runId:", runId, "taskId:", taskId);
        }
        backendMessages = await fetchAgentMessages(
          null, // No agentId, use task/run based endpoint
          100,
          0,
          {
            workspaceId: currentWorkspace?.id,
            projectId: currentProject?.id,
            taskId: taskId, // CRITICAL: Always filter by taskId
            runId: runId,
          }
        );
      } else {
        // Fetch messages for the task (even if no runId)
        if (isDev) {
          console.debug("[loadMessages] Fetching messages for taskId:", taskId, "(no runId)");
        }
        backendMessages = await fetchAgentMessages(
          null, // No agentId, use task-based endpoint
          100,
          0,
          {
            workspaceId: currentWorkspace?.id,
            projectId: currentProject?.id,
            taskId: taskId, // CRITICAL: Always filter by taskId
            runId: undefined,
          }
        );
      }
      
      // Debug: Log taskId to verify correct filtering
      if (isDev) {
        console.debug("[loadMessages] Received messages:", {
          taskId: taskId,
          runId: runId,
          count: backendMessages.length,
          messageTaskIds: backendMessages.map(m => m.taskId).filter((id, idx, arr) => arr.indexOf(id) === idx), // Unique taskIds
        });
        
        // Verify all messages belong to the correct task
        const wrongTaskMessages = backendMessages.filter(m => m.taskId !== taskId);
        if (wrongTaskMessages.length > 0) {
          console.warn("[loadMessages] WARNING: Found messages from other tasks!", {
            expectedTaskId: taskId,
            wrongMessages: wrongTaskMessages.map(m => ({ id: m.id, taskId: m.taskId })),
          });
        }
      }

      if (backendMessages && Array.isArray(backendMessages)) {
        // Backend's list_messages_by_task returns messages in ASC order (oldest first, newest last)
        // We need to ensure they're sorted by timestamp to maintain chronological order
        // Newest messages should appear at the bottom of the chat
        const sorted = [...backendMessages].sort((a: AgentMessage, b: AgentMessage) => {
          // Get timestamp from multiple sources
          const timeA = a.timestamp || (a.created_at ? new Date(a.created_at).getTime() : 0) || 0;
          const timeB = b.timestamp || (b.created_at ? new Date(b.created_at).getTime() : 0) || 0;
          // Ascending order: oldest first (smallest timestamp), newest last (largest timestamp)
          return timeA - timeB;
        });
        
        // Deduplicate messages by ID
        const seenIds = new Set<string>();
        const uniqueMessages = sorted.filter((msg: AgentMessage) => {
          if (seenIds.has(msg.id)) return false;
          seenIds.add(msg.id);
          return true;
        });
        
        const mapped = uniqueMessages.map(mapAgentMessageToChat);
        
        // Debug: Log first and last message timestamps to verify sorting
        const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
        if (isDev && mapped.length > 0) {
          console.debug("[loadMessages] Message order:", {
            first: { timestamp: mapped[0].timestamp, content: mapped[0].content?.substring(0, 50) },
            last: { timestamp: mapped[mapped.length - 1].timestamp, content: mapped[mapped.length - 1].content?.substring(0, 50) },
            total: mapped.length,
            taskId: taskId,
          });
        }
        
        // Replace messages with backend messages (includes user messages from backend)
        // This ensures user messages persist after page refresh
        // Messages are sorted with oldest at top, newest at bottom
        setMessages(mapped);
        
        // Update pagination state
        if (mapped.length > 0) {
          setOldestMessageId(mapped[0].messageId || mapped[0].id);
          setOldestMessageTimestamp(mapped[0].timestamp || null);
          // If we got fewer messages than requested, there are no more messages
          setHasMoreMessages(mapped.length >= 100);
        } else {
          setHasMoreMessages(false);
          setOldestMessageTimestamp(null);
        }
        
        // Force scroll to bottom after messages are loaded
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          const chatContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 200);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load messages");
      setError(error);
      console.error("Failed to load messages:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, currentWorkspace?.id, currentProject?.id, isAgentsLoading, runId, taskId]);

  // Subscribe to WebSocket events for this task
  React.useEffect(() => {
    if (subscribe && taskId) {
      subscribe({ taskId, runId });
      console.debug("[TaskLiveChat] Subscribed to WebSocket for taskId:", taskId, "runId:", runId);
    }
  }, [subscribe, taskId, runId]);

  // Clear messages and pagination state when taskId or runId changes
  // This ensures clean state when switching between tasks/runs
  React.useEffect(() => {
    const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
    if (isDev) {
      console.debug("[TaskLiveChat] taskId or runId changed, clearing messages. taskId:", taskId, "runId:", runId);
    }
    // Immediately clear all state when taskId/runId changes
    // This prevents showing messages from previous task/run
    setMessages([]);
    setError(null);
    setIsLoading(true); // Set loading to true to show loading state
    setHasMoreMessages(true);
    setOldestMessageId(null);
    setOldestMessageTimestamp(null);
    setPendingPlan(null); // Clear any pending plans
    setIsTyping(false); // Clear typing indicator
    setInputValue(""); // Clear input when switching tasks
  }, [taskId, runId]);
  
  // Load older messages function for infinite scroll
  const loadOlderMessages = React.useCallback(async () => {
    if (!hasMoreMessages || isLoadingMore || !oldestMessageId) return;
    
    setIsLoadingMore(true);
    try {
      const olderMessages = await fetchAgentMessages(
        null,
        50, // Load 50 older messages at a time
        0,
        {
          workspaceId: currentWorkspace?.id,
          projectId: currentProject?.id,
          taskId: taskId,
          runId: runId,
          beforeId: oldestMessageId,
        }
      );
      
      if (olderMessages.length > 0) {
        const sorted = [...olderMessages].sort((a: AgentMessage, b: AgentMessage) => {
          const timeA = a.timestamp || (a.created_at ? new Date(a.created_at).getTime() : 0) || 0;
          const timeB = b.timestamp || (b.created_at ? new Date(b.created_at).getTime() : 0) || 0;
          return timeA - timeB;
        });
        
        const mapped = sorted.map(mapAgentMessageToChat);
        
        // Prepend older messages to existing messages
        setMessages((prev) => {
          // Merge and deduplicate
          const allMessages = [...mapped, ...prev];
          const seenIds = new Set<string>();
          return allMessages.filter((msg) => {
            const id = msg.messageId || msg.id;
            if (seenIds.has(id)) return false;
            seenIds.add(id);
            return true;
          }).sort((a, b) => a.timestamp - b.timestamp);
        });
        
        // Update pagination state
        if (mapped.length > 0) {
          setOldestMessageId(mapped[0].messageId || mapped[0].id);
          setOldestMessageTimestamp(mapped[0].timestamp || null);
          setHasMoreMessages(mapped.length >= 50);
        } else {
          setHasMoreMessages(false);
          setOldestMessageTimestamp(null);
        }
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreMessages, isLoadingMore, oldestMessageId, taskId, runId, currentWorkspace?.id, currentProject?.id]);

  // Load messages only on initial mount or when taskId/runId changes
  // WebSocket will handle real-time updates, no need to reload constantly
  React.useEffect(() => {
    const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
    if (isDev) {
      console.debug("[TaskLiveChat] loadMessages effect triggered. taskId:", taskId, "runId:", runId);
    }
    // Load messages for the new task/run (messages are already cleared by previous effect)
    loadMessages(true);
  }, [taskId, runId]); // Only reload when taskId or runId changes, not on every render

  const handleSendMessage = React.useCallback(async (message: string) => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    
    // Add user message to chat IMMEDIATELY (before async operations)
    const userMessage: ChatMessageProps = {
      type: "user",
      content: message,
      senderName: "You",
      timestamp: Date.now(),
      taskId: taskId,
    };
    setMessages((prev) => {
      // Add user message and sort by timestamp to keep chronological order
      // Newest messages should be at the bottom
      const updated = [...prev, userMessage];
      const sorted = updated.sort((a, b) => a.timestamp - b.timestamp);
      
      // Scroll to bottom after adding user message
      setTimeout(() => {
        const chatContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      
      return sorted;
    });
    
    try {
      // ALWAYS save user message to backend IMMEDIATELY
      // This ensures the message is persisted with correct timestamp from backend
      
      // Early validation: taskId is required for saving messages
      if (!taskId) {
        console.warn("[handleSendMessage] Cannot save user message: taskId is required");
        // Continue anyway - message is already in UI
      } else {
        try {
          const { sendAgentMessage, sendMessageByTask } = await import("@/lib/api");
          
          let savedMessage;
          if (agentId) {
            // Use agent-specific endpoint if agentId is available
            savedMessage = await sendAgentMessage(
              agentId,
              message,
              "inbound",
              undefined,
              {
                workspaceId: currentWorkspace?.id,
                projectId: currentProject?.id,
                taskId: taskId,
                runId: runId,
              }
            );
          } else {
            // Use task-based endpoint if no agentId (creates placeholder agent instance)
            // taskId is already validated above
            savedMessage = await sendMessageByTask(
              message,
              "inbound",
              undefined,
              {
                workspaceId: currentWorkspace?.id,
                projectId: currentProject?.id,
                taskId: taskId,
                runId: runId,
              }
            );
          }
          
          if (savedMessage) {
            console.log("[handleSendMessage] User message saved to backend:", savedMessage);
          }
        } catch (msgError) {
          console.error("[handleSendMessage] Failed to save user message to backend:", msgError);
          // Show user-friendly error message
          if (msgError instanceof Error) {
            toast.error(`Failed to save message: ${msgError.message}`);
          } else {
            toast.error("Failed to save message. It may not persist after refresh.");
          }
        }
      }
      
      // For follow-up messages, trigger a new run to process the message
      // WebSocket will handle real-time message updates, no need to reload
      const { triggerRun } = await import("@/lib/api");
      
      try {
        // Trigger a new run for this task (auto-approves by default)
        // This will process the message and send response via WebSocket
        const runResponse = await triggerRun(taskId, {
          workspaceId: currentWorkspace?.id,
          projectId: currentProject?.id,
        });
        
        console.log("[handleSendMessage] New run triggered:", runResponse);
        
        // Update runId if we got a new one
        if (runResponse?.runId && runResponse.runId !== runId) {
          // Update runId in parent component if needed
          // For now, WebSocket will handle messages for the correct run
        }
      } catch (runError) {
        console.error("[handleSendMessage] Failed to trigger run:", runError);
        // Don't show error to user - message is already saved and will be processed
        // when user manually triggers a run or when system processes it
      }
      
      // Clear input immediately for better UX
      setInputValue("");
      
      // WebSocket will handle incoming messages in real-time
      // No need to reload messages - that causes page refresh effect
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  }, [taskId, currentWorkspace?.id, currentProject?.id, isSending, agentId, runId, loadMessages]);

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

    // Handle plan_ready event
    if (lastMessage.type === "plan_ready" || lastMessage.type === "PLAN_READY" || 
        (lastMessage.payload as any)?.event_type === "plan_ready") {
      const eventPayload = lastMessage.payload as any;
      const planData = eventPayload.data?.plan || eventPayload.plan;
      const eventTaskId = eventPayload.task_id;
      const eventRunId = eventPayload.run_id;
      
      if (eventTaskId === taskId && (!runId || eventRunId === runId)) {
        // Parse plan data
        let planText = "";
        let outputs: string[] = [];
        let commands: string[] = [];
        let checklist: PlanItem[] = [];
        
        if (typeof planData === "string") {
          planText = planData;
          // Try to extract steps from plan text
          const lines = planData.split("\n");
          checklist = lines
            .filter(line => {
              const trimmed = line.trim();
              // Only include lines that match numbered list pattern AND have actual content
              const match = trimmed.match(/^\d+[\.\)]\s*(.+)/);
              if (!match) return false;
              const stepText = match[1].trim();
              // Filter out generic/static step names like "step1", "step2", "step3", "adım1", etc.
              const isStaticStep = /^(step|adım)\s*\d+$/i.test(stepText);
              // Must have meaningful content (more than just a number or generic text)
              return !isStaticStep && stepText.length > 5;
            })
            .map((line, idx) => {
              const trimmed = line.trim();
              const match = trimmed.match(/^\d+[\.\)]\s*(.+)/);
              return {
                id: `step-${idx}`,
                text: match ? match[1].trim() : trimmed.replace(/^\d+[\.\)]\s*/, ""),
                completed: false,
              };
            });
        } else if (typeof planData === "object" && planData !== null) {
          planText = planData.text || planData.plan || JSON.stringify(planData, null, 2);
          if (Array.isArray(planData.steps)) {
            checklist = planData.steps
              .map((step: string | { text: string }, idx: number) => {
                const stepText = typeof step === "string" ? step : step.text;
                return {
                  id: `step-${idx}`,
                  text: stepText,
                  completed: false,
                };
              })
              // Filter out static/generic step names - be very aggressive
              .filter((item: PlanItem) => {
                const text = item.text.trim();
                const isStaticStep = /^(step|adım)\s*\d+$/i.test(text);
                // Also filter very short or generic text
                const isTooShort = text.length < 5;
                // Filter common generic patterns
                const isGeneric = /^(step|adım|görev|task)\s*\d*$/i.test(text);
                return !isStaticStep && !isTooShort && !isGeneric;
              });
          }
          if (Array.isArray(planData.outputs)) {
            outputs = planData.outputs;
          }
          if (Array.isArray(planData.commands)) {
            commands = planData.commands;
          }
        }
        
        // Check if this is a simple question that doesn't need approval
        // Simple questions typically have:
        // - No meaningful steps (empty or only generic step names like "step1", "step2", "step3")
        // - No commands or outputs
        // - Very short plan text
        // - Only static/generic step names
        
        // Check if all steps are just generic "step1", "step2", "step3" etc.
        // Be very aggressive in detecting generic steps
        const allStepsAreGeneric = checklist.length > 0 && checklist.every(item => {
          const text = item.text.trim().toLowerCase();
          // Check for step1, step2, step3, adım1, adım2, etc.
          const isStepNumber = /^(step|adım)\s*\d+$/i.test(text);
          // Check for very short text
          const isTooShort = text.length < 5;
          // Check for generic patterns
          const isGeneric = /^(step|adım|görev|task)\s*\d*$/i.test(text);
          return isStepNumber || isTooShort || isGeneric;
        });
        
        // Also check if plan text itself is very generic
        const planTextLower = planText.toLowerCase().trim();
        const isGenericPlanText = planTextLower.length < 30 || 
          /^(plan|planı|plan ready|plan hazır)/i.test(planTextLower) ||
          /^step\s*\d+/i.test(planTextLower);
        
        const hasRealSteps = checklist.length > 0 && !allStepsAreGeneric;
        const hasCommands = commands.length > 0;
        const hasOutputs = outputs.length > 0;
        const hasSubstantialPlan = planText && planText.trim().length > 50 && !isGenericPlanText;
        
        // Only show approval if there's actual work to approve
        // If all steps are generic (step1, step2, step3), don't show approval
        // Also don't show if plan text is generic
        const needsApproval = (hasRealSteps || hasCommands || hasOutputs || hasSubstantialPlan) && 
                              !allStepsAreGeneric && 
                              !isGenericPlanText;
        
        // Debug logging
        const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
        if (isDev) {
          console.debug("[TaskLiveChat] Plan analysis:", {
            checklistLength: checklist.length,
            allStepsAreGeneric,
            hasRealSteps,
            hasCommands,
            hasOutputs,
            hasSubstantialPlan,
            isGenericPlanText,
            planTextLength: planText?.length || 0,
            planTextPreview: planText?.substring(0, 100),
            needsApproval,
          });
        }
        
        if (needsApproval) {
          setPendingPlan({
            plan: planText,
            outputs,
            commands,
            checklist: checklist.length > 0 ? checklist : (planText ? [{
              id: "default",
              text: planText.substring(0, 200) + (planText.length > 200 ? "..." : ""),
              completed: false,
            }] : []),
            runId: eventRunId || runId || "",
          });
          
          toast.info("Plan is ready for approval");
        } else {
          // Simple question - skip approval, let it proceed automatically
          console.debug("[TaskLiveChat] Simple question detected, skipping approval");
          // Auto-approve simple questions
          if (eventRunId || runId) {
            approvePlan(
              taskId,
              eventRunId || runId || "",
              {
                workspaceId: currentWorkspace?.id,
                projectId: currentProject?.id,
              }
            ).catch((error) => {
              console.warn("[TaskLiveChat] Failed to auto-approve simple question:", error);
            });
          }
        }
      }
      return;
    }

    // Handle agent_progress events - real-time updates from Alex, Bob, Charlie
    if (lastMessage.type === "agent_progress") {
      const payload = lastMessage.payload as any;
      const progressMessage = payload?.data?.message?.payload || payload;
      
      // CRITICAL: Strict filtering - reject progress messages from other tasks
      const msgTaskId = progressMessage?.task_id || progressMessage?.taskId;
      if (!msgTaskId || msgTaskId !== taskId) {
        const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
        if (isDev) {
          console.debug("[TaskLiveChat] Rejecting progress message from different task:", {
            msgTaskId,
            currentTaskId: taskId
          });
        }
        return;
      }
      
      const agentName = progressMessage?.agent_name || progressMessage?.agentName || "Agent";
      const status = progressMessage?.status || "working";
      const content = progressMessage?.content || progressMessage?.message || "";
      
      // Show typing indicator for working status
      if (status === "working") {
        setIsTyping(true);
        setTypingAgentName(agentName);
      } else if (status === "completed") {
        setIsTyping(false);
      }
      
      // Add progress message to chat
      const progressChatMessage: ChatMessageProps = {
        id: `progress-${agentName}-${Date.now()}`,
        content: `${content}`,
        role: "assistant",
        agentName: agentName,
        timestamp: Date.now(),
        type: "thinking" as MessageType,
      };
      
      setMessages(prev => {
        // Remove old progress messages from same agent
        const filtered = prev.filter(m => !(m.id?.startsWith(`progress-${agentName}-`) && m.type === "thinking"));
        return [...filtered, progressChatMessage];
      });
      
      return;
    }

    // Handle agent_message events
    // Backend sends: { type: "agent_message", payload: { event_type: "agent_message", data: { message: {...} }, ... } }
    let messageData: Partial<AgentMessage> | null = null;
    
    if (lastMessage.type === "agent_message") {
      // Format from transform_event_for_frontend:
      // { type: "agent_message", payload: { event_type: "agent_message", task_id: "...", run_id: "...", data: { message: {...} } } }
      const eventPayload = lastMessage.payload as any;
      
      if (eventPayload?.data?.message) {
        // Extract message from EventPayload.data.message
        const backendMessage = eventPayload.data.message;
        const messagePayload = backendMessage.payload || {};
        
        messageData = {
          id: backendMessage.id || `${Date.now()}-${Math.random()}`,
          taskId: eventPayload.task_id || backendMessage.task_id || taskId,
          runId: eventPayload.run_id || backendMessage.run_id || runId,
          agentName: messagePayload.agent_name || messagePayload.agentName || "Agent",
          role: (messagePayload.role || "assistant") as AgentMessage["role"],
          content: messagePayload.content || messagePayload.message || "",
          timestamp: backendMessage.created_at 
            ? new Date(backendMessage.created_at).getTime()
            : (eventPayload.timestamp ? new Date(eventPayload.timestamp).getTime() : Date.now()),
          actionType: messagePayload.actionType as AgentMessage["actionType"],
          payload: messagePayload,
          created_at: backendMessage.created_at,
        };
      } else if (eventPayload?.agent_name || eventPayload?.content) {
        // Fallback: direct payload format (old format)
        messageData = {
          id: eventPayload.id || `${Date.now()}-${Math.random()}`,
          taskId: eventPayload.taskId || eventPayload.task_id || taskId,
          runId: eventPayload.runId || eventPayload.run_id || runId,
          agentName: eventPayload.agent_name || eventPayload.agentName || "Agent",
          role: (eventPayload.role || "assistant") as AgentMessage["role"],
          content: eventPayload.content || eventPayload.message || "",
          timestamp: eventPayload.timestamp || eventPayload.created_at 
            ? (typeof eventPayload.timestamp === "number" 
                ? eventPayload.timestamp 
                : new Date(eventPayload.timestamp || eventPayload.created_at).getTime())
            : Date.now(),
          actionType: eventPayload.actionType as AgentMessage["actionType"],
          payload: eventPayload,
          created_at: eventPayload.created_at,
        };
      }
    } else if (lastMessage.type === "agent_action") {
      // Old format: direct payload
      messageData = lastMessage.payload as Partial<AgentMessage>;
    }
    
    if (!messageData) return;
    
    // CRITICAL: Filter by taskId and runId - reject messages from other tasks
    const msgTaskId = messageData.taskId || (messageData as any).task_id;
    const msgRunId = messageData.runId || (messageData as any).run_id;
    
    // Strict filtering: only accept messages that match current taskId
    if (!msgTaskId || msgTaskId !== taskId) {
      const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
      if (isDev) {
        console.debug("[TaskLiveChat] Rejecting WebSocket message from different task:", {
          msgTaskId,
          currentTaskId: taskId,
          messageId: messageData.id
        });
      }
      return; // Reject messages from other tasks
    }
    
    // If runId is specified, also filter by runId
    if (runId && msgRunId && msgRunId !== runId) {
      const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
      if (isDev) {
        console.debug("[TaskLiveChat] Rejecting WebSocket message from different run:", {
          msgRunId,
          currentRunId: runId,
          messageId: messageData.id
        });
      }
      return; // Reject messages from other runs
    }
    
    if (msgTaskId === taskId && (!runId || !msgRunId || msgRunId === runId)) {
      const newMessage: AgentMessage = {
        id: messageData.id || `${Date.now()}-${Math.random()}`,
        taskId: msgTaskId || taskId,
        runId: msgRunId || runId,
        agentName: messageData.agentName || "Agent",
        role: (messageData.role as AgentMessage["role"]) || "assistant",
        content: messageData.content || "",
        timestamp: messageData.timestamp || Date.now(),
        actionType: (messageData.actionType as AgentMessage["actionType"]) || undefined,
        payload: messageData.payload || (messageData as any),
        created_at: (messageData as any).created_at,
      };

      // Handle typing state
      if (newMessage.actionType === "thinking") {
          setIsTyping(true);
          setTypingAgentName(newMessage.agentName);
      } else if (newMessage.actionType === "completed" || newMessage.actionType === "error") {
          setIsTyping(false);
      }

      // Add message if it has content
      if (newMessage.content && newMessage.content.trim()) {
           const chatMsg = mapAgentMessageToChat(newMessage);
           setMessages((prev) => {
               // De-duplicate by message ID first (most reliable)
               const messageId = chatMsg.messageId || chatMsg.id;
               if (messageId) {
                 const existsById = prev.some(m => (m.messageId || m.id) === messageId);
                 if (existsById) {
                   console.debug("[TaskLiveChat] Duplicate message detected by ID, skipping:", messageId);
                   return prev;
                 }
               }
               
               // Fallback: check by timestamp and content (within 2 second window)
               // This prevents duplicate messages from WebSocket and polling
               const existsByContent = prev.some(m => 
                 Math.abs(m.timestamp - chatMsg.timestamp) < 2000 &&
                 m.content === chatMsg.content &&
                 m.senderName === chatMsg.senderName
               );
               if (existsByContent) {
                 console.debug("[TaskLiveChat] Duplicate message detected by content, skipping");
                 return prev;
               }
               
               // Add new message and sort by timestamp to keep chronological order
               // Newest messages should be at the bottom
               const updated = [...prev, chatMsg];
               const sorted = updated.sort((a, b) => a.timestamp - b.timestamp);
               
               // Auto-scroll is handled by ChatMessageList component
               // No need to manually scroll here
               
               return sorted;
           });
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

  // Show message if no agent is available, but allow WebSocket messages to flow
  // Agent instance will be created when task execution starts
  const showNoAgentMessage = !agentId && !isAgentsLoading && messages.length === 0;
  
  if (showNoAgentMessage) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">No agent instance found for this task</span>
        </div>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-500">
          Waiting for task execution to start. Agent instance will be created automatically.
        </p>
      </div>
    );
  }

  if (messages.length === 0 && !isTyping && !isLoading && agentId) {
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
    <div 
      className={cn("flex flex-col", className)} 
      style={{ 
        height: '100%', 
        minHeight: 0, 
        maxHeight: '100%',
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Plan Preview */}
      {pendingPlan && (
        <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 flex-shrink-0">
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

      {/* Chat Messages - scrollable area */}
      <div 
        className="flex-1 min-h-0" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: 0, 
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <ChatMessageList 
          messages={messages} 
          isTyping={isTyping} 
          typingAgentName={typingAgentName}
          taskId={taskId}
          onPinToMemory={handlePinToMemory}
          onLoadOlder={loadOlderMessages}
          isLoadingMore={isLoadingMore}
          hasMoreMessages={hasMoreMessages}
          className="flex-1 min-h-0"
        />
      </div>

      {/* Chat Input - fixed at bottom */}
      <div 
        className="flex-shrink-0 border-t border-zinc-200 bg-zinc-950 dark:bg-zinc-950 pt-4 px-4 pb-4 dark:border-zinc-800" 
        style={{ 
          flexShrink: 0,
          flexGrow: 0,
          flexBasis: 'auto'
        }}
      >
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
