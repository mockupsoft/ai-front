"use client";

import * as React from "react";
import { GitBranch, ArrowRight, GitCommit } from "lucide-react";
import { toast } from "sonner";
import { formatTimeAgo } from "@/lib/utils";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Spinner } from "@/components/mgx/ui/spinner";
import type { BranchCompare } from "@/lib/types";
import { compareBranches, type ApiRequestOptions } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { useBranches } from "@/hooks/useBranches";

interface BranchCompareViewProps {
  linkId: string;
}

export function BranchCompareView({ linkId }: BranchCompareViewProps) {
  const { currentWorkspace } = useWorkspace();
  const { branches } = useBranches({ linkId, enabled: true });
  const [baseBranch, setBaseBranch] = React.useState("");
  const [headBranch, setHeadBranch] = React.useState("");
  const [comparison, setComparison] = React.useState<BranchCompare | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const handleCompare = async () => {
    if (!baseBranch || !headBranch) {
      toast.error("Please select both base and head branches");
      return;
    }

    if (baseBranch === headBranch) {
      toast.error("Base and head branches must be different");
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const result = await compareBranches(linkId, baseBranch, headBranch, apiOptions);
      setComparison(result);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Failed to compare branches"));
      toast.error(err instanceof Error ? err.message : "Failed to compare branches");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Branches</CardTitle>
        <CardDescription>Compare two branches to see differences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Branch</label>
            <select
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select base branch</option>
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Head Branch</label>
            <select
              value={headBranch}
              onChange={(e) => setHeadBranch(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select head branch</option>
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleCompare}
          disabled={isLoading || !baseBranch || !headBranch}
          variant="primary"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Comparing...
            </>
          ) : (
            <>
              <GitBranch className="mr-2 h-4 w-4" />
              Compare
            </>
          )}
        </Button>

        {isError && error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error.message}</span>
          </div>
        )}

        {comparison && (
          <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{baseBranch}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">{headBranch}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{comparison.ahead_by}
                </div>
                <div className="text-xs text-zinc-500">Ahead</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  -{comparison.behind_by}
                </div>
                <div className="text-xs text-zinc-500">Behind</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {comparison.total_commits}
                </div>
                <div className="text-xs text-zinc-500">Total</div>
              </div>
            </div>

            {comparison.commits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Commits</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {comparison.commits.map((commit) => (
                    <div
                      key={commit.sha}
                      className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <GitCommit className="h-4 w-4 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {commit.message.split("\n")[0]}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                          {commit.author && <span>by {commit.author}</span>}
                          {commit.date && <span>{formatTimeAgo(commit.date)}</span>}
                        </div>
                      </div>
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


