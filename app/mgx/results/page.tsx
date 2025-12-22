"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Plus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Button } from "@/components/mgx/ui/button";
import { Spinner } from "@/components/mgx/ui/spinner";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { Table, TBody, Td, THead, Th, Tr } from "@/components/mgx/ui/table";
import { useResults } from "@/lib/mgx/hooks/useResults";
import type { MgxResultType } from "@/lib/mgx/types";

export default function MgxResultsPage() {
  const { data, error, isLoading, mutate } = useResults();
  const [typeFilter, setTypeFilter] = React.useState<MgxResultType | "all">("all");

  const filtered = React.useMemo(() => {
    if (!data) return [];
    if (typeFilter === "all") return data;
    return data.filter((r) => r.type === typeFilter);
  }, [data, typeFilter]);

  const handleRetry = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Results</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View and manage task results and artifacts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Latest results</CardTitle>
              <CardDescription>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            {isLoading ? <Spinner className="h-4 w-4" /> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-rose-50 p-4 dark:bg-rose-900/20">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <p className="font-medium text-rose-600 dark:text-rose-400">
                  Failed to load results
                </p>
                <p className="mt-0.5 text-sm text-rose-700 dark:text-rose-300">
                  {error instanceof Error ? error.message : "An error occurred while fetching results"}
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleRetry}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          {!error && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={typeFilter === "all" ? "primary" : "secondary"}
                onClick={() => setTypeFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={typeFilter === "summary" ? "primary" : "secondary"}
                onClick={() => setTypeFilter("summary")}
              >
                Summary
              </Button>
              <Button
                size="sm"
                variant={typeFilter === "report" ? "primary" : "secondary"}
                onClick={() => setTypeFilter("report")}
              >
                Report
              </Button>
              <Button
                size="sm"
                variant={typeFilter === "file" ? "primary" : "secondary"}
                onClick={() => setTypeFilter("file")}
              >
                File
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && (data ?? []).length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 py-12 dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                No results yet
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Run a task to generate results
              </p>
              <Link href="/mgx/tasks">
                <Button size="sm" variant="primary" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Run a Task
                </Button>
              </Link>
            </div>
          )}

          {/* Results Table */}
          {!error && filtered.length > 0 && (
            <Table>
              <THead>
                <Tr>
                  <Th>Result</Th>
                  <Th>Task</Th>
                  <Th>Type</Th>
                  <Th>Created</Th>
                </Tr>
              </THead>
              <TBody>
                {filtered.map((r) => (
                  <Tr
                    key={r.id}
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Td>
                      <Link
                        href={`/mgx/results/${r.id}`}
                        className="block space-y-1 hover:underline"
                      >
                        <div className="font-medium">{r.summary}</div>
                        <div className="text-xs text-zinc-500">{r.id}</div>
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={`/mgx/tasks/${r.taskId}`}
                        className="text-zinc-900 hover:underline dark:text-zinc-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.taskName || r.taskId}
                      </Link>
                    </Td>
                    <Td>
                      <StatusPill variant="neutral">{r.type}</StatusPill>
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}

          {/* Empty Filtered State */}
          {!isLoading && !error && (data ?? []).length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No results match the selected filter
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
