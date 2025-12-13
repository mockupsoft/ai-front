"use client";

import useSWR, { SWRConfiguration } from "swr";
import { fetcher, type ApiRequestOptions } from "@/lib/api";
import type { Repository } from "@/lib/types";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

const REPOSITORIES_ENDPOINT = "/api/projects/{projectId}/repositories";

interface UseRepositoriesOptions extends SWRConfiguration {
  projectId?: string;
}

export function useRepositories(options?: UseRepositoriesOptions) {
  const { currentProject, currentWorkspace } = useWorkspace();
  const projectId = options?.projectId || currentProject?.id;

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
  };

  const { data, error, isLoading, mutate } = useSWR<Repository[]>(
    projectId && currentWorkspace ? [REPOSITORIES_ENDPOINT.replace("{projectId}", projectId), apiOptions] : null,
    ([path, opts]) => fetcher<Repository[]>(path, opts as ApiRequestOptions),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      ...options,
    }
  );

  return {
    repositories: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
