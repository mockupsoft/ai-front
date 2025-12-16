# Workflow Timeline Monitor User Guide

## Overview

The Workflow Timeline Monitor provides real-time visualization of workflow executions, displaying step-by-step progress, performance metrics, logs, and failure indicators. It features a Gantt-style timeline that shows concurrent step execution and helps you diagnose issues in running or completed workflows.

## Accessing the Timeline Monitor

### From Workflow List

1. Navigate to **Workflows** in the MGX Dashboard sidebar
2. Click on a workflow to view its details
3. Click **Executions** tab
4. Select an execution from the list to view its timeline

### Direct Access

Navigate to: `/mgx/workflows/{workflowId}/executions/{executionId}`

## Interface Overview

The Timeline Monitor interface consists of four main sections:

```
┌────────────────────────────────────────────────────┐
│  Execution Header (Status, Duration, Triggered By) │
├────────────────────────────────────────────────────┤
│  Metrics Cards (4-card grid)                       │
├──────────────────────────┬─────────────────────────┤
│  Timeline Gantt Chart    │  Step Details Panel     │
│  (Left - 2/3 width)      │  (Right - 1/3 width)    │
│                          │                         │
│  Step progress bars      │  - Step metadata        │
│  Status indicators       │  - Outputs/errors       │
│  Retry markers           │  - Agent info           │
├──────────────────────────┴─────────────────────────┤
│  Execution Log Panel (Collapsible)                 │
└────────────────────────────────────────────────────┘
```

## Reading the Gantt Timeline

### Timeline Structure

The Gantt chart displays all workflow steps as horizontal bars:

- **X-axis**: Time progression (relative to execution start)
- **Y-axis**: Steps (stacked vertically)
- **Bar width**: Proportional to step duration
- **Bar position**: Indicates start time relative to workflow start

### Step Progress Bars

Each step is represented by a colored bar:

```
┌──────────────────────────────────┐
│  Step Name        [Agent Icon]   │  ← Step header
│  ████████████████░░░░ (80%)      │  ← Progress bar
│  2.5s / 3.0s                     │  ← Duration info
└──────────────────────────────────┘
```

**Progress bar meanings:**
- **Filled portion**: Completed percentage
- **Empty portion**: Remaining work
- **Color**: Status indicator (see below)

### Status Color Coding

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | `completed` | Step finished successfully |
| 🔴 Red | `failed` | Step encountered an error |
| 🔵 Blue | `running` | Step is currently executing |
| 🟡 Amber | `retrying` | Step failed and is retrying |
| ⚪ Gray | `pending` | Step not yet started |
| ⚫ Gray (dark) | `skipped` | Step was skipped (conditional) |

### Concurrent Execution

Steps that run in parallel are shown **overlapping in time**:

```
Step 1  ████████████████████         
Step 2       ████████████            (Started while Step 1 was running)
Step 3       ████████                (Parallel with Step 2)
Step 4                   ████████    (Started after Step 2 & 3 completed)
```

This visualization helps identify:
- Which steps can be parallelized
- Bottlenecks where steps wait for dependencies
- Total workflow duration vs. sum of step durations

## Step Status Indicators

### Status Pills

Each step displays a status pill with icon and text:

- ✅ **Completed**: Green pill, check icon
- ❌ **Failed**: Red pill, X icon
- ⏳ **Running**: Blue pill, loading spinner
- 🔄 **Retrying**: Amber pill, refresh icon
- ⏸️ **Pending**: Gray pill, clock icon
- ⏭️ **Skipped**: Dark gray pill, skip icon

### Retry Indicators

When a step retries, the timeline shows:

1. **Retry count badge**: `🔄 2` (indicating 2 retries so far)
2. **Retry markers**: Small dots below the progress bar
3. **Latest attempt**: The current progress bar shows only the latest retry

**Example:**
```
┌──────────────────────────────────┐
│  Fetch API Data      🔄 2        │  ← 2 retries
│  ████████████░░░░░░  (70%)       │  ← Current attempt (3rd try)
│  ● ●                             │  ← Previous attempts (failed)
└──────────────────────────────────┘
```

### Error Indicators

Failed steps show:
- Red progress bar (100% width)
- Error icon (❌)
- Error message below the bar (expandable)

