"use client";

import useSWR, { type SWRConfiguration } from "swr";

import {
  fetchWorkflowExecutions,
  fetchWorkflowExecution,
  fetchExecutionMetrics,
  type ApiRequestOptions,
} from "@/lib/api";
import type {
  WorkflowExecution,
  ExecutionMetrics,
} from "@/lib/types/workflows";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

export function useWorkflowExecutions(
  workflowId?: string,
  options?: SWRConfiguration
) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<WorkflowExecution[]>(
    workflowId && currentWorkspace
      ? [`/workflows/${workflowId}/executions`, apiOptions]
      : null,
    ([, opts]) =>
      fetchWorkflowExecutions(
        workflowId as string,
        undefined,
        undefined,
        opts as ApiRequestOptions
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...options,
    }
  );

  return {
    executions: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useWorkflowExecution(
  executionId?: string,
  options?: SWRConfiguration
) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<WorkflowExecution>(
    executionId && currentWorkspace
      ? [`/executions/${executionId}`, apiOptions]
      : null,
    ([, opts]) =>
      fetchWorkflowExecution(executionId as string, opts as ApiRequestOptions),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 1000,
      ...options,
    }
  );

  return {
    execution: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useExecutionMetrics(
  executionId?: string,
  options?: SWRConfiguration
) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<ExecutionMetrics>(
    executionId && currentWorkspace
      ? [`/executions/${executionId}/metrics`, apiOptions]
      : null,
    ([, opts]) =>
      fetchExecutionMetrics(executionId as string, opts as ApiRequestOptions),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 1000,
      ...options,
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
