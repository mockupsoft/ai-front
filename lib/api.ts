import { MGX_API_BASE_URL } from "@/lib/mgx/env";
import type { 
  AgentDefinition, 
  AgentInstance,
  AgentMessage,
  LlmProvider, 
  LlmModel,
  LlmConnectionTestResult,
  MemoryItem,
  Memory,
  TaskMemory
} from "@/lib/types";
import type {
  Workflow,
  WorkflowSummary,
  WorkflowTemplate,
  WorkflowUpsertRequest,
  WorkflowValidationResult,
  WorkflowExecution,
  ExecutionMetrics,
} from "@/lib/types/workflows";
import type { Workspace } from "@/lib/types/workspace";

// API Base URL resolution - prioritize environment variables, fallback to localhost:8000
// Always use http://localhost:8000 as fallback since frontend runs in browser
// IMPORTANT: In Next.js, NEXT_PUBLIC_* variables are embedded at build time
// If they're not set, we fallback to localhost:8000 which should work from browser
const getApiBase = (): string => {
  // Check in order: MGX_API_BASE_URL, API_URL, then fallback
  if (typeof window !== 'undefined') {
    // Client-side: use window location or fallback
    return process.env.NEXT_PUBLIC_MGX_API_BASE_URL ?? 
           process.env.NEXT_PUBLIC_API_URL ?? 
           "http://localhost:8000";
  }
  // Server-side: same logic
  return process.env.NEXT_PUBLIC_MGX_API_BASE_URL ?? 
         process.env.NEXT_PUBLIC_API_URL ?? 
         "http://localhost:8000";
};

const API_BASE = getApiBase();

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
  taskId?: string;
  runId?: string;
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
  
  if (options?.taskId) {
    url.searchParams.set("task_id", options.taskId);
  }
  
  if (options?.runId) {
    url.searchParams.set("run_id", options.runId);
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
  
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      throw error;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to ${url}. Make sure the backend is running.`);
    }
    throw err;
  }
}

// Legacy fetcher for backwards compatibility
export async function legacyFetcher<T>(path: string): Promise<T> {
  return fetcher<T>(path);
}

export async function triggerRun(taskId: string, options?: ApiRequestOptions) {
  const url = options ? buildScopedUrl(`/api/runs/`, options) : resolveUrl(`/api/runs/`);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ task_id: taskId }),
  });
  if (!res.ok) {
    let errorMessage = `Failed to trigger run (${res.status})`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage);
  }
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
  // Use correct endpoint: /api/runs/{run_id}/approve
  const url = options 
    ? buildScopedUrl(`/api/runs/${runId}/approve`, options)
    : resolveUrl(`/api/runs/${runId}/approve`);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ 
      approved: opts.decision === "approve",
      feedback: opts.comment ?? "" 
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `Failed to ${opts.decision} plan`);
  }
  return res.json();
}

export async function downloadArtifact(taskId: string, runId: string, artifactId: string, options?: ApiRequestOptions) {
  if (typeof window === "undefined") return;
  const url = options 
    ? buildScopedUrl(`/tasks/${taskId}/runs/${runId}/artifacts/${artifactId}/download`, options)
    : resolveUrl(`/tasks/${taskId}/runs/${runId}/artifacts/${artifactId}/download`);
  
  window.open(url, "_blank");
}

export async function createTask(
  name: string, 
  description?: string,
  options?: ApiRequestOptions
) {
  const url = options 
    ? buildScopedUrl("/api/tasks/", options)
    : resolveUrl("/api/tasks/");
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const errorMessage = error?.detail || error?.message || `Failed to create task (${res.status})`;
    console.error("Create task error:", { status: res.status, error, url });
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function updateTask(
  taskId: string,
  data: { name?: string; description?: string },
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/api/tasks/${taskId}`, options)
    : resolveUrl(`/api/tasks/${taskId}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const errorMessage = error?.detail || error?.message || `Failed to update task (${res.status})`;
    console.error("Update task error:", { status: res.status, error, url });
    throw new Error(errorMessage);
  }
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

export async function listWebhookEvents(
  repoFullName?: string,
  eventType?: string,
  limit: number = 50,
  options?: ApiRequestOptions
) {
  const url = new URL(resolveUrl("/api/webhooks/github/events"));
  if (repoFullName) url.searchParams.set("repo_full_name", repoFullName);
  if (eventType) url.searchParams.set("event_type", eventType);
  url.searchParams.set("limit", limit.toString());

  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), { headers });

  if (!res.ok) throw new Error("Failed to fetch webhook events");
  return res.json();
}

export async function listPullRequests(
  linkId: string,
  state: "open" | "closed" | "all" = "open",
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/pull-requests?state=${state}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch pull requests");
  return res.json();
}

export async function getPullRequest(
  linkId: string,
  prNumber: number,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/pull-requests/${prNumber}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch pull request");
  return res.json();
}

export async function mergePullRequest(
  linkId: string,
  prNumber: number,
  mergeMethod: "merge" | "squash" | "rebase" = "merge",
  commitTitle?: string,
  commitMessage?: string,
  options?: ApiRequestOptions
) {
  const url = new URL(buildScopedUrl(`/api/repositories/${linkId}/pull-requests/${prNumber}/merge`, options));
  url.searchParams.set("merge_method", mergeMethod);
  if (commitTitle) url.searchParams.set("commit_title", commitTitle);
  if (commitMessage) url.searchParams.set("commit_message", commitMessage);
  
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to merge pull request");
  return res.json();
}

export async function createPullRequestReview(
  linkId: string,
  prNumber: number,
  state: "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
  body?: string,
  event?: "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
  options?: ApiRequestOptions
) {
  const url = new URL(buildScopedUrl(`/api/repositories/${linkId}/pull-requests/${prNumber}/review`, options));
  url.searchParams.set("state", state);
  if (event) url.searchParams.set("event", event);
  
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: body ? JSON.stringify({ body }) : undefined,
  });
  if (!res.ok) throw new Error("Failed to create review");
  return res.json();
}

export async function createPullRequestComment(
  linkId: string,
  prNumber: number,
  body: string,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/pull-requests/${prNumber}/comments`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
}

