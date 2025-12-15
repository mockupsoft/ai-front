"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return "Never";
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

import { AgentStatusBadge } from "@/components/mgx/agent-status-badge";
import { Card } from "@/components/mgx/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/mgx/ui/table";
import { Button } from "@/components/mgx/ui/button";
import type { AgentInstance } from "@/lib/types";

interface AgentListProps {
  agents?: AgentInstance[];
  isLoading?: boolean;
  selectedAgentId?: string;
  onSelectAgent: (agentId: string) => void;
  statusFilter?: string;
}

export const AgentList = React.forwardRef<HTMLDivElement, AgentListProps>(
  ({
    agents = [],
    isLoading = false,
    selectedAgentId,
    onSelectAgent,
    statusFilter,
  }, ref) => {
    const [sortBy, setSortBy] = useState<"name" | "status" | "heartbeat">(
      "name"
    );

    const filteredAgents = statusFilter
      ? agents.filter((agent) => agent.status === statusFilter)
      : agents;

    const sortedAgents = [...filteredAgents].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      } else {
        const aTime = a.lastHeartbeat || 0;
        const bTime = b.lastHeartbeat || 0;
        return bTime - aTime;
      }
    });

    if (isLoading) {
      return (
        <Card ref={ref}>
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading agents...
            </p>
          </div>
        </Card>
      );
    }

    if (agents.length === 0) {
      return (
        <Card ref={ref}>
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No agents found. Add an agent to get started.
            </p>
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref}>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <Tr>
                <Th className="w-1/4">
                  <button
                    onClick={() => setSortBy("name")}
                    className="flex items-center gap-2 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Name
                    {sortBy === "name" && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </Th>
                <Th className="w-1/6">Definition</Th>
                <Th className="w-1/6">
                  <button
                    onClick={() => setSortBy("status")}
                    className="flex items-center gap-2 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Status
                    {sortBy === "status" && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </Th>
                <Th className="w-1/6">
                  <button
                    onClick={() => setSortBy("heartbeat")}
                    className="flex items-center gap-2 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Last Heartbeat
                    {sortBy === "heartbeat" && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </Th>
                <Th className="w-1/6">Tasks</Th>
                <Th className="w-auto text-right">Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {sortedAgents.map((agent) => (
                <Tr
                  key={agent.id}
                  className={`cursor-pointer transition-colors ${
                    selectedAgentId === agent.id
                      ? "bg-zinc-50 dark:bg-zinc-900"
                      : ""
                  }`}
                  onClick={() => onSelectAgent(agent.id)}
                >
                  <Td className="font-medium">{agent.name}</Td>
                  <Td className="text-sm text-zinc-600 dark:text-zinc-400">
                    {agent.definitionId}
                  </Td>
                  <Td>
                    <AgentStatusBadge status={agent.status} />
                  </Td>
                  <Td className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatRelativeTime(agent.lastHeartbeat)}
                  </Td>
                  <Td className="text-sm text-zinc-600 dark:text-zinc-400">
                    {agent.taskId ? (
                      <span className="inline-block rounded px-2 py-1 bg-zinc-100 dark:bg-zinc-800">
                        {agent.taskId}
                      </span>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAgent(agent.id);
                      }}
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>
    );
  }
);

AgentList.displayName = "AgentList";
