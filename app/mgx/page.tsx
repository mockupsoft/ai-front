"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { AgentMetricsSummary } from "@/components/mgx/agent-metrics-summary";
import { useAgents } from "@/hooks/useAgents";
import { Spinner } from "@/components/mgx/ui/spinner";

export default function MgxOverviewPage() {
  const { agents, counts, isLoading: isAgentsLoading } = useAgents();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">MGX Overview</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Dashboard overview with agent telemetry and task management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill variant="info">Live</StatusPill>
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
              <CardTitle>Agents</CardTitle>
              <CardDescription>Connected</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isAgentsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-semibold">{counts.total}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {counts.active} active • {counts.idle} idle • {counts.error} errors
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AgentMetricsSummary
        activCount={counts.active}
        idleCount={counts.idle}
        errorCount={counts.error}
        totalCount={counts.total}
        isLoading={isAgentsLoading}
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Agent Activity</CardTitle>
            <CardDescription>
              Real-time updates from connected agents.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isAgentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {agents && agents.length > 0 ? (
                <p>
                  {agents.length} agent{agents.length !== 1 ? "s" : ""} connected and ready.
                </p>
              ) : (
                <p>No agents connected yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