export async function listPullRequestReviews(
  linkId: string,
  prNumber: number,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/pull-requests/${prNumber}/reviews`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function listPullRequestComments(
  linkId: string,
  prNumber: number,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/pull-requests/${prNumber}/comments`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function listIssues(
  linkId: string,
  state: "open" | "closed" | "all" = "open",
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/issues?state=${state}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function getIssue(
  linkId: string,
  issueNumber: number,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/issues/${issueNumber}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch issue");
  return res.json();
}

export async function createIssue(
  linkId: string,
  title: string,
  body?: string,
  labels?: string[],
  assignees?: string[],
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/issues`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ title, body, labels, assignees }),
  });
  if (!res.ok) throw new Error("Failed to create issue");
  return res.json();
}

export async function updateIssue(
  linkId: string,
  issueNumber: number,
  title?: string,
  body?: string,
  state?: "open" | "closed",
  labels?: string[],
  assignees?: string[],
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/issues/${issueNumber}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title, body, state, labels, assignees }),
  });
  if (!res.ok) throw new Error("Failed to update issue");
  return res.json();
}

export async function closeIssue(
  linkId: string,
  issueNumber: number,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/issues/${issueNumber}/close`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to close issue");
  return res.json();
}

export async function createIssueComment(
  linkId: string,
  issueNumber: number,
  body: string,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/issues/${issueNumber}/comments`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
}

export async function listIssueComments(
  linkId: string,
  issueNumber: number,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/issues/${issueNumber}/comments`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function getActivityFeed(
  linkId: string,
  limit: number = 50,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/activity?limit=${limit}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch activity feed");
  return res.json();
}

export async function getCommitHistory(
  linkId: string,
  branch: string = "main",
  limit: number = 50,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/commits?branch=${branch}&limit=${limit}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch commit history");
  return res.json();
}

export async function getTimelineView(
  linkId: string,
  limit: number = 50,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/activity/timeline?limit=${limit}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json();
}

export async function listBranches(
  linkId: string,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/branches`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch branches");
  return res.json();
}

export async function createBranch(
  linkId: string,
  branchName: string,
  fromBranch: string = "main",
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/branches`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ branch_name: branchName, from_branch: fromBranch }),
  });
  if (!res.ok) throw new Error("Failed to create branch");
  return res.json();
}

export async function deleteBranch(
  linkId: string,
  branchName: string,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/branches/${branchName}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete branch");
  return res.json();
}

export async function compareBranches(
  linkId: string,
  base: string,
  head: string,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/branches/compare?base=${base}&head=${head}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to compare branches");
  return res.json();
}

export async function getCommitDiff(
  linkId: string,
  commitSha: string,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/diffs/${commitSha}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch commit diff");
  return res.json();
}

export async function getCompareDiff(
  linkId: string,
  base: string,
  head: string,
  options?: ApiRequestOptions
) {
  const url = buildScopedUrl(`/api/repositories/${linkId}/diffs/compare?base=${base}&head=${head}`, options);
  const headers = buildHeaders(options);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch compare diff");
  return res.json();
}

export async function fetchAgentInstances(
  options?: ApiRequestOptions,
): Promise<AgentInstance[]> {
  const response = await fetcher<{ items: AgentInstance[] }>("/api/agents", options);
  return response?.items ?? [];
}

export async function fetchAgentDefinitions(
  options?: ApiRequestOptions,
): Promise<AgentDefinition[]> {
  return fetcher<AgentDefinition[]>("/api/agents/definitions", options);
}

export async function fetchAgentContext(
  agentId: string,
  options?: ApiRequestOptions
) {
  return fetcher(`/api/agents/${agentId}/context`, options);
}

