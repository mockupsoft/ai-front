# Workflow Builder User Guide

## Overview

The Workflow Builder is a visual, drag-and-drop interface for creating and editing multi-step workflows in the MGX Dashboard. It provides a canvas-based editor where you can compose complex automation sequences by connecting steps, configuring agents, managing dependencies, and defining workflow variables.

## Getting Started

### Accessing the Builder

1. Navigate to **Workflows** in the MGX Dashboard sidebar
2. Click **Create Workflow** or select an existing workflow
3. Click **Edit** to open the workflow builder

### Interface Layout

The Workflow Builder consists of three main sections:

```
┌─────────────┬──────────────────────┬──────────────┐
│   Palette   │       Canvas         │  Properties  │
│   + Vars    │    (Drag & Drop)     │    Panel     │
│  (Left)     │      (Center)        │   (Right)    │
└─────────────┴──────────────────────┴──────────────┘
```

- **Left Panel**: Step palette and workflow variables editor
- **Center Canvas**: Visual workflow editor with drag-and-drop
- **Right Panel**: Step configuration and validation results

## Creating Workflows

### 1. Adding Steps

#### Using the Step Palette

The left panel provides a **Step Palette** with available step types:

- **Agent Task**: Execute a task using an AI agent
- **Script**: Run a custom script or code snippet
- **Condition**: Conditional branching based on expressions
- **HTTP Request**: Make API calls to external services
- **Delay**: Wait for a specified duration

**To add a step:**
- **Method 1**: Click a step type in the palette (adds to canvas at default position)
- **Method 2**: Drag a step from the palette and drop it on the canvas

#### Drag-and-Drop Canvas Usage

- **Pan**: Click and drag on empty canvas space
- **Zoom**: Use mouse wheel or trackpad to zoom in/out (40%-250%)
- **Select Step**: Click on a step node to select it
- **Move Step**: Click and drag a step node to reposition it
- **Deselect**: Click on empty canvas space

### 2. Configuring Steps

When you select a step, the right panel displays its configuration options:

#### Basic Settings

- **Name**: Display name for the step (e.g., "Fetch User Data")
- **Type**: Step type (agent_task, script, condition, etc.)
- **Description**: Optional description for documentation

#### Agent Configuration (for Agent Task steps)

- **Agent ID**: Select an agent from the dropdown
- **Agent Name**: Display name of the assigned agent
- **Agent Capabilities**: View agent's capabilities and metadata

#### Execution Settings

- **Timeout (seconds)**: Maximum execution time before failure
  - Range: 1-3600 seconds
  - Default: 300 seconds (5 minutes)
  
- **Retries**: Number of retry attempts on failure
  - Range: 0-5
  - Default: 0 (no retries)

- **Fallback Step**: Optional step to execute if this step fails
  - Select from dropdown of available steps

#### Variable Bindings

Bind workflow variables or outputs from previous steps to this step's inputs:

```json
{
  "inputField": "{{workflow.variableName}}",
  "previousOutput": "{{step_abc123.result}}"
}
```

- Use `{{workflow.varName}}` to reference workflow variables
- Use `{{stepId.outputKey}}` to reference outputs from previous steps

### 3. Managing Dependencies

Dependencies define the execution order of steps in your workflow.

#### Creating Dependencies

1. Select the **source step** (the step that must complete first)
2. Click the **Link** button in the right panel
3. The step will be highlighted in green (linking mode)
4. Click the **target step** (the step that depends on the source)
5. An arrow is drawn from source to target

**Alternative**: Click a step while in linking mode to create the edge

#### Canceling Linking Mode

Click **Cancel Linking** or press `Esc` to exit linking mode without creating a dependency.

#### Removing Dependencies

Dependencies are automatically removed when you delete a step. To remove a specific edge:
- Delete the source or target step
- Rebuild the workflow without that dependency

### 4. Setting Workflow Variables

Workflow variables are inputs/parameters that can be passed when triggering an execution.

#### Variables Panel

Located at the bottom of the left panel, the **Workflow Variables** editor displays variables as JSON:

