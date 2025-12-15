"use client";

import React, { useState } from "react";
import { PowerOff, AlertCircle } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/mgx/ui/card";
import { Button } from "@/components/mgx/ui/button";
import type { AgentStatus } from "@/lib/types";

interface AgentControlsProps {
  agentId: string;
  agentName: string;
  status: AgentStatus;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onShutdown?: () => Promise<void>;
  disabled?: boolean;
}

export const AgentControls = React.forwardRef<
  HTMLDivElement,
  AgentControlsProps
>(
  ({
    agentId,
    agentName,
    status,
    onActivate,
    onDeactivate,
    onShutdown,
    disabled = false,
  }, ref) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [confirmShutdown, setConfirmShutdown] = useState(false);

    const handleAction = async (
      action: "activate" | "deactivate" | "shutdown",
      callback?: () => Promise<void>
    ) => {
      setLoading(action);
      try {
        if (callback) {
          await callback();
        }
      } finally {
        setLoading(null);
        if (action === "shutdown") {
          setConfirmShutdown(false);
        }
      }
    };

    const isActive = status === "active" || status === "executing";

    return (
      <Card ref={ref}>
        <CardHeader>
          <CardTitle>Lifecycle Control</CardTitle>
          <CardDescription>Manage agent state and operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "offline" && (
            <div className="flex items-start gap-3 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-300 dark:border-zinc-700">
              <AlertCircle className="w-5 h-5 text-zinc-600 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                This agent is currently offline and cannot be controlled.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant={isActive ? "secondary" : "primary"}
                disabled={
                  disabled ||
                  status === "offline" ||
                  loading !== null ||
                  !onActivate
                }
                onClick={() => handleAction("activate", onActivate)}
                className="flex-1"
              >
                {loading === "activate" ? "Activating..." : "Activate"}
              </Button>
              <Button
                variant={isActive ? "primary" : "secondary"}
                disabled={
                  disabled ||
                  status === "offline" ||
                  loading !== null ||
                  !isActive ||
                  !onDeactivate
                }
                onClick={() => handleAction("deactivate", onDeactivate)}
                className="flex-1"
              >
                {loading === "deactivate" ? "Deactivating..." : "Deactivate"}
              </Button>
            </div>

            {confirmShutdown ? (
              <div className="space-y-3 p-3 bg-rose-100 dark:bg-rose-900/20 rounded-md border border-rose-300 dark:border-rose-800">
                <p className="text-sm text-rose-900 dark:text-rose-200">
                  Are you sure you want to shutdown <strong>{agentName}</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={loading === "shutdown"}
                    onClick={() =>
                      handleAction("shutdown", onShutdown)
                    }
                    className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
                  >
                    {loading === "shutdown" ? "Shutting down..." : "Confirm"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loading === "shutdown"}
                    onClick={() => setConfirmShutdown(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                disabled={
                  disabled ||
                  status === "offline" ||
                  loading !== null ||
                  !onShutdown
                }
                onClick={() => setConfirmShutdown(true)}
                className="w-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Shutdown
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">
              Current State
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400">Status</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
                  {status}
                </p>
              </div>
              <div>
                <p className="text-zinc-600 dark:text-zinc-400">Agent ID</p>
                <p className="font-mono text-xs text-zinc-900 dark:text-zinc-50 truncate">
                  {agentId}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AgentControls.displayName = "AgentControls";
