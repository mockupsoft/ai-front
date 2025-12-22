"use client";

import * as React from "react";
import { ExternalLink, GitMerge, GitPullRequest, CheckCircle, XCircle } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import type { PullRequest } from "@/lib/types";
import { usePullRequests } from "@/hooks/usePullRequests";
import { Spinner } from "@/components/mgx/ui/spinner";

interface PullRequestListProps {
  linkId: string;
  state?: "open" | "closed" | "all";
}

function getStateColor(state: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (state === "open") return "info";
  if (state === "closed") return "neutral";
  return "neutral";
}

export function PullRequestList({ linkId, state = "open" }: PullRequestListProps) {
  const { pullRequests, isLoading, isError, error, mutate } = usePullRequests({
    linkId,
    state,
    enabled: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pull Requests</CardTitle>
          <CardDescription>GitHub pull requests for this repository</CardDescription>
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
          <CardTitle>Pull Requests</CardTitle>
          <CardDescription>GitHub pull requests for this repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error instanceof Error ? error.message : "Failed to load pull requests"}</span>
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
            <CardTitle>Pull Requests</CardTitle>
            <CardDescription>
              {pullRequests.length > 0 ? `${pullRequests.length} ${state} pull requests` : "No pull requests"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {pullRequests.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No pull requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {pullRequests.map((pr: PullRequest) => (
              <div
                key={pr.number}
                className="flex items-start gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex-shrink-0">
                  {pr.state === "open" ? (
                    <GitPullRequest className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : pr.merged_at ? (
                    <GitMerge className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                          #{pr.number} {pr.title}
                        </h3>
                        <StatusPill variant={getStateColor(pr.state)}>
                          {pr.state}
                        </StatusPill>
                        {pr.merged_at && (
                          <StatusPill variant="success">
                            Merged
                          </StatusPill>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {pr.head_branch} → {pr.base_branch}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(pr.html_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  {pr.body && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {pr.body}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {pr.author && <span>by {pr.author}</span>}
                    <span>{formatTimeAgo(pr.updated_at)}</span>
                    {pr.labels.length > 0 && (
                      <div className="flex gap-1">
                        {pr.labels.slice(0, 3).map((label) => (
                          <span
                            key={label}
                            className="rounded px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


