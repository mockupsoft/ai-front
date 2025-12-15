# MGX Dashboard Shell Implementation

## Overview
This document describes the implementation of the MGX Dashboard Shell across all phases (4.5-8).

**Latest Update**: Phase 8 - Workflow Timeline Monitor with Live Execution Updates

## Implemented Features

### 1. Next.js Admin Layout (`app/mgx/layout.tsx`)
- **Header**: App name with logo, environment badge (DEV/PROD), search bar, notifications, user avatar
- **Sidebar**: Config-driven navigation with grouped menu items
- **Main content area**: Responsive design with proper spacing
- **Breadcrumbs**: Context-aware breadcrumb navigation
- **Dark mode support**: Full dark mode using Tailwind CSS and CSS variables
- **Mobile support**: Collapsible navigation for mobile devices

### 2. Navigation System (`app/mgx/config/navigation.ts`)
- **Config-driven menu**: All navigation items defined in a single config file
- **Icons**: Using lucide-react for consistent iconography
- **Active state tracking**: Current page highlighted in navigation
- **Expandable groups**: Navigation organized into logical groups:
  - Overview
  - Management (Tasks, Results)
  - Monitoring
  - System (Settings)
- **Badge support**: Optional badges for menu items

### 3. Pages & Routes
All pages implemented with consistent styling and headers:

```
/mgx/
├── page.tsx (overview dashboard with cards)
├── tasks/page.tsx (tasks list)
├── tasks/[id]/page.tsx (task detail + monitor)
├── monitoring/page.tsx (metrics dashboard)
├── metrics/page.tsx (legacy, kept for compatibility)
├── results/page.tsx (results list with table)
└── settings/page.tsx (configuration page)
```

### 4. Core Components

#### MGX Components (`components/mgx/`)
- **header.tsx**: Top navigation with search, environment badge, notifications, user menu
- **sidebar.tsx**: Desktop sidebar with app logo and navigation
- **sidebar-nav.tsx**: Navigation component with vertical/horizontal variants
- **breadcrumb.tsx**: Dynamic breadcrumb navigation based on route

#### UI Components (`components/mgx/ui/`)
- **button.tsx**: Button with variants (primary, secondary, ghost) and sizes
- **card.tsx**: Card container with header, title, description, and content
- **table.tsx**: Styled table components
- **status-pill.tsx**: Status indicators with variants
- **spinner.tsx**: Loading spinner

### 5. Styling & Theme
- **Tailwind CSS v4**: Latest version via PostCSS
- **CSS Variables**: Defined in `app/globals.css` for dark mode
- **Responsive Design**: Mobile-first approach
  - Desktop: Full sidebar navigation
  - Tablet/Mobile: Horizontal navigation bar
- **Consistent Spacing**: Using Tailwind's spacing scale
- **Color Palette**: Zinc for neutrals with semantic colors

### 6. Environment Integration
- **Environment variables**: 
  - `NEXT_PUBLIC_MGX_API_BASE_URL`: API endpoint (default: `/api/mgx`)
  - `NEXT_PUBLIC_MGX_WS_URL`: WebSocket URL (default: `ws://localhost:4000/ws`)
  - `NEXT_PUBLIC_ENV`: Custom environment label for header badge
- **Configuration file**: `.env.local.example` provided
- **Environment badge**: Shows DEV/PROD/custom label in header

### 7. Testing
Comprehensive test suite using React Testing Library:

#### Component Tests
- `__tests__/mgx/header.test.tsx`: Header component and environment badge
- `__tests__/mgx/sidebar-nav.test.tsx`: Navigation rendering and variants
- `__tests__/mgx/breadcrumb.test.tsx`: Breadcrumb navigation logic
- `__tests__/mgx/layout.test.tsx`: Layout structure
- `__tests__/mgx/ui/button.test.tsx`: Button variants and interactions
- `__tests__/mgx/ui/card.test.tsx`: Card component structure

#### Page Tests
- `__tests__/mgx/overview-page.test.tsx`: Overview dashboard
- `__tests__/mgx/settings-page.test.tsx`: Settings page

**Test Results**: All 43 tests passing ✓

## File Structure

