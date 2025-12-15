"use client";

import useSWR, { SWRConfiguration } from "swr";
import { fetchAgentInstances, type ApiRequestOptions } from "@/lib/api";
import type { AgentInstance } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface UseAgentsOptions extends SWRConfiguration {
  taskId?: string;
  runId?: string;
}

interface AgentCounts {
  total: number;
  active: number;
  idle: number;
  executing: number;
  error: number;
  offline: number;
}

export function useAgents(options?: UseAgentsOptions) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<AgentInstance[]>(
    currentWorkspace ? ["/agents", apiOptions] : null,
    ([, opts]) => fetchAgentInstances(opts as ApiRequestOptions) as Promise<AgentInstance[]>,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      ...options,
    }
  );

  const filteredAgents = data?.filter((agent) => {
    if (options?.taskId && agent.taskId !== options.taskId) return false;
    if (options?.runId && agent.runId !== options.runId) return false;
    return true;
  });

  const counts: AgentCounts = {
    total: filteredAgents?.length ?? 0,
    active: filteredAgents?.filter((a) => a.status === "active").length ?? 0,
    idle: filteredAgents?.filter((a) => a.status === "idle").length ?? 0,
    executing: filteredAgents?.filter((a) => a.status === "executing").length ?? 0,
    error: filteredAgents?.filter((a) => a.status === "error").length ?? 0,
    offline: filteredAgents?.filter((a) => a.status === "offline").length ?? 0,
  };

  return {
    agents: filteredAgents,
    allAgents: data,
    counts,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useAgentForTask(taskId: string, runId?: string) {
  return useAgents({ taskId, runId });
}
