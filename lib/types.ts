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
  | "git_metadata_updated"
  | "git_event";

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
