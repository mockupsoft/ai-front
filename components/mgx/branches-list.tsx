"use client";

import * as React from "react";
import { GitBranch, Shield, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Spinner } from "@/components/mgx/ui/spinner";
import type { Branch } from "@/lib/types";
import { useBranches } from "@/hooks/useBranches";
import { deleteBranch, type ApiRequestOptions } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface BranchesListProps {
  linkId: string;
}

export function BranchesList({ linkId }: BranchesListProps) {
  const { currentWorkspace } = useWorkspace();
  const { branches, isLoading, isError, error, mutate } = useBranches({
    linkId,
    enabled: true,
  });

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const handleDelete = async (branchName: string) => {
    if (!confirm(`Are you sure you want to delete branch "${branchName}"?`)) {
      return;
    }

    try {
      await deleteBranch(linkId, branchName, apiOptions);
      toast.success(`Branch "${branchName}" deleted successfully`);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete branch");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
          <CardDescription>GitHub branches for this repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
          <CardDescription>GitHub branches for this repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error instanceof Error ? error.message : "Failed to load branches"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Branches</CardTitle>
            <CardDescription>
              {branches.length > 0 ? `${branches.length} branches` : "No branches"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No branches found.
          </div>
        ) : (
          <div className="space-y-2">
            {branches.map((branch: Branch) => (
              <div
                key={branch.name}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {branch.name}
                      </span>
                      {branch.default && (
                        <span className="rounded px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          default
                        </span>
                      )}
                      {branch.protected && (
                        <Shield className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      {branch.sha.slice(0, 7)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!branch.default && !branch.protected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(branch.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


