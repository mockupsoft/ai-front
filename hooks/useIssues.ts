"use client";

import useSWR from "swr";
import { listIssues, type ApiRequestOptions } from "@/lib/api";
import type { Issue } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface UseIssuesOptions {
  linkId: string;
  state?: "open" | "closed" | "all";
  enabled?: boolean;
}

export function useIssues(options: UseIssuesOptions) {
  const { currentWorkspace } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Issue[]>(
    options?.enabled !== false && options.linkId && currentWorkspace
      ? ["issues", options.linkId, options.state || "open"]
      : null,
    () =>
      listIssues(
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
    issues: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}


