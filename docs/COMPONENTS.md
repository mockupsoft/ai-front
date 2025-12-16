# MGX Dashboard Component Library

## Overview

This document provides a comprehensive reference for all workflow-related components in the MGX Dashboard, including props documentation, usage examples, and test patterns.

## Table of Contents

- [Workflow Builder Components](#workflow-builder-components)
- [Workflow Timeline Components](#workflow-timeline-components)
- [Common UI Components](#common-ui-components)
- [Usage Patterns](#usage-patterns)
- [Testing Components](#testing-components)

---

## Workflow Builder Components

### WorkflowBuilder

Main container component for the visual workflow editor.

#### Props

```typescript
interface WorkflowBuilderProps {
  workflowId?: string;                // Existing workflow ID (for editing)
  initialWorkflow?: Workflow;         // Pre-loaded workflow data
  initialDefinition?: WorkflowDefinition; // Initial definition (new workflow)
  initialName?: string;               // Initial workflow name
  initialDescription?: string;        // Initial workflow description
  onSaved?: (workflow: Workflow) => void; // Callback after successful save
}
```

#### Usage

```typescript
import { WorkflowBuilder } from "@/components/mgx/workflow-builder";

function WorkflowBuilderPage() {
  return (
    <WorkflowBuilder
      workflowId="wf_123"
      onSaved={(workflow) => {
        console.log("Workflow saved:", workflow);
        router.push(`/mgx/workflows/${workflow.id}`);
      }}
    />
  );
}
```

#### Features

- Visual drag-and-drop canvas
- Step palette for adding nodes
- Step configuration panel
- Variable editor (JSON format)
- Validation with error display
- Save/update workflow

---

### WorkflowCanvas

Interactive canvas for drag-and-drop workflow composition.

#### Props

```typescript
interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  selectedStepId?: string;
  linkingFromStepId?: string | null;
  issuesByStepId?: Record<string, number>;
  
  view: WorkflowCanvasView;
  onChangeView: (view: WorkflowCanvasView) => void;
  
  onSelectStep: (stepId: string | undefined) => void;
  onMoveStep: (stepId: string, position: WorkflowStepPosition) => void;
  onDropNewStep: (type: WorkflowStepType, position: WorkflowStepPosition) => void;
  onCreateEdge: (fromStepId: string, toStepId: string) => void;
}

type WorkflowCanvasView = {
  x: number;      // Pan X offset
  y: number;      // Pan Y offset
  zoom: number;   // Zoom level (0.4 - 2.5)
};
```

#### Usage

```typescript
import { WorkflowCanvas } from "@/components/mgx/workflow-canvas";

function CanvasExample() {
  const [view, setView] = useState({ x: 40, y: 40, zoom: 1 });
  const [selectedStepId, setSelectedStepId] = useState<string>();

  return (
    <WorkflowCanvas
      steps={definition.steps}
      edges={definition.edges}
      selectedStepId={selectedStepId}
      view={view}
      onChangeView={setView}
      onSelectStep={setSelectedStepId}
      onMoveStep={(stepId, position) => {
        updateStep(stepId, { position });
      }}
      onDropNewStep={(type, position) => {
        addStep(type, position);
      }}
      onCreateEdge={(from, to) => {
        addEdge(from, to);
      }}
    />
  );
}
```

#### Features

- **Pan**: Click and drag empty space
- **Zoom**: Mouse wheel (40% - 250%)
- **Select**: Click step nodes
- **Move**: Drag step nodes
- **Link**: Click source, then target to create edge
- **Drop**: Drag step type from palette

#### Canvas Size

- Default: 2400x2400px
- Node size: 200x72px
- Grid: 22x22px dots

---

### WorkflowStepPalette

Palette of available step types for dragging onto the canvas.

#### Props

```typescript
interface WorkflowStepPaletteProps {
  onAddStep: (type: WorkflowStepType) => void;
}
```

#### Usage

```typescript
import { WorkflowStepPalette } from "@/components/mgx/workflow-step-palette";

function PaletteExample() {
  return (
    <WorkflowStepPalette
      onAddStep={(type) => {
        console.log("Adding step:", type);
        addStep(type);
      }}
    />
  );
}
```

#### Step Types

- `agent_task`: Execute task with AI agent
- `script`: Run custom script
- `condition`: Conditional branching
- `http_request`: Make HTTP API call
- `delay`: Wait for duration

---

### WorkflowStepPanel

Configuration panel for editing step properties.

#### Props

```typescript
interface WorkflowStepPanelProps {
  step?: WorkflowStep;
  allSteps: WorkflowStep[];
  agentDefinitions?: AgentDefinition[];
  issues?: WorkflowValidationIssue[];
  linkingFromStepId: string | null;
  
  onStartLinking: (stepId: string) => void;
  onCancelLinking: () => void;
  onUpdateStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
  onDeleteStep: (stepId: string) => void;
}
```

#### Usage

```typescript
import { WorkflowStepPanel } from "@/components/mgx/workflow-step-panel";

function StepPanelExample() {
  return (
    <WorkflowStepPanel
      step={selectedStep}
      allSteps={definition.steps}
      agentDefinitions={agents}
      issues={validationIssues}
      linkingFromStepId={linkingFromId}
      onStartLinking={(id) => setLinkingFromId(id)}
      onCancelLinking={() => setLinkingFromId(null)}
      onUpdateStep={(id, updates) => updateStep(id, updates)}
      onDeleteStep={(id) => deleteStep(id)}
    />
  );
}
```

#### Features

- Step name and description editor
- Agent selector (for agent_task steps)
- Timeout and retry configuration
- Fallback step selector
- Variable bindings editor (JSON)
- Link/unlink dependency buttons
- Delete step button
- Validation issues display

---

### WorkflowTemplatePicker

Template selector for creating workflows from pre-defined templates.

#### Props

```typescript
interface WorkflowTemplatePickerProps {
  templates?: WorkflowTemplate[];
  onSelect: (template: WorkflowTemplate) => void;
  isLoading?: boolean;
}
```

#### Usage

```typescript
import { WorkflowTemplatePicker } from "@/components/mgx/workflow-template-picker";

function TemplatePickerExample() {
  const { templates, isLoading } = useWorkflowTemplates();

  return (
    <WorkflowTemplatePicker
      templates={templates}
      isLoading={isLoading}
      onSelect={(template) => {
        console.log("Selected template:", template);
        loadTemplate(template);
      }}
    />
  );
}
```

---

## Workflow Timeline Components

### WorkflowTimeline

Gantt-style timeline visualization for workflow executions.

#### Props

```typescript
interface WorkflowTimelineProps {
  execution: WorkflowExecution;
  onSelectStep?: (stepId: string) => void;
}
```

#### Usage

```typescript
import { WorkflowTimeline } from "@/components/mgx/workflow-timeline";

function TimelineExample() {
  const { execution } = useWorkflowExecution(executionId);

  return (
    <WorkflowTimeline
      execution={execution}
      onSelectStep={(stepId) => {
        console.log("Selected step:", stepId);
        setSelectedStepId(stepId);
      }}
    />
  );
}
```

#### Features

- **Gantt bars**: Proportional to step duration
- **Status colors**: Green (completed), red (failed), blue (running), amber (retrying)
- **Retry indicators**: Badge and markers
- **Expandable details**: Click to expand step outputs/errors
- **Agent display**: Shows assigned agent ID
- **Error messages**: Inline error display for failed steps

#### Visual Structure

```
┌──────────────────────────────────────┐
│  Step Name            [Agent Icon]   │
│  ████████████░░░░░░   (70%)          │
│  2.5s / 3.0s          🔄 2           │
└──────────────────────────────────────┘
```

---

### WorkflowExecutionList

Sortable table of workflow executions.

#### Props

```typescript
interface WorkflowExecutionListProps {
  executions: WorkflowExecution[];
  onSelectExecution?: (executionId: string) => void;
  isLoading?: boolean;
}
```

#### Usage

```typescript
import { WorkflowExecutionList } from "@/components/mgx/workflow-execution-list";

function ExecutionListExample() {
  const { executions, isLoading } = useWorkflowExecutions(workflowId);

  return (
    <WorkflowExecutionList
      executions={executions}
      isLoading={isLoading}
      onSelectExecution={(id) => {
        router.push(`/mgx/workflows/${workflowId}/executions/${id}`);
      }}
    />
  );
}
```

#### Features

- Sortable columns (start time, duration, status)
- Status pills (completed, failed, running, pending)
- Duration formatting
- Step completion ratio
- Links to detail pages

---

### ExecutionMetricsCards

4-card grid displaying execution performance metrics.

#### Props

```typescript
interface ExecutionMetricsCardsProps {
  metrics?: ExecutionMetrics;
  isLoading?: boolean;
}
```

#### Usage

```typescript
import { ExecutionMetricsCards } from "@/components/mgx/execution-metrics-cards";

function MetricsExample() {
  const { metrics, isLoading } = useExecutionMetrics(executionId);

  return <ExecutionMetricsCards metrics={metrics} isLoading={isLoading} />;
}
```

#### Metrics Displayed

1. **Total Duration**: `Xm Ys` or `Xs`
2. **Success Rate**: `X%` (percentage of steps completed)
3. **Steps Completed**: `X / Y` (fraction)
4. **Retries**: Total retry count

#### Formatting

```typescript
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}
```

---

### ExecutionLogPanel

Live streaming log panel with auto-scroll.

#### Props

```typescript
interface ExecutionLogPanelProps {
  executionId: string;
  stepId?: string;
  autoScroll?: boolean;
}
```

#### Usage

```typescript
import { ExecutionLogPanel } from "@/components/mgx/execution-log-panel";

function LogPanelExample() {
  const [selectedStepId, setSelectedStepId] = useState<string>();

  return (
    <ExecutionLogPanel
      executionId="exec_123"
      stepId={selectedStepId}
      autoScroll={true}
    />
  );
}
```

#### Features

- **Live updates**: 500ms refresh interval
- **Auto-scroll**: Scroll to newest logs automatically
- **Monospace font**: Preserves formatting
- **Step filtering**: Show logs for specific step or all steps
- **Max height**: Scrollable container (max 400px)

---

## Common UI Components

### StatusPill

Status indicator pill with color-coded variants.

#### Props

```typescript
interface StatusPillProps {
  variant: "success" | "danger" | "warning" | "info" | "default";
  children: React.ReactNode;
}
```

#### Usage

```typescript
import { StatusPill } from "@/components/mgx/ui/status-pill";

function StatusExample() {
  return (
    <>
      <StatusPill variant="success">Completed</StatusPill>
      <StatusPill variant="danger">Failed</StatusPill>
      <StatusPill variant="warning">Retrying</StatusPill>
      <StatusPill variant="info">Pending</StatusPill>
    </>
  );
}
```

#### Variants

- **success**: Green (completed, valid)
- **danger**: Red (failed, error, invalid)
- **warning**: Amber (retrying, caution)
- **info**: Blue (pending, info, not validated)
- **default**: Gray (default)

---

### Button

Button component with multiple variants and sizes.

#### Props

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: React.ReactNode;
}
```

#### Usage

```typescript
import { Button } from "@/components/mgx/ui/button";

function ButtonExample() {
  return (
    <>
      <Button variant="primary" onClick={handleSave}>
        Save
      </Button>
      <Button variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  );
}
```

---

### Card

Card container for grouped content.

#### Props

```typescript
interface CardProps {
  children: React.ReactNode;
}

interface CardHeaderProps {
  children: React.ReactNode;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}
```

#### Usage

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/mgx/ui/card";

function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  );
}
```

---

### Spinner

Loading spinner with customizable size.

#### Props

```typescript
interface SpinnerProps {
  className?: string; // For custom sizing
}
```

#### Usage

```typescript
import { Spinner } from "@/components/mgx/ui/spinner";

function LoadingExample() {
  return (
    <div>
      <Spinner className="h-5 w-5" />
      <span>Loading...</span>
    </div>
  );
}
```

---

## Usage Patterns

### Pattern 1: Full Workflow Builder Integration

```typescript
import { WorkflowBuilder } from "@/components/mgx/workflow-builder";
import { useWorkflow } from "@/hooks/useWorkflows";
import { useRouter } from "next/navigation";

export default function WorkflowBuilderPage({ 
  params 
}: { 
  params: { id: string } 
}) {
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

### Pattern 2: Timeline Monitor with Metrics

```typescript
import { WorkflowTimeline } from "@/components/mgx/workflow-timeline";
import { ExecutionMetricsCards } from "@/components/mgx/execution-metrics-cards";
import { ExecutionLogPanel } from "@/components/mgx/execution-log-panel";
import { useWorkflowExecution, useExecutionMetrics } from "@/hooks/useWorkflowExecutions";

export default function ExecutionTimelinePage({ 
  params 
}: { 
  params: { executionId: string } 
}) {
  const { execution, isLoading } = useWorkflowExecution(params.executionId);
  const { metrics } = useExecutionMetrics(params.executionId);
  const [selectedStepId, setSelectedStepId] = useState<string>();

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <ExecutionMetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkflowTimeline 
            execution={execution}
            onSelectStep={setSelectedStepId}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Step Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStepId ? (
                <div>Step {selectedStepId} details</div>
              ) : (
                <p>Select a step to view details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ExecutionLogPanel 
        executionId={params.executionId}
        stepId={selectedStepId}
      />
    </div>
  );
}
```

---

### Pattern 3: Workflow List with Actions

```typescript
import { WorkflowExecutionList } from "@/components/mgx/workflow-execution-list";
import { Button } from "@/components/mgx/ui/button";
import { useWorkflowExecutions } from "@/hooks/useWorkflowExecutions";
import { triggerWorkflowExecution } from "@/lib/api";
import { toast } from "sonner";

export default function ExecutionListPage({ 
  params 
}: { 
  params: { workflowId: string } 
}) {
  const { executions, isLoading, mutate } = useWorkflowExecutions(params.workflowId);

  async function handleTrigger() {
    try {
      const execution = await triggerWorkflowExecution(params.workflowId, {});
      toast.success("Workflow started");
      mutate(); // Refresh list
    } catch (error) {
      toast.error("Failed to trigger workflow");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Executions</h1>
        <Button variant="primary" onClick={handleTrigger}>
          Trigger Execution
        </Button>
      </div>
      
      <WorkflowExecutionList 
        executions={executions}
        isLoading={isLoading}
        onSelectExecution={(id) => {
          router.push(`/mgx/workflows/${params.workflowId}/executions/${id}`);
        }}
      />
    </div>
  );
}
```

---

## Testing Components

### Test Pattern 1: Component Rendering

```typescript
import { render, screen } from "@testing-library/react";
import { WorkflowTimeline } from "@/components/mgx/workflow-timeline";

describe("WorkflowTimeline", () => {
  it("renders execution with steps", () => {
    const execution = {
      id: "exec_1",
      workflowId: "wf_1",
      status: "completed",
      startedAt: Date.now(),
      steps: [
        { stepId: "step_1", stepName: "Step 1", status: "completed" }
      ]
    };

    render(<WorkflowTimeline execution={execution} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });
});
```

---

### Test Pattern 2: User Interactions

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkflowCanvas } from "@/components/mgx/workflow-canvas";

describe("WorkflowCanvas", () => {
  it("calls onSelectStep when step is clicked", () => {
    const onSelectStep = jest.fn();
    const steps = [
      { id: "step_1", name: "Step 1", type: "agent_task", position: { x: 0, y: 0 } }
    ];

    render(
      <WorkflowCanvas
        steps={steps}
        edges={[]}
        view={{ x: 0, y: 0, zoom: 1 }}
        onChangeView={jest.fn()}
        onSelectStep={onSelectStep}
        onMoveStep={jest.fn()}
        onDropNewStep={jest.fn()}
        onCreateEdge={jest.fn()}
      />
    );

    const stepNode = screen.getByText("Step 1");
    fireEvent.click(stepNode);

    expect(onSelectStep).toHaveBeenCalledWith("step_1");
  });
});
```

---

### Test Pattern 3: SWR Hooks with Mock Data

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { useWorkflows } from "@/hooks/useWorkflows";

describe("useWorkflows", () => {
  it("fetches workflows successfully", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [
          { id: "wf_1", name: "Workflow 1" },
          { id: "wf_2", name: "Workflow 2" }
        ]
      } as Response)
    );

    const { result } = renderHook(() => useWorkflows(), { wrapper });

    await waitFor(() => expect(result.current.workflows).toHaveLength(2));
    expect(result.current.workflows[0].name).toBe("Workflow 1");
  });
});
```

---

## Component Styling Guidelines

### Tailwind CSS Conventions

- Use semantic color classes: `bg-white dark:bg-zinc-950`
- Responsive design: `sm:`, `md:`, `lg:` prefixes
- Spacing: `space-y-4`, `gap-6`, `p-4`
- Typography: `text-sm`, `text-lg`, `font-semibold`
- Borders: `border`, `border-zinc-200 dark:border-zinc-800`
- Rounded corners: `rounded-md`, `rounded-lg`, `rounded-xl`

### Dark Mode Support

All components support dark mode using Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
  Content
</div>
```

---

## Accessibility

All interactive components include:

- **Semantic HTML**: Use `<button>`, `<input>`, etc.
- **ARIA labels**: `aria-label`, `aria-labelledby`
- **Keyboard navigation**: `tabIndex`, `onKeyDown` handlers
- **Focus indicators**: Visible focus rings
- **Screen reader support**: Descriptive text for actions

Example:
```tsx
<button
  aria-label="Delete step"
  onClick={handleDelete}
  className="focus:ring-2 focus:ring-offset-2"
>
  <TrashIcon />
</button>
```

---

## Performance Considerations

### Component Optimization

- **Memoization**: Use `useMemo` for expensive calculations
- **Callbacks**: Use `useCallback` for event handlers
- **Virtualization**: Use `react-window` for long lists (not implemented yet)
- **Code splitting**: Lazy load heavy components

Example:
```typescript
const renderedEdges = useMemo(() => {
  return edges.map(edge => {
    const from = stepsById.get(edge.fromStepId);
    const to = stepsById.get(edge.toStepId);
    if (!from || !to) return null;
    return { id: edge.id, from, to };
  }).filter(Boolean);
}, [edges, stepsById]);
```

---

## Related Documentation

- [Workflow Builder User Guide](./WORKFLOW_BUILDER.md)
- [Workflow Timeline User Guide](./WORKFLOW_TIMELINE.md)
- [Workflow API Reference](./WORKFLOW_API.md)
- [Main README](../README.md)
