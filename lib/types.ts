export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "waiting_approval";

export type TaskPhase = "analyze" | "plan" | "execute" | "review";

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  currentRunId?: string;
  lastRunStatus?: TaskStatus;
}

export interface Run {
  id: string;
  taskId: string;
  status: TaskStatus;
  plan?: string;
  logs: string[];
  artifacts: Artifact[];
  createdAt: string;
  completedAt?: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: "code" | "test" | "review";
  content: string;
  language?: string;
}

export interface Metrics {
  latency: number;
  cacheHits: number;
  throughput: number;
  timestamp: number;
  memoryUsageMB?: number;
  phaseDurationsMs?: Partial<Record<TaskPhase, number>>;
}

export type RunProgressPayload = {
  taskId?: string;
  runId?: string;
  phase?: TaskPhase;
  progress?: number;
  currentAction?: string;
  etaSeconds?: number;
  elapsedSeconds?: number;
  status?: TaskStatus;
  log?: string;
  timestamp?: number;
};

export type WebSocketMessagePayload =
  | Task
  | Run
  | Metrics
  | RunProgressPayload
  | { [key: string]: unknown };

export type WebSocketMessageType =
  | "plan_ready"
  | "run_progress"
  | "run_completed"
  | "run_failed"
  | "metrics_update"
  | "task_update"
  | "run_update"
  | "alert"
  | "agent_message"
  | "agent_action"
  | "agent_status_changed"
  | "agent_activity"
  | "agent_context_updated"
  | "git_metadata_updated"
  | "git_event"
  | "workflow_execution_started"
  | "workflow_step_started"
  | "workflow_step_completed"
  | "workflow_step_failed"
  | "workflow_step_retrying"
  | "workflow_execution_completed"
  | "workflow_execution_failed"
  | "workflow_log_entry";

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: WebSocketMessagePayload;
}

export interface AgentMessage {
  id: string;
  taskId: string;
  runId?: string;
  agentName: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  actionType?: "thinking" | "executing" | "completed" | "error";
}

export interface TaskRun {
  taskId: string;
  runId: string;
  startedAt: number;
  messages: AgentMessage[];
  status: TaskStatus;
}

export type RepositoryStatus = "connected" | "disconnected" | "syncing" | "error";

export interface Repository {
  id: string;
  projectId: string;
  name: string;
  url: string;
  branch: string;
  status: RepositoryStatus;
  lastSyncTime?: string;
  lastSyncStatus?: "success" | "failed";
  error?: string;
}

export interface GitMetadata {
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
  authorName?: string;
  authorEmail?: string;
  prUrl?: string;
  prNumber?: number;
  lastSyncTime?: string;
}

export type GitEvent = {
  type: "repo_connected" | "repo_disconnected" | "repo_synced" | "git_metadata_updated";
  projectId: string;
  repositoryId?: string;
  data?: Record<string, unknown>;
};

export interface WebhookEvent {
  id: string;
  delivery_id: string;
  event_type: string;
  repository_id?: string;
  repo_full_name?: string;
  payload: Record<string, unknown>;
  parsed_data?: Record<string, unknown>;
  processed: boolean;
  processed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookEventsResponse {
  items: WebhookEvent[];
  total: number;
  limit: number;
}

export interface PullRequest {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  head_branch: string;
  base_branch: string;
  head_sha: string;
  base_sha: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  mergeable?: boolean;
  mergeable_state?: string;
  author?: string;
  labels: string[];
  review_count: number;
  comment_count: number;
}

export interface PRReview {
  id: number;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED";
  body?: string;
  author?: string;
  submitted_at: string;
}

export interface PRComment {
  id: number;
  body: string;
  author?: string;
  created_at: string;
  path?: string;
  line?: number;
}

export interface Issue {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  author?: string;
  labels: string[];
  assignees: string[];
  comment_count: number;
}

export interface IssueComment {
  id: number;
  body: string;
  author?: string;
  created_at: string;
  updated_at?: string;
}

export interface ActivityEvent {
  id: string;
  type: "commit" | "pull_request" | "issue" | "issue_comment" | "pr_review";
  timestamp: string;
  actor?: string;
  title?: string;
  body?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface Branch {
  name: string;
  sha: string;
  protected: boolean;
  default: boolean;
}

export interface BranchCompare {
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: Array<{
    sha: string;
    message: string;
    author?: string;
    date?: string;
  }>;
}

export interface DiffFile {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

export interface DiffStatistics {
  files_changed: number;
  additions: number;
  deletions: number;
  total_changes: number;
}

export interface DiffResponse {
  base_sha: string;
  head_sha: string;
  files: DiffFile[];
  statistics: DiffStatistics;
}

export type AgentStatus = "idle" | "active" | "executing" | "error" | "offline";

export interface AgentDefinition {
  id: string;
  name: string;
  description?: string;
  capabilities?: string[];
  version?: string;
}

export interface AgentInstance {
  id: string;
  definitionId: string;
  name: string;
  status: AgentStatus;
  taskId?: string;
  runId?: string;
  lastHeartbeat?: number;
  metrics?: {
    messagesProcessed?: number;
    actionsExecuted?: number;
    errorCount?: number;
    averageResponseTimeMs?: number;
  };
  context?: Record<string, unknown>;
}

export interface AgentActivityEvent {
  id: string;
  agentId: string;
  agentName: string;
  type: "status_change" | "action_started" | "action_completed" | "error" | "message";
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AgentContextSnapshot {
  agentId: string;
  timestamp: number;
  context: Record<string, unknown>;
}

export interface AgentContextVersion {
  version: number;
  timestamp: number;
  context: Record<string, unknown>;
}

export interface AgentConfiguration {
  agentId: string;
  name?: string;
  settings?: Record<string, unknown>;
}
