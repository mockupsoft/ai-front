"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/api";
import type { Run, Task } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface TaskListResponse {
  items: Task[];
  total: number;
  skip: number;
  limit: number;
}

export function useTasks() {
  const { currentWorkspace, currentProject } = useWorkspace();
  
  const apiOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<TaskListResponse>(
    currentWorkspace ? ["/api/tasks/", apiOptions] : null,
    ([path, options]) => fetcher<TaskListResponse>(path, options as { workspaceId?: string; projectId?: string }),
  );
  
  return {
    tasks: data?.items ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTask(id: string) {
  const { currentWorkspace, currentProject } = useWorkspace();
  
  const apiOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Task>(
    id && currentWorkspace ? [`/api/tasks/${id}`, apiOptions] : null,
    ([path, options]) => fetcher<Task>(path, options as { workspaceId?: string; projectId?: string }),
  );
  
  return {
    task: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRun(taskId: string, runId?: string) {
  const { currentWorkspace, currentProject } = useWorkspace();
  
  const apiOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Run>(
    taskId && runId && currentWorkspace ? [`/api/tasks/${taskId}/runs/${runId}`, apiOptions] : null,
    ([path, options]) => fetcher<Run>(path, options as { workspaceId?: string; projectId?: string }),
  );

  return {
    run: data,
    isLoading,
    isError: error,
    mutate,
  };
}
