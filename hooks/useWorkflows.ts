"use client";

import useSWR, { type SWRConfiguration } from "swr";

import {
  fetchWorkflow,
  fetchWorkflows,
  fetchWorkflowTemplates,
  type ApiRequestOptions,
} from "@/lib/api";
import type { Workflow, WorkflowSummary, WorkflowTemplate } from "@/lib/types/workflows";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

export function useWorkflows(options?: SWRConfiguration) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<WorkflowSummary[]>(
    currentWorkspace ? ["/workflows", apiOptions] : null,
    ([, opts]) => fetchWorkflows(opts as ApiRequestOptions),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5_000,
      ...options,
    },
  );

  return {
    workflows: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useWorkflow(workflowId?: string, options?: SWRConfiguration) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Workflow>(
    workflowId && currentWorkspace ? [`/workflows/${workflowId}`, apiOptions] : null,
    ([, opts]) => fetchWorkflow(workflowId as string, opts as ApiRequestOptions),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...options,
    },
  );

  return {
    workflow: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useWorkflowTemplates(options?: SWRConfiguration) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<WorkflowTemplate[]>(
    currentWorkspace ? ["/workflows/templates", apiOptions] : null,
    ([, opts]) => fetchWorkflowTemplates(opts as ApiRequestOptions),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60_000,
      ...options,
    },
  );

  return {
    templates: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