```
app/
├── mgx/
│   ├── config/
│   │   └── navigation.ts          # Navigation configuration
│   ├── layout.tsx                 # Main dashboard layout
│   ├── page.tsx                   # Overview page
│   ├── tasks/
│   │   ├── page.tsx              # Tasks list
│   │   └── [id]/page.tsx         # Task detail
│   ├── monitoring/page.tsx        # Monitoring dashboard
│   ├── metrics/page.tsx           # Legacy metrics page
│   ├── results/page.tsx           # Results list
│   └── settings/page.tsx          # Settings page

components/
├── mgx/
│   ├── header.tsx                 # Top header
│   ├── sidebar.tsx                # Desktop sidebar
│   ├── sidebar-nav.tsx            # Navigation component
│   ├── breadcrumb.tsx             # Breadcrumb navigation
│   └── ui/
│       ├── button.tsx             # Button component
│       ├── card.tsx               # Card component
│       ├── table.tsx              # Table component
│       ├── status-pill.tsx        # Status pill
│       └── spinner.tsx            # Loading spinner

lib/
└── mgx/
    ├── env.ts                     # Environment configuration
    ├── hooks/                     # Custom hooks for data fetching
    └── rest-client.ts             # API client

__tests__/
└── mgx/                          # Test files
```

## Acceptance Criteria Status

✅ Dashboard layout renders correctly
✅ Sidebar navigation works with active state tracking
✅ All pages load without errors
✅ Responsive on mobile/tablet/desktop
✅ Dark mode toggles (system preference)
✅ Environment badge displays correctly
✅ Breadcrumb navigation works
✅ Config-driven navigation system
✅ All UI components functional
✅ Tests passing

## Usage

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Environment Configuration
Copy `.env.local.example` to `.env.local` and configure:
```bash
cp .env.local.example .env.local
```

## Design Decisions

1. **Config-driven navigation**: Centralizes menu structure for easy maintenance
2. **Grouped navigation**: Improves organization with logical sections
3. **Component library**: Reusable UI components following shadcn/ui patterns
4. **Mobile-first**: Responsive design that adapts to all screen sizes
5. **Type-safe**: Full TypeScript coverage for better DX
6. **Test coverage**: Comprehensive test suite for reliability
7. **Dark mode**: Automatic system preference detection
8. **Environment awareness**: Clear visual indicators of environment

## GitHub Repository Connection (Phase 5)

### New Feature Overview
Integrated GitHub repository connection UI for automated branch tracking and metadata sync:

### Components Added
- **`components/mgx/repository-connect-form.tsx`**: Form for connecting GitHub repos with validation
- **`components/mgx/repositories-list.tsx`**: Table displaying connected repositories with actions
- **`components/mgx/git-metadata-badge.tsx`**: Badges displaying branch, commit, and PR information
- **`app/mgx/settings/git/page.tsx`**: Settings page for managing repository connections

### Hooks Added
- **`hooks/useRepositories.ts`**: SWR-based hook for fetching and caching repositories per project

### API Functions Added
- **`connectRepository()`**: POST endpoint to connect a new repository
- **`disconnectRepository()`**: DELETE endpoint to disconnect a repository
- **`refreshRepositoryMetadata()`**: POST endpoint to sync latest repository metadata

### TypeScript Types Added
- **`Repository`**: Repository connection with status and metadata
- **`GitMetadata`**: Branch, commit, PR information for tasks
- **`RepositoryStatus`**: Connection states (connected, syncing, error, disconnected)
- **`GitEvent`**: WebSocket event types for git updates

### Features
1. **Repository Management** (`/mgx/settings/git`)
   - Connect GitHub repositories with OAuth token support
   - Disconnect repositories with confirmation
   - Refresh metadata manually
   - View connection status and last sync time

2. **Task Integration**
   - Display git metadata (branch, commit SHA, PR link) in task monitoring view
   - Handle WebSocket git events (`git_metadata_updated`, `git_event`)
   - Show toast notifications on metadata updates

3. **Error Handling**
   - Validation errors in form submission
   - User-friendly error messages
   - Graceful degradation on API failures

4. **Performance Optimizations**
   - SWR caching per project with smart invalidation
   - Optimistic UI updates
   - Debounced metadata refresh

### Testing
- **`__tests__/mgx/repository-connect-form.test.tsx`**: Form submission, error handling, optional fields
- **`__tests__/mgx/git-metadata-badge.test.tsx`**: Badge rendering for branch, commit, PR
- Updated **`__tests__/mgx/task-monitoring-view.test.tsx`**: Git metadata display and WebSocket events

