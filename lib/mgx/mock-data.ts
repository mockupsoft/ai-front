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
    taskName: "Generate results bundle",
    createdAt: iso(120),
    type: "report",
    summary: "Bundle generated successfully with 5 artifacts",
    content: "# Results Bundle Report\n\nGenerated 5 artifacts including code, test results, and review comments.",
    artifacts: [
      {
        id: "art_001",
        name: "generated_code.ts",
        type: "code",
        content: "export function example() {\n  return 'Hello World';\n}",
        language: "typescript",
      },
      {
        id: "art_002",
        name: "test_results.json",
        type: "json",
        content: JSON.stringify({ passed: 45, failed: 2, skipped: 3 }, null, 2),
      },
      {
        id: "art_003",
        name: "review_summary.md",
        type: "markdown",
        content: "## Code Review Summary\n- Quality: Good\n- Coverage: 85%\n- Issues: 2 minor",
      },
    ],
  },
  {
    id: "res_2000",
    taskId: "task_0998",
    taskName: "Regression run",
    createdAt: iso(290),
    type: "summary",
    summary: "Regression test suite completed with failures",
    content: "Regression tests identified 3 critical issues that need to be addressed.",
    artifacts: [
      {
        id: "art_004",
        name: "regression_test_output.json",
        type: "test",
        content: JSON.stringify({ total: 50, passed: 47, failed: 3, errors: [] }, null, 2),
      },
    ],
  },
];
