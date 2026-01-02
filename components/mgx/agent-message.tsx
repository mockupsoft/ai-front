"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, FileEdit, ExternalLink, Copy, Check } from "lucide-react";

// Agent avatars with emojis (like mgx.dev)
const AGENT_AVATARS: Record<string, { emoji: string; bg: string; role: string }> = {
  Mike: { emoji: "🐹", bg: "bg-amber-100", role: "Team Leader" },
  Alex: { emoji: "🤖", bg: "bg-cyan-100", role: "Engineer" },
  Bob: { emoji: "🧪", bg: "bg-purple-100", role: "Tester" },
  Charlie: { emoji: "🔍", bg: "bg-orange-100", role: "Reviewer" },
  Agent: { emoji: "🤖", bg: "bg-zinc-100", role: "Agent" },
};

export interface ProcessedStep {
  id: string;
  description: string;
  details?: string[];
  completed?: boolean;
}

export interface FileOperation {
  type: "write" | "read" | "delete" | "create";
  filename: string;
  content?: string;
}

export interface TaskInfo {
  title: string;
  status: "pending" | "in_progress" | "done" | "failed";
  assignee?: string;
}

export interface VersionInfo {
  version: number;
  description: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AgentMessageProps {
  agentName: string;
  timestamp: number;
  content?: string;
  steps?: ProcessedStep[];
  fileOperations?: FileOperation[];
  task?: TaskInfo;
  version?: VersionInfo;
  checklist?: ChecklistItem[];
  isThinking?: boolean;
  className?: string;
}

function AgentAvatar({ agentName }: { agentName: string }) {
  const agent = AGENT_AVATARS[agentName] || AGENT_AVATARS.Agent;
  
  return (
    <div className={cn(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl",
      agent.bg
    )}>
      {agent.emoji}
    </div>
  );
}

function AgentHeader({ agentName, timestamp }: { agentName: string; timestamp: number }) {
  const agent = AGENT_AVATARS[agentName] || AGENT_AVATARS.Agent;
  const formattedTime = React.useMemo(() => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [timestamp]);

  return (
    <div className="flex items-center gap-3">
      <AgentAvatar agentName={agentName} />
      <div className="flex items-center gap-2">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{agentName}</span>
        <span className="text-zinc-400">|</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{agent.role}</span>
        {formattedTime && (
          <span className="text-sm text-zinc-400">{formattedTime}</span>
        )}
      </div>
    </div>
  );
}

function ProcessedStepsSection({ steps }: { steps: ProcessedStep[] }) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const completedCount = steps.filter(s => s.completed !== false).length;
  
  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span>Processed {completedCount} step{completedCount !== 1 ? "s" : ""}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 pl-6 border-l-2 border-zinc-200 dark:border-zinc-700">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-2">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-zinc-400" />
              <div className="flex-1">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
                {step.details && step.details.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-zinc-500 dark:text-zinc-500">
                        • {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileOperationCard({ operation }: { operation: FileOperation }) {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    if (operation.content) {
      await navigator.clipboard.writeText(operation.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const iconMap = {
    write: <FileEdit className="h-4 w-4" />,
    read: <FileEdit className="h-4 w-4" />,
    delete: <FileEdit className="h-4 w-4" />,
    create: <FileEdit className="h-4 w-4" />,
  };
  
  const labelMap = {
    write: "Write file",
    read: "Read file",
    delete: "Delete file",
    create: "Create file",
  };
  
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      onClick={handleCopy}
      title={operation.content ? "Click to copy content" : undefined}
    >
      {iconMap[operation.type]}
      <span>{labelMap[operation.type]}</span>
      <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
        {operation.filename}
      </code>
      {operation.content && (
        copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

function TaskCard({ task }: { task: TaskInfo }) {
  const statusColors = {
    pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  
  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    done: "Done",
    failed: "Failed",
  };
  
  return (
    <div className="mt-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-purple-500" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[300px]">
            {task.title}
          </span>
        </div>
        <ExternalLink className="h-4 w-4 text-zinc-400 cursor-pointer hover:text-zinc-600" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[task.status])}>
          • {statusLabels[task.status]}
        </span>
        {task.assignee && (
          <>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              ↻ {task.assignee}'s reply
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function ChecklistSection({ items }: { items: ChecklistItem[] }) {
  return (
    <div className="mt-3 space-y-2">
      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Proje özellikleri:</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="inline-flex items-center gap-1.5 text-sm"
          >
            {item.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-zinc-400" />
            )}
            <span className={cn(
              item.completed 
                ? "text-zinc-700 dark:text-zinc-300" 
                : "text-zinc-500 dark:text-zinc-500"
            )}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VersionCard({ version }: { version: VersionInfo }) {
  return (
    <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Version {version.version}
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {version.description}
          </p>
        </div>
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
          <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function AgentMessage({
  agentName,
  timestamp,
  content,
  steps,
  fileOperations,
  task,
  version,
  checklist,
  isThinking,
  className,
}: AgentMessageProps) {
  return (
    <div className={cn("py-4", className)}>
      <AgentHeader agentName={agentName} timestamp={timestamp} />
      
      {/* Processed Steps */}
      {steps && steps.length > 0 && (
        <ProcessedStepsSection steps={steps} />
      )}
      
      {/* Main Content */}
      {content && (
        <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
          {content}
        </div>
      )}
      
      {/* File Operations */}
      {fileOperations && fileOperations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {fileOperations.map((op, idx) => (
            <FileOperationCard key={idx} operation={op} />
          ))}
        </div>
      )}
      
      {/* Task Card */}
      {task && <TaskCard task={task} />}
      
      {/* Checklist */}
      {checklist && checklist.length > 0 && (
        <ChecklistSection items={checklist} />
      )}
      
      {/* Version Card */}
      {version && <VersionCard version={version} />}
      
      {/* Thinking Indicator */}
      {isThinking && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span>Thinking...</span>
        </div>
      )}
    </div>
  );
}


