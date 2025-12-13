"use client";

import { MetricsDashboard } from "@/components/MetricsDashboard";

export default function MgxMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Monitoring</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Real-time system metrics and performance monitoring.
        </p>
      </div>
      <MetricsDashboard />
    </div>
  );
}
