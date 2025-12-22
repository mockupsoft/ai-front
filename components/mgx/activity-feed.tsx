"use client";

import * as React from "react";
import { GitCommit, GitPullRequest, AlertCircle, MessageSquare, ExternalLink } from "lucide-react";
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
import type { ActivityEvent } from "@/lib/types";
import { useActivityFeed } from "@/hooks/useActivityFeed";

interface ActivityFeedProps {
  linkId: string;
  limit?: number;
}

function getEventIcon(type: string) {
  switch (type) {
    case "commit":
      return GitCommit;
    case "pull_request":
      return GitPullRequest;
    case "issue":
      return AlertCircle;
    case "issue_comment":
    case "pr_review":
      return MessageSquare;
    default:
      return GitCommit;
  }
}

function getEventColor(type: string): string {
  switch (type) {
    case "commit":
      return "text-green-600 dark:text-green-400";
    case "pull_request":
      return "text-blue-600 dark:text-blue-400";
    case "issue":
      return "text-yellow-600 dark:text-yellow-400";
    case "issue_comment":
    case "pr_review":
      return "text-purple-600 dark:text-purple-400";
    default:
      return "text-zinc-600 dark:text-zinc-400";
  }
}

export function ActivityFeed({ linkId, limit = 50 }: ActivityFeedProps) {
  const { events, isLoading, isError, error, mutate } = useActivityFeed({
    linkId,
    limit,
    enabled: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent GitHub activity for this repository</CardDescription>
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
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent GitHub activity for this repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error instanceof Error ? error.message : "Failed to load activity feed"}</span>
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
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              {events.length > 0 ? `${events.length} recent events` : "No activity"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No activity found.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: ActivityEvent) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);
              
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className={`flex-shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {event.title && (
                            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                              {event.title}
                            </h3>
                          )}
                          <span className="text-xs text-zinc-500 uppercase">
                            {event.type.replace("_", " ")}
                          </span>
                        </div>
                        {event.actor && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            by {event.actor}
                          </p>
                        )}
                      </div>
                      {event.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(event.url!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {event.body && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {event.body}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{formatTimeAgo(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