### Environment Configuration
```env
# Optional GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id

# API endpoints (already required)
NEXT_PUBLIC_MGX_API_BASE_URL=/api/mgx
NEXT_PUBLIC_MGX_WS_URL=ws://localhost:4000/ws
```

### Backend API Contract
```
GET /api/projects/{projectId}/repositories
  - Returns: Repository[]

POST /api/projects/{projectId}/repositories/connect
  - Body: { url: string, branch: string, oauthToken?: string, appInstallId?: string }
  - Returns: Repository

DELETE /api/projects/{projectId}/repositories/{repoId}
  - Returns: success response

POST /api/projects/{projectId}/repositories/{repoId}/refresh
  - Returns: Repository with updated metadata
```

### WebSocket Event Handling
```typescript
// Git metadata update event
{
  type: "git_metadata_updated" | "git_event",
  payload: {
    branch?: string,
    commitSha?: string,
    prNumber?: number,
    prUrl?: string,
    ...
  }
}
```

## Phase 7: Agent Status UI with Live Telemetry

### New Types (lib/types.ts)
- `AgentStatus`: Status union type (idle, active, executing, error, offline)
- `AgentDefinition`: Agent definition with capabilities and metadata
- `AgentInstance`: Current agent with status, metrics, and context
- `AgentActivityEvent`: Single agent event (status change, action, error, message)
- `AgentContextSnapshot`: Agent execution context at a point in time
- `AgentContextVersion`: Historical context snapshot with version and rollback capability
- `AgentConfiguration`: Agent settings and configuration object

### New API Endpoints (lib/api.ts)
- `fetchAgentInstances()`: List agents with current status and metrics
- `fetchAgentDefinitions()`: Get available agent definitions
- `fetchAgentContext(agentId)`: Fetch agent's execution context
- `fetchAgentMessages(agentId, limit, offset)`: Get agent message history
- `fetchAgentContextHistory(agentId)`: Get historical context versions
- `updateAgentConfig(agentId, config)`: Update agent configuration (PATCH)
- `activateAgent(agentId)`: Activate an idle agent (POST)
- `deactivateAgent(agentId)`: Deactivate an active agent (POST)
- `shutdownAgent(agentId)`: Shutdown an agent instance (POST)
- `rollbackAgentContext(agentId, version)`: Rollback context to previous version (POST)

### New Hook (hooks/useAgents.ts)
- `useAgents(options?)`: SWR hook for agent list with filtering and derived counts
- `useAgentForTask(taskId, runId?)`: Get agents for specific task/run
- Returns: `{ agents, allAgents, counts, isLoading, mutate }`

### New Components (components/mgx/)
- **agent-status-badge.tsx**: Status indicator with visual indicator dot
- **agent-status-list.tsx**: List of agents with name, status, and metrics
- **agent-activity-timeline.tsx**: Real-time activity feed with event types and timestamps
- **agent-metrics-summary.tsx**: KPI cards with active/idle/error/total counts (compact & full)
- **agent-list.tsx**: Sortable table showing all agents with filtering
- **agent-details-panel.tsx**: Agent details, configuration editor, context history with rollback
- **agent-controls.tsx**: Lifecycle control buttons (activate, deactivate, shutdown)

### Management Page Features
- **Route**: `/mgx/agents` with page.tsx, loading.tsx, error.tsx
- **Agent List Table**:
  - Sortable columns (name, status, last heartbeat)
  - Filterable by status (idle, active, executing, error, offline)
  - Shows linked tasks and metrics
  - Click to select agent for details view
- **Agent Details Panel**:
  - View full agent configuration
  - Edit configuration via JSON editor (PATCH API)
  - View current execution context
  - Browse context history with version timestamps
  - Rollback context to previous versions with confirmation
- **Agent Controls**:
  - Activate/deactivate buttons (state-aware, disabled when offline)
  - Shutdown button with confirmation dialog
  - Displays current status and ID
- **Toast Notifications**: Success/error feedback for all mutations
- **Responsive Layout**: 1/3 width agent list + 2/3 width details on desktop, stacked on mobile

