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

export interface ApiRequestOptions {
  workspaceId?: string;
  projectId?: string;
  headers?: Record<string, string>;
}

function buildScopedUrl(path: string, options?: ApiRequestOptions): string {
  const url = new URL(resolveUrl(path));
  
  if (options?.workspaceId) {
    url.searchParams.set("workspace_id", options.workspaceId);
  }
  
  if (options?.projectId) {
    url.searchParams.set("project_id", options.projectId);
  }
  
  return url.toString();
}

function buildHeaders(options?: ApiRequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // Add workspace/project headers for backend filtering
  if (options?.workspaceId) {
    headers["X-Workspace-Id"] = options.workspaceId;
  }
  
  if (options?.projectId) {
    headers["X-Project-Id"] = options.projectId;
  }

  return headers;
}

export async function fetcher<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  const url = options ? buildScopedUrl(path, options) : resolveUrl(path);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return res.json() as Promise<T>;
}

// Legacy fetcher for backwards compatibility
export async function legacyFetcher<T>(path: string): Promise<T> {
  return fetcher<T>(path);
}

export async function triggerRun(taskId: string, options?: ApiRequestOptions) {
  const url = options ? buildScopedUrl(`/tasks/${taskId}/run`, options) : resolveUrl(`/tasks/${taskId}/run`);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to trigger run");
  return res.json();
}

export async function approvePlan(taskId: string, runId: string, options?: ApiRequestOptions) {
  return reviewPlan(taskId, runId, { decision: "approve" }, options);
}

export async function rejectPlan(taskId: string, runId: string, comment?: string, options?: ApiRequestOptions) {
  return reviewPlan(taskId, runId, { decision: "reject", comment }, options);
}

export async function reviewPlan(
  taskId: string,
  runId: string,
  opts: { decision: "approve" | "reject"; comment?: string },
  options?: ApiRequestOptions,
) {
  const url = options 
    ? buildScopedUrl(`/tasks/${taskId}/runs/${runId}/${opts.decision}`, options)
    : resolveUrl(`/tasks/${taskId}/runs/${runId}/${opts.decision}`);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ comment: opts.comment ?? "" }),
  });

  if (!res.ok) throw new Error(`Failed to ${opts.decision} plan`);
  return res.json();
}

export async function downloadArtifact(taskId: string, runId: string, artifactId: string, options?: ApiRequestOptions) {
  if (typeof window === "undefined") return;
  const url = options 
    ? buildScopedUrl(`/tasks/${taskId}/runs/${runId}/artifacts/${artifactId}/download`, options)
    : resolveUrl(`/tasks/${taskId}/runs/${runId}/artifacts/${artifactId}/download`);
  
  window.open(url, "_blank");
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

export async function connectRepository(
  projectId: string,
  data: {
    url: string;
    branch: string;
    oauthToken?: string;
    appInstallId?: string;
  },
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/projects/${projectId}/repositories/connect`, options)
    : resolveUrl(`/projects/${projectId}/repositories/connect`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to connect repository");
  }
  return res.json();
}

export async function disconnectRepository(
  projectId: string,
  repositoryId: string,
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/projects/${projectId}/repositories/${repositoryId}`, options)
    : resolveUrl(`/projects/${projectId}/repositories/${repositoryId}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) throw new Error("Failed to disconnect repository");
  return res.json();
}

export async function refreshRepositoryMetadata(
  projectId: string,
  repositoryId: string,
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/projects/${projectId}/repositories/${repositoryId}/refresh`, options)
    : resolveUrl(`/projects/${projectId}/repositories/${repositoryId}/refresh`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!res.ok) throw new Error("Failed to refresh repository metadata");
  return res.json();
}
