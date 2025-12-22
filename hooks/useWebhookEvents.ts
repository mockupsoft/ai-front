"use client";

import useSWR from "swr";
import { listWebhookEvents, type ApiRequestOptions } from "@/lib/api";
import type { WebhookEventsResponse } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface UseWebhookEventsOptions {
  repoFullName?: string;
  eventType?: string;
  limit?: number;
  enabled?: boolean;
}

export function useWebhookEvents(options?: UseWebhookEventsOptions) {
  const { currentWorkspace } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<WebhookEventsResponse>(
    options?.enabled !== false && currentWorkspace
      ? [
          "webhook-events",
          options?.repoFullName,
          options?.eventType,
          options?.limit || 50,
        ]
      : null,
    () =>
      listWebhookEvents(
        options?.repoFullName,
        options?.eventType,
        options?.limit || 50,
        apiOptions
      ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    events: data?.items || [],
    total: data?.total || 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}


