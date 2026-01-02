"use client";

import * as React from "react";
import { CheckCircle, AlertCircle, Activity, Loader2 } from "lucide-react";
import type { AgentActivityEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AgentActivityTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  events?: AgentActivityEvent[];
  isLoading?: boolean;
  maxItems?: number;
}

const eventIcons: Record<AgentActivityEvent["type"], React.ReactNode> = {
  status_change: <Activity className="w-4 h-4" />,
  action_started: <Loader2 className="w-4 h-4 animate-spin" />,
  action_completed: <CheckCircle className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  message: <Activity className="w-4 h-4" />,
};

const eventColors: Record<AgentActivityEvent["type"], string> = {
  status_change: "text-blue-500 dark:text-blue-400",
  action_started: "text-amber-500 dark:text-amber-400",
  action_completed: "text-green-500 dark:text-green-400",
  error: "text-red-500 dark:text-red-400",
  message: "text-zinc-500 dark:text-zinc-400",
};

export const AgentActivityTimeline = React.forwardRef<
  HTMLDivElement,
  AgentActivityTimelineProps
>(({ events = [], isLoading = false, maxItems = 10, className, ...props }, ref) => {
  const displayEvents = events.slice(0, maxItems);
  const [formattedTimes, setFormattedTimes] = React.useState<Record<string, string>>({});

  // Format timestamps on client-side only to avoid hydration mismatch
  React.useEffect(() => {
    const formatted: Record<string, string> = {};
    displayEvents.forEach((event) => {
      try {
        formatted[event.id] = new Date(event.timestamp).toLocaleTimeString();
      } catch {
        formatted[event.id] = "";
      }
    });
    setFormattedTimes(formatted);
  }, [displayEvents]);

  if (isLoading) {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center py-4", className)}
        {...props}
      >
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <div
        ref={ref}
        className={cn(
          "text-sm text-zinc-600 dark:text-zinc-400 py-4",
          className
        )}
        {...props}
      >
        No activity yet.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("space-y-3", className)}
      {...props}
    >
      {displayEvents.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex-shrink-0 pt-1">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800",
                eventColors[event.type]
              )}
            >
              {eventIcons[event.type]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {event.agentName}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {event.description}
                </p>
                {/* Show agent coordination info if available */}
                {(event.data?.sender_agent_id || event.data?.recipient_agent_id || event.data?.llm_provider) && (
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {event.data?.sender_agent_id && (
                      <span className="font-mono">From: {event.data.sender_agent_id.substring(0, 8)}...</span>
                    )}
                    {event.data?.recipient_agent_id && (
                      <span className="font-mono">To: {event.data.recipient_agent_id.substring(0, 8)}...</span>
                    )}
                    {event.data?.llm_provider && (
                      <span className="font-mono">LLM: {event.data.llm_provider}{event.data?.llm_model ? `/${event.data.llm_model}` : ""}</span>
                    )}
                  </div>
                )}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap flex-shrink-0">
                {formattedTimes[event.id] || "Loading..."}
              </span>
            </div>
          </div>
          {index < displayEvents.length - 1 && (
            <div className="absolute left-3 top-6 w-0.5 h-8 bg-zinc-200 dark:bg-zinc-700" />
          )}
        </div>
      ))}
    </div>
  );
});

AgentActivityTimeline.displayName = "AgentActivityTimeline";
