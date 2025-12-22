"use client";

import * as React from "react";
import { Copy, Download, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { MgxResultArtifact } from "@/lib/mgx/types";

export type ResultArtifactViewerProps = {
  artifact: MgxResultArtifact;
  onDownload?: (artifactId: string) => void;
};

const MAX_PREVIEW_LINES = 30;

export function ResultArtifactViewer({
  artifact,
  onDownload,
}: ResultArtifactViewerProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleCopy = async () => {
    if (!artifact.content) {
      toast.error("No content to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(artifact.content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(artifact.id);
    } else if (artifact.downloadUrl) {
      window.open(artifact.downloadUrl, "_blank");
    } else {
      toast.error("Download not available");
    }
  };

  const contentLines = artifact.content?.split("\n") || [];
  const isLongContent = contentLines.length > MAX_PREVIEW_LINES;
  const displayContent = isExpanded ? (artifact.content || "") : (contentLines.slice(0, MAX_PREVIEW_LINES).join("\n") || "");

  const renderContent = () => {
    try {
      if (!artifact.content) {
        return (
          <div className="flex items-center gap-2 py-4 text-sm text-zinc-600 dark:text-zinc-400">
            <AlertCircle className="h-4 w-4" />
            No content available
          </div>
        );
      }

      switch (artifact.type) {
        case "code":
          return (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <SyntaxHighlighter
                language={artifact.language || "typescript"}
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: 0 }}
                showLineNumbers
              >
                {displayContent}
              </SyntaxHighlighter>
            </div>
          );

        case "json":
        case "test":
          return (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: 0 }}
                showLineNumbers
              >
                {displayContent}
              </SyntaxHighlighter>
            </div>
          );

        case "markdown":
          return (
            <div className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <code className="font-mono">{displayContent}</code>
            </div>
          );

        case "binary":
          return (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Binary file - download to view
              </p>
              <Button size="sm" variant="primary" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </div>
          );

        default:
          return (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <SyntaxHighlighter
                language="text"
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: 0 }}
                showLineNumbers
              >
                {displayContent}
              </SyntaxHighlighter>
            </div>
          );
      }
    } catch {
      return (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Failed to render artifact</p>
            <p className="text-xs">The artifact content could not be displayed</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="flex-1">{artifact.name}</CardTitle>
            <StatusPill variant="neutral">{artifact.type}</StatusPill>
            {artifact.size && (
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {(artifact.size / 1024).toFixed(1)}KB
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {artifact.type !== "binary" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {artifact.downloadUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {renderContent()}

        {isLongContent && (
          <div className="mt-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show More ({contentLines.length - MAX_PREVIEW_LINES} more lines)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
