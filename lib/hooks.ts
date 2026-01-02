import useSWR from 'swr';
import { fetcher } from './api';
import { Task, Run, Metrics } from './types';

interface TaskListResponse {
  items: Task[];
  total: number;
  skip: number;
  limit: number;
}

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR<TaskListResponse>('/api/tasks/', fetcher);
  return {
    // Handle both paginated response and direct array (for backwards compatibility)
    tasks: Array.isArray(data) ? data : (data?.items ?? []),
    total: Array.isArray(data) ? data.length : (data?.total ?? 0),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTask(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Task>(id ? `/api/tasks/${id}` : null, fetcher);
  return {
    task: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRun(taskId: string, runId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Run>(
    taskId && runId ? `/api/tasks/${taskId}/runs/${runId}` : null,
    fetcher
  );
  return {
    run: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMetrics() {
    // For metrics we might want a faster refresh interval or rely on WS
    const { data, error, isLoading } = useSWR<Metrics[]>('/metrics', fetcher, {
        refreshInterval: 5000 // Fallback if WS fails
    });
    return {
        metrics: data,
        isLoading,
        isError: error
    };
}
