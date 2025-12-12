import type { MgxMetricSeries, MgxResult, MgxTask } from "@/lib/mgx/types";

const now = Date.now();

function iso(minutesAgo: number) {
  return new Date(now - minutesAgo * 60_000).toISOString();
}

export const mockTasks: MgxTask[] = [
  {
    id: "task_1001",
    name: "Ingest daily feed",
    status: "running",
    createdAt: iso(42),
    updatedAt: iso(1),
    owner: "system",
  },
  {
    id: "task_1000",
    name: "Backfill historic metrics",
    status: "queued",
    createdAt: iso(85),
    updatedAt: iso(85),
    owner: "admin",
  },
  {
    id: "task_0999",
    name: "Generate results bundle",
    status: "success",
    createdAt: iso(190),
    updatedAt: iso(140),
    owner: "admin",
  },
  {
    id: "task_0998",
    name: "Regression run",
    status: "failed",
    createdAt: iso(320),
    updatedAt: iso(300),
    owner: "system",
  },
];

export function getMockTask(id: string) {
  return mockTasks.find((t) => t.id === id) ?? null;
}

export const mockMetrics: MgxMetricSeries[] = [
  {
    name: "throughput",
    unit: "r/s",
    points: Array.from({ length: 24 }).map((_, i) => ({
      ts: new Date(now - (24 - i) * 60_000).toISOString(),
      value: 40 + Math.sin(i / 3) * 10 + i * 0.2,
    })),
  },
];

export const mockResults: MgxResult[] = [
  {
    id: "res_2001",
    taskId: "task_0999",
    createdAt: iso(120),
    summary: "Bundle generated",
  },
  {
    id: "res_2000",
    taskId: "task_0998",
    createdAt: iso(290),
    summary: "Regression failed (placeholder)",
  },
];
