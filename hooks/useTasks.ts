"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/api";
import type { Run, Task } from "@/lib/types";

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR<Task[]>("/tasks", fetcher);
  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTask(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Task>(
    id ? `/tasks/${id}` : null,
    fetcher,
  );
  return {
    task: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRun(taskId: string, runId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Run>(
    taskId && runId ? `/tasks/${taskId}/runs/${runId}` : null,
    fetcher,
  );

  return {
    run: data,
    isLoading,
    isError: error,
    mutate,
  };
}
