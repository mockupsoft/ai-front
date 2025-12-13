"use client";

import * as React from "react";
import { ExternalLink, GitBranch, GitCommit } from "lucide-react";
import type { GitMetadata } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GitMetadataBadgeProps {
  metadata?: GitMetadata;
  className?: string;
}

export function GitMetadataBadge({
  metadata,
  className,
}: GitMetadataBadgeProps) {
  if (!metadata) return null;

  const badges = [];

  if (metadata.branch) {
    badges.push(
      <div
        key="branch"
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200"
      >
        <GitBranch className="h-3 w-3" />
        {metadata.branch}
      </div>
    );
  }

  if (metadata.commitSha) {
    const shortSha = metadata.commitSha.substring(0, 7);
    badges.push(
      <div
        key="commit"
        className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-200"
      >
        <GitCommit className="h-3 w-3" />
        <code className="font-mono">{shortSha}</code>
      </div>
    );
  }

  if (metadata.prUrl && metadata.prNumber) {
    badges.push(
      <a
        key="pr"
        href={metadata.prUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
      >
        PR #{metadata.prNumber}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {badges}
    </div>
  );
}
