"use client";

import { useState } from "react";
import {
  useWorkflowExecution,
  useExecutionMetrics,
} from "@/hooks/useWorkflowExecutions";
import { useWebSocket, type WebSocketSubscription } from "@/hooks/useWebSocket";
import { WorkflowTimeline } from "@/components/mgx/workflow-timeline";
import { ExecutionMetricsCards } from "@/components/mgx/execution-metrics-cards";
import { ExecutionLogPanel } from "@/components/mgx/execution-log-panel";
import { StatusPill, type StatusPillVariant } from "@/components/mgx/ui/status-pill";
import { Button } from "@/components/mgx/ui/button";
import type { StepExecution } from "@/lib/types/workflows";

function getStatusVariant(status: string): StatusPillVariant {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
    case "cancelled":
      return "danger";
    case "running":
      return "info";
    default:
      return "neutral";
  }
}

export default function ExecutionDetailPage({
  params,
}: {
  params: { workflowId: string; executionId: string };
}) {
  const { execution, isLoading: executionLoading, mutate } =
    useWorkflowExecution(params.executionId);
  const { metrics, isLoading: metricsLoading } = useExecutionMetrics(
    params.executionId
  );
  const [selectedStep, setSelectedStep] = useState<StepExecution | null>(null);

  const { subscribe } = useWebSocket();

  // Subscribe to execution updates
  const subscriptionPayload: WebSocketSubscription = {
    executionId: params.executionId,
  };

  if (typeof window !== "undefined") {
    subscribe(subscriptionPayload);
  }

  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Execution Timeline</h1>
            {execution && (
              <StatusPill variant={getStatusVariant(execution.status)}>
                {execution.status}
              </StatusPill>
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Execution ID: {params.executionId}
          </p>
        </div>

        <Button variant="secondary" onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      <ExecutionMetricsCards metrics={metrics} isLoading={metricsLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WorkflowTimeline
            execution={execution}
            isLoading={executionLoading}
            onStepSelect={setSelectedStep}
          />
        </div>

        <div className="space-y-4">
          {selectedStep ? (
            <>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Step Details
                </h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Name
                    </p>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                      {selectedStep.stepName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Status
                    </p>
                    <p className="mt-1">
                      <StatusPill
                        variant={getStatusVariant(selectedStep.status)}
                      >
                        {selectedStep.status}
                      </StatusPill>
                    </p>
                  </div>
                  {selectedStep.agentId && (
                    <div>
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Agent
                      </p>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {selectedStep.agentId}
                      </p>
                    </div>
                  )}
                  {selectedStep.durationMs && (
                    <div>
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Duration
                      </p>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {selectedStep.durationMs}ms
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <ExecutionLogPanel
                executionId={params.executionId}
                stepId={selectedStep.stepId}
                title={`Logs: ${selectedStep.stepName}`}
              />
            </>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Select a step to view details and logs
              </p>
            </div>
          )}
        </div>
      </div>

      <ExecutionLogPanel executionId={params.executionId} title="All Logs" />
    </div>
  );
}
