import { MGX_API_BASE_URL } from "@/lib/mgx/env";

const API_BASE =
  process.env.NEXT_PUBLIC_MGX_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  MGX_API_BASE_URL ??
  "http://localhost:8000";

function joinPath(basePath: string, path: string) {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function resolveUrl(path: string) {
  if (!API_BASE) return path;
  return joinPath(API_BASE, path);
}

export async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(resolveUrl(path));
  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return res.json() as Promise<T>;
}

export async function triggerRun(taskId: string) {
  const res = await fetch(resolveUrl(`/tasks/${taskId}/run`), {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger run");
  return res.json();
}

export async function approvePlan(taskId: string, runId: string) {
  return reviewPlan(taskId, runId, { decision: "approve" });
}

export async function rejectPlan(taskId: string, runId: string, comment?: string) {
  return reviewPlan(taskId, runId, { decision: "reject", comment });
}

export async function reviewPlan(
  taskId: string,
  runId: string,
  opts: { decision: "approve" | "reject"; comment?: string },
) {
  const res = await fetch(resolveUrl(`/tasks/${taskId}/runs/${runId}/${opts.decision}`), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ comment: opts.comment ?? "" }),
  });

  if (!res.ok) throw new Error(`Failed to ${opts.decision} plan`);
  return res.json();
}

export async function downloadArtifact(taskId: string, runId: string, artifactId: string) {
  if (typeof window === "undefined") return;
  window.open(
    resolveUrl(`/tasks/${taskId}/runs/${runId}/artifacts/${artifactId}/download`),
    "_blank",
  );
}

export async function createTask(name: string, description?: string) {
  const res = await fetch(resolveUrl("/tasks"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}
