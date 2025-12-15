"use client";

import Link from "next/link";

import type { WorkflowSummary } from "@/lib/types/workflows";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/mgx/ui/table";
import { Spinner } from "@/components/mgx/ui/spinner";

function formatRelativeTime(isoString?: string) {
  if (!isoString) return "—";
  const ts = new Date(isoString).getTime();
  if (Number.isNaN(ts)) return "—";

  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export interface WorkflowListProps {
  workflows?: WorkflowSummary[];
  isLoading?: boolean;
}

export function WorkflowList({ workflows, isLoading }: WorkflowListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
        <Spinner className="h-5 w-5" />
        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
          Loading workflows…
        </span>
      </div>
    );
  }

  if (!workflows || workflows.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        No workflows found.
      </div>
    );
  }

  return (
    <Table>
      <THead>
        <Tr>
          <Th>Name</Th>
          <Th>Steps</Th>
          <Th>Updated</Th>
        </Tr>
      </THead>
      <TBody>
        {workflows.map((workflow) => (
          <Tr key={workflow.id}>
            <Td className="font-medium">
              <Link
                href={`/mgx/workflows/${workflow.id}/builder`}
                className="text-zinc-900 hover:underline dark:text-zinc-50"
              >
                {workflow.name}
              </Link>
              {workflow.description ? (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {workflow.description}
                </p>
              ) : null}
            </Td>
            <Td>{workflow.definition?.steps?.length ?? "—"}</Td>
            <Td className="text-zinc-600 dark:text-zinc-400">
              {formatRelativeTime(workflow.updatedAt)}
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}
