"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Spinner } from "@/components/mgx/ui/spinner";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { useTask } from "@/lib/mgx/hooks/useTask";
import { MgxApiError } from "@/lib/mgx/rest-client";

export default function MgxTaskDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error, isLoading } = useTask(params.id);

  const notFound = error instanceof MgxApiError && error.status === 404;

  if (notFound) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Task not found</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No task found for id: {params.id}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Task</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{params.id}</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Details</CardTitle>
            <CardDescription>Placeholder fields</CardDescription>
          </div>
          {isLoading ? <Spinner className="h-4 w-4" /> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">
              Failed to load task.
            </p>
          ) : null}

          {data ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-zinc-500">Name</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                  {data.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">Status</dt>
                <dd>
                  <StatusPill>{data.status}</StatusPill>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">Created</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                  {new Date(data.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">Updated</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                  {new Date(data.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