```json
[
  {
    "name": "userEmail",
    "type": "string",
    "description": "Email address of the user",
    "defaultValue": "user@example.com"
  },
  {
    "name": "retryLimit",
    "type": "number",
    "description": "Maximum number of retries",
    "defaultValue": 3
  }
]
```

#### Variable Schema

Each variable has the following properties:

- **name** (required): Variable identifier (alphanumeric + underscores)
- **type** (optional): `string`, `number`, `boolean`, or `json`
- **description** (optional): Documentation for the variable
- **defaultValue** (optional): Default value if not provided at execution

#### Editing Variables

1. Click in the **Workflow Variables** textarea
2. Edit the JSON directly
3. The editor validates in real-time and shows errors
4. Changes are applied automatically when valid JSON is detected

#### Referencing Variables in Steps

Use the `{{workflow.variableName}}` syntax in step bindings:

```json
{
  "email": "{{workflow.userEmail}}",
  "retries": "{{workflow.retryLimit}}"
}
```

## Templates System

The Workflow Builder supports templates for common workflow patterns.

### Using Templates

1. Click **Templates** in the workflow list
2. Browse available templates (e.g., "Data Pipeline", "API Integration")
3. Click **Use Template** to load it into the builder
4. Customize the template to fit your needs

### Template Features

- Pre-configured steps with sensible defaults
- Example variable definitions
- Common dependency patterns
- Best practice configurations

Templates are read-only references. When you load a template, you create a new workflow based on it.

## Validation & Error Handling

### Validating Workflows

Click the **Validate** button (top-right) to check your workflow for issues.

#### Validation Checks

- **No cycles**: Steps cannot depend on themselves (directly or indirectly)
- **Reachable steps**: All steps must be connected to the workflow entry
- **Agent availability**: Agent IDs must reference valid agents
- **Timeout limits**: Timeouts must be within allowed ranges
- **Variable references**: All `{{...}}` references must be valid

### Validation Results

After validation, you'll see:

- **Valid** (green badge): No issues found
- **Invalid** (red badge): X errors • Y warnings

#### Issue Details

- **Workflow-level issues**: Displayed below the canvas
- **Step-level issues**: Badge on step nodes shows issue count
- **Issue panel**: Right panel shows issues for selected step

Click on a step with issues to view detailed error messages.

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| **Cycle detected** | Step A depends on step B, which depends on step A | Remove circular dependency |
| **Unreachable step** | Step has no incoming dependencies | Connect it to another step or make it a start step |
| **Invalid agent** | Agent ID doesn't exist | Select a valid agent from the dropdown |
| **Invalid timeout** | Timeout < 1 or > 3600 | Set timeout between 1 and 3600 seconds |
| **Variable not found** | `{{workflow.foo}}` but no variable named "foo" | Define the variable or fix the reference |

## Saving & Loading Workflows

### Saving Workflows

1. Configure your workflow on the canvas
2. Fill in **Name** and **Description** (top section)
3. Click **Validate** to check for issues (optional but recommended)
4. Click **Save**

The workflow is saved to the backend with its definition (steps, edges, variables).

### Loading Workflows

When you open an existing workflow:
- The builder loads the saved definition
- All steps, dependencies, and variables are restored
- The canvas view is reset to default (zoom 100%, centered)

### Auto-save

The Workflow Builder does **not** auto-save. Always click **Save** before navigating away.

## Best Practices

### 1. Naming Conventions

- Use descriptive step names (e.g., "Validate User Input" vs "Step 1")
- Name variables in camelCase (e.g., `userEmail`, `maxRetries`)
- Include descriptions for complex steps

### 2. Error Handling

- Set appropriate timeouts for long-running steps
- Configure retries for steps that may fail transiently
- Use fallback steps for critical error paths
- Test failure scenarios during development

### 3. Performance Optimization

