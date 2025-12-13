"use client";

import * as React from "react";
import { AlertCircle, Loader, Github } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { connectRepository } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

interface RepositoryConnectFormProps {
  onSuccess?: () => void;
}

export function RepositoryConnectForm({ onSuccess }: RepositoryConnectFormProps) {
  const { currentProject, currentWorkspace } = useWorkspace();
  const [repoUrl, setRepoUrl] = React.useState("");
  const [branch, setBranch] = React.useState("main");
  const [oauthToken, setOauthToken] = React.useState("");
  const [appInstallId, setAppInstallId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentProject || !currentWorkspace) {
      setError("No project selected");
      return;
    }

    if (!repoUrl.trim()) {
      setError("Repository URL is required");
      return;
    }

    if (!branch.trim()) {
      setError("Branch name is required");
      return;
    }

    setIsLoading(true);
    try {
      await connectRepository(
        currentProject.id,
        {
          url: repoUrl.trim(),
          branch: branch.trim(),
          oauthToken: oauthToken || undefined,
          appInstallId: appInstallId || undefined,
        },
        {
          workspaceId: currentWorkspace.id,
          projectId: currentProject.id,
        }
      );

      toast.success("Repository connected successfully");
      setRepoUrl("");
      setBranch("main");
      setOauthToken("");
      setAppInstallId("");
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect repository";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect Repository
          </CardTitle>
          <CardDescription>
            Connect a GitHub repository to enable automatic branch tracking and metadata sync
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="repo-url"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Repository URL
            </label>
            <input
              id="repo-url"
              type="text"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isLoading}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700 dark:disabled:bg-zinc-900"
            />
            <p className="text-xs text-zinc-500">
              Paste your GitHub repository URL
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="branch"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Branch Name
            </label>
            <input
              id="branch"
              type="text"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={isLoading}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700 dark:disabled:bg-zinc-900"
            />
            <p className="text-xs text-zinc-500">
              The branch to track for commits and metadata
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="oauth-token"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              OAuth Token <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              id="oauth-token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={oauthToken}
              onChange={(e) => setOauthToken(e.target.value)}
              disabled={isLoading}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700 dark:disabled:bg-zinc-900"
            />
            <p className="text-xs text-zinc-500">
              GitHub personal access token for private repositories
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="app-install"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              GitHub App Installation ID <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              id="app-install"
              type="text"
              placeholder="12345678"
              value={appInstallId}
              onChange={(e) => setAppInstallId(e.target.value)}
              disabled={isLoading}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700 dark:disabled:bg-zinc-900"
            />
            <p className="text-xs text-zinc-500">
              GitHub app installation ID for app-based authentication
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !currentProject}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Connect Repository
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
