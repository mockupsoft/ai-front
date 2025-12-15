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
