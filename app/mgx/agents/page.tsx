"use client";

import { useState, useCallback, useMemo } from "react";
import { AlertCircle } from "lucide-react";

import { useAgents } from "@/hooks/useAgents";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import {
  updateAgentConfig,
  activateAgent,
  deactivateAgent,
  shutdownAgent,
  rollbackAgentContext,
} from "@/lib/api";
import { AgentList } from "@/components/mgx/agent-list";
import { AgentDetailsPanel } from "@/components/mgx/agent-details-panel";
import { AgentControls } from "@/components/mgx/agent-controls";
import { Card, CardContent } from "@/components/mgx/ui/card";

export default function AgentsPage() {
  const { agents, isLoading, mutate } = useAgents();
  const { currentWorkspace, currentProject } = useWorkspace();
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const selectedAgent = agents?.find((a) => a.id === selectedAgentId);

  const apiOptions = useMemo(
    () => ({
      workspaceId: currentWorkspace?.id,
      projectId: currentProject?.id,
    }),
    [currentWorkspace?.id, currentProject?.id]
  );

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateConfig = useCallback(
    async (config: Record<string, unknown>) => {
      if (!selectedAgent) return;

      try {
        await updateAgentConfig(selectedAgent.id, config, apiOptions);
        await mutate();
        showToast("Configuration updated successfully", "success");
      } catch (error) {
        console.error("Failed to update config:", error);
        showToast(
          error instanceof Error ? error.message : "Failed to update config",
          "error"
        );
      }
    },
    [selectedAgent, apiOptions, mutate]
  );

  const handleActivate = useCallback(async () => {
    if (!selectedAgent) return;

    try {
      await activateAgent(selectedAgent.id, apiOptions);
      await mutate();
      showToast("Agent activated", "success");
    } catch (error) {
      console.error("Failed to activate agent:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to activate agent",
        "error"
      );
    }
  }, [selectedAgent, apiOptions, mutate]);

  const handleDeactivate = useCallback(async () => {
    if (!selectedAgent) return;

    try {
      await deactivateAgent(selectedAgent.id, apiOptions);
      await mutate();
      showToast("Agent deactivated", "success");
    } catch (error) {
      console.error("Failed to deactivate agent:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to deactivate agent",
        "error"
      );
    }
  }, [selectedAgent, apiOptions, mutate]);

  const handleShutdown = useCallback(async () => {
    if (!selectedAgent) return;

    try {
      await shutdownAgent(selectedAgent.id, apiOptions);
      await mutate();
      setSelectedAgentId(undefined);
      showToast("Agent shutdown successfully", "success");
    } catch (error) {
      console.error("Failed to shutdown agent:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to shutdown agent",
        "error"
      );
    }
  }, [selectedAgent, apiOptions, mutate]);

  const handleRollback = useCallback(
    async (version: number) => {
      if (!selectedAgent) return;

      try {
        await rollbackAgentContext(selectedAgent.id, version, apiOptions);
        await mutate();
        showToast("Context rolled back successfully", "success");
      } catch (error) {
        console.error("Failed to rollback context:", error);
        showToast(
          error instanceof Error
            ? error.message
            : "Failed to rollback context",
          "error"
        );
      }
    },
    [selectedAgent, apiOptions, mutate]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage agent instances, inspect health, and configure settings.
        </p>
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200 border border-green-300 dark:border-green-800"
              : "bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800"
          }`}
        >
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Filter by Status
              </label>
              <select
                value={statusFilter || ""}
                onChange={(e) =>
                  setStatusFilter(e.target.value ? e.target.value : undefined)
                }
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50"
              >
                <option value="">All Statuses</option>
                <option value="idle">Idle</option>
                <option value="active">Active</option>
                <option value="executing">Executing</option>
                <option value="error">Error</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <AgentList
              agents={agents}
              isLoading={isLoading}
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
              statusFilter={statusFilter}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedAgent ? (
            <div className="space-y-4">
              <AgentDetailsPanel
                agent={selectedAgent}
                onEdit={handleUpdateConfig}
                onRollback={handleRollback}
                apiOptions={apiOptions}
              />
              <AgentControls
                agentId={selectedAgent.id}
                agentName={selectedAgent.name}
                status={selectedAgent.status}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onShutdown={handleShutdown}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Select an agent from the list to view details and manage
                  configuration.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