export async function fetchAgentMessages(
  agentId: string | null,
  limit?: number,
  offset?: number,
  options?: ApiRequestOptions & { taskId?: string; runId?: string; beforeId?: string; beforeTimestamp?: string }
): Promise<AgentMessage[]> {
  // If no agentId but taskId/runId provided, use task-based endpoint
  if (!agentId && (options?.taskId || options?.runId)) {
    const url = options
      ? buildScopedUrl(`/api/agents/messages`, options)
      : resolveUrl(`/api/agents/messages`);
    
    const urlObj = new URL(url);
    if (options?.taskId) urlObj.searchParams.set("task_id", options.taskId);
    if (options?.runId) urlObj.searchParams.set("run_id", options.runId);
    if (limit) urlObj.searchParams.set("limit", String(limit));
    if (offset) urlObj.searchParams.set("skip", String(offset));
    if (options?.beforeId) urlObj.searchParams.set("before_id", options.beforeId);
    if (options?.beforeTimestamp) urlObj.searchParams.set("before_timestamp", options.beforeTimestamp);
    
    // Debug: Log the URL and parameters
    const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
    if (isDev) {
      console.debug("[fetchAgentMessages] Requesting messages with URL:", urlObj.toString(), {
        taskId: options?.taskId,
        runId: options?.runId,
        limit,
        offset,
      });
    }
    
    const headers = buildHeaders(options);
    const res = await fetch(urlObj.toString(), { headers });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.warn("[fetchAgentMessages] Failed to fetch messages by task/run:", error.detail || error.message, {
        taskId: options?.taskId,
        runId: options?.runId,
        status: res.status,
      });
      return [];
    }
    const backendMessages = await res.json();
    
    // Debug: Log response
    if (isDev) {
      console.debug("[fetchAgentMessages] Received messages from backend:", {
        taskId: options?.taskId,
        runId: options?.runId,
        count: backendMessages.length,
        messageTaskIds: backendMessages.map((m: any) => m.task_id).filter((id: string, idx: number, arr: string[]) => arr.indexOf(id) === idx), // Unique taskIds
      });
    }
    
    // Backend's list_messages_by_task returns messages in ASC order (oldest first, newest last)
    // This is correct - we want newest messages at the bottom
    // Convert backend AgentMessageResponse to frontend AgentMessage format
    return backendMessages.map((msg: any) => {
      // Extract content from payload
      // IMPORTANT: payload might be a string (JSON) or object
      let payload = msg.payload || {};
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          payload = {};
        }
      }
      
      let content = "";
      if (typeof payload === "string") {
        content = payload;
      } else if (payload.message) {
        content = typeof payload.message === "string" ? payload.message : JSON.stringify(payload.message);
      } else if (payload.content) {
        content = typeof payload.content === "string" ? payload.content : JSON.stringify(payload.content);
      } else if (payload.text) {
        content = typeof payload.text === "string" ? payload.text : JSON.stringify(payload.text);
      } else if (Object.keys(payload).length > 0) {
        content = JSON.stringify(payload, null, 2);
      }
      
      // Determine role from direction
      // IMPORTANT: "inbound" = user message, "outbound" = agent message, "system" = system message
      let role: "user" | "assistant" | "system" = "assistant";
      if (msg.direction === "inbound") {
        role = "user";
      } else if (msg.direction === "system") {
        role = "system";
      } else if (msg.direction === "outbound") {
        role = "assistant";
      }
      
      // Also check payload.type for user messages
      if (payload.type === "user_message" || payload.type === "inbound") {
        role = "user";
      }
      
      // Extract actionType from payload
      const actionType = payload.actionType || payload.type || (msg.direction === "system" ? "system" : undefined);
      
      // Extract agent name with priority: payload.agent_name > payload.agentName > role mapping > "Agent"
      // Note: payload is already parsed above if it was a string
      let agentName = payload.agent_name || payload.agentName;
      
      // Debug logging in development
      if (process.env.NODE_ENV === "development" && !agentName && (payload.type === "execution_started" || payload.type === "task_started")) {
        console.debug("[fetchAgentMessages] Payload for agent name:", {
          payload_type: payload.type,
          payload_agent_name: payload.agent_name,
          payload_role: payload.role,
          full_payload_keys: Object.keys(payload),
        });
      }
      
      // If no agent name, try to map from role
      if (!agentName && payload.role) {
        const roleNameMap: Record<string, string> = {
          "TeamLeader": "Mike",
          "Engineer": "Alex",
          "Tester": "Bob",
          "Reviewer": "Charlie",
        };
        agentName = roleNameMap[payload.role] || payload.role;
      }
      
      // Also check msg.agent_name directly (from backend response)
      if (!agentName && msg.agent_name) {
        agentName = msg.agent_name;
      }
      
      // Final fallback
      if (!agentName) {
        agentName = "Agent";
      }
      
      // Parse timestamp from created_at - ensure it's a valid timestamp
      // Each message should have its own unique timestamp
      let messageTimestamp = Date.now(); // Default fallback (but should not be used if created_at exists)
      if (msg.created_at) {
        try {
          // Handle both ISO string and timestamp number formats
          let dateValue: Date;
          if (typeof msg.created_at === 'string') {
            dateValue = new Date(msg.created_at);
          } else if (typeof msg.created_at === 'number') {
            dateValue = new Date(msg.created_at);
          } else {
            // Try to convert to string first
            dateValue = new Date(String(msg.created_at));
          }
          
          if (!isNaN(dateValue.getTime())) {
            messageTimestamp = dateValue.getTime();
            
            // Debug logging in development
            if (process.env.NODE_ENV === "development") {
              console.debug("[fetchAgentMessages] Parsed timestamp:", {
                messageId: msg.id.substring(0, 8),
                created_at: msg.created_at,
                parsedTimestamp: messageTimestamp,
                formattedTime: dateValue.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              });
            }
          } else {
            console.warn("[fetchAgentMessages] Invalid created_at date:", msg.created_at, "for message:", msg.id);
          }
        } catch (e) {
          console.warn("[fetchAgentMessages] Error parsing created_at:", msg.created_at, "for message:", msg.id, e);
        }
      } else {
        console.warn("[fetchAgentMessages] Missing created_at for message:", msg.id);
      }
      
      return {
        id: msg.id,
        taskId: msg.task_id || options?.taskId || "",
        runId: msg.run_id || options?.runId,
        agentName: agentName, // Use extracted agent name (Bob, Mike, Alex, Charlie)
        role,
        content: content || payload.type || actionType || "Message",
        timestamp: messageTimestamp,
        actionType: actionType as "thinking" | "executing" | "completed" | "error" | undefined,
        payload: payload,
        sender_agent_id: payload.sender_agent_id || payload.senderAgentId,
        recipient_agent_id: payload.recipient_agent_id || payload.recipientAgentId,
        llm_provider: payload.llm_provider || payload.llmProvider,
        llm_model: payload.llm_model || payload.llmModel,
        // Include created_at as a fallback for timestamp parsing
        created_at: msg.created_at,
      } as AgentMessage;
    });
  }
  
  // Fallback to agent_id-based endpoint
  if (!agentId) {
    console.warn("No agentId or taskId/runId provided, cannot fetch messages");
    return [];
  }
  
  const url = options
    ? buildScopedUrl(`/api/agents/${agentId}/messages`, options)
    : resolveUrl(`/api/agents/${agentId}/messages`);
  
  const urlObj = new URL(url);
  if (limit) urlObj.searchParams.set("limit", String(limit));
  if (offset) urlObj.searchParams.set("offset", String(offset));
  
  const headers = buildHeaders(options);
  const res = await fetch(urlObj.toString(), { headers });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.warn("Failed to fetch agent messages:", error.detail || error.message);
    return [];
  }
  return res.json();
}