- Minimize serial dependencies (allow parallel execution where possible)
- Use reasonable timeout values (don't set 3600s for a 5s operation)
- Limit retry counts to avoid excessive delays
- Consider using condition steps to skip unnecessary work

### 4. Maintainability

- Group related steps visually on the canvas
- Use workflow variables for values that may change
- Document complex logic in step descriptions
- Keep workflows focused on a single responsibility

### 5. Testing Workflows

After building a workflow:
1. **Validate** to catch structural issues
2. **Save** the workflow
3. **Trigger an execution** with test data
4. **Monitor** in the Timeline Monitor
5. **Iterate** based on execution results

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Click + Drag` (canvas) | Pan the canvas |
| `Mouse Wheel` | Zoom in/out |
| `Click` (step) | Select step |
| `Click` (canvas) | Deselect all |
| `Esc` | Cancel linking mode |
| `Ctrl/Cmd + S` | Save workflow (browser default) |

## Visual Reference

### Step Node States

- **Default**: Gray border, white background
- **Selected**: Black border, ring shadow
- **Linking Source**: Green ring (ready to connect)
- **Has Issues**: Red badge with issue count

### Dependency Arrows

- **Direction**: Points from source to target
- **Color**: Gray (rgba(148,163,184,0.9))
- **Arrowhead**: Indicates execution flow direction

### Canvas Grid

- The canvas has a dotted grid pattern for alignment
- Canvas size: 2400x2400px
- Step nodes: 200x72px

## Troubleshooting

### Issue: Cannot drag steps on canvas

**Solution**: Ensure you're clicking on the step node itself, not the canvas background. Check that you're not in "linking mode" (green ring on a step).

### Issue: Validation always fails

**Solution**: Check the validation output in the right panel. Common issues are unreachable steps or invalid agent IDs. Fix issues one by one and re-validate.

### Issue: Variables not applied

**Solution**: Ensure your JSON is valid (no syntax errors). Check that variable names match references in step bindings exactly (case-sensitive).

### Issue: Canvas is stuck or zoomed too far

**Solution**: Refresh the page to reset the view. The canvas state is not persisted across sessions.

### Issue: Save button does nothing

**Solution**: Check browser console for errors. Ensure you have entered a workflow name (required field). Check that you're connected to the API.

## Examples

### Example 1: Simple Sequential Workflow

```
[Start] → [Fetch Data] → [Process Data] → [Save Results]
```

**Steps:**
1. Add "Fetch Data" agent task
2. Add "Process Data" script step
3. Add "Save Results" agent task
4. Create dependencies: Fetch → Process → Save
5. Configure each step's agent and timeout
6. Save workflow

### Example 2: Parallel Execution with Join

```
          ┌─→ [Task A] ─┐
[Start] ──┤             ├─→ [Merge Results]
          └─→ [Task B] ─┘
```

**Steps:**
1. Add "Start" step (or use implicit start)
2. Add "Task A" and "Task B" agent tasks
3. Add "Merge Results" step
4. Create dependencies: Start → Task A → Merge
5. Create dependencies: Start → Task B → Merge
6. Task A and Task B execute in parallel
7. Merge waits for both to complete

### Example 3: Conditional Branching

```
[Start] → [Check Status] ─→ (if success) → [Process Success]
                          └→ (if failure) → [Handle Error]
```

**Steps:**
1. Add "Check Status" condition step
2. Add "Process Success" step
3. Add "Handle Error" step
4. Create dependencies based on condition outputs
5. Configure condition expression in bindings

## API Integration

The Workflow Builder uses the following API endpoints:

- `GET /workflows` - List workflows
- `GET /workflows/{id}` - Fetch workflow definition
- `POST /workflows` - Create new workflow
- `PATCH /workflows/{id}` - Update existing workflow
- `POST /workflows/validate` - Validate workflow definition
- `GET /agents/definitions` - Fetch available agents

See [WORKFLOW_API.md](./WORKFLOW_API.md) for full API documentation.

## Component Reference

For developers working with the Workflow Builder components:

- **WorkflowBuilder**: Main container component
- **WorkflowCanvas**: Drag-and-drop canvas with zoom/pan
- **WorkflowStepPalette**: Step type selector
- **WorkflowStepPanel**: Step configuration editor
- **WorkflowTemplatePicker**: Template selection UI

See [COMPONENTS.md](./COMPONENTS.md) for detailed component API.