### WebSocket Integration
- New event types: `agent_status_changed`, `agent_activity`, `agent_message`, `agent_context_updated`
- WebSocketProvider handles events silently, UI updates via SWR hooks
- Fallback endpoint: `NEXT_PUBLIC_MGX_AGENT_WS_URL` (defaults to `/ws/agents/stream`)
- Real-time status updates in agent list and details view

### Enhanced Components
- **TaskMonitoringView**: Added "Assigned Agents" section with status list and activity timeline
- **AgentChat**: Fetches message history from backend with IndexedDB fallback
- **Overview Page**: Agent KPI cards with live counts and activity summary
- **Navigation**: Added "Agents" menu item under Management section with Robot icon

### Environment Variables
- `NEXT_PUBLIC_MGX_AGENT_WS_URL`: Optional agent WebSocket endpoint (fallback to main WS URL)

### Tests
- `__tests__/mgx/agent-status-badge.test.tsx`
- `__tests__/mgx/agent-status-list.test.tsx`
- `__tests__/mgx/agent-activity-timeline.test.tsx`
- `__tests__/mgx/agent-metrics-summary.test.tsx`
- `__tests__/mgx/agent-list.test.tsx`: List rendering, sorting, filtering, row selection
- `__tests__/mgx/agent-details-panel.test.tsx`: Configuration editing, context history, metrics display
- `__tests__/mgx/agent-controls.test.tsx`: Lifecycle action buttons, confirmation dialogs
- `__tests__/hooks/useAgents.test.ts`
- Extended `task-monitoring-view.test.tsx` with agent event handling tests

### Backend API Contract (New Endpoints)
```
GET /agents
  Query Params: workspace_id?, project_id?
  Returns: AgentInstance[]

GET /agents/{agentId}/context
  Returns: AgentContextSnapshot

GET /agents/{agentId}/context/history
  Returns: AgentContextVersion[]

PATCH /agents/{agentId}
  Body: { name?: string, settings?: Record<string, unknown> }
  Returns: AgentInstance

POST /agents/{agentId}/activate
  Returns: AgentInstance

POST /agents/{agentId}/deactivate
  Returns: AgentInstance

POST /agents/{agentId}/shutdown
  Returns: { status: "shutdown" }

POST /agents/{agentId}/context/rollback
  Body: { version: number }
  Returns: AgentContextSnapshot
```

## Phase 8: Workflow Timeline Monitor

### Overview
Real-time execution timeline view that consumes workflow events, shows per-step progress, and streams logs/metrics.

### Routes & Pages
```
/mgx/workflows/[workflowId]/executions
  - Paginated execution list with status filtering
  - Trigger execution button with optimistic UI
  
/mgx/workflows/[workflowId]/executions/[executionId]
  - Real-time timeline visualization
  - Per-step metrics and logs
  - Failure indicators and retry tracking
  - Live WebSocket updates
```

### Components
1. **WorkflowExecutionList** (`components/mgx/workflow-execution-list.tsx`)
   - Sortable/filterable table of execution history
   - Status pills (completed, failed, running, pending)
   - Duration and step completion ratio
   - Links to execution detail pages

2. **WorkflowTimeline** (`components/mgx/workflow-timeline.tsx`)
   - Gantt-style stacked timeline visualization
   - Step progress bars with duration scaling
   - Status indicators (completed, failed, running, retrying)
   - Retry count and error messages
   - Expandable step details with outputs/logs
   - Agent assignment display

3. **ExecutionMetricsCards** (`components/mgx/execution-metrics-cards.tsx`)
   - Total duration
   - Success rate percentage
   - Steps completed / total
   - Retry count
   - Agent utilization metrics

4. **ExecutionLogPanel** (`components/mgx/execution-log-panel.tsx`)
   - Live streaming logs with auto-scroll
   - Per-step or execution-wide logs
   - Monospace formatting with line preservation
   - 500ms refresh interval for live updates
   - Scrollable container for long outputs

### API Extensions

#### New Endpoints
```
GET /workflows/{id}/executions         # List executions
GET /executions/{id}                   # Get execution details
POST /workflows/{id}/executions        # Trigger execution
GET /executions/{id}/logs              # Get execution logs
GET /executions/{id}/steps/{stepId}/logs # Get step logs
GET /executions/{id}/metrics           # Get execution metrics
```

