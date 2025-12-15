"use client";

import * as React from "react";
import { Activity, Zap, AlertCircle, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { cn } from "@/lib/utils";

interface AgentMetricsSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  activCount?: number;
  idleCount?: number;
  errorCount?: number;
  totalCount?: number;
  isLoading?: boolean;
  compact?: boolean;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard = ({ label, value, icon, color }: MetricCardProps) => (
  <div className="flex items-center gap-3">
    <div className={cn("p-2 rounded-lg", color)}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  </div>
);

export const AgentMetricsSummary = React.forwardRef<
  HTMLDivElement,
  AgentMetricsSummaryProps
>(
  (
    {
      activCount = 0,
      idleCount = 0,
      errorCount = 0,
      totalCount = 0,
      compact = false,
      className,
      ...props
    },
    ref
  ) => {
    if (compact) {
      return (
        <div
          ref={ref}
          className={cn("grid grid-cols-4 gap-2 text-center text-xs", className)}
          {...props}
        >
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">Active</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {activCount}
            </p>
          </div>
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">Idle</p>
            <p className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
              {idleCount}
            </p>
          </div>
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">Error</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {errorCount}
            </p>
          </div>
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">Total</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {totalCount}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}
        {...props}
      >
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active Agents</CardTitle>
              <CardDescription>Currently executing</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MetricCard
              label="Running"
              value={activCount}
              icon={
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              }
              color="bg-blue-500/10"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Idle Agents</CardTitle>
              <CardDescription>Waiting for tasks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MetricCard
              label="Ready"
              value={idleCount}
              icon={
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              }
              color="bg-yellow-500/10"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Error Agents</CardTitle>
              <CardDescription>Require attention</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MetricCard
              label="Failed"
              value={errorCount}
              icon={
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              }
              color="bg-red-500/10"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Total Agents</CardTitle>
              <CardDescription>All available</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MetricCard
              label="Connected"
              value={totalCount}
              icon={
                <BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              }
              color="bg-zinc-500/10"
            />
          </CardContent>
        </Card>
      </div>
    );
  }
);

AgentMetricsSummary.displayName = "AgentMetricsSummary";
