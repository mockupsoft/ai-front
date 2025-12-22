"use client";

import * as React from "react";
import { ExternalLink, GitMerge, GitPullRequest, CheckCircle, XCircle, MessageSquare } from "lucide-react";
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
import type { PullRequest, PRReview, PRComment } from "@/lib/types";
import { 
  getPullRequest, 
  mergePullRequest, 
  createPullRequestReview,
  createPullRequestComment,
  listPullRequestReviews,
  listPullRequestComments,
  type ApiRequestOptions 
} from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface PullRequestDetailProps {
  linkId: string;
  prNumber: number;
}

export function PullRequestDetail({ linkId, prNumber }: PullRequestDetailProps) {
  const { currentWorkspace } = useWorkspace();
  const [pr, setPr] = React.useState<PullRequest | null>(null);
  const [reviews, setReviews] = React.useState<PRReview[]>([]);
  const [comments, setComments] = React.useState<PRComment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [isMerging, setIsMerging] = React.useState(false);
  const [reviewBody, setReviewBody] = React.useState("");
  const [reviewState, setReviewState] = React.useState<"APPROVE" | "REQUEST_CHANGES" | "COMMENT">("COMMENT");
  const [commentBody, setCommentBody] = React.useState("");

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  React.useEffect(() => {
    loadData();
  }, [linkId, prNumber]);

  const loadData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [prData, reviewsData, commentsData] = await Promise.all([
        getPullRequest(linkId, prNumber, apiOptions),
        listPullRequestReviews(linkId, prNumber, apiOptions),
        listPullRequestComments(linkId, prNumber, apiOptions),
      ]);
      setPr(prData);
      setReviews(reviewsData);
      setComments(commentsData);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Failed to load pull request"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!pr) return;
    
    if (!confirm(`Are you sure you want to merge PR #${pr.number}?`)) {
      return;
    }

    setIsMerging(true);
    try {
      await mergePullRequest(linkId, prNumber, "merge", undefined, undefined, apiOptions);
      toast.success("Pull request merged successfully");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to merge pull request");
    } finally {
      setIsMerging(false);
    }
  };

  const handleReview = async () => {
    if (!reviewBody.trim()) {
      toast.error("Review body is required");
      return;
    }

    try {
      await createPullRequestReview(linkId, prNumber, reviewState, reviewBody, undefined, apiOptions);
      toast.success("Review submitted successfully");
      setReviewBody("");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    }
  };

  const handleComment = async () => {
    if (!commentBody.trim()) {
      toast.error("Comment body is required");
      return;
    }

    try {
      await createPullRequestComment(linkId, prNumber, commentBody, apiOptions);
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
          <CardTitle>Pull Request #{prNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !pr) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pull Request #{prNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <span>{error?.message || "Failed to load pull request"}</span>
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
                <CardTitle>#{pr.number} {pr.title}</CardTitle>
                <StatusPill variant={pr.state === "open" ? "info" : "neutral"}>
                  {pr.state}
                </StatusPill>
                {pr.merged_at && (
                  <StatusPill variant="success">Merged</StatusPill>
                )}
              </div>
              <CardDescription>
                {pr.head_branch} → {pr.base_branch}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(pr.html_url, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
              {pr.state === "open" && pr.mergeable && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMerge}
                  disabled={isMerging}
                >
                  {isMerging ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <GitMerge className="mr-2 h-4 w-4" />
                      Merge
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {pr.body && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{pr.body}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            {pr.author && <span>Author: {pr.author}</span>}
            <span>Created: {formatTimeAgo(pr.created_at)}</span>
            <span>Updated: {formatTimeAgo(pr.updated_at)}</span>
            {pr.merged_at && <span>Merged: {formatTimeAgo(pr.merged_at)}</span>}
          </div>

          {pr.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pr.labels.map((label) => (
                <span
                  key={label}
                  className="rounded px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-500">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusPill
                      variant={
                        review.state === "APPROVED"
                          ? "success"
                          : review.state === "CHANGES_REQUESTED"
                          ? "danger"
                          : "neutral"
                      }
                    >
                      {review.state}
                    </StatusPill>
                    {review.author && <span className="text-sm font-medium">{review.author}</span>}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatTimeAgo(review.submitted_at)}
                  </span>
                </div>
                {review.body && (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {review.body}
                  </p>
                )}
              </div>
            ))
          )}

          {pr.state === "open" && (
            <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div className="space-y-2">
                <label className="text-sm font-medium">Review State</label>
                <select
                  value={reviewState}
                  onChange={(e) => setReviewState(e.target.value as typeof reviewState)}
                  className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="COMMENT">Comment</option>
                  <option value="APPROVE">Approve</option>
                  <option value="REQUEST_CHANGES">Request Changes</option>
                </select>
              </div>
              <textarea
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="Write your review..."
                rows={4}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
              <Button onClick={handleReview} variant="primary" size="sm">
                Submit Review
              </Button>
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

          {pr.state === "open" && (
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


