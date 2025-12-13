"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/api";
import type { Metrics } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

export function useMetrics() {
  const { currentWorkspace, currentProject } = useWorkspace();
  
  const apiOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Metrics[]>(
    currentWorkspace ? ["/metrics", apiOptions] : null,
    ([path, options]) => fetcher<Metrics[]>(path, options as { workspaceId?: string; projectId?: string }),
    {
      refreshInterval: 5000,
    },
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate,
  };
}
