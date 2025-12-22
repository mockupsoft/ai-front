"use client";

import * as React from "react";
import { ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
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
import { Spinner } from "@/components/mgx/ui/spinner";
import type { Issue } from "@/lib/types";
import { useIssues } from "@/hooks/useIssues";

interface IssuesListProps {
  linkId: string;
  state?: "open" | "closed" | "all";
}

function getStateColor(state: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (state === "open") return "warning";
  if (state === "closed") return "neutral";
  return "neutral";
}

export function IssuesList({ linkId, state = "open" }: IssuesListProps) {
  const { issues, isLoading, isError, error, mutate } = useIssues({
    linkId,
    state,
    enabled: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues</CardTitle>
          <CardDescription>GitHub issues for this repository</CardDescription>
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
          <CardTitle>Issues</CardTitle>
          <CardDescription>GitHub issues for this repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error instanceof Error ? error.message : "Failed to load issues"}</span>
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
            <CardTitle>Issues</CardTitle>
            <CardDescription>
              {issues.length > 0 ? `${issues.length} ${state} issues` : "No issues"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No issues found.
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue: Issue) => (
              <div
                key={issue.number}
                className="flex items-start gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex-shrink-0">
                  {issue.state === "open" ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                          #{issue.number} {issue.title}
                        </h3>
                        <StatusPill variant={getStateColor(issue.state)}>
                          {issue.state}
                        </StatusPill>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(issue.html_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  {issue.body && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {issue.body}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {issue.author && <span>by {issue.author}</span>}
                    <span>{formatTimeAgo(issue.updated_at)}</span>
                    {issue.labels.length > 0 && (
                      <div className="flex gap-1">
                        {issue.labels.slice(0, 3).map((label) => (
                          <span
                            key={label}
                            className="rounded px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    {issue.comment_count > 0 && (
                      <span>{issue.comment_count} comment{issue.comment_count > 1 ? "s" : ""}</span>
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


