import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";

export default function MgxOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">MGX Overview</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Authenticated-looking shell with placeholder data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill variant="info">Mock mode</StatusPill>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Queued + running</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <Link
              href="/mgx/tasks"
              className="mt-2 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              View tasks
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Monitoring</CardTitle>
              <CardDescription>Time series</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <Link
              href="/mgx/monitoring"
              className="mt-2 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              View monitoring
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>Latest summaries</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <Link
              href="/mgx/results"
              className="mt-2 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              View results
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>WebSocket</CardTitle>
              <CardDescription>Connectivity</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Hook included; backend contract integration TBD.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
