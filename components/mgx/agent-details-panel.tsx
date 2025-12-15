"use client";

import React, { useState } from "react";
import useSWR from "swr";

import { AgentStatusBadge } from "@/components/mgx/agent-status-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/mgx/ui/card";
import { Button } from "@/components/mgx/ui/button";
import { fetchAgentContext, fetchAgentContextHistory } from "@/lib/api";
import type {
  AgentInstance,
  AgentContextSnapshot,
  AgentContextVersion,
} from "@/lib/types";
import type { ApiRequestOptions } from "@/lib/api";

interface AgentDetailsPanelProps {
  agent: AgentInstance;
  onEdit?: (config: Record<string, unknown>) => void;
  onRollback?: (version: number) => Promise<void>;
  apiOptions?: ApiRequestOptions;
}

export const AgentDetailsPanel = React.forwardRef<
  HTMLDivElement,
  AgentDetailsPanelProps
>(({ agent, onEdit, onRollback, apiOptions }, ref) => {
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editConfig, setEditConfig] = useState<Record<string, unknown>>(
    agent.context || {}
  );
  const [showHistory, setShowHistory] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState<number | null>(null);

  const { data: currentContext } = useSWR<AgentContextSnapshot | undefined>(
    agent.id ? ["/agents", agent.id, "context"] : null,
    agent.id
      ? async () => {
          return fetchAgentContext(agent.id, apiOptions) as Promise<AgentContextSnapshot>;
        }
      : null,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  const { data: contextHistory } = useSWR<AgentContextVersion[] | undefined>(
    showHistory && agent.id ? ["/agents", agent.id, "history"] : null,
    showHistory && agent.id
      ? async () => {
          return fetchAgentContextHistory(agent.id, apiOptions) as Promise<AgentContextVersion[]>;
        }
      : null,
    { revalidateOnFocus: false }
  );

  const handleSaveConfig = async () => {
    if (onEdit) {
      await onEdit(editConfig);
      setIsEditingConfig(false);
    }
  };

  const handleRollback = async (version: number) => {
    setRollbackLoading(version);
    try {
      if (onRollback) {
        await onRollback(version);
      }
    } finally {
      setRollbackLoading(null);
    }
  };

  const context = currentContext?.context || agent.context || {};

  return (
    <div ref={ref} className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{agent.name}</CardTitle>
              <CardDescription>{agent.definitionId}</CardDescription>
            </div>
            <AgentStatusBadge status={agent.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                ID
              </p>
              <p className="text-sm text-zinc-900 dark:text-zinc-50 break-all">
                {agent.id}
              </p>
            </div>
            {agent.taskId && (
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Linked Task
                </p>
                <p className="text-sm text-zinc-900 dark:text-zinc-50">
                  {agent.taskId}
                </p>
              </div>
            )}
          </div>

          {agent.metrics && (
            <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Metrics
              </p>
              <div className="grid grid-cols-2 gap-2">
                {agent.metrics.messagesProcessed !== undefined && (
                  <div className="rounded bg-zinc-50 dark:bg-zinc-900 p-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Messages
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {agent.metrics.messagesProcessed}
                    </p>
                  </div>
                )}
                {agent.metrics.actionsExecuted !== undefined && (
                  <div className="rounded bg-zinc-50 dark:bg-zinc-900 p-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Actions
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {agent.metrics.actionsExecuted}
                    </p>
                  </div>
                )}
                {agent.metrics.errorCount !== undefined && (
                  <div className="rounded bg-zinc-50 dark:bg-zinc-900 p-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Errors
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {agent.metrics.errorCount}
                    </p>
                  </div>
                )}
                {agent.metrics.averageResponseTimeMs !== undefined && (
                  <div className="rounded bg-zinc-50 dark:bg-zinc-900 p-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Avg Response
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {agent.metrics.averageResponseTimeMs}ms
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Configurable settings for this agent
              </CardDescription>
            </div>
            {!isEditingConfig && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditingConfig(true)}
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingConfig ? (
            <div className="space-y-4">
              <textarea
                value={JSON.stringify(editConfig, null, 2)}
                onChange={(e) => {
                  try {
                    setEditConfig(JSON.parse(e.target.value));
                  } catch {
                    // Invalid JSON, ignore for now
                  }
                }}
                className="w-full h-40 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm font-mono text-zinc-900 dark:text-zinc-50"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveConfig}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingConfig(false);
                    setEditConfig(context);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md overflow-auto max-h-40 text-zinc-900 dark:text-zinc-50">
              {JSON.stringify(context, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Context History</CardTitle>
              <CardDescription>
                View and rollback previous context snapshots
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide" : "Show"} History
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {contextHistory && contextHistory.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-auto">
                {contextHistory.map((version) => (
                  <div
                    key={version.version}
                    className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        Version {version.version}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={rollbackLoading === version.version}
                      onClick={() => handleRollback(version.version)}
                    >
                      {rollbackLoading === version.version
                        ? "Rolling back..."
                        : "Rollback"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No context history available
              </p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
});

AgentDetailsPanel.displayName = "AgentDetailsPanel";