Click on a failed step to view full error details in the Step Details Panel.

## Real-time Updates

### Live Execution Monitoring

The Timeline Monitor updates automatically during workflow execution:

- **Refresh interval**: 1 second (configurable via SWR)
- **WebSocket events**: Instant updates for status changes
- **Auto-scroll**: Timeline scrolls to show the currently running step

### WebSocket Event Types

The monitor listens for these real-time events:

- `workflow_execution_started`: Workflow begins
- `workflow_step_started`: New step starts
- `workflow_step_completed`: Step finishes successfully
- `workflow_step_failed`: Step encounters an error
- `workflow_step_retrying`: Step is retrying after failure
- `workflow_execution_completed`: Workflow finishes
- `workflow_execution_failed`: Workflow fails
- `workflow_log_entry`: New log entry (for log panel)

### Connection Indicators

- **Connected**: Green dot in header
- **Disconnected**: Red dot + "Reconnecting..." message
- **Fallback**: If WebSocket fails, polling continues at 1s intervals

## Performance Metrics

### Metrics Cards (Top Section)

Four metric cards provide high-level execution statistics:

#### 1. Total Duration
- **Displays**: Total time from start to completion
- **Format**: `Xm Ys` or `Xs` or `Xms`
- **Updates**: Real-time during execution

#### 2. Success Rate
- **Displays**: Percentage of steps completed successfully
- **Formula**: `(completedSteps / totalSteps) × 100%`
- **Example**: `85%` means 85% of steps succeeded

#### 3. Steps Completed
- **Displays**: Fraction of completed vs. total steps
- **Format**: `X / Y` (e.g., `8 / 10`)
- **Color**:
  - Green: All steps completed
  - Amber: Partial completion
  - Red: No steps completed

#### 4. Retries
- **Displays**: Total number of retries across all steps
- **Example**: `3` means 3 retry attempts occurred
- **Note**: Does not count initial attempts

### Detailed Metrics

Click **Show Metrics** to expand additional statistics:

- **Agent Utilization**: Bar chart showing time spent per agent
- **Step Duration Breakdown**: Pie chart of time per step
- **Bottleneck Analysis**: Steps that took longest
- **Parallel Efficiency**: Time saved by parallel execution

## Log Inspection

### Execution Log Panel

The bottom panel displays real-time logs for the workflow execution.

#### Viewing Logs

1. **Execution-wide logs**: Default view (no step selected)
2. **Step-specific logs**: Click a step, then view its logs

#### Log Format

```
[2024-12-16 14:23:45] [step_abc123] [INFO] Fetching data from API...
[2024-12-16 14:23:46] [step_abc123] [INFO] Received 150 records
[2024-12-16 14:23:47] [step_abc123] [SUCCESS] Data fetch completed
```

**Log entry structure:**
- **Timestamp**: ISO 8601 format
- **Step ID**: Which step produced the log
- **Level**: INFO, WARN, ERROR, SUCCESS
- **Message**: Log content

#### Log Panel Features

- **Auto-scroll**: Automatically scrolls to newest logs
- **Monospace font**: Preserves formatting and alignment
- **Line numbers**: Optional (toggle in settings)
- **Search**: Ctrl+F to search logs
- **Copy**: Select and copy log entries
- **Download**: Export logs to file (button in panel header)

### Log Refresh Interval

- **Default**: 500ms
- **Configurable**: Adjust in settings (100ms - 5s)
- **Pause**: Click "Pause" to stop auto-refresh for analysis

## Step Details Panel

### Accessing Step Details

Click any step in the timeline to view its details in the right panel:

```
┌─────────────────────────────────┐
│  Step: Fetch User Data          │
│  Status: completed ✅           │
│  Duration: 2.35s                │
│  Agent: data-fetcher-01         │
├─────────────────────────────────┤
│  Outputs:                       │
│  {                              │
│    "userCount": 150,            │
│    "dataSize": "2.4MB"          │
│  }                              │
├─────────────────────────────────┤
│  Execution Timeline:            │
│  Started: 14:23:45              │
│  Completed: 14:23:47            │
│  Retries: 0                     │
└─────────────────────────────────┘
```

### Panel Sections

#### 1. Step Metadata
- Name, type, description
- Current status
- Assigned agent (if applicable)
- Timeout configuration
- Retry settings

