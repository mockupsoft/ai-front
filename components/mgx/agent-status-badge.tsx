import * as React from "react";
import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/types";

const statusColors: Record<AgentStatus, string> = {
  idle: "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:text-zinc-300",
  active: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  executing: "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300",
  error: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300",
  offline: "bg-gray-500/10 text-gray-700 ring-gray-500/20 dark:text-gray-300",
};

const statusDots: Record<AgentStatus, string> = {
  idle: "bg-zinc-500",
  active: "bg-sky-500",
  executing: "bg-blue-500",
  error: "bg-rose-500",
  offline: "bg-gray-400",
};

interface AgentStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AgentStatus;
  showDot?: boolean;
}

export const AgentStatusBadge = React.forwardRef<
  HTMLSpanElement,
  AgentStatusBadgeProps
>(({ status, showDot = true, className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize",
      statusColors[status],
      className
    )}
    {...props}
  >
    {showDot && (
      <span
        className={cn("w-1.5 h-1.5 rounded-full", statusDots[status])}
      />
    )}
    {status}
  </span>
));

AgentStatusBadge.displayName = "AgentStatusBadge";
