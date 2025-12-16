# Workflow API Integration Guide

## Overview

This document describes the frontend API integration for MGX Dashboard workflow features. It covers REST endpoints, WebSocket event handling, SWR hooks, error handling patterns, and caching strategies.

## Table of Contents

- [REST API Endpoints](#rest-api-endpoints)
- [WebSocket Events](#websocket-events)
- [Frontend Hooks](#frontend-hooks)
- [Error Handling](#error-handling)
- [Caching with SWR](#caching-with-swr)
- [Real-time Synchronization](#real-time-synchronization)
- [Example Integrations](#example-integrations)

---

## REST API Endpoints

All endpoints support workspace and project scoping via:
- Query params: `?workspace_id=xxx&project_id=yyy`
- Headers: `X-Workspace-Id` and `X-Project-Id`

### Base Configuration

```typescript
import { MGX_API_BASE_URL } from "@/lib/mgx/env";

const API_BASE = 
  process.env.NEXT_PUBLIC_MGX_API_BASE_URL ?? 
  "http://localhost:8000";

interface ApiRequestOptions {
  workspaceId?: string;
  projectId?: string;
  headers?: Record<string, string>;
}
```

---

### Workflow Management

#### GET /workflows
List all workflows in the current project.

**Request:**
```typescript
import { fetchWorkflows } from "@/lib/api";

const workflows = await fetchWorkflows({
  workspaceId: "ws_123",
  projectId: "proj_456"
});
```

**Response:**
```typescript
type WorkflowSummary = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  definition?: WorkflowDefinition; // Lightweight version
}[];
```

---

#### GET /workflows/{workflowId}
Fetch a single workflow with full definition.

**Request:**
```typescript
import { fetchWorkflow } from "@/lib/api";

const workflow = await fetchWorkflow("wf_789", {
  workspaceId: "ws_123",
  projectId: "proj_456"
});
```

**Response:**
```typescript
type Workflow = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  definition: WorkflowDefinition;
};

type WorkflowDefinition = {
  schemaVersion: 1;
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  variables?: WorkflowVariable[];
};
```

---

#### GET /workflows/templates
Fetch available workflow templates.

**Request:**
```typescript
import { fetchWorkflowTemplates } from "@/lib/api";

const templates = await fetchWorkflowTemplates({
  workspaceId: "ws_123",
  projectId: "proj_456"
});
```

**Response:**
```typescript
type WorkflowTemplate = {
  id: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
}[];
```

---

#### POST /workflows/validate
Validate a workflow definition before saving.

**Request:**
```typescript
import { validateWorkflowDefinition } from "@/lib/api";

const result = await validateWorkflowDefinition(
  {
    schemaVersion: 1,
    steps: [...],
    edges: [...],
    variables: [...]
  },
  {
    workspaceId: "ws_123",
    projectId: "proj_456"
  }
);
```

**Response:**
```typescript
type WorkflowValidationResult = {
  valid: boolean;
  issues: WorkflowValidationIssue[];
};

type WorkflowValidationIssue = {
  message: string;
  severity: "error" | "warning";
  code?: string;
  path?: string;
  stepId?: string;
  edgeId?: string;
};
```

---

#### POST /workflows
Create a new workflow.

**Request:**
```typescript
import { createWorkflow } from "@/lib/api";

const workflow = await createWorkflow(
  {
    name: "My Workflow",
    description: "Workflow description",
    definition: {
      schemaVersion: 1,
      steps: [...],
      edges: [...],
      variables: [...]
    }
  },
  {
    workspaceId: "ws_123",
    projectId: "proj_456"
  }
);
```

**Response:** `Workflow` (see GET /workflows/{id})

---

#### PUT /workflows/{workflowId}
Update an existing workflow.

**Request:**
```typescript
import { updateWorkflow } from "@/lib/api";

const workflow = await updateWorkflow(
  "wf_789",
  {
    name: "Updated Workflow Name",
    description: "New description",
    definition: {...}
  },
  {
    workspaceId: "ws_123",
    projectId: "proj_456"
  }
);
```

**Response:** `Workflow` (see GET /workflows/{id})

---

### Workflow Execution

#### GET /workflows/{workflowId}/executions
List executions for a workflow.

**Request:**
```typescript
import { fetchWorkflowExecutions } from "@/lib/api";

const executions = await fetchWorkflowExecutions(
  "wf_789",
  50,    // limit
  0,     // offset
  {
    workspaceId: "ws_123",
    projectId: "proj_456"
  }
);
```

**Query Parameters:**
- `limit` (number): Max executions to return (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Response:**
```typescript
type WorkflowExecution = {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  startedAt: number;          // Unix timestamp (ms)
  completedAt?: number;       // Unix timestamp (ms)
  durationMs?: number;
  steps: StepExecution[];
  triggerredBy?: string;
  variables?: Record<string, unknown>;
  error?: string;
}[];

type WorkflowExecutionStatus = 
  | "pending" | "running" | "completed" | "failed" | "cancelled";
```

---

#### GET /executions/{executionId}
Fetch a single execution with full details.

**Request:**
```typescript
import { fetchWorkflowExecution } from "@/lib/api";

const execution = await fetchWorkflowExecution("exec_123", {
  workspaceId: "ws_123",
  projectId: "proj_456"
});
```

**Response:** `WorkflowExecution` (see above)

---

#### POST /workflows/{workflowId}/executions
Trigger a new workflow execution.

**Request:**
```typescript
import { triggerWorkflowExecution } from "@/lib/api";

const execution = await triggerWorkflowExecution(
  "wf_789",
  {
    userEmail: "user@example.com",
    retryLimit: 3
  },
  {
    workspaceId: "ws_123",
    projectId: "proj_456"
  }
);
```

**Body:**
```json
{
  "variables": {
    "variableName": "value",
    ...
  }
}
```

**Response:** `WorkflowExecution` (see above)

---

#### GET /executions/{executionId}/logs
Fetch execution logs (all steps or specific step).

**Request:**
```typescript
import { fetchExecutionLogs } from "@/lib/api";

// All execution logs
const logs = await fetchExecutionLogs("exec_123", undefined, 100, 0, {
  workspaceId: "ws_123",
  projectId: "proj_456"
});

// Step-specific logs
const stepLogs = await fetchExecutionLogs("exec_123", "step_abc", 100, 0, {
  workspaceId: "ws_123",
  projectId: "proj_456"
});
```

**Query Parameters:**
- `limit` (number): Max log entries (default: 100)
- `offset` (number): Pagination offset (default: 0)

**Response:**
```typescript
type ExecutionLog = string[]; // Array of log lines
```

---

#### GET /executions/{executionId}/metrics
Fetch execution performance metrics.

**Request:**
```typescript
import { fetchExecutionMetrics } from "@/lib/api";

const metrics = await fetchExecutionMetrics("exec_123", {
  workspaceId: "ws_123",
  projectId: "proj_456"
});
```

**Response:**
```typescript
type ExecutionMetrics = {
  totalDuration: number;           // ms
  successRate: number;             // 0.0 - 1.0
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  retryCount: number;
  agentUtilization: Record<string, number>; // agentId -> time (ms)
};
```

---

## WebSocket Events

### Connection

WebSocket connections are scoped to workspace and project:

```typescript
import { useWebSocket } from "@/hooks/useWebSocket";

const { subscribe, unsubscribe, isConnected } = useWebSocket();

const subscription = subscribe({
  workflowId: "wf_789",
  executionId: "exec_123",
  topics: ["workflow_events"]
});
```

**WebSocket URL:**
```
ws://api/workspaces/{workspaceId}/projects/{projectId}/workflows/{workflowId}/stream
```

---

### Event Types

#### workflow_execution_started
Workflow execution begins.

```typescript
{
  type: "workflow_execution_started",
  executionId: "exec_123",
  timestamp: 1702742400000,
  data: {
    workflowId: "wf_789",
    variables: {...}
  }
}
```

---

#### workflow_step_started
A workflow step begins execution.

```typescript
{
  type: "workflow_step_started",
  executionId: "exec_123",
  stepId: "step_abc",
  timestamp: 1702742401000,
  data: {
    stepName: "Fetch Data",
    agentId: "agent_xyz"
  }
}
```

---

#### workflow_step_completed
A workflow step completes successfully.

```typescript
{
  type: "workflow_step_completed",
  executionId: "exec_123",
  stepId: "step_abc",
  timestamp: 1702742403000,
  data: {
    durationMs: 2000,
    outputs: {...}
  }
}
```

---

#### workflow_step_failed
A workflow step fails.

```typescript
{
  type: "workflow_step_failed",
  executionId: "exec_123",
  stepId: "step_abc",
  timestamp: 1702742403000,
  data: {
    error: "Connection timeout",
    retryCount: 0
  }
}
```

---

#### workflow_step_retrying
A workflow step is retrying after failure.

```typescript
{
  type: "workflow_step_retrying",
  executionId: "exec_123",
  stepId: "step_abc",
  timestamp: 1702742405000,
  data: {
    retryCount: 1,
    maxRetries: 3
  }
}
```

---

#### workflow_execution_completed
Workflow execution completes successfully.

```typescript
{
  type: "workflow_execution_completed",
  executionId: "exec_123",
  timestamp: 1702742410000,
  data: {
    durationMs: 10000,
    completedSteps: 5,
    totalSteps: 5
  }
}
```

---

#### workflow_execution_failed
Workflow execution fails.

```typescript
{
  type: "workflow_execution_failed",
  executionId: "exec_123",
  timestamp: 1702742408000,
  data: {
    error: "Step 'Process Data' failed after 3 retries",
    failedStepId: "step_def"
  }
}
```

---

#### workflow_log_entry
New log entry from execution.

```typescript
{
  type: "workflow_log_entry",
  executionId: "exec_123",
  stepId: "step_abc", // optional
  timestamp: 1702742402000,
  data: {
    level: "INFO",
    message: "Fetching data from API..."
  }
}
```

---

## Frontend Hooks

### useWorkflows

Fetch workflow list with SWR caching.

```typescript
import { useWorkflows } from "@/hooks/useWorkflows";

function WorkflowListPage() {
  const { workflows, isLoading, isError, error, mutate } = useWorkflows();

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return (
    <ul>
      {workflows?.map(wf => (
        <li key={wf.id}>{wf.name}</li>
      ))}
    </ul>
  );
}
```

**Features:**
- Auto-caching per workspace/project
- Revalidates on focus
- Deduplication (5s interval)

---

### useWorkflow

Fetch a single workflow.

```typescript
import { useWorkflow } from "@/hooks/useWorkflows";

function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const { workflow, isLoading, isError, error, mutate } = useWorkflow(workflowId);

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return <WorkflowBuilder initialWorkflow={workflow} />;
}
```

**Features:**
- No auto-revalidation on focus (static data)
- Revalidates on reconnect

---

### useWorkflowTemplates

Fetch available templates.

```typescript
import { useWorkflowTemplates } from "@/hooks/useWorkflows";

function TemplatePicker() {
  const { templates, isLoading, isError, error, mutate } = useWorkflowTemplates();

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return (
    <select>
      {templates?.map(t => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );
}
```

**Features:**
- Long cache duration (60s deduplication)
- Infrequent updates

---

### useWorkflowExecutions

Fetch execution list for a workflow.

```typescript
import { useWorkflowExecutions } from "@/hooks/useWorkflowExecutions";

function ExecutionListPage({ workflowId }: { workflowId: string }) {
  const { executions, isLoading, isError, error, mutate } = 
    useWorkflowExecutions(workflowId);

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return (
    <table>
      {executions?.map(exec => (
        <tr key={exec.id}>
          <td>{exec.id}</td>
          <td>{exec.status}</td>
        </tr>
      ))}
    </table>
  );
}
```

**Features:**
- No auto-revalidation on focus
- Manual refresh with `mutate()`

---

### useWorkflowExecution

Fetch a single execution with live updates.

```typescript
import { useWorkflowExecution } from "@/hooks/useWorkflowExecutions";

function ExecutionTimeline({ executionId }: { executionId: string }) {
  const { execution, isLoading, isError, error, mutate } = 
    useWorkflowExecution(executionId);

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return <WorkflowTimeline execution={execution} />;
}
```

**Features:**
- **Auto-refresh**: 1 second interval
- Real-time updates for running executions
- Stops refreshing when execution completes

---

### useExecutionMetrics

Fetch execution metrics with live updates.

```typescript
import { useExecutionMetrics } from "@/hooks/useWorkflowExecutions";

function MetricsDashboard({ executionId }: { executionId: string }) {
  const { metrics, isLoading, isError, error, mutate } = 
    useExecutionMetrics(executionId);

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return <ExecutionMetricsCards metrics={metrics} />;
}
```

**Features:**
- **Auto-refresh**: 1 second interval
- Live metrics during execution

---

## Error Handling

### API Error Handling Pattern

```typescript
import { toast } from "sonner";

async function handleWorkflowSave() {
  try {
    const workflow = await createWorkflow(payload, options);
    toast.success("Workflow saved successfully");
    onSuccess(workflow);
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : "Failed to save workflow";
    toast.error(message);
    console.error("Workflow save error:", error);
  }
}
```

---

### Validation Error Handling

```typescript
const result = await validateWorkflowDefinition(definition, options);

if (!result.valid) {
  const errorCount = result.issues.filter(i => i.severity === "error").length;
  const warningCount = result.issues.filter(i => i.severity === "warning").length;
  
  toast.error(`${errorCount} errors, ${warningCount} warnings`);
  
  // Display issues by step
  const issuesByStep = groupBy(result.issues, "stepId");
  setValidationIssues(issuesByStep);
}
```

---

### WebSocket Error Handling

```typescript
const { subscribe, isConnected } = useWebSocket();

useEffect(() => {
  if (!isConnected) {
    toast.warning("Connection lost. Reconnecting...");
  } else {
    toast.success("Connected");
  }
}, [isConnected]);
```

---

## Caching with SWR

### Cache Key Structure

SWR uses cache keys to deduplicate requests:

```typescript
// Workflow list cache key
["/workflows", { workspaceId: "ws_123", projectId: "proj_456" }]

// Single workflow cache key
["/workflows/wf_789", { workspaceId: "ws_123", projectId: "proj_456" }]

// Execution cache key
["/executions/exec_123", { workspaceId: "ws_123", projectId: "proj_456" }]
```

---

### Manual Cache Invalidation

```typescript
import { mutate } from "swr";

// Invalidate specific workflow
mutate(["/workflows/wf_789", apiOptions]);

// Invalidate all workflows
mutate((key) => Array.isArray(key) && key[0] === "/workflows");

// Invalidate execution list after triggering
await triggerWorkflowExecution(workflowId, variables, apiOptions);
mutate([`/workflows/${workflowId}/executions`, apiOptions]);
```

---

### Optimistic Updates

```typescript
import { mutate } from "swr";

async function deleteWorkflow(workflowId: string) {
  const cacheKey = ["/workflows", apiOptions];
  
  // Optimistic update
  mutate(
    cacheKey,
    (workflows) => workflows?.filter(wf => wf.id !== workflowId),
    false // Don't revalidate yet
  );
  
  try {
    await deleteWorkflowApi(workflowId, apiOptions);
    // Confirm deletion
    mutate(cacheKey);
  } catch (error) {
    // Rollback on error
    mutate(cacheKey);
    toast.error("Failed to delete workflow");
  }
}
```

---

## Real-time Synchronization

### Execution State Sync

Combine SWR polling + WebSocket events for redundancy:

```typescript
import { useWorkflowExecution } from "@/hooks/useWorkflowExecutions";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";

function ExecutionMonitor({ executionId }: { executionId: string }) {
  const { execution, mutate } = useWorkflowExecution(executionId);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const subscription = subscribe({
      executionId,
      topics: ["workflow_events"]
    });

    const handleEvent = (event: WorkflowEvent) => {
      if (event.executionId === executionId) {
        // Trigger immediate refresh
        mutate();
      }
    };

    // Listen to all workflow event types
    window.addEventListener("workflow_event", handleEvent);

    return () => {
      window.removeEventListener("workflow_event", handleEvent);
      unsubscribe(subscription);
    };
  }, [executionId, subscribe, mutate]);

  return <WorkflowTimeline execution={execution} />;
}
```

---

### Step Status Updates

```typescript
const handleStepUpdate = useCallback((event: WorkflowEvent) => {
  if (event.type === "workflow_step_completed") {
    toast.success(`Step ${event.data?.stepName} completed`);
    mutate(); // Refresh execution data
  }
  
  if (event.type === "workflow_step_failed") {
    toast.error(`Step ${event.data?.stepName} failed`);
    mutate();
  }
  
  if (event.type === "workflow_step_retrying") {
    toast.warning(`Step ${event.data?.stepName} retrying...`);
    mutate();
  }
}, [mutate]);
```

---

## Example Integrations

### Example 1: Workflow Builder Integration

```typescript
import { WorkflowBuilder } from "@/components/mgx/workflow-builder";
import { useWorkflow } from "@/hooks/useWorkflows";
import { useRouter } from "next/navigation";

export default function WorkflowBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { workflow, isLoading } = useWorkflow(params.id);

  if (isLoading) return <Spinner />;

  return (
    <WorkflowBuilder
      workflowId={params.id}
      initialWorkflow={workflow}
      onSaved={(saved) => {
        router.push(`/mgx/workflows/${saved.id}`);
      }}
    />
  );
}
```

---

### Example 2: Execution Trigger with Toast

```typescript
import { triggerWorkflowExecution } from "@/lib/api";
import { toast } from "sonner";

async function handleTrigger(workflowId: string, variables: Record<string, unknown>) {
  const toastId = toast.loading("Triggering workflow...");
  
  try {
    const execution = await triggerWorkflowExecution(workflowId, variables, {
      workspaceId: currentWorkspace.id,
      projectId: currentProject.id
    });
    
    toast.success("Workflow started", { id: toastId });
    router.push(`/mgx/workflows/${workflowId}/executions/${execution.id}`);
  } catch (error) {
    toast.error("Failed to trigger workflow", { id: toastId });
  }
}
```

---

### Example 3: Live Metrics Dashboard

```typescript
import { useExecutionMetrics } from "@/hooks/useWorkflowExecutions";
import { ExecutionMetricsCards } from "@/components/mgx/execution-metrics-cards";

function MetricsDashboard({ executionId }: { executionId: string }) {
  const { metrics, isLoading } = useExecutionMetrics(executionId);

  return <ExecutionMetricsCards metrics={metrics} isLoading={isLoading} />;
}
```

Metrics auto-refresh every 1 second during execution.

---

## Testing API Integration

### Mock API Responses

```typescript
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/workflows", (req, res, ctx) => {
    return res(ctx.json([
      { id: "wf_1", name: "Workflow 1" },
      { id: "wf_2", name: "Workflow 2" }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

### Mock SWR Hooks

```typescript
import { SWRConfig } from "swr";

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
}
```

---

## Best Practices

1. **Always use ApiRequestOptions**: Ensure workspace/project scoping
2. **Handle loading states**: Show spinners during API calls
3. **Display error messages**: Use toast notifications for user feedback
4. **Invalidate caches**: After mutations, invalidate related cache keys
5. **Use WebSocket + polling**: Redundancy for critical real-time updates
6. **Debounce validations**: Don't validate on every keystroke
7. **Optimistic updates**: For better UX, update UI before API response
8. **Log errors**: Always log to console for debugging

---

## Related Documentation

- [Workflow Builder Guide](./WORKFLOW_BUILDER.md) - User guide for workflow builder
- [Workflow Timeline Guide](./WORKFLOW_TIMELINE.md) - User guide for execution monitor
- [Component Reference](./COMPONENTS.md) - UI component documentation