#### 2. Outputs
- JSON object with step results
- Syntax-highlighted for readability
- Collapsible sections for large outputs
- Copy button for easy sharing

#### 3. Errors (if step failed)
- Error type and message
- Stack trace (if available)
- Retry history
- Suggested fixes (if available)

#### 4. Execution Timeline
- Start time (absolute and relative)
- End time
- Duration
- Wait time (time waiting for dependencies)

#### 5. Dependencies
- List of steps this step depends on
- List of steps that depend on this step
- Dependency graph visualization

### Expandable Sections

Click section headers to expand/collapse:
- **Outputs**: Shows step results
- **Inputs**: Shows variables and bindings used
- **Logs**: Shows step-specific logs
- **Agent Details**: Shows agent configuration and status

## Failure Indicators & Recovery

### Identifying Failures

Failed steps are marked with:
1. **Red progress bar** in timeline
2. **Error icon** (❌) in status pill
3. **Error badge** on step node (if multiple issues)
4. **Error message** in step details panel

### Failure Types

| Type | Indicator | Cause |
|------|-----------|-------|
| **Timeout** | ⏰ Timeout exceeded | Step exceeded configured timeout |
| **Agent Error** | 🤖 Agent failed | Agent encountered an internal error |
| **Dependency Failed** | 🔗 Upstream failure | A dependency step failed |
| **Validation Error** | ⚠️ Invalid input | Step received invalid inputs |
| **Network Error** | 🌐 Connection failed | Network request failed |

### Retry Behavior

When a step is configured with retries:

1. **Initial Attempt**: First execution
2. **Retry 1**: If failed, wait and retry
3. **Retry N**: Continue until max retries reached
4. **Final Failure**: If all retries fail, step fails

**Retry Indicator Timeline:**
```
Attempt 1: ████████❌ (failed after 2s)
Attempt 2: ████████❌ (failed after 2s)  
Attempt 3: ████████████✅ (succeeded after 3s)
Total: 7s (2s + 2s + 3s)
```

### Fallback Steps

If a step has a configured **Fallback Step**:
- The fallback executes when the primary step fails
- Timeline shows both the failed step and the fallback
- Fallback is marked with 🔀 icon

### Manual Recovery Actions

From the timeline view, you can:

1. **Retry Execution**: Re-run the entire workflow with same inputs
2. **Resume from Failed Step**: Continue from the failed step (if supported)
3. **Cancel Execution**: Stop a running execution
4. **Download Logs**: Export all logs for offline analysis

## Export & Sharing

### Exporting Execution Data

Click the **Export** button to download:

- **JSON**: Complete execution data with all steps, outputs, and metadata
- **Logs (TXT)**: Plain text log file
- **Timeline Screenshot**: PNG image of the Gantt chart
- **Report (PDF)**: Summary report with metrics and timeline

### Sharing Executions

Click **Share** to generate a shareable link:

- **Public Link**: Anyone with the link can view (read-only)
- **Workspace Link**: Only workspace members can access
- **Expiration**: Links expire after 30 days (configurable)

### Comparing Executions

