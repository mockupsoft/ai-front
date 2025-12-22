"use client";

import useSWR from "swr";
import { listPullRequests, type ApiRequestOptions } from "@/lib/api";
import type { PullRequest } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface UsePullRequestsOptions {
  linkId: string;
  state?: "open" | "closed" | "all";
  enabled?: boolean;
}

export function usePullRequests(options: UsePullRequestsOptions) {
  const { currentWorkspace } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<PullRequest[]>(
    options?.enabled !== false && options.linkId && currentWorkspace
      ? ["pull-requests", options.linkId, options.state || "open"]
      : null,
    () =>
      listPullRequests(
        options.linkId,
        options.state || "open",
        apiOptions
      ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    pullRequests: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}


