"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/api";
import type { Run, Task } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

export function useTasks() {
  const { currentWorkspace, currentProject } = useWorkspace();
  
  const apiOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    currentWorkspace ? ["/tasks", apiOptions] : null,
    ([path, options]) => fetcher<Task[]>(path, options as { workspaceId?: string; projectId?: string }),
  );
  
  return {
    tasks: data,
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
    id && currentWorkspace ? [`/tasks/${id}`, apiOptions] : null,
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
    taskId && runId && currentWorkspace ? [`/tasks/${taskId}/runs/${runId}`, apiOptions] : null,
    ([path, options]) => fetcher<Run>(path, options as { workspaceId?: string; projectId?: string }),
  );

  return {
    run: data,
    isLoading,
    isError: error,
    mutate,
  };
}
