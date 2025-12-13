"use client";

import { useRepositories } from "@/hooks/useRepositories";
import { RepositoryConnectForm } from "@/components/mgx/repository-connect-form";
import { RepositoriesList } from "@/components/mgx/repositories-list";

export default function GitSettingsPage() {
  const { repositories, isLoading, mutate } = useRepositories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Git Repository Configuration</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Connect and manage GitHub repositories for automated branch tracking and metadata sync.
        </p>
      </div>

      <RepositoryConnectForm onSuccess={() => mutate()} />

      <RepositoriesList
        repositories={repositories}
        isLoading={isLoading}
        onRefresh={() => mutate()}
      />
    </div>
  );
}
