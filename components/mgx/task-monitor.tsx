"use client";

import * as React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { cn } from "@/lib/utils";
import type { TaskPhase, TaskStatus } from "@/lib/types";

const PHASES: Array<{ id: TaskPhase; label: string }> = [
  { id: "analyze", label: "Analyze" },
  { id: "plan", label: "Plan" },
  { id: "execute", label: "Execute" },
  { id: "review", label: "Review" },
];

function statusVariant(status: TaskStatus | undefined) {
  switch (status) {
    case "running":
      return "info";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "waiting_approval":
      return "warning";
    default:
      return "neutral";
  }
}

function clampProgress(progress: number | undefined) {
  if (progress === undefined || Number.isNaN(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

function formatSeconds(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export type TaskMonitorProps = {
  status?: TaskStatus;
  phase?: TaskPhase;
  progress?: number;
  currentAction?: string;
  startedAt?: string;
  etaSeconds?: number;
  className?: string;
};

export function TaskMonitor({
  status,
  phase,
  progress,
  currentAction,
  startedAt,
  etaSeconds,
  className,
}: TaskMonitorProps) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const startedAtMs = startedAt ? new Date(startedAt).getTime() : undefined;
  const elapsedSeconds = startedAtMs ? Math.max(0, (now - startedAtMs) / 1000) : undefined;

  const normalizedProgress =
    status === "completed" ? 1 : status === "failed" ? clampProgress(progress) : clampProgress(progress);

  const estimatedTotalSeconds = React.useMemo(() => {
    if (etaSeconds !== undefined) {
      return (elapsedSeconds ?? 0) + Math.max(0, etaSeconds);
    }

    if (!elapsedSeconds) return undefined;
    if (normalizedProgress <= 0) return undefined;

    return elapsedSeconds / normalizedProgress;
  }, [elapsedSeconds, etaSeconds, normalizedProgress]);

  const etaDisplay = React.useMemo(() => {
    if (!elapsedSeconds) return "—";
    if (!estimatedTotalSeconds) return "—";

    const remaining = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
    return formatSeconds(remaining);
  }, [elapsedSeconds, estimatedTotalSeconds]);

  const currentPhaseIndex = phase ? PHASES.findIndex((p) => p.id === phase) : -1;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Live monitor</CardTitle>
          <CardDescription>Real-time progress, phases, and timing.</CardDescription>
        </div>
        {status ? <StatusPill variant={statusVariant(status)}>{status}</StatusPill> : null}
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
            <span className="font-medium tabular-nums">
              {Math.round(normalizedProgress * 100)}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(normalizedProgress * 100)}
            className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800"
          >
            <div
              className="h-2 rounded-full bg-zinc-900 transition-[width] dark:bg-zinc-50"
              style={{ width: `${Math.round(normalizedProgress * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Current action</div>
            <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {currentAction || "—"}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <span>Elapsed</span>
              <span>ETA</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              <span className="tabular-nums">{elapsedSeconds ? formatSeconds(elapsedSeconds) : "—"}</span>
              <span className="tabular-nums">{etaDisplay}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Execution timeline</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PHASES.map((p, idx) => {
              const isComplete = status === "completed" || (currentPhaseIndex !== -1 && idx < currentPhaseIndex);
              const isCurrent = currentPhaseIndex !== -1 && idx === currentPhaseIndex && status !== "completed";

              const Icon = isComplete ? CheckCircle2 : isCurrent ? Loader2 : Circle;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2",
                    "border-zinc-200 dark:border-zinc-800",
                    isComplete && "bg-emerald-500/5",
                    isCurrent && "bg-sky-500/5",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isComplete && "text-emerald-600 dark:text-emerald-400",
                      isCurrent && "animate-spin text-sky-600 dark:text-sky-400",
                      !isComplete && !isCurrent && "text-zinc-500 dark:text-zinc-400",
                    )}
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