export async function sendAgentMessage(
  agentId: string,
  content: string,
  direction: "inbound" | "outbound" = "inbound",
  correlationId?: string,
  options?: ApiRequestOptions & { taskId?: string; runId?: string }
): Promise<AgentMessage> {
  const url = options
    ? buildScopedUrl(`/api/agents/${agentId}/messages`, options)
    : resolveUrl(`/api/agents/${agentId}/messages`);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      direction,
      payload: {
        message: content,
        content: content,
        type: "user_message",
      },
      correlation_id: correlationId,
      task_id: options?.taskId,
      run_id: options?.runId,
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Failed to send message");
  }
  const backendMsg = await res.json();
  
  // Convert backend AgentMessageResponse to frontend AgentMessage format
  // Same logic as in fetchAgentMessages
  const payload = backendMsg.payload || {};
  let extractedContent = "";
  if (typeof payload === "string") {
    extractedContent = payload;
  } else if (payload.message) {
    extractedContent = typeof payload.message === "string" ? payload.message : JSON.stringify(payload.message);
  } else if (payload.content) {
    extractedContent = typeof payload.content === "string" ? payload.content : JSON.stringify(payload.content);
  } else if (payload.text) {
    extractedContent = typeof payload.text === "string" ? payload.text : JSON.stringify(payload.text);
  } else if (Object.keys(payload).length > 0) {
    extractedContent = JSON.stringify(payload, null, 2);
  }
  
  // Determine role from direction
  let role: "user" | "assistant" | "system" = "assistant";
  if (backendMsg.direction === "inbound") role = "user";
  if (backendMsg.direction === "system") role = "system";
  
  // Extract agent name from payload
  const agentName = payload.agent_name || backendMsg.agent_name || "Agent";
  
  return {
    id: backendMsg.id || backendMsg.message_id || String(Date.now()),
    taskId: backendMsg.task_id || options?.taskId || "",
    runId: backendMsg.run_id || options?.runId,
    agentName: agentName,
    role: role,
    content: extractedContent,
    timestamp: backendMsg.timestamp ? (typeof backendMsg.timestamp === "number" ? backendMsg.timestamp : new Date(backendMsg.timestamp).getTime()) : Date.now(),
    actionType: payload.action_type || backendMsg.action_type,
    payload: payload,
  } as AgentMessage;
}

