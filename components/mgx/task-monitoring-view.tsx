"use client";

import * as React from "react";
import { CheckCircle, Play, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Spinner } from "@/components/mgx/ui/spinner";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { useWebSocket } from "@/components/WebSocketProvider";
import { PlanApprovalModal } from "@/components/mgx/plan-approval-modal";
import { ResultsViewer } from "@/components/mgx/results-viewer";
import { TaskMonitor } from "@/components/mgx/task-monitor";
import { AgentChat } from "@/components/AgentChat";
import { triggerRun } from "@/lib/api";
import type { RunProgressPayload, TaskPhase, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRun, useTask } from "@/hooks/useTasks";

function pillVariant(status: TaskStatus) {
  switch (status) {
    case "running":
      return "info" as const;
    case "completed":
      return "success" as const;
    case "failed":
      return "danger" as const;
    case "waiting_approval":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

type TabId = "plan" | "progress" | "results";

const TAB_LABELS: Record<TabId, string> = {
  plan: "Plan",
  progress: "Progress",
  results: "Results",
};

function safeString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function safeNumber(value: unknown) {
  return typeof value === "number" && !Number.isNaN(value) ? value : undefined;
}

function safePhase(value: unknown): TaskPhase | undefined {
  if (value === "analyze" || value === "plan" || value === "execute" || value === "review") return value;
  return undefined;
}

function parseRunProgressPayload(payload: unknown): RunProgressPayload {
  if (!payload || typeof payload !== "object") return {};
  const p = payload as Record<string, unknown>;

  return {
    taskId: safeString(p.taskId),
    runId: safeString(p.runId),
    phase: safePhase(p.phase),
    progress: safeNumber(p.progress),
    currentAction: safeString(p.currentAction ?? p.action),
    etaSeconds: safeNumber(p.etaSeconds),
    elapsedSeconds: safeNumber(p.elapsedSeconds),
    status: safeString(p.status) as TaskStatus | undefined,
    log: safeString(p.log ?? p.message),
    timestamp: safeNumber(p.timestamp),
  };
}

export function TaskMonitoringView({ taskId }: { taskId: string }) {
  const { task, isLoading: isTaskLoading, mutate: mutateTask } = useTask(taskId);
  const { run, isLoading: isRunLoading, mutate: mutateRun } = useRun(taskId, task?.currentRunId);
  const { lastMessage, subscribe } = useWebSocket();

  const [activeTab, setActiveTab] = React.useState<TabId>("plan");
  const [planModalOpen, setPlanModalOpen] = React.useState(false);

  const [livePhase, setLivePhase] = React.useState<TaskPhase | undefined>(undefined);
  const [liveProgress, setLiveProgress] = React.useState<number | undefined>(undefined);
  const [liveAction, setLiveAction] = React.useState<string | undefined>(undefined);
  const [liveEtaSeconds, setLiveEtaSeconds] = React.useState<number | undefined>(undefined);
  const [liveLogs, setLiveLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    subscribe?.({ taskId, runId: task?.currentRunId });
  }, [subscribe, task?.currentRunId, taskId]);

  React.useEffect(() => {
    if (!lastMessage) return;

    if (
      [
        "plan_ready",
        "run_progress",
        "run_completed",
        "run_failed",
        "task_update",
        "run_update",
      ].includes(lastMessage.type)
    ) {
      mutateTask();
      mutateRun();
    }

    if (lastMessage.type !== "run_progress") return;

    const progressPayload = parseRunProgressPayload(lastMessage.payload);
    if (progressPayload.taskId && progressPayload.taskId !== taskId) return;
    if (progressPayload.runId && run?.id && progressPayload.runId !== run.id) return;

    if (progressPayload.phase) setLivePhase(progressPayload.phase);
    if (progressPayload.progress !== undefined) setLiveProgress(progressPayload.progress);
    if (progressPayload.currentAction) setLiveAction(progressPayload.currentAction);
    if (progressPayload.etaSeconds !== undefined) setLiveEtaSeconds(progressPayload.etaSeconds);
    if (progressPayload.log) {
      setLiveLogs((prev) => {
        const next = [...prev, progressPayload.log!];
        if (next.length > 200) return next.slice(-200);
        return next;
      });
    }
  }, [lastMessage, mutateRun, mutateTask, run?.id, taskId]);

  const handleTriggerRun = async () => {
    try {
      await triggerRun(taskId);
      toast.success("Run triggered");
      mutateTask();
    } catch {
      toast.error("Failed to trigger run");
    }
  };

  if (isTaskLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Spinner className="h-4 w-4" /> Loading task...
      </div>
    );
  }

  if (!task) {
    return <div className="text-sm text-zinc-600 dark:text-zinc-400">Task not found.</div>;
  }

  const effectiveLogs = [...(run?.logs ?? []), ...liveLogs];
  const effectiveAction = liveAction || effectiveLogs[effectiveLogs.length - 1] || undefined;

  const effectivePhase = livePhase;
  const effectiveProgress = liveProgress;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{task.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="tabular-nums">Updated {new Date(task.updatedAt).toLocaleString()}</span>
            <StatusPill variant={pillVariant(task.status)}>{task.status}</StatusPill>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {task.status !== "running" && task.status !== "waiting_approval" ? (
            <Button variant="primary" onClick={handleTriggerRun}>
              <Play className="mr-2 h-4 w-4" /> Trigger run
            </Button>
          ) : null}

          {task.status === "waiting_approval" ? (
            <Button variant="primary" onClick={() => setPlanModalOpen(true)}>
              <CheckCircle className="mr-2 h-4 w-4" /> Review plan
            </Button>
          ) : null}
        </div>
      </div>

      <TaskMonitor
        status={run?.status ?? task.status}
        phase={effectivePhase}
        progress={effectiveProgress}
        currentAction={effectiveAction}
        startedAt={run?.createdAt}
        etaSeconds={liveEtaSeconds}
      />

      {task.currentRunId && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Agent Communication</CardTitle>
              <CardDescription>
                Real-time agent activity and communication during task execution.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-96">
              <AgentChat
                taskId={taskId}
                runId={task.currentRunId}
                isRunning={task.status === "running"}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Run details</CardTitle>
            <CardDescription>
              Plan, execution progress, and generated results (auto-updated from WebSocket events).
            </CardDescription>
          </div>
          {isRunLoading ? <Spinner className="h-4 w-4" /> : null}
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TAB_LABELS) as TabId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  activeTab === id
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800",
                )}
              >
                {TAB_LABELS[id]}
              </button>
            ))}
          </div>

          {!run ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              No active run information available.
            </div>
          ) : null}

          {run && activeTab === "plan" ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Execution plan
              </div>
              <pre className="max-h-[50vh] overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
                {run.plan || "No plan available."}
              </pre>
              {task.status === "waiting_approval" ? (
                <Button variant="secondary" onClick={() => setPlanModalOpen(true)}>
                  <XCircle className="mr-2 h-4 w-4" /> Approve or reject
                </Button>
              ) : null}
            </div>
          ) : null}

          {run && activeTab === "progress" ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 dark:border-zinc-800">
              {effectiveLogs.length === 0 ? (
                <div className="text-zinc-400">No logs yet.</div>
              ) : (
                <div className="max-h-[50vh] overflow-auto space-y-1">
                  {effectiveLogs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {run && activeTab === "results" ? (
            <ResultsViewer artifacts={run.artifacts} taskId={taskId} runId={run.id} />
          ) : null}
        </CardContent>
      </Card>

      <PlanApprovalModal
        open={planModalOpen}
        taskId={taskId}
        runId={task.currentRunId ?? run?.id ?? ""}
        plan={run?.plan}
        onClose={() => setPlanModalOpen(false)}
        onDecision={() => {
          mutateTask();
          mutateRun();
        }}
      />
    </div>
  );
}
