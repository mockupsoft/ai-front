"use client";

import * as React from "react";
import { Clock, Hash, MessageCircle, FileText, Lightbulb, Archive, Trash2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoryItem } from "@/lib/types";

interface MemoryItemProps {
  item: MemoryItem;
  onRemove?: (id: string) => void;
  className?: string;
}

const getTypeIcon = (type: MemoryItem["type"]) => {
  switch (type) {
    case "message":
      return <MessageCircle className="h-4 w-4" />;
    case "fact":
      return <Hash className="h-4 w-4" />;
    case "summary":
      return <FileText className="h-4 w-4" />;
    case "context":
      return <Lightbulb className="h-4 w-4" />;
    default:
      return <Archive className="h-4 w-4" />;
  }
};

const getTypeColor = (type: MemoryItem["type"]) => {
  switch (type) {
    case "message":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200";
    case "fact":
      return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200";
    case "summary":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200";
    case "context":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200";
  }
};

const getSourceBadge = (source: MemoryItem["source"]) => {
  switch (source) {
    case "pinned":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
    case "auto":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200";
    case "manual":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200";
  }
};

export function MemoryItemComponent({ item, onRemove, className }: MemoryItemProps) {
  const [showFullContent, setShowFullContent] = React.useState(false);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatSize = (size?: number) => {
    if (!size) return "";
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
    return `${Math.round(size / (1024 * 1024))}MB`;
  };

  const shouldTruncate = item.content.length > 200;

  return (
    <div className={cn(
      "group relative rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", getTypeColor(item.type))}>
          {getTypeIcon(item.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate pr-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                getSourceBadge(item.source)
              )}>
                {item.source}
              </span>
              {onRemove && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-all"
                  title="Remove from memory"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {shouldTruncate && !showFullContent
                ? `${item.content.substring(0, 200)}...`
                : item.content}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="mt-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showFullContent ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(item.timestamp)}
              </span>
              {item.size && (
                <span>{formatSize(item.size)}</span>
              )}
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}