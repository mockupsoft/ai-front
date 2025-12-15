"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { AgentStatusBadge } from "@/components/mgx/agent-status-badge";
import type { AgentInstance } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AgentStatusListProps extends React.HTMLAttributes<HTMLDivElement> {
  agents?: AgentInstance[];
  isLoading?: boolean;
  compact?: boolean;
}

export const AgentStatusList = React.forwardRef<
  HTMLDivElement,
  AgentStatusListProps
>(({ agents = [], isLoading = false, compact = false, className, ...props }, ref) => {
  if (isLoading) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          compact ? "py-2" : "py-4",
          className
        )}
        {...props}
      >
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div
        ref={ref}
        className={cn(
          "text-sm text-zinc-600 dark:text-zinc-400",
          compact ? "py-1" : "py-3",
          className
        )}
        {...props}
      >
        No agents assigned.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        compact ? "space-y-1" : "space-y-2",
        className
      )}
      {...props}
    >
      {agents.map((agent) => (
        <div
          key={agent.id}
          className={cn(
            "flex items-center justify-between",
            compact ? "py-1" : "py-2"
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
              {agent.name}
            </p>
            {agent.metrics?.messagesProcessed !== undefined && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {agent.metrics.messagesProcessed} messages
              </p>
            )}
          </div>
          <div className="ml-2 flex-shrink-0">
            <AgentStatusBadge status={agent.status} />
          </div>
        </div>
      ))}
    </div>
  );
});

AgentStatusList.displayName = "AgentStatusList";
