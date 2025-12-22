"use client";

import * as React from "react";
import { Plus, GitBranch } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { createBranch, type ApiRequestOptions } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { useBranches } from "@/hooks/useBranches";

interface BranchCreateFormProps {
  linkId: string;
  onSuccess?: () => void;
}

export function BranchCreateForm({ linkId, onSuccess }: BranchCreateFormProps) {
  const { currentWorkspace } = useWorkspace();
  const { branches, mutate } = useBranches({ linkId, enabled: true });
  const [branchName, setBranchName] = React.useState("");
  const [fromBranch, setFromBranch] = React.useState("main");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const apiOptions: ApiRequestOptions = {
    workspaceId: currentWorkspace?.id,
  };

  const defaultBranch = branches.find((b) => b.default);
  React.useEffect(() => {
    if (defaultBranch) {
      setFromBranch(defaultBranch.name);
    }
  }, [defaultBranch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!branchName.trim()) {
      toast.error("Branch name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBranch(linkId, branchName.trim(), fromBranch, apiOptions);
      toast.success(`Branch "${branchName}" created successfully`);
      setBranchName("");
      mutate();
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Branch</CardTitle>
        <CardDescription>Create a new branch from an existing branch</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch Name *</label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="feature/new-feature"
              required
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">From Branch</label>
            <select
              value={fromBranch}
              onChange={(e) => setFromBranch(e.target.value)}
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !branchName.trim()}
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Branch
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


