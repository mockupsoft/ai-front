"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import { fetchExecutionLogs, type ApiRequestOptions } from "@/lib/api";
import { Spinner } from "@/components/mgx/ui/spinner";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

export interface ExecutionLogPanelProps {
  executionId?: string;
  stepId?: string;
  title?: string;
}

export function ExecutionLogPanel({
  executionId,
  stepId,
  title = "Execution Logs",
}: ExecutionLogPanelProps) {
  const { currentWorkspace, currentProject } = useWorkspace();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data: logs, isLoading } = useSWR<string[]>(
    executionId && currentWorkspace
      ? [`/executions/${executionId}/logs${stepId ? `/${stepId}` : ""}`, apiOptions]
      : null,
    ([, opts]) =>
      fetchExecutionLogs(
        executionId as string,
        stepId,
        100,
        0,
        opts as ApiRequestOptions
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 500,
    }
  );

  useEffect(() => {
    if (typeof window !== "undefined" && logsEndRef.current?.scrollIntoView) {
      try {
        logsEndRef.current.scrollIntoView({ behavior: "smooth" });
      } catch {
        // Handle environments where scrollIntoView is not fully supported
      }
    }
  }, [logs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <Spinner className="h-5 w-5" />
        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
          Loading logs…
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto bg-zinc-950 p-4 font-mono text-xs text-zinc-200">
        {logs && logs.length > 0 ? (
          <>
            {logs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-words py-1">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        ) : (
          <div className="text-center text-zinc-500">No logs available</div>
        )}
      </div>
    </div>
  );
}
