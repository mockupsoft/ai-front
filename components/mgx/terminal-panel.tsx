"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/useWebSocket";

interface TerminalPanelProps {
  taskId: string;
  runId?: string;
  className?: string;
}

interface LogEntry {
  timestamp: Date;
  type: "info" | "success" | "error" | "warning" | "command";
  message: string;
  agent?: string;
}

export function TerminalPanel({ taskId, runId, className }: TerminalPanelProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>([
    {
      timestamp: new Date(),
      type: "info",
      message: "Agent execution log viewer initialized",
    },
  ]);
  const logContainerRef = React.useRef<HTMLDivElement>(null);
  const { lastMessage, subscribe } = useWebSocket();

  // Subscribe to task events
  React.useEffect(() => {
    if (subscribe && taskId) {
      subscribe({ taskId, runId });
    }
  }, [subscribe, taskId, runId]);

  // Handle incoming WebSocket messages
  React.useEffect(() => {
    if (!lastMessage) return;

    const payload = lastMessage.payload as any;
    
    // Handle different event types
    let logEntry: LogEntry | null = null;

    switch (lastMessage.type) {
      case "analysis_start":
        logEntry = {
          timestamp: new Date(),
          type: "info",
          message: "🔍 Starting task analysis...",
          agent: "Mike",
        };
        break;
      case "plan_ready":
        logEntry = {
          timestamp: new Date(),
          type: "success",
          message: "📋 Plan ready for review",
          agent: "Mike",
        };
        break;
      case "progress":
        logEntry = {
          timestamp: new Date(),
          type: "info",
          message: payload?.message || payload?.data?.message || "Processing...",
          agent: payload?.agent_name || payload?.data?.agent_name,
        };
        break;
      case "agent_message":
        const agentName = payload?.data?.message?.payload?.agent_name || 
                         payload?.agent_name || 
                         "Agent";
        const content = payload?.data?.message?.payload?.content || 
                       payload?.content ||
                       payload?.message || "";
        if (content) {
          logEntry = {
            timestamp: new Date(),
            type: "info",
            message: content.length > 150 ? content.substring(0, 150) + "..." : content,
            agent: agentName,
          };
        }
        break;
      case "completion":
        logEntry = {
          timestamp: new Date(),
          type: "success",
          message: "✅ Task completed successfully",
        };
        break;
      case "failure":
        logEntry = {
          timestamp: new Date(),
          type: "error",
          message: `❌ Task failed: ${payload?.message || payload?.data?.error || "Unknown error"}`,
        };
        break;
      case "files_updated":
        logEntry = {
          timestamp: new Date(),
          type: "success",
          message: `📁 Files updated: ${payload?.data?.file_count || 0} files generated`,
        };
        break;
    }

    if (logEntry) {
      setLogs(prev => [...prev, logEntry!]);
    }
  }, [lastMessage]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "command":
        return "text-cyan-400";
      default:
        return "text-zinc-300";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-zinc-950 text-zinc-300 font-mono text-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-zinc-400">Execution Log</span>
        </div>
        <button
          onClick={() => setLogs([])}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Log Container */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-600 text-center py-8">
            Waiting for agent activity...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">
                [{formatTime(log.timestamp)}]
              </span>
              {log.agent && (
                <span className="text-purple-400 shrink-0">
                  [{log.agent}]
                </span>
              )}
              <span className={getLogColor(log.type)}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Task: {taskId.substring(0, 8)}...</span>
          {runId && <span>| Run: {runId.substring(0, 8)}...</span>}
        </div>
      </div>
    </div>
  );
}
