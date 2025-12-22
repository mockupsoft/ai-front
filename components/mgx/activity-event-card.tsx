"use client";

import * as React from "react";
import { GitCommit, GitPullRequest, AlertCircle, MessageSquare, ExternalLink } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

import { Button } from "@/components/mgx/ui/button";
import type { ActivityEvent } from "@/lib/types";

interface ActivityEventCardProps {
  event: ActivityEvent;
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

export function ActivityEventCard({ event }: ActivityEventCardProps) {
  const Icon = getEventIcon(event.type);
  const colorClass = getEventColor(event.type);

  return (
    <div className="flex items-start gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
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
}