#### New API Functions (`lib/api.ts`)
- `fetchWorkflowExecutions(workflowId, limit, offset, options)`
- `fetchWorkflowExecution(executionId, options)`
- `triggerWorkflowExecution(workflowId, variables, options)`
- `fetchExecutionLogs(executionId, stepId, limit, offset, options)`
- `fetchExecutionMetrics(executionId, options)`

### WebSocket Enhancement

#### Extended Subscriptions (`hooks/useWebSocket.ts`)
```typescript
type WebSocketSubscription = {
  taskId?: string;
  runId?: string;
  executionId?: string;      // NEW
  workflowId?: string;        // NEW
  topics?: string[];
}
```

#### New Message Types (`lib/types.ts`)
- `workflow_execution_started`
- `workflow_step_started`
- `workflow_step_completed`
- `workflow_step_failed`
- `workflow_step_retrying`
- `workflow_execution_completed`
- `workflow_execution_failed`
- `workflow_log_entry`

### Types (`lib/types/workflows.ts`)

```typescript
type WorkflowExecutionStatus = 
  | "pending" | "running" | "completed" | "failed" | "cancelled"

type StepExecutionStatus = 
  | "pending" | "running" | "completed" | "failed" | "skipped" | "retrying"

interface StepExecution {
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

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  steps: StepExecution[];
  triggeredBy?: string;
  variables?: Record<string, unknown>;
  error?: string;
}

interface ExecutionMetrics {
  totalDuration: number;
  successRate: number;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  retryCount: number;
  agentUtilization: Record<string, number>;
}
```

### Hooks
- `useWorkflowExecutions(workflowId)` - List with manual fetch + mutate
- `useWorkflowExecution(executionId)` - Auto-refresh every 1 second
- `useExecutionMetrics(executionId)` - Auto-refresh every 1 second

### Tests
✅ All tests passing (57 new tests)

#### Unit Tests
- `__tests__/mgx/workflow-timeline.test.tsx` (15 tests)
  - Rendering, status display, duration, step details
  - Error and retry indicators, expandable sections
  
- `__tests__/mgx/workflow-execution-list.test.tsx` (11 tests)
  - List rendering, filtering, sorting
  - Status pills, duration formatting, links
  
- `__tests__/mgx/execution-metrics-cards.test.tsx` (13 tests)
  - Metric display and formatting
  - Different duration/success rate scenarios
  
- `__tests__/mgx/execution-log-panel.test.tsx` (14 tests)
  - Log rendering and streaming
  - Multiline handling, monospace formatting
  
- `__tests__/mgx/workflow-execution-integration.test.tsx` (4 tests)
  - Hook integration and state transitions

#### E2E Tests
- `e2e/workflow-execution.spec.ts`
  - ✓ Triggers execution and monitors timeline with live updates
  - ✓ Handles execution failure and shows error indicators
  - ✓ Shows retry indicators for retried steps

### Key Architecture Decisions

1. **Real-time Updates**: 1-second refresh intervals for live execution state + WebSocket for event notifications

2. **Timeline Visualization**: Gantt-style bars with proportional duration display, handles parallel steps

3. **Log Streaming**: Separate API calls with 500ms refresh for live log panels, independent of execution state

4. **Error Handling**: Graceful fallbacks for WebSocket disconnects, all data fetched via REST with SWR caching

5. **Responsive Layout**: Timeline on left (2/3 width), step details panel on right (1/3 width) on desktop, stacked on mobile

6. **Metrics Aggregation**: Real-time calculations from execution state (success rate, step completion ratio)

### Build & Test Status
✅ Production build succeeds
✅ Routes properly registered
✅ All 57 new tests passing
✅ No TypeScript errors
✅ No linting issues

## Next Steps

1. **Authentication**: Add real authentication and user management
2. **Advanced Git Features**: PR status checks, commit history view
3. **Advanced Agent Features**: Agent debugging, detailed metrics, performance profiling
4. **Advanced Workflow Features**: Workflow templating, conditional execution, parallel branches
5. **Pagination**: Add proper pagination to execution list
6. **Search**: Full-text search across execution logs
7. **Accessibility**: Enhance keyboard navigation and screen reader support
8. **Performance**: Add data caching and optimization for large execution histories
9. **Analytics**: Integrate usage tracking and workflow performance metrics
