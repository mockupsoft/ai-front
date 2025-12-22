"use client";

import * as React from "react";
import { AlertCircle, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

const API_BASE =
  process.env.NEXT_PUBLIC_MGX_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export function GitHubWebhookSettings() {
  const { currentWorkspace } = useWorkspace();
  const [copied, setCopied] = React.useState(false);

  const webhookUrl = `${API_BASE}/api/webhooks/github`;
  const webhookSecret = "YOUR_WEBHOOK_SECRET"; // This should come from settings

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast.success("Webhook URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy webhook URL");
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(webhookSecret);
      toast.success("Webhook secret copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy webhook secret");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Webhook Configuration</CardTitle>
        <CardDescription>
          Configure GitHub webhooks to receive real-time events from your repositories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              readOnly
              className="h-9 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyUrl}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-zinc-500">
            Use this URL when configuring webhooks in your GitHub repository settings
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Webhook Secret
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={webhookSecret}
              readOnly
              className="h-9 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopySecret}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-zinc-500">
            Set this secret in your GitHub webhook configuration for signature verification
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="flex-1 space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Setup Instructions
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Go to your GitHub repository settings</li>
                <li>Navigate to Webhooks section</li>
                <li>Click "Add webhook"</li>
                <li>Paste the webhook URL above</li>
                <li>Set Content type to "application/json"</li>
                <li>Paste the webhook secret for signature verification</li>
                <li>Select events: push, pull_request, issues, etc.</li>
                <li>Click "Add webhook"</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              window.open(
                "https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks",
                "_blank"
              );
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            GitHub Webhook Docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


