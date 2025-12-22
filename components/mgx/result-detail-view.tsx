"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Calendar, Type, Target } from "lucide-react";

import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { ResultArtifactViewer } from "@/components/mgx/result-artifact-viewer";
import { useResult } from "@/lib/mgx/hooks/useResults";
import { useTasks } from "@/lib/mgx/hooks/useTasks";

export type ResultDetailViewProps = {
  resultId: string;
  onBack?: () => void;
};

export function ResultDetailView({ resultId, onBack }: ResultDetailViewProps) {
  const { data: result, error, isLoading } = useResult(resultId);
  const { data: tasks = [] } = useTasks();

  const relatedTask = result?.taskId ? tasks.find((t) => t.id === result.taskId) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
        )}

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-medium text-rose-600 dark:text-rose-400">
                Failed to load result
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {error ? error.message : "Result not found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
      )}

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>Result Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Result ID */}
            <div>
              <p className="text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                Result ID
              </p>
              <p className="mt-1 font-mono text-sm">{result.id}</p>
            </div>

            {/* Type */}
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                <Type className="h-3 w-3" />
                Type
              </p>
              <div className="mt-1">
                <StatusPill variant="neutral">{result.type}</StatusPill>
              </div>
            </div>

            {/* Created Date */}
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                <Calendar className="h-3 w-3" />
                Created
              </p>
              <p className="mt-1 text-sm">
                {new Date(result.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Related Task */}
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                <Target className="h-3 w-3" />
                Related Task
              </p>
              <div className="mt-1">
                {relatedTask ? (
                  <Link
                    href={`/mgx/tasks/${result.taskId}`}
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-2.5 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                  >
                    {relatedTask.name}
                    <StatusPill variant="neutral">{relatedTask.status}</StatusPill>
                  </Link>
                ) : (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Task {result.taskId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary/Content */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>{result.summary}</CardDescription>
        </CardHeader>
        {result.content && (
          <CardContent className="pt-0">
            <div className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
              <code className="font-mono text-xs text-zinc-900 dark:text-zinc-50">
                {result.content}
              </code>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Artifacts Section */}
      {result.artifacts && result.artifacts.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Artifacts</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {result.artifacts.length} artifact{result.artifacts.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-4">
            {result.artifacts.map((artifact) => (
              <ResultArtifactViewer
                key={artifact.id}
                artifact={artifact}
                onDownload={() => {
                  if (artifact.downloadUrl) {
                    window.open(artifact.downloadUrl, "_blank");
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty Artifacts State */}
      {(!result.artifacts || result.artifacts.length === 0) && (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No artifacts available for this result
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
