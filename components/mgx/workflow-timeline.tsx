"use client";

import { useState } from "react";
import type {
  WorkflowExecution,
  StepExecution,
} from "@/lib/types/workflows";
import { StatusPill, type StatusPillVariant } from "@/components/mgx/ui/status-pill";
import { Spinner } from "@/components/mgx/ui/spinner";

function getStatusVariant(status: string): StatusPillVariant {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "running":
      return "info";
    case "retrying":
      return "warning";
    case "skipped":
    default:
      return "neutral";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-500";
    case "failed":
      return "bg-rose-500";
    case "running":
      return "bg-sky-500";
    case "retrying":
      return "bg-amber-500";
    case "skipped":
    default:
      return "bg-zinc-300";
  }
}

function formatDuration(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

export interface WorkflowTimelineProps {
  execution?: WorkflowExecution;
  isLoading?: boolean;
  onStepSelect?: (step: StepExecution) => void;
}

export function WorkflowTimeline({
  execution,
  isLoading,
  onStepSelect,
}: WorkflowTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <Spinner className="h-5 w-5" />
        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
          Loading timeline…
        </span>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        No execution data available.
      </div>
    );
  }

  if (!execution.steps || execution.steps.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        No steps in execution.
      </div>
    );
  }

  const minStartTime = Math.min(
    ...execution.steps
      .filter((s) => s.startedAt)
      .map((s) => s.startedAt as number),
    execution.startedAt
  );
  const maxEndTime =
    execution.completedAt ||
    Math.max(
      ...execution.steps
        .filter((s) => s.completedAt)
        .map((s) => s.completedAt as number),
      execution.startedAt
    );
  const totalDuration = maxEndTime - minStartTime;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Execution Timeline
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Total duration: {formatDuration(execution.durationMs)}
          </p>
        </div>

        <div className="space-y-3">
          {execution.steps.map((step) => {
            const stepStartOffset = step.startedAt
              ? ((step.startedAt - minStartTime) / totalDuration) * 100
              : 0;
            const stepDuration = step.durationMs || 0;
            const stepWidth =
              totalDuration > 0
                ? (stepDuration / totalDuration) * 100
                : 5;

            return (
              <div key={step.stepId}>
                <div
                  className="cursor-pointer rounded px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => {
                    setExpandedStep(
                      expandedStep === step.stepId ? null : step.stepId
                    );
                    onStepSelect?.(step);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {step.stepName}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {step.agentId
                          ? `Agent: ${step.agentId.slice(0, 8)}`
                          : "No agent assigned"}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {formatDuration(step.durationMs)}
                      </span>
                      <StatusPill variant={getStatusVariant(step.status)}>
                        {step.status}
                      </StatusPill>
                    </div>
                  </div>

                  {/* Timeline bar */}
                  <div className="mt-2 h-6 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                    {step.startedAt && (
                      <div
                        className={`h-full ${getStatusColor(step.status)} transition-all`}
                        style={{
                          marginLeft: `${Math.max(0, stepStartOffset)}%`,
                          width: `${Math.max(2, stepWidth)}%`,
                        }}
                        title={`${step.stepName}: ${formatDuration(step.durationMs)}`}
                      />
                    )}
                  </div>

                  {/* Retry indicator */}
                  {step.retryCount && step.retryCount > 0 && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Retried {step.retryCount} time{step.retryCount > 1 ? "s" : ""}
                    </p>
                  )}

                  {/* Error message */}
                  {step.error && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      Error: {step.error}
                    </p>
                  )}
                </div>

                {/* Expanded details */}
                {expandedStep === step.stepId && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800">
                    {step.outputs && Object.keys(step.outputs).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          Outputs
                        </p>
                        <pre className="mt-1 max-h-40 overflow-y-auto rounded bg-zinc-50 p-2 text-xs dark:bg-zinc-900">
                          {JSON.stringify(step.outputs, null, 2)}
                        </pre>
                      </div>
                    )}
                    {step.error && (
                      <div>
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                          Error Details
                        </p>
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          {step.error}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
