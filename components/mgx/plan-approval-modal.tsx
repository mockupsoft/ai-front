"use client";

import * as React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/mgx/ui/card";
import { reviewPlan } from "@/lib/api";

// Keep this import local to avoid SSR issues in consumers.
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export type PlanApprovalModalProps = {
  open: boolean;
  taskId: string;
  runId: string;
  plan?: string;
  onClose: () => void;
  onDecision?: (decision: "approve" | "reject") => void;
};

export function PlanApprovalModal({
  open,
  taskId,
  runId,
  plan,
  onClose,
  onDecision,
}: PlanApprovalModalProps) {
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setComment("");
  }, [open]);

  const handleDecision = async (decision: "approve" | "reject") => {
    setIsSubmitting(true);
    try {
      await reviewPlan(taskId, runId, {
        decision,
        comment: comment.trim() || undefined,
      });
      toast.success(decision === "approve" ? "Plan approved" : "Plan rejected");
      onDecision?.(decision);
      onClose();
    } catch {
      toast.error("Failed to submit decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Plan approval</CardTitle>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[50vh] overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <SyntaxHighlighter
              language="markdown"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 0 }}
              showLineNumbers
            >
              {plan || "No plan available."}
            </SyntaxHighlighter>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              placeholder="Optional notes for reviewers..."
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDecision("reject")}
              disabled={isSubmitting}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDecision("approve")}
              disabled={isSubmitting}
            >
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
