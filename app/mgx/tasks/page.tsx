"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Spinner } from "@/components/mgx/ui/spinner";
import { StatusPill, type StatusPillVariant } from "@/components/mgx/ui/status-pill";
import { Table, TBody, Td, THead, Th, Tr } from "@/components/mgx/ui/table";
import { useTasks } from "@/lib/mgx/hooks/useTasks";
import type { MgxTask, MgxTaskStatus } from "@/lib/mgx/types";

function statusVariant(status: MgxTaskStatus): StatusPillVariant {
  switch (status) {
    case "success":
      return "success";
    case "failed":
      return "danger";
    case "running":
      return "info";
    case "canceled":
      return "warning";
    case "queued":
    default:
      return "neutral";
  }
}

function TaskRow({ task }: { task: MgxTask }) {
  return (
    <Tr>
      <Td>
        <Link
          href={`/mgx/tasks/${task.id}`}
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
        >
          {task.name}
        </Link>
        <div className="text-xs text-zinc-500">{task.id}</div>
      </Td>
      <Td>
        <StatusPill variant={statusVariant(task.status)}>{task.status}</StatusPill>
      </Td>
      <Td className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
        {new Date(task.createdAt).toLocaleString()}
      </Td>
      <Td className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
        {new Date(task.updatedAt).toLocaleString()}
      </Td>
    </Tr>
  );
}

export default function MgxTasksPage() {
  const { data, error, isLoading } = useTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tasks</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Listing tasks from the MGX REST client (defaults to mock routes).
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent tasks</CardTitle>
            <CardDescription>Placeholder list</CardDescription>
          </div>
          {isLoading ? <Spinner className="h-4 w-4" /> : null}
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">
              Failed to load tasks.
            </p>
          ) : null}

          <Table>
            <THead>
              <Tr>
                <Th>Task</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Updated</Th>
              </Tr>
            </THead>
            <TBody>
              {(data ?? []).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
              {!isLoading && (data ?? []).length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="py-10 text-center text-zinc-600 dark:text-zinc-400">
                    No tasks yet.
                  </Td>
                </Tr>
              ) : null}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
