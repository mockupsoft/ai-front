"use client";

import useSWR from "swr";
import { listBranches, type ApiRequestOptions } from "@/lib/api";
import type { Branch } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface UseBranchesOptions {
  linkId: string;
  enabled?: boolean;
}

export function useBranches(options: UseBranchesOptions) {
  const { currentWorkspace } = useWorkspace();

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Branch[]>(
    options?.enabled !== false && options.linkId && currentWorkspace
      ? ["branches", options.linkId]
      : null,
    () =>
      listBranches(
        options.linkId,
        apiOptions
      ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    branches: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}


