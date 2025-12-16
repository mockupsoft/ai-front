/**
 * Type of step in a workflow.
 * @example "agent_task" - Execute task using an AI agent
 * @example "script" - Run custom script or code snippet
 * @example "condition" - Conditional branching based on expressions
 * @example "http_request" - Make HTTP API call to external service
 * @example "delay" - Wait for specified duration
 */
export type WorkflowStepType =
  | "agent_task"
  | "script"
  | "condition"
  | "http_request"
  | "delay";

/**
 * Type of connection between workflow steps.
 * @example "dependency" - Execution dependency (step B waits for step A)
 * @example "data" - Data flow (output of step A flows to input of step B)
 */
export type WorkflowEdgeKind = "dependency" | "data";

/**
 * Data type for workflow variables.
 */
export type WorkflowVariableType = "string" | "number" | "boolean" | "json";

/**
 * Variable definition for workflow inputs/parameters.
 * Variables can be referenced in step bindings using {{workflow.variableName}} syntax.
 */
export interface WorkflowVariable {
  /** Variable identifier (alphanumeric + underscores) */
  name: string;
  /** Data type of the variable */
  type?: WorkflowVariableType;
  /** Human-readable description */
  description?: string;
  /** Default value if not provided at execution time */
  defaultValue?: unknown;
}

/**
 * Position of a step node on the workflow canvas.
 */
export interface WorkflowStepPosition {
  /** X coordinate in pixels (0-2400) */
  x: number;
  /** Y coordinate in pixels (0-2400) */
  y: number;
}

/**
 * Definition of a single step in a workflow.
 * Steps are executed nodes that perform actions like running agent tasks, scripts, or API calls.
 */
export interface WorkflowStep {
  /** Unique identifier for the step */
  id: string;
  /** Type of step (agent_task, script, condition, http_request, delay) */
  type: WorkflowStepType;
  /** Display name for the step */
  name: string;
  /** Optional description for documentation */
  description?: string;
  /** Position on the visual canvas */
  position: WorkflowStepPosition;

  /** ID of the agent to execute this step (for agent_task type) */
  agentId?: string;
  /** Maximum execution time in seconds before timeout (1-3600) */
  timeoutSeconds?: number;
  /** Number of retry attempts on failure (0-5) */
  retries?: number;
  /** ID of fallback step to execute if this step fails */
  fallbackStepId?: string;

  /** Variable bindings mapping input fields to workflow variables or step outputs */
  bindings?: Record<string, string>;
}

/**
 * Connection between two workflow steps, defining execution order or data flow.
 */
export interface WorkflowEdge {
  /** Unique identifier for the edge */
  id: string;
  /** ID of the source step */
  fromStepId: string;
  /** ID of the target step (depends on source) */
  toStepId: string;
  /** Type of connection (dependency or data) */
  kind: WorkflowEdgeKind;
}

/**
 * Complete definition of a workflow including steps, dependencies, and variables.
 * This is the main structure persisted and executed by the workflow engine.
 */
export interface WorkflowDefinition {
  /** Schema version for forward compatibility (currently 1) */
  schemaVersion: 1;
  /** Array of workflow steps */
  steps: WorkflowStep[];
  /** Array of edges (dependencies) between steps */
  edges: WorkflowEdge[];
  /** Optional workflow-level variables/parameters */
  variables?: WorkflowVariable[];
}

/**
 * Lightweight workflow summary for list views.
 * Contains metadata without the full step/edge definition.
 */
export interface WorkflowSummary {
  /** Unique workflow identifier */
  id: string;
  /** Workflow name */
  name: string;
  /** Optional description */
  description?: string;
  /** ISO 8601 creation timestamp */
  createdAt?: string;
  /** ISO 8601 last update timestamp */
  updatedAt?: string;
  /** Lightweight definition (may omit steps/edges for performance) */
  definition?: WorkflowDefinition;
}

/**
 * Complete workflow with full definition.
 * Extends WorkflowSummary to include complete step and edge data.
 */
export interface Workflow extends WorkflowSummary {
  /** Full workflow definition with all steps and edges */
  definition: WorkflowDefinition;
}

/**
 * Pre-defined workflow template for common patterns.
 * Templates serve as starting points for creating new workflows.
 */
export interface WorkflowTemplate {
  /** Unique template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Description of the template's purpose */
  description?: string;
  /** Pre-configured workflow definition */
  definition: WorkflowDefinition;
}

/**
 * Severity level for validation issues.
 */
export type WorkflowValidationSeverity = "error" | "warning";

/**
 * Single validation issue found during workflow validation.
 * Issues can be workflow-level or specific to steps/edges.
 */
export interface WorkflowValidationIssue {
  /** Human-readable error/warning message */
  message: string;
  /** Severity level (error prevents execution, warning is advisory) */
  severity: WorkflowValidationSeverity;
  /** Machine-readable error code */
  code?: string;
  /** JSON path to the problematic field */
  path?: string;
  /** ID of the step with the issue (if step-specific) */
  stepId?: string;
  /** ID of the edge with the issue (if edge-specific) */
  edgeId?: string;
}