export async function sendMessageByTask(
  content: string,
  direction: "inbound" | "outbound" = "inbound",
  correlationId?: string,
  options?: ApiRequestOptions & { taskId?: string; runId?: string }
): Promise<AgentMessage> {
  if (!options?.taskId) {
    throw new Error("taskId is required");
  }
  
  const url = options
    ? buildScopedUrl(`/api/agents/messages`, options)
    : resolveUrl(`/api/agents/messages`);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      direction,
      payload: {
        message: content,
        content: content,
        type: "user_message",
      },
      correlation_id: correlationId,
      task_id: options.taskId,
      run_id: options.runId,
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Failed to send message");
  }
  const backendMsg = await res.json();
  
  // Convert backend AgentMessageResponse to frontend AgentMessage format
  // Same logic as in fetchAgentMessages
  const payload = backendMsg.payload || {};
  let extractedContent = "";
  if (typeof payload === "string") {
    extractedContent = payload;
  } else if (payload.message) {
    extractedContent = typeof payload.message === "string" ? payload.message : JSON.stringify(payload.message);
  } else if (payload.content) {
    extractedContent = typeof payload.content === "string" ? payload.content : JSON.stringify(payload.content);
  } else if (payload.text) {
    extractedContent = typeof payload.text === "string" ? payload.text : JSON.stringify(payload.text);
  } else if (Object.keys(payload).length > 0) {
    extractedContent = JSON.stringify(payload, null, 2);
  }
  
  // Determine role from direction
  let role: "user" | "assistant" | "system" = "assistant";
  if (backendMsg.direction === "inbound") role = "user";
  if (backendMsg.direction === "system") role = "system";
  
  // Extract agent name from payload
  const agentName = payload.agent_name || backendMsg.agent_name || "Agent";
  
  return {
    id: backendMsg.id || backendMsg.message_id || String(Date.now()),
    taskId: backendMsg.task_id || options.taskId || "",
    runId: backendMsg.run_id || options.runId,
    agentName: agentName,
    role: role,
    content: extractedContent,
    timestamp: backendMsg.timestamp ? (typeof backendMsg.timestamp === "number" ? backendMsg.timestamp : new Date(backendMsg.timestamp).getTime()) : Date.now(),
    actionType: payload.action_type || backendMsg.action_type,
    payload: payload,
    created_at: backendMsg.created_at || new Date().toISOString(),
  } as AgentMessage;
}

export async function fetchAgentContextHistory(
  agentId: string,
  options?: ApiRequestOptions
) {
  return fetcher(`/api/agents/${agentId}/context/history`, options);
}

export async function updateAgentConfig(
  agentId: string,
  config: Record<string, unknown>,
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/api/agents/${agentId}`, options)
    : resolveUrl(`/api/agents/${agentId}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(config),
  });

  if (!res.ok) throw new Error("Failed to update agent config");
  return res.json();
}

export async function activateAgent(
  agentId: string,
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/api/agents/${agentId}/activate`, options)
    : resolveUrl(`/api/agents/${agentId}/activate`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!res.ok) throw new Error("Failed to activate agent");
  return res.json();
}

export async function deactivateAgent(
  agentId: string,
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/api/agents/${agentId}/deactivate`, options)
    : resolveUrl(`/api/agents/${agentId}/deactivate`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!res.ok) throw new Error("Failed to deactivate agent");
  return res.json();
}

export async function shutdownAgent(
  agentId: string,
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/api/agents/${agentId}/shutdown`, options)
    : resolveUrl(`/api/agents/${agentId}/shutdown`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!res.ok) throw new Error("Failed to shutdown agent");
  return res.json();
}

export async function rollbackAgentContext(
  agentId: string,
  contextVersion: number,
  options?: ApiRequestOptions
) {
  const url = options
    ? buildScopedUrl(`/api/agents/${agentId}/context/rollback`, options)
    : resolveUrl(`/api/agents/${agentId}/context/rollback`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ version: contextVersion }),
  });

  if (!res.ok) throw new Error("Failed to rollback agent context");
  return res.json();
}

export async function fetchWorkflows(
  options?: ApiRequestOptions,
): Promise<WorkflowSummary[]> {
  return fetcher<WorkflowSummary[]>("/workflows", options);
}

export async function fetchWorkflow(
  workflowId: string,
  options?: ApiRequestOptions,
): Promise<Workflow> {
  return fetcher<Workflow>(`/workflows/${workflowId}`, options);
}

export async function fetchWorkflowTemplates(
  options?: ApiRequestOptions,
): Promise<WorkflowTemplate[]> {
  return fetcher<WorkflowTemplate[]>("/workflows/templates", options);
}

export async function validateWorkflowDefinition(
  definition: WorkflowUpsertRequest["definition"],
  options?: ApiRequestOptions,
): Promise<WorkflowValidationResult> {
  const url = options
    ? buildScopedUrl("/workflows/validate", options)
    : resolveUrl("/workflows/validate");
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ definition }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to validate workflow");
  }

  return res.json();
}

export async function createWorkflow(
  payload: WorkflowUpsertRequest,
  options?: ApiRequestOptions,
): Promise<Workflow> {
  const url = options ? buildScopedUrl("/workflows", options) : resolveUrl("/workflows");
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create workflow");
  }

  return res.json();
}

export async function updateWorkflow(
  workflowId: string,
  payload: WorkflowUpsertRequest,
  options?: ApiRequestOptions,
): Promise<Workflow> {
  const url = options
    ? buildScopedUrl(`/workflows/${workflowId}`, options)
    : resolveUrl(`/workflows/${workflowId}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update workflow");
  }

  return res.json();
}

