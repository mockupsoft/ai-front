"use client";

import type { ExecutionMetrics } from "@/lib/types/workflows";
import { Spinner } from "@/components/mgx/ui/spinner";

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

export interface ExecutionMetricsCardsProps {
  metrics?: ExecutionMetrics;
  isLoading?: boolean;
}

export function ExecutionMetricsCards({
  metrics,
  isLoading,
}: ExecutionMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <Spinner className="h-5 w-5" />
        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
          Loading metrics…
        </span>
      </div>
    );
  }

  if (!metrics) return null;

  const successRatePercent = Math.round(metrics.successRate * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Total Duration
        </p>
        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {formatDuration(metrics.totalDuration)}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Success Rate
        </p>
        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {successRatePercent}%
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Steps Completed
        </p>
        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {metrics.completedSteps}/{metrics.totalSteps}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Retries
        </p>
        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {metrics.retryCount}
        </p>
      </div>
    </div>
  );
}
