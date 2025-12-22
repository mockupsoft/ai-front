"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { createIssue, type ApiRequestOptions } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface IssueCreateFormProps {
  linkId: string;
  onSuccess?: () => void;
}

export function IssueCreateForm({ linkId, onSuccess }: IssueCreateFormProps) {
  const { currentWorkspace } = useWorkspace();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [labels, setLabels] = React.useState("");
  const [assignees, setAssignees] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const labelsList = labels.split(",").map((l) => l.trim()).filter(Boolean);
      const assigneesList = assignees.split(",").map((a) => a.trim()).filter(Boolean);

      await createIssue(
        linkId,
        title,
        body || undefined,
        labelsList.length > 0 ? labelsList : undefined,
        assigneesList.length > 0 ? assigneesList : undefined,
        apiOptions
      );

      toast.success("Issue created successfully");
      setTitle("");
      setBody("");
      setLabels("");
      setAssignees("");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Issue</CardTitle>
        <CardDescription>Create a new GitHub issue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              required
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Issue description"
              rows={6}
              disabled={isSubmitting}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Labels (comma-separated)</label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="bug, enhancement, question"
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assignees (comma-separated)</label>
            <input
              type="text"
              value={assignees}
              onChange={(e) => setAssignees(e.target.value)}
              placeholder="username1, username2"
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Issue
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


