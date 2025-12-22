"use client";

import useSWR from "swr";
import { getActivityFeed, type ApiRequestOptions } from "@/lib/api";
import type { ActivityEvent } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface UseActivityFeedOptions {
  linkId: string;
  limit?: number;
  enabled?: boolean;
}

export function useActivityFeed(options: UseActivityFeedOptions) {
  const { currentWorkspace } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<ActivityEvent[]>(
    options?.enabled !== false && options.linkId && currentWorkspace
      ? ["activity-feed", options.linkId, options.limit || 50]
      : null,
    () =>
      getActivityFeed(
        options.linkId,
        options.limit || 50,
        apiOptions
      ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    events: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}


