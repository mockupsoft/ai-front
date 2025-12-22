"use client";

import * as React from "react";
import { ExternalLink, AlertCircle, CheckCircle, MessageSquare, X } from "lucide-react";
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
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { Spinner } from "@/components/mgx/ui/spinner";
import type { Issue, IssueComment } from "@/lib/types";
import { 
  getIssue, 
  closeIssue,
  createIssueComment,
  listIssueComments,
  type ApiRequestOptions 
} from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface IssueDetailProps {
  linkId: string;
  issueNumber: number;
}

export function IssueDetail({ linkId, issueNumber }: IssueDetailProps) {
  const { currentWorkspace } = useWorkspace();
  const [issue, setIssue] = React.useState<Issue | null>(null);
  const [comments, setComments] = React.useState<IssueComment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [isClosing, setIsClosing] = React.useState(false);
  const [commentBody, setCommentBody] = React.useState("");

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  React.useEffect(() => {
    loadData();
  }, [linkId, issueNumber]);

  const loadData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [issueData, commentsData] = await Promise.all([
        getIssue(linkId, issueNumber, apiOptions),
        listIssueComments(linkId, issueNumber, apiOptions),
      ]);
      setIssue(issueData);
      setComments(commentsData);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Failed to load issue"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (!issue) return;
    
    if (!confirm(`Are you sure you want to close issue #${issue.number}?`)) {
      return;
    }

    setIsClosing(true);
    try {
      await closeIssue(linkId, issueNumber, apiOptions);
      toast.success("Issue closed successfully");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to close issue");
    } finally {
      setIsClosing(false);
    }
  };

  const handleComment = async () => {
    if (!commentBody.trim()) {
      toast.error("Comment body is required");
      return;
    }

    try {
      await createIssueComment(linkId, issueNumber, commentBody, apiOptions);
      toast.success("Comment added successfully");
      setCommentBody("");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issue #{issueNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !issue) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issue #{issueNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error?.message || "Failed to load issue"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle>#{issue.number} {issue.title}</CardTitle>
                <StatusPill variant={issue.state === "open" ? "warning" : "neutral"}>
                  {issue.state}
                </StatusPill>
              </div>
              <CardDescription>
                {issue.author && `Created by ${issue.author}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(issue.html_url, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
              {issue.state === "open" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleClose}
                  disabled={isClosing}
                >
                  {isClosing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Close
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {issue.body && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{issue.body}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Created: {formatTimeAgo(issue.created_at)}</span>
            <span>Updated: {formatTimeAgo(issue.updated_at)}</span>
            {issue.closed_at && <span>Closed: {formatTimeAgo(issue.closed_at)}</span>}
          </div>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="rounded px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {issue.assignees.length > 0 && (
            <div>
              <span className="text-sm font-medium">Assignees: </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {issue.assignees.join(", ")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-500">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-2">
                  {comment.author && (
                    <span className="text-sm font-medium">{comment.author}</span>
                  )}
                  <span className="text-xs text-zinc-500">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            ))
          )}

          {issue.state === "open" && (
            <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
              <Button onClick={handleComment} variant="primary" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


