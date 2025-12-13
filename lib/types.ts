export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';

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
  plan?: string; // Markdown or JSON representation of the plan
  logs: string[];
  artifacts: Artifact[];
  createdAt: string;
  completedAt?: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'code' | 'test' | 'review';
  content: string; // Could be a URL in real app, but content for now
  language?: string;
}

export interface Metrics {
  latency: number;
  cacheHits: number;
  throughput: number;
  timestamp: number;
}

export type WebSocketMessagePayload = Task | Run | Metrics | { [key: string]: unknown };

export interface WebSocketMessage {
  type: 'plan_ready' | 'run_progress' | 'run_completed' | 'run_failed' | 'metrics_update';
  payload: WebSocketMessagePayload;
}