export async function fetchWorkflowExecutions(
  workflowId: string,
  limit?: number,
  offset?: number,
  options?: ApiRequestOptions,
): Promise<WorkflowExecution[]> {
  const url = options
    ? buildScopedUrl(`/workflows/${workflowId}/executions`, options)
    : resolveUrl(`/workflows/${workflowId}/executions`);

  const urlObj = new URL(url);
  if (limit) urlObj.searchParams.set("limit", String(limit));
  if (offset) urlObj.searchParams.set("offset", String(offset));

  const headers = buildHeaders(options);
  const res = await fetch(urlObj.toString(), { headers });

  if (!res.ok) throw new Error("Failed to fetch workflow executions");
  return res.json();
}

export async function fetchWorkflowExecution(
  executionId: string,
  options?: ApiRequestOptions,
): Promise<WorkflowExecution> {
  return fetcher<WorkflowExecution>(`/executions/${executionId}`, options);
}

export async function triggerWorkflowExecution(
  workflowId: string,
  variables?: Record<string, unknown>,
  options?: ApiRequestOptions,
): Promise<WorkflowExecution> {
  const url = options
    ? buildScopedUrl(`/workflows/${workflowId}/executions`, options)
    : resolveUrl(`/workflows/${workflowId}/executions`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ variables: variables ?? {} }),
  });

  if (!res.ok) throw new Error("Failed to trigger workflow execution");
  return res.json();
}

export async function fetchExecutionLogs(
  executionId: string,
  stepId?: string,
  limit?: number,
  offset?: number,
  options?: ApiRequestOptions,
): Promise<string[]> {
  const path = stepId
    ? `/executions/${executionId}/steps/${stepId}/logs`
    : `/executions/${executionId}/logs`;

  const url = options ? buildScopedUrl(path, options) : resolveUrl(path);

  const urlObj = new URL(url);
  if (limit) urlObj.searchParams.set("limit", String(limit));
  if (offset) urlObj.searchParams.set("offset", String(offset));

  const headers = buildHeaders(options);
  const res = await fetch(urlObj.toString(), { headers });

  if (!res.ok) throw new Error("Failed to fetch execution logs");
  return res.json();
}

export async function fetchExecutionMetrics(
  executionId: string,
  options?: ApiRequestOptions,
): Promise<ExecutionMetrics> {
  return fetcher<ExecutionMetrics>(`/executions/${executionId}/metrics`, options);
}

// Workspace management endpoints
export async function fetchWorkspaceWorkspaces(
  options?: ApiRequestOptions,
): Promise<Workspace[]> {
  // Backend returns WorkspaceListResponse with items array
  // Add trailing slash to avoid 307 redirect
  const url = options ? buildScopedUrl('/api/workspaces/', options) : resolveUrl('/api/workspaces/');
  const headers = buildHeaders(options);
  
  // Debug: Always log in development to see what's happening
  if (typeof window !== 'undefined') {
    console.log('[fetchWorkspaceWorkspaces] Request URL:', url);
    console.log('[fetchWorkspaceWorkspaces] API_BASE:', API_BASE);
    console.log('[fetchWorkspaceWorkspaces] Full URL will be:', url);
  }
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    if (typeof window !== 'undefined') {
      console.log('[fetchWorkspaceWorkspaces] Making fetch request to:', url);
    }
    
    const res = await fetch(url, { 
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'application/json',
      },
      signal: controller.signal,
      // Don't use credentials to avoid CORS issues with wildcard origins
      // credentials: 'include',
    });
    
    clearTimeout(timeoutId);
    
    if (typeof window !== 'undefined') {
      console.log('[fetchWorkspaceWorkspaces] Response status:', res.status, res.statusText);
    }
    
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      throw new Error(errorMessage);
    }
    
    const response = await res.json() as { items: any[]; total: number; skip: number; limit: number };
    
    // Transform backend response to frontend format
    const workspaces = (response.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug || '',
      metadata: item.metadata || item.workspace_metadata || {},
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
      userId: item.userId || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    }));
    
    return workspaces;
  } catch (err) {
    // Enhanced error logging
    if (typeof window !== 'undefined') {
      console.error('[fetchWorkspaceWorkspaces] Error caught:', err);
      console.error('[fetchWorkspaceWorkspaces] Error type:', err instanceof Error ? err.name : typeof err);
      console.error('[fetchWorkspaceWorkspaces] Error message:', err instanceof Error ? err.message : String(err));
      console.error('[fetchWorkspaceWorkspaces] Failed URL:', url);
      if (err instanceof Error && err.stack) {
        console.error('[fetchWorkspaceWorkspaces] Stack:', err.stack);
      }
    }
    
    // Handle network errors, timeouts, etc.
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error(`Request timeout: Backend did not respond within 15 seconds`);
      }
      // Re-throw with original message for SWR to handle
      throw err;
    }
    // Re-throw unknown errors
    throw new Error(`Failed to fetch workspaces: ${String(err)}`);
  }
}

export async function createWorkspace(
  name: string,
  description?: string,
  options?: ApiRequestOptions
): Promise<Workspace> {
  const url = options ? buildScopedUrl('/api/workspaces', options) : resolveUrl('/api/workspaces');
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, description }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create workspace');
  }

  return res.json();
}

