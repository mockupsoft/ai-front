"use client";

import * as React from "react";
import { Trash2, RotateCw, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import {
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
} from "@/components/mgx/ui/table";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { Spinner } from "@/components/mgx/ui/spinner";
import type { Repository } from "@/lib/types";
import { disconnectRepository, refreshRepositoryMetadata } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface RepositoriesListProps {
  repositories?: Repository[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

function getStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "connected":
      return "success";
    case "syncing":
      return "info";
    case "error":
      return "danger";
    case "disconnected":
      return "neutral";
    default:
      return "neutral";
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function RepositoriesList({
  repositories = [],
  isLoading = false,
  onRefresh,
}: RepositoriesListProps) {
  const { currentProject, currentWorkspace } = useWorkspace();
  const [refressingId, setRefressingId] = React.useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = React.useState<string | null>(null);

  const handleRefreshMetadata = async (repo: Repository) => {
    if (!currentProject || !currentWorkspace) return;

    setRefressingId(repo.id);
    try {
      await refreshRepositoryMetadata(repo.projectId, repo.id, {
        workspaceId: currentWorkspace.id,
        projectId: currentProject.id,
      });
      toast.success("Repository metadata refreshed");
      onRefresh?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh metadata";
      toast.error(errorMessage);
    } finally {
      setRefressingId(null);
    }
  };

  const handleDisconnect = async (repo: Repository) => {
    if (!currentProject || !currentWorkspace) return;

    if (!confirm(`Are you sure you want to disconnect "${repo.name}"?`)) return;

    setDisconnectingId(repo.id);
    try {
      await disconnectRepository(repo.projectId, repo.id, {
        workspaceId: currentWorkspace.id,
        projectId: currentProject.id,
      });
      toast.success("Repository disconnected");
      onRefresh?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disconnect repository";
      toast.error(errorMessage);
    } finally {
      setDisconnectingId(null);
    }
  };

  if (isLoading && repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>Manage your GitHub repository connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Spinner className="h-4 w-4" />
              Loading repositories...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>Manage your GitHub repository connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No repositories connected yet
            </p>
            <p className="text-xs text-zinc-500">
              Use the form above to connect a GitHub repository
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Repositories</CardTitle>
        <CardDescription>Manage your GitHub repository connections</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <THead>
            <Tr>
              <Th>Repository</Th>
              <Th>Branch</Th>
              <Th>Status</Th>
              <Th>Last Sync</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {repositories.map((repo) => (
              <Tr key={repo.id}>
                <Td className="font-medium">
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {repo.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </Td>
                <Td className="text-sm">
                  <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-900">
                    {repo.branch}
                  </code>
                </Td>
                <Td>
                  <StatusPill variant={getStatusVariant(repo.status)}>
                    {repo.status}
                  </StatusPill>
                  {repo.error && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {repo.error}
                    </div>
                  )}
                </Td>
                <Td className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDate(repo.lastSyncTime)}
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshMetadata(repo)}
                      disabled={refressingId === repo.id}
                      title="Refresh repository metadata"
                    >
                      {refressingId === repo.id ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <RotateCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(repo)}
                      disabled={disconnectingId === repo.id}
                      title="Disconnect repository"
                    >
                      {disconnectingId === repo.id ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}