Select multiple executions to compare:
- Side-by-side timeline view
- Diff of step outputs
- Performance comparison metrics

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Spacebar` | Pause/resume auto-scroll |
| `R` | Retry execution |
| `L` | Toggle log panel |
| `M` | Toggle metrics panel |
| `Esc` | Deselect step |
| `←` / `→` | Navigate between steps |
| `Ctrl/Cmd + F` | Search logs |
| `Ctrl/Cmd + E` | Export execution |

## Filtering & Searching

### Filter by Status

Use the status filter dropdown to show only:
- ✅ Completed steps
- ❌ Failed steps
- 🔄 Retried steps
- ⏳ Running steps

### Search Steps

Use the search bar to find steps by:
- Step name
- Agent ID
- Error message
- Output content

### Time Range Filter

Filter executions by time range:
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

## Troubleshooting

### Issue: Timeline not updating

**Possible causes:**
- WebSocket connection lost
- API endpoint unavailable
- Browser tab backgrounded (throttled)

**Solutions:**
1. Check connection indicator (top-right)
2. Refresh the page to reconnect
3. Verify API endpoint in browser console
4. Bring tab to foreground

### Issue: Logs not displaying

**Possible causes:**
- Step hasn't produced logs yet
- Log endpoint is slow
- Log buffer is full

**Solutions:**
1. Wait for step to start executing
2. Check if step is configured to log
3. Increase log refresh interval
4. Clear log buffer and refresh

### Issue: Metrics show incorrect data

**Possible causes:**
- Execution still in progress (partial data)
- Cache not invalidated
- Backend calculation error

**Solutions:**
1. Wait for execution to complete
2. Refresh the page to reload data
3. Compare with raw execution JSON
4. Report issue if persistent

### Issue: Timeline is too crowded

**Solutions:**
1. Use the filter to hide completed steps
2. Collapse step details to save space
3. Zoom out to see full timeline
4. Use full-screen mode (F11)

## Best Practices

### 1. Monitoring Long-Running Workflows

- Open timeline in a dedicated browser window
- Enable desktop notifications for completion/failures
- Set up alerts for critical workflow failures
- Monitor agent utilization to identify bottlenecks

### 2. Analyzing Failed Executions

1. **Check failure type**: Timeout vs. error vs. dependency
2. **Review logs**: Look for error messages and warnings
3. **Inspect outputs**: Check if previous steps produced expected results
4. **Compare with successful runs**: Use execution comparison feature
5. **Check agent health**: Verify assigned agents are operational

### 3. Performance Optimization

Use the timeline to identify:
- **Serial bottlenecks**: Steps that could run in parallel
- **Long-running steps**: Candidates for optimization
- **Excessive retries**: Steps that fail frequently
- **Idle time**: Time spent waiting for dependencies

### 4. Log Management

- Use **log levels** appropriately (INFO, WARN, ERROR)
- Include **context** in log messages (step name, variables)
- **Limit log volume** for high-frequency steps
- **Archive old logs** to save storage

## API Integration

The Timeline Monitor uses the following API endpoints:

- `GET /workflows/{id}/executions` - List executions
- `GET /executions/{id}` - Fetch execution details
- `GET /executions/{id}/logs` - Fetch execution logs
- `GET /executions/{id}/steps/{stepId}/logs` - Fetch step logs
- `GET /executions/{id}/metrics` - Fetch execution metrics
- `POST /workflows/{id}/executions` - Trigger new execution
- `POST /executions/{id}/cancel` - Cancel running execution

**WebSocket events:**
- `ws://api/workspaces/{id}/projects/{id}/workflows/{id}/stream`

See [WORKFLOW_API.md](./WORKFLOW_API.md) for full API documentation.

## Examples

### Example 1: Monitoring a Simple Workflow

```
Timeline:
[Start] → [Fetch Data] → [Process] → [Save]
  0s        0-2s         2-5s        5-6s

Total Duration: 6s
Success Rate: 100%
Steps: 4/4
Retries: 0
```

**What to look for:**
- All steps completed (green)
- No retries
- Sequential execution (no overlap)
- Total duration = sum of step durations

### Example 2: Parallel Execution

```
Timeline:
          ┌─ [Task A] (2s) ─┐
[Start] ──┤                 ├─ [Merge] (1s)
  0s      └─ [Task B] (3s) ─┘
          0-2s    0-3s        3-4s

Total Duration: 4s
Success Rate: 100%
Steps: 4/4
Retries: 0
```

**What to look for:**
- Task A and Task B overlap (parallel)
- Merge waits for both to complete
- Total duration < sum of step durations (optimization!)

### Example 3: Failure and Retry

```
Timeline:
[Start] → [Fetch] → [Process] → [Save]
           (failed)  (retrying)   (pending)
           0-2s❌    2-4s❌       (waiting)
                     4-6s✅

Total Duration: 6s (so far)
Success Rate: 66% (2/3 completed)
Steps: 2/3
Retries: 2
```

**What to look for:**
- Fetch failed (red bar)
- Process retried twice (amber, then green)
- Save is pending (gray)
- Retry markers below Process bar

## Related Documentation

- [Workflow Builder Guide](./WORKFLOW_BUILDER.md) - Creating workflows
- [Workflow API Reference](./WORKFLOW_API.md) - API endpoints and integration
- [Component Reference](./COMPONENTS.md) - UI component details