// LLM Provider endpoints
export async function fetchLlmModels(
  provider: LlmProvider,
  options?: ApiRequestOptions,
): Promise<LlmModel[]> {
  return fetcher<LlmModel[]>(`/api/llm/models?provider=${provider}`, options);
}

// LLM Health and Provider Management
export interface LlmProviderHealth {
  provider: string;
  configured: boolean;
  model_count: number;
  models: string[];
}

export interface LlmHealthResponse {
  routing_strategy: string;
  fallback_enabled: boolean;
  prefer_local: boolean;
  providers: LlmProviderHealth[];
}

export async function fetchLlmHealth(options?: ApiRequestOptions): Promise<LlmHealthResponse> {
  return fetcher<LlmHealthResponse>("/api/llm/health", options);
}

export interface LlmRouteRequest {
  required_capability?: string;
  strategy?: "balanced" | "cost_optimized" | "latency_optimized" | "quality_optimized" | "local_first";
  budget_remaining?: number;
  prefer_local?: boolean;
}

export interface LlmRouteResponse {
  provider: string;
  model: string;
  reason: string;
}

export async function fetchLlmRoute(
  request: LlmRouteRequest,
  options?: ApiRequestOptions
): Promise<LlmRouteResponse> {
  const url = buildScopedUrl("/api/llm/route", options);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  
  if (!res.ok) throw new Error("Failed to route LLM request");
  return res.json();
}

// Ollama Management APIs
export interface OllamaModelInfo {
  name: string;
  size?: number;
  modified_at?: string;
}

export interface OllamaListResponse {
  models: OllamaModelInfo[];
  connected: boolean;
  base_url: string;
}

export interface OllamaPullRequest {
  model: string;
}

export interface OllamaPullResponse {
  success: boolean;
  message: string;
  model: string;
}

export interface OllamaDeleteRequest {
  model: string;
}

export interface OllamaDeleteResponse {
  success: boolean;
  message: string;
  model: string;
}

export interface OllamaHealthResponse {
  connected: boolean;
  base_url: string;
  model_count: number;
  models: string[];
}

export async function fetchOllamaModels(options?: ApiRequestOptions): Promise<OllamaListResponse> {
  return fetcher<OllamaListResponse>("/api/llm/ollama/models", options);
}

export async function pullOllamaModel(
  model: string,
  options?: ApiRequestOptions
): Promise<OllamaPullResponse> {
  const url = buildScopedUrl("/api/llm/ollama/pull", options);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Failed to pull model");
  }
  return res.json();
}

export async function deleteOllamaModel(
  model: string,
  options?: ApiRequestOptions
): Promise<OllamaDeleteResponse> {
  const url = buildScopedUrl("/api/llm/ollama/delete", options);
  const headers = buildHeaders(options);
  
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Failed to delete model");
  }
  return res.json();
}

export async function fetchOllamaHealth(options?: ApiRequestOptions): Promise<OllamaHealthResponse> {
  return fetcher<OllamaHealthResponse>("/api/llm/ollama/health", options);
}

// Plan creation from chat message
export interface CreatePlanRequest {
  message: string;
  task_description?: string;
}

export interface CreatePlanResponse {
  task_id: string;
  run_id: string;
  plan?: string;
  status: string;
}

export async function createPlanFromChat(
  taskId: string,
  request: CreatePlanRequest,
  options?: ApiRequestOptions
): Promise<CreatePlanResponse> {
  // First, update task description if provided
  if (request.task_description) {
    const updateUrl = options
      ? buildScopedUrl(`/api/tasks/${taskId}`, options)
      : resolveUrl(`/api/tasks/${taskId}`);
    const headers = buildHeaders(options);
    
    const updateRes = await fetch(updateUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ description: request.task_description }),
    });
    
    if (!updateRes.ok) {
      const error = await updateRes.json().catch(() => ({}));
      // Log warning but don't fail - task description update is optional
      console.warn("Failed to update task description:", error.detail || error.message);
    }
  }

  // Create a run which will trigger plan creation
  const runUrl = options
    ? buildScopedUrl(`/api/runs/`, options)
    : resolveUrl(`/api/runs/`);
  const headers = buildHeaders(options);
  
  const res = await fetch(runUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      task_id: taskId,
      // Run will be created and plan will be generated automatically
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create plan");
  }
  
  const run = await res.json();
  return {
    task_id: taskId,
    run_id: run.id,
    plan: run.plan,
    status: run.status,
  };
}

export async function testLlmConnection(
  provider: LlmProvider,
  apiKey: string,
  options?: ApiRequestOptions,
): Promise<LlmConnectionTestResult> {
  const url = options
    ? buildScopedUrl("/llm/test-connection", options)
    : resolveUrl("/llm/test-connection");
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ provider, apiKey }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to test LLM connection");
  }

  return res.json();
}

// Memory Management APIs
export async function getTaskMemory(
  taskId: string,
  options?: ApiRequestOptions,
): Promise<TaskMemory> {
  return fetcher<TaskMemory>(`/tasks/${taskId}/memory`, options);
}

