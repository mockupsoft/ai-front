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
import { Table, TBody, Td, THead, Th, Tr } from "@/components/mgx/ui/table";
import { useResults } from "@/lib/mgx/hooks/useResults";

export default function MgxResultsPage() {
  const { data, error, isLoading } = useResults();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Results</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Placeholder results list.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Latest results</CardTitle>
            <CardDescription>From /results</CardDescription>
          </div>
          {isLoading ? <Spinner className="h-4 w-4" /> : null}
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">
              Failed to load results.
            </p>
          ) : null}

          <Table>
            <THead>
              <Tr>
                <Th>Result</Th>
                <Th>Task</Th>
                <Th>Created</Th>
              </Tr>
            </THead>
            <TBody>
              {(data ?? []).map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <div className="font-medium">{r.summary}</div>
                    <div className="text-xs text-zinc-500">{r.id}</div>
                  </Td>
                  <Td>
                    <Link
                      href={`/mgx/tasks/${r.taskId}`}
                      className="text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {r.taskId}
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </Td>
                </Tr>
              ))}
              {!isLoading && (data ?? []).length === 0 ? (
                <Tr>
                  <Td colSpan={3} className="py-10 text-center text-zinc-600 dark:text-zinc-400">
                    No results yet.
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
