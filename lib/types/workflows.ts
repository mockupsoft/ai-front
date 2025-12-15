export type WorkflowStepType =
  | "agent_task"
  | "script"
  | "condition"
  | "http_request"
  | "delay";

export type WorkflowEdgeKind = "dependency" | "data";

export type WorkflowVariableType = "string" | "number" | "boolean" | "json";

export interface WorkflowVariable {
  name: string;
  type?: WorkflowVariableType;
  description?: string;
  defaultValue?: unknown;
}

export interface WorkflowStepPosition {
  x: number;
  y: number;
}

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  description?: string;
  position: WorkflowStepPosition;

  agentId?: string;
  timeoutSeconds?: number;
  retries?: number;
  fallbackStepId?: string;

  bindings?: Record<string, string>;
}

export interface WorkflowEdge {
  id: string;
  fromStepId: string;
  toStepId: string;
  kind: WorkflowEdgeKind;
}

export interface WorkflowDefinition {
  schemaVersion: 1;
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  variables?: WorkflowVariable[];
}

export interface WorkflowSummary {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  definition?: WorkflowDefinition;
}

export interface Workflow extends WorkflowSummary {
  definition: WorkflowDefinition;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
}

export type WorkflowValidationSeverity = "error" | "warning";

export interface WorkflowValidationIssue {
  message: string;
  severity: WorkflowValidationSeverity;
  code?: string;
  path?: string;
  stepId?: string;
  edgeId?: string;
}

export interface WorkflowValidationResult {
  valid: boolean;
  issues: WorkflowValidationIssue[];
}

export interface WorkflowUpsertRequest {
  name: string;
  description?: string;
  definition: WorkflowDefinition;
}

export type WorkflowExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type StepExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "retrying";

export interface StepExecution {
  stepId: string;
  stepName: string;
  status: StepExecutionStatus;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  retryCount?: number;
  error?: string;
  agentId?: string;
  outputs?: Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  steps: StepExecution[];
  triggerredBy?: string;
  variables?: Record<string, unknown>;
  error?: string;
}

export interface ExecutionMetrics {
  totalDuration: number;
  successRate: number;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  retryCount: number;
  agentUtilization: Record<string, number>;
}

export type WorkflowEventType =
  | "workflow_execution_started"
  | "workflow_step_started"
  | "workflow_step_completed"
  | "workflow_step_failed"
  | "workflow_step_retrying"
  | "workflow_execution_completed"
  | "workflow_execution_failed"
  | "workflow_log_entry";

export interface WorkflowEvent {
  type: WorkflowEventType;
  executionId: string;
  stepId?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}
