"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Calendar, Type, Target, Download, MoreVertical, Copy, Trash2, Archive } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { ResultArtifactViewer } from "@/components/mgx/result-artifact-viewer";
import { useResult } from "@/lib/mgx/hooks/useResults";
import { useTasks } from "@/lib/mgx/hooks/useTasks";
import { exportResult, duplicateResult, deleteResult, archiveResult } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

export type ResultDetailViewProps = {
  resultId: string;
  onBack?: () => void;
};

export function ResultDetailView({ resultId, onBack }: ResultDetailViewProps) {
  const { data: result, error, isLoading, mutate } = useResult(resultId);
  const { data: tasks = [] } = useTasks();
  const { currentWorkspace, currentProject } = useWorkspace();
  const [isExporting, setIsExporting] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showActionsMenu, setShowActionsMenu] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  const relatedTask = result?.taskId ? tasks.find((t) => t.id === result.taskId) : null;

  const handleExport = async (format: "pdf" | "json" | "markdown") => {
    try {
      setIsExporting(true);
      const blob = await exportResult(resultId, format, {
        workspaceId: currentWorkspace?.id,
        projectId: currentProject?.id,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `result-${resultId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Result exported as ${format.toUpperCase()}`);
      setShowExportMenu(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export result");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateResult(resultId, {
        workspaceId: currentWorkspace?.id,
        projectId: currentProject?.id,
      });
      toast.success("Result duplicated successfully");
      mutate(); // Refresh results list
      setShowActionsMenu(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to duplicate result");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResult(resultId, {
        workspaceId: currentWorkspace?.id,
        projectId: currentProject?.id,
      });
      toast.success("Result deleted successfully");
      onBack?.(); // Navigate back after deletion
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete result");
    } finally {
      setDeleteConfirm(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveResult(resultId, {
        workspaceId: currentWorkspace?.id,
        projectId: currentProject?.id,
      });
      toast.success("Result archived successfully");
      mutate(); // Refresh result
      setShowActionsMenu(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive result");
    }
  };

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
          <div className="flex items-center justify-between">
            <CardTitle>Result Details</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                  {isExporting && <span className="animate-spin">...</span>}
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport("pdf")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport("json")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={() => handleExport("markdown")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        Export as Markdown
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="gap-2"
                >
                  <MoreVertical className="h-4 w-4" />
                  Actions
                </Button>
                {showActionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-10">
                    <div className="py-1">
                      <button
                        onClick={handleDuplicate}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={handleArchive}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </button>
                      <button
                        onClick={() => {
                          setShowActionsMenu(false);
                          setDeleteConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Delete Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete this result? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Close menus when clicking outside */}
      <React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Element;
          if (showExportMenu && !target.closest(".relative")) {
            setShowExportMenu(false);
          }
          if (showActionsMenu && !target.closest(".relative")) {
            setShowActionsMenu(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [showExportMenu, showActionsMenu]);
    </div>
  );
}