/**
 * Result of workflow definition validation.
 * Contains validation status and list of issues found.
 */
export interface WorkflowValidationResult {
  /** True if workflow is valid and can be executed */
  valid: boolean;
  /** List of validation issues (empty if valid) */
  issues: WorkflowValidationIssue[];
}

/**
 * Request payload for creating or updating a workflow.
 * Used in POST /workflows and PUT /workflows/{id} endpoints.
 */
export interface WorkflowUpsertRequest {
  /** Workflow name (required) */
  name: string;
  /** Optional workflow description */
  description?: string;
  /** Complete workflow definition */
  definition: WorkflowDefinition;
}

/**
 * Overall status of a workflow execution.
 */
export type WorkflowExecutionStatus =
  | "pending"    // Execution queued but not started
  | "running"    // Execution in progress
  | "completed"  // Execution finished successfully
  | "failed"     // Execution failed (one or more steps failed)
  | "cancelled"; // Execution was cancelled by user

/**
 * Status of an individual step within a workflow execution.
 */
export type StepExecutionStatus =
  | "pending"    // Step not yet started
  | "running"    // Step currently executing
  | "completed"  // Step finished successfully
  | "failed"     // Step failed (after all retries)
  | "skipped"    // Step was skipped (conditional branching)
  | "retrying";  // Step failed and is retrying

/**
 * Execution state of a single workflow step.
 * Tracks timing, status, retries, and outputs for monitoring and debugging.
 */
export interface StepExecution {
  /** ID of the step from the workflow definition */
  stepId: string;
  /** Display name of the step */
  stepName: string;
  /** Current execution status */
  status: StepExecutionStatus;
  /** Unix timestamp (ms) when step started */
  startedAt?: number;
  /** Unix timestamp (ms) when step completed/failed */
  completedAt?: number;
  /** Total execution duration in milliseconds */
  durationMs?: number;
  /** Number of retry attempts (0 means first attempt succeeded) */
  retryCount?: number;
  /** Error message if step failed */
  error?: string;
  /** ID of agent that executed this step (for agent_task steps) */
  agentId?: string;
  /** Output data produced by the step */
  outputs?: Record<string, unknown>;
}

/**
 * Complete workflow execution with all step states and metadata.
 * Represents a single run of a workflow definition.
 */
export interface WorkflowExecution {
  /** Unique execution identifier */
  id: string;
  /** ID of the workflow definition that was executed */
  workflowId: string;
  /** Overall execution status */
  status: WorkflowExecutionStatus;
  /** Unix timestamp (ms) when execution started */
  startedAt: number;
  /** Unix timestamp (ms) when execution completed/failed */
  completedAt?: number;
  /** Total execution duration in milliseconds */
  durationMs?: number;
  /** State of each step in the execution */
  steps: StepExecution[];
  /** User/system that triggered the execution */
  triggerredBy?: string;
  /** Variables passed to the workflow at execution time */
  variables?: Record<string, unknown>;
  /** Error message if execution failed */
  error?: string;
}

/**
 * Performance metrics for a workflow execution.
 * Calculated from execution data for monitoring and optimization.
 */
export interface ExecutionMetrics {
  /** Total execution duration in milliseconds */
  totalDuration: number;
  /** Success rate as decimal (0.0 - 1.0) */
  successRate: number;
  /** Total number of steps in the workflow */
  totalSteps: number;
  /** Number of steps that completed successfully */
  completedSteps: number;
  /** Number of steps that failed */
  failedSteps: number;
  /** Total number of retry attempts across all steps */
  retryCount: number;
  /** Time spent per agent (agentId -> milliseconds) */
  agentUtilization: Record<string, number>;
}

/**
 * Type of WebSocket event for workflow execution updates.
 */
export type WorkflowEventType =
  | "workflow_execution_started"    // Execution begins
  | "workflow_step_started"          // Step starts
  | "workflow_step_completed"        // Step completes successfully
  | "workflow_step_failed"           // Step fails
  | "workflow_step_retrying"         // Step is retrying after failure
  | "workflow_execution_completed"   // Execution completes successfully
  | "workflow_execution_failed"      // Execution fails
  | "workflow_log_entry";            // New log entry

/**
 * WebSocket event for real-time workflow execution updates.
 * Pushed from backend to frontend during execution.
 */
export interface WorkflowEvent {
  /** Type of event */
  type: WorkflowEventType;
  /** ID of the execution this event belongs to */
  executionId: string;
  /** ID of the step (for step-specific events) */
  stepId?: string;
  /** Unix timestamp (ms) when event occurred */
  timestamp: number;
  /** Additional event-specific data */
  data?: Record<string, unknown>;
}
