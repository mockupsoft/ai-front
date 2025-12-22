"use client";

import * as React from "react";
import { FileText, Plus, Minus, GitBranch } from "lucide-react";
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
import type { DiffResponse } from "@/lib/types";
import { getCommitDiff, getCompareDiff, type ApiRequestOptions } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { useBranches } from "@/hooks/useBranches";

interface DiffViewerProps {
  linkId: string;
  mode?: "commit" | "compare";
  commitSha?: string;
  baseBranch?: string;
  headBranch?: string;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "added":
      return "text-green-600 dark:text-green-400";
    case "removed":
      return "text-red-600 dark:text-red-400";
    case "modified":
      return "text-yellow-600 dark:text-yellow-400";
    case "renamed":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-zinc-600 dark:text-zinc-400";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "added":
      return Plus;
    case "removed":
      return Minus;
    default:
      return FileText;
  }
}

export function DiffViewer({ 
  linkId, 
  mode = "compare",
  commitSha,
  baseBranch,
  headBranch,
}: DiffViewerProps) {
  const { currentWorkspace } = useWorkspace();
  const { branches } = useBranches({ linkId, enabled: true });
  const [diff, setDiff] = React.useState<DiffResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [selectedBase, setSelectedBase] = React.useState(baseBranch || "");
  const [selectedHead, setSelectedHead] = React.useState(headBranch || "");
  const [selectedCommit, setSelectedCommit] = React.useState(commitSha || "");

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  React.useEffect(() => {
    if (mode === "commit" && commitSha) {
      loadCommitDiff();
    } else if (mode === "compare" && baseBranch && headBranch) {
      loadCompareDiff();
    }
  }, [mode, commitSha, baseBranch, headBranch]);

  const loadCommitDiff = async () => {
    if (!commitSha) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const result = await getCommitDiff(linkId, commitSha, apiOptions);
      setDiff(result);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Failed to load diff"));
      toast.error(err instanceof Error ? err.message : "Failed to load diff");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompareDiff = async () => {
    if (!selectedBase || !selectedHead) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const result = await getCompareDiff(linkId, selectedBase, selectedHead, apiOptions);
      setDiff(result);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Failed to load diff"));
      toast.error(err instanceof Error ? err.message : "Failed to load diff");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = () => {
    if (!selectedBase || !selectedHead) {
      toast.error("Please select both base and head");
      return;
    }
    loadCompareDiff();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diff Viewer</CardTitle>
          <CardDescription>View code changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError && !diff) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diff Viewer</CardTitle>
          <CardDescription>View code changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error?.message || "Failed to load diff"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diff Viewer</CardTitle>
        <CardDescription>View code changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "compare" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base</label>
              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="">Select base</option>
                {branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Head</label>
              <select
                value={selectedHead}
                onChange={(e) => setSelectedHead(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="">Select head</option>
                {branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Button onClick={handleCompare} variant="primary" className="w-full">
                <GitBranch className="mr-2 h-4 w-4" />
                View Diff
              </Button>
            </div>
          </div>
        )}

        {mode === "commit" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Commit SHA</label>
            <input
              type="text"
              value={selectedCommit}
              onChange={(e) => setSelectedCommit(e.target.value)}
              placeholder="abc1234..."
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
            <Button onClick={loadCommitDiff} variant="primary" className="w-full">
              View Diff
            </Button>
          </div>
        )}

        {diff && (
          <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {diff.statistics.files_changed}
                </div>
                <div className="text-xs text-zinc-500">Files</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{diff.statistics.additions}
                </div>
                <div className="text-xs text-zinc-500">Additions</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  -{diff.statistics.deletions}
                </div>
                <div className="text-xs text-zinc-500">Deletions</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {diff.statistics.total_changes}
                </div>
                <div className="text-xs text-zinc-500">Total</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Files Changed</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {diff.files.map((file) => {
                  const Icon = getStatusIcon(file.status);
                  const colorClass = getStatusColor(file.status);
                  
                  return (
                    <div
                      key={file.filename}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon className={`h-4 w-4 flex-shrink-0 ${colorClass}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                            {file.filename}
                          </p>
                          {file.previous_filename && (
                            <p className="text-xs text-zinc-500">
                              Renamed from {file.previous_filename}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500 flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400">
                          +{file.additions}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{file.deletions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {diff.files.some((f) => f.patch) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Patch Preview</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {diff.files
                    .filter((f) => f.patch)
                    .map((file) => (
                      <div
                        key={file.filename}
                        className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                      >
                        <p className="text-sm font-medium mb-2">{file.filename}</p>
                        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-3 rounded overflow-x-auto">
                          <code>{file.patch}</code>
                        </pre>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


