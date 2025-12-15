"use client";

import Link from "next/link";
import type { WorkflowExecution } from "@/lib/types/workflows";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/mgx/ui/table";
import { StatusPill, type StatusPillVariant } from "@/components/mgx/ui/status-pill";
import { Spinner } from "@/components/mgx/ui/spinner";

function formatRelativeTime(timestamp: number) {
  if (!timestamp) return "—";
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatDuration(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

function getStatusVariant(status: string): StatusPillVariant {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
    case "cancelled":
      return "danger";
    case "running":
      return "info";
    default:
      return "neutral";
  }
}

export interface WorkflowExecutionListProps {
  workflowId: string;
  executions?: WorkflowExecution[];
  isLoading?: boolean;
}

export function WorkflowExecutionList({
  workflowId,
  executions,
  isLoading,
}: WorkflowExecutionListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
        <Spinner className="h-5 w-5" />
        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
          Loading executions…
        </span>
      </div>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        No executions found.
      </div>
    );
  }

  return (
    <Table>
      <THead>
        <Tr>
          <Th>Execution ID</Th>
          <Th>Status</Th>
          <Th>Steps</Th>
          <Th>Duration</Th>
          <Th>Started</Th>
        </Tr>
      </THead>
      <TBody>
        {executions.map((execution) => (
          <Tr key={execution.id}>
            <Td className="font-medium">
              <Link
                href={`/mgx/workflows/${workflowId}/executions/${execution.id}`}
                className="text-zinc-900 hover:underline dark:text-zinc-50"
              >
                {execution.id.slice(0, 8)}
              </Link>
            </Td>
            <Td>
              <StatusPill variant={getStatusVariant(execution.status)}>
                {execution.status}
              </StatusPill>
            </Td>
            <Td>
              {execution.steps.filter((s) => s.status === "completed").length}/
              {execution.steps.length}
            </Td>
            <Td>{formatDuration(execution.durationMs)}</Td>
            <Td className="text-zinc-600 dark:text-zinc-400">
              {formatRelativeTime(execution.startedAt)}
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}