export async function pinMessageToMemory(
  taskId: string,
  messageId: string,
  memoryType: "thread" | "workspace" = "thread",
  options?: ApiRequestOptions,
): Promise<MemoryItem> {
  const url = options
    ? buildScopedUrl(`/tasks/${taskId}/memory/pin`, options)
    : resolveUrl(`/tasks/${taskId}/memory/pin`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ messageId, memoryType }),
  });

  if (!res.ok) throw new Error("Failed to pin message to memory");
  return res.json();
}

export async function removeMemoryItem(
  taskId: string,
  memoryItemId: string,
  memoryType: "thread" | "workspace",
  options?: ApiRequestOptions,
): Promise<void> {
  const url = options
    ? buildScopedUrl(`/tasks/${taskId}/memory/items/${memoryItemId}`, options)
    : resolveUrl(`/tasks/${taskId}/memory/items/${memoryItemId}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ memoryType }),
  });

  if (!res.ok) throw new Error("Failed to remove memory item");
}

export async function clearMemory(
  taskId: string,
  memoryType: "thread" | "workspace" | "both" = "thread",
  options?: ApiRequestOptions,
): Promise<void> {
  const url = options
    ? buildScopedUrl(`/tasks/${taskId}/memory/clear`, options)
    : resolveUrl(`/tasks/${taskId}/memory/clear`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ memoryType }),
  });

  if (!res.ok) throw new Error("Failed to clear memory");
}

export async function pruneMemoryItems(
  taskId: string,
  memoryType: "thread" | "workspace",
  keepCount: number = 10,
  options?: ApiRequestOptions,
): Promise<Memory> {
  const url = options
    ? buildScopedUrl(`/tasks/${taskId}/memory/prune`, options)
    : resolveUrl(`/tasks/${taskId}/memory/prune`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ memoryType, keepCount }),
  });

  if (!res.ok) throw new Error("Failed to prune memory items");
  return res.json();
}

export async function addManualMemoryItem(
  taskId: string,
  memoryType: "thread" | "workspace",
  item: Omit<MemoryItem, "id" | "timestamp">,
  options?: ApiRequestOptions,
): Promise<MemoryItem> {
  const url = options
    ? buildScopedUrl(`/tasks/${taskId}/memory/items`, options)
    : resolveUrl(`/tasks/${taskId}/memory/items`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ memoryType, item }),
  });

  if (!res.ok) throw new Error("Failed to add memory item");
  return res.json();
}

export async function updateMemoryItem(
  taskId: string,
  itemId: string,
  memoryType: "thread" | "workspace",
  updates: Partial<Omit<MemoryItem, "id" | "timestamp">>,
  options?: ApiRequestOptions,
): Promise<MemoryItem> {
  const url = options
    ? buildScopedUrl(`/tasks/${taskId}/memory/items/${itemId}`, options)
    : resolveUrl(`/tasks/${taskId}/memory/items/${itemId}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ memoryType, ...updates }),
  });

  if (!res.ok) throw new Error("Failed to update memory item");
  return res.json();
}

// Result Management APIs
export async function exportResult(
  resultId: string,
  format: "pdf" | "json" | "markdown",
  options?: ApiRequestOptions,
): Promise<Blob> {
  const url = options
    ? buildScopedUrl(`/results/${resultId}/export`, options)
    : resolveUrl(`/results/${resultId}/export`);
  const urlObj = new URL(url);
  urlObj.searchParams.set("format", format);
  
  const headers = buildHeaders(options);
  const res = await fetch(urlObj.toString(), { headers });

  if (!res.ok) throw new Error("Failed to export result");
  return res.blob();
}

export async function duplicateResult(
  resultId: string,
  options?: ApiRequestOptions,
): Promise<any> {
  const url = options
    ? buildScopedUrl(`/results/${resultId}/duplicate`, options)
    : resolveUrl(`/results/${resultId}/duplicate`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!res.ok) throw new Error("Failed to duplicate result");
  return res.json();
}

export async function deleteResult(
  resultId: string,
  options?: ApiRequestOptions,
): Promise<void> {
  const url = options
    ? buildScopedUrl(`/results/${resultId}`, options)
    : resolveUrl(`/results/${resultId}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) throw new Error("Failed to delete result");
}

export async function archiveResult(
  resultId: string,
  options?: ApiRequestOptions,
): Promise<any> {
  const url = options
    ? buildScopedUrl(`/results/${resultId}/archive`, options)
    : resolveUrl(`/results/${resultId}/archive`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "PATCH",
    headers,
  });

  if (!res.ok) throw new Error("Failed to archive result");
  return res.json();
}

// Task Files API
export interface TaskFile {
  name: string;
  path: string;
  content: string;
  type: "html" | "css" | "js" | "other";
  size: number;
  error?: string;
}

export interface TaskFilesResponse {
  files: TaskFile[];
  count: number;
  task_id: string;
  run_id?: string;
}

export async function getTaskFiles(
  taskId: string,
  runId?: string,
  options?: ApiRequestOptions
): Promise<TaskFilesResponse> {
  const url = options
    ? buildScopedUrl(`/api/tasks/${taskId}/files${runId ? `?run_id=${runId}` : ""}`, options)
    : resolveUrl(`/api/tasks/${taskId}/files${runId ? `?run_id=${runId}` : ""}`);
  const headers = buildHeaders(options);

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Failed to fetch task files");
  }

  return res.json();
}
