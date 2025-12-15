# AI-Front: MGX Admin Dashboard

A modern, production-ready admin dashboard built with Next.js 16, React 19, and TypeScript. Part of the TEM (Temporal Execution Manager) platform featuring real-time monitoring, multi-tenant workspace management, GitHub repository integration, and comprehensive metrics visualization.

## 📑 Table of Contents

- [Project Status](#-project-status)
- [What's New in Phase 5-6](#-whats-new-in-phase-5-6)
- [Phase 4.5: Core Dashboard](#-phase-45-frontend-deliverables)
- [Phase 5: GitHub Repository Integration](#-phase-5-github-repository-integration)
- [Phase 6: Workspace & Project Management](#-phase-6-workspace--project-management)
- [Complete Architecture Overview](#-complete-architecture-overview)
- [Getting Started](#-getting-started)
  - [Quick Start Guide](#quick-start-guide)
- [Technology Stack](#-technology-stack)
- [Routes & Pages](#-routes--pages)
- [Testing](#-testing)
- [Custom Hooks](#-custom-hooks)
- [Key Components](#-key-components)
- [Features Overview](#-features-overview)
- [Documentation](#-documentation)
- [Performance Optimizations](#-performance-optimizations)
- [Security](#-security-considerations)
- [Roadmap](#-roadmap)
- [Complete Features Checklist](#-complete-features-checklist)
- [Contributing](#-contributing)
- [Support & Troubleshooting](#-support--troubleshooting)

---

## 🎯 Project Status

**Dashboard Maturity**: 🚀 **Production-Ready**

| Component | Status | Details |
|-----------|--------|---------|
| Dashboard Shell | ✅ LIVE | Production-ready admin interface |
| Real-time Monitoring | ✅ LIVE | WebSocket integration with live updates |
| Git Integration | ✅ LIVE | GitHub repos, branches, commits, PRs |
| Workspace Support | ✅ LIVE | Multi-tenant UI with data isolation |
| Real-time Sync | ✅ ACTIVE | WebSocket events for git & workspace |
| API Integration | ✅ COMPLETE | REST API with workspace/project scoping |
| Responsive Design | ✅ COMPLETE | Mobile/Tablet/Desktop optimized |

**Phase Status**: Phase 4.5 ✅ | Phase 5 ✅ | Phase 6 ✅ | Phase 7 ✅

---

## 🎉 What's New in Phase 5-7

### 🔗 Phase 5: GitHub Repository Integration

**Connect your GitHub repositories and track git activity in real-time!**

- **🔌 Repository Connection**: Connect GitHub repos via OAuth or GitHub App
- **🏷️ Git Metadata Badges**: See branch, commit SHA, and PR links directly in task views
- **⚡ Real-time Git Events**: Watch branches being created, commits pushed, and PRs opened
- **🔄 Smart Sync**: Automatic metadata sync with manual refresh option
- **📊 Git Activity Timeline**: Track all git events during task execution
- **🎨 Beautiful UI**: Color-coded badges with dark mode support
- **✅ Comprehensive Testing**: Full test coverage for git features

### 🏢 Phase 6: Workspace & Project Management

**Manage multiple projects across different workspaces with complete data isolation!**

- **🌐 Multi-Tenant Architecture**: Switch seamlessly between workspaces and projects
- **🔒 Data Isolation**: Complete separation of data per project - no cross-contamination
- **📂 Project Management**: Create and manage projects within workspaces
- **🔗 Context-Aware**: All APIs and WebSocket events automatically scoped to workspace/project
- **💾 Persistent Selection**: Your workspace and project selections saved across sessions
- **🧭 Enhanced Navigation**: Breadcrumbs and UI always show your current context
- **🚀 Performance**: Optimized caching and data fetching per project
- **🎯 Scoped Metrics**: All metrics and analytics calculated per project

### 🤖 Phase 7: Agent Status UI with Live Telemetry

**Monitor multi-agent orchestration with real-time status updates and activity feeds!**

- **📊 Agent KPI Cards**: Dashboard overview with active/idle/error counts
- **🟢 Agent Status Badges**: Visual status indicators (active, idle, executing, error, offline)
- **📈 Agent Status List**: Detailed agent roster with metrics per task
- **⚡ Activity Timeline**: Real-time feed of agent actions and state changes
- **🔄 Live WebSocket Updates**: Automatic UI refresh for `agent_status_changed`, `agent_activity`, `agent_message`, and `agent_context_updated` events
- **💾 Message History**: AgentChat hydrates from backend with offline fallback to IndexedDB
- **🎯 Task-Scoped Agents**: View agents assigned to specific task runs
- **📱 Responsive Design**: Adapts beautifully to mobile, tablet, and desktop viewports
- **✅ Comprehensive Tests**: Full coverage for status components and event handling

**Ready to use?** Jump to the [Quick Start Guide](#quick-start-guide) to get started!

---

## 📦 Phase 4.5 Frontend Deliverables

### ✅ Core Features Implemented

#### Admin Dashboard Shell
- **Responsive layout** with desktop sidebar and mobile-optimized navigation
- **Config-driven navigation system** for easy menu management
- **Dynamic breadcrumb** navigation based on current route
- **Header** with environment badge (DEV/PROD), search bar, and user menu
- **Dark mode support** using CSS variables
- **Environment-aware** UI with visual environment indicators

#### Main Dashboard Pages (5 Pages)
1. **Overview Dashboard** (`/mgx`)
   - Summary cards with key metrics
   - Task execution status overview
   - Real-time status indicators

2. **Task Management** (`/mgx/tasks`)
   - Task list with filtering and sorting
   - Task creation form
   - Execution control (cancel, retry)
   - Search functionality

3. **Task Monitor & Details** (`/mgx/tasks/[id]`)
   - Real-time progress tracking
   - Phase indicator (Analyze → Plan → Execute → Review)
   - Execution timeline visualization
   - Time elapsed & ETA
   - Detailed task information

4. **Monitoring & Metrics** (`/mgx/monitoring` & `/mgx/metrics`)
   - Async execution timeline chart
   - Performance metrics visualization
   - Phase duration breakdown
   - Real-time metric updates

5. **Settings & Configuration** (`/mgx/settings`)
   - Application configuration
   - Environment variables display
   - System settings management

#### Advanced Features
- **Real-time Monitoring Components**
  - Live progress tracking with WebSocket updates
  - Phase indicators with visual timeline
  - Execution timeline with Recharts
  - Status badges with semantic coloring
  - Time tracking (elapsed & ETA)

- **Metrics Dashboard**
  - Async execution timeline chart
  - Cache hit rate gauge
  - Memory usage trend analysis
  - Phase duration breakdown
  - Performance alerts
  - Multiple chart types (Line, Area, Bar, Pie)

- **Plan Approval Workflow**
  - Modal-based plan display
  - Approve/Reject functionality
  - Comments input field
  - Real-time status updates
  - Auto-redirect after approval

- **Results Viewer**
  - Generated code display with syntax highlighting
  - Test results formatting
  - Review comments display
  - Export/download options
  - Copy-to-clipboard functionality

- **WebSocket Integration**
  - Real-time data streaming
  - Live component updates
  - Connection state management
  - Automatic reconnection handling

### 🏗️ Architecture

```
app/
├── page.tsx (landing - existing)
├── layout.tsx (global)
├── globals.css (theme & design tokens)
└── mgx/
    ├── layout.tsx (admin shell with header/sidebar/breadcrumb)
    ├── config/
    │   └── navigation.ts (centralized menu configuration)
    ├── page.tsx (overview dashboard)
    ├── tasks/
    │   ├── page.tsx (task list)
    │   └── [id]/page.tsx (task detail + monitor)
    ├── monitoring/
    │   └── page.tsx (metrics & charts)
    ├── metrics/
    │   └── page.tsx (legacy metrics)
    ├── results/
    │   └── page.tsx (results viewer)
    └── settings/
        └── page.tsx (configuration)

components/
├── MetricsDashboard.tsx (metrics charts)
├── TaskDetail.tsx (task details)
├── TaskList.tsx (task list)
├── TaskMonitor.tsx (progress tracking)
├── ResultsViewer.tsx (results display)
├── PlanViewer.tsx (plan approval)
├── StatusBadge.tsx (status indicators)
├── WebSocketProvider.tsx (WebSocket provider)
└── mgx/
    ├── header.tsx (top navigation bar)
    ├── sidebar.tsx (desktop sidebar)
    ├── sidebar-nav.tsx (navigation component)
    ├── breadcrumb.tsx (breadcrumb navigation)
    ├── task-monitor.tsx (real-time monitor)
    ├── task-monitoring-view.tsx (monitoring dashboard)
    ├── plan-approval-modal.tsx (plan approval)
    ├── results-viewer.tsx (results display)
    ├── metrics-chart.tsx (chart component)
    └── ui/
        ├── button.tsx (button component)
        ├── card.tsx (card component)
        ├── table.tsx (table component)
        ├── status-pill.tsx (status indicator)
        └── spinner.tsx (loading spinner)

hooks/
├── useWebSocket.ts (WebSocket connection)
├── useTasks.ts (task data fetching)
├── useMetrics.ts (metrics data fetching)
└── useApproval.ts (plan approval)

lib/
└── mgx/
    ├── env.ts (environment configuration)
    ├── rest-client.ts (API client)
    └── hooks/ (custom hooks)
```

---

## 📦 Phase 5: GitHub Repository Integration

### ✅ Git Features in Dashboard

Phase 5 delivers comprehensive GitHub integration with real-time git event tracking and metadata display throughout the dashboard.

#### 🔗 Repository Connection UI

**Git Settings Page** (`/mgx/settings/git`)
- **Repository Connection Form**: Connect GitHub repositories with OAuth or App Installation
  - Input: Repository URL (e.g., `https://github.com/owner/repo`)
  - Branch selection (default: `main`)
  - Optional: GitHub OAuth Token (scope: `repo`, `read:user`)
  - Optional: GitHub App Installation ID
  - Form validation and error handling
  - Connection status indicators

- **Repository List Management**
  - View all connected repositories per project
  - Repository metadata display (name, URL, branch)
  - Connection status badges (Connected, Syncing, Error)
  - Actions: Refresh metadata, Disconnect repository
  - Last sync timestamp display
  - Error state handling with retry options

**Components**:
- `RepositoryConnectForm` (`components/mgx/repository-connect-form.tsx`)
- `RepositoriesList` (`components/mgx/repositories-list.tsx`)

#### 🏷️ Git Metadata Display

**GitMetadataBadge Component** (`components/mgx/git-metadata-badge.tsx`)
- **Branch Badge**: Shows current branch name (blue, GitBranch icon)
- **Commit Badge**: Shows short commit SHA (purple, GitCommit icon, clickable)
- **PR Badge**: Shows pull request link (green, GitPullRequest icon, clickable)
- Responsive design with proper spacing
- Dark mode support
- Tooltips on hover with full metadata

**Integration Points**:
- Task monitoring views (`/mgx/tasks/[id]`)
- Task list views (`/mgx/tasks`)
- Project dashboard (`/mgx`)
- Real-time updates via WebSocket

**Git Metadata Structure**:
```typescript
interface GitMetadata {
  branch?: string;              // Current branch name
  commitSha?: string;           // Full commit hash
  commitMessage?: string;       // Commit message text
  authorName?: string;          // Commit author name
  authorEmail?: string;         // Commit author email
  prUrl?: string;               // Pull request URL (if exists)
  prNumber?: number;            // PR number (e.g., #123)
  lastSyncTime?: string;        // ISO timestamp of last sync
}
```

#### ⚡ Real-time Git Updates

**WebSocket Event Handling**:
```typescript
// Event: git_metadata_updated
{
  type: 'git_metadata_updated',
  data: {
    projectId: string;
    taskId?: string;
    metadata: GitMetadata;
  }
}

// Event: git_event
{
  type: 'git_event',
  data: {
    eventType: 'branch_created' | 'commit_created' | 'pull_request_opened';
    branch?: string;
    commitSha?: string;
    prUrl?: string;
    prNumber?: number;
    message: string;
  }
}
```

**Git Event Types**:
- `git_branch_created` → Display toast notification, update badge
- `git_commit_created` → Update commit SHA badge
- `pull_request_opened` → Show PR badge with link
- Error states → Display error toast with retry option

**UI Updates**:
- Automatic badge updates on git events
- Toast notifications for important git actions
- Loading states during metadata refresh
- Error recovery with manual refresh option

#### 🔄 Repository Management

**API Functions** (`lib/api.ts`):
```typescript
// Connect a new repository to project
connectRepository(projectId, {
  repoUrl: string;
  branch: string;
  githubToken?: string;
  installationId?: string;
})

// Disconnect repository from project
disconnectRepository(projectId, repositoryId)

// Manually refresh repository metadata
refreshRepositoryMetadata(projectId, repositoryId)
```

**SWR Hook** (`hooks/useRepositories.ts`):
```typescript
const { repositories, isLoading, error, mutate } = useRepositories(projectId);

// Features:
// - Automatic caching per project
// - Smart cache invalidation on mutations
// - Optimistic UI updates
// - Error handling with retry logic
```

**Repository Operations**:
1. **Connect**: Validate GitHub URL → Create connection → Initial metadata sync
2. **Disconnect**: Confirm action → Remove connection → Update UI
3. **Refresh**: Fetch latest metadata → Update cache → Show notification
4. **Auto-sync**: Background sync on git events (branches, commits, PRs)

#### ✅ Phase 5 Checklist
- ✅ Repository connection form with validation
- ✅ OAuth token and GitHub app support
- ✅ Repository list with management actions
- ✅ Git metadata badges (branch, commit, PR)
- ✅ Real-time WebSocket git events
- ✅ Toast notifications for git updates
- ✅ SWR-based repository caching
- ✅ Error handling and retry logic
- ✅ Responsive design with dark mode
- ✅ Comprehensive test coverage
- ✅ API integration with backend
- ✅ Documentation and examples

---

## 📦 Phase 6: Workspace & Project Management

### ✅ Multi-Tenant Architecture

Phase 6 delivers full multi-tenant support with workspace and project isolation, enabling teams to manage multiple projects within separate workspaces.

#### 🏢 Workspace Selector

**Header Integration** (`components/mgx/header.tsx`)
- **Workspace Dropdown**: Select from available workspaces
  - Workspace list with names and icons
  - Current workspace highlighted
  - "Create Workspace" option
  - Workspace settings access
  - Smooth transitions on switch

- **Project Dropdown**: Select projects within workspace
  - Project list filtered by workspace
  - Current project highlighted
  - "Create Project" option
  - Project settings link
  - Quick project search

**WorkspaceProvider** (`lib/mgx/workspace/workspace-context.tsx`)
```typescript
const {
  currentWorkspace,
  currentProject,
  workspaces,
  projects,
  selectWorkspace,
  selectProject,
  isLoading,
  error
} = useWorkspace();

// Features:
// - React Context for global state
// - Persistent selection via localStorage
// - URL synchronization (?workspace=id&project=id)
// - Automatic data refetching on switch
// - Loading states and error handling
```

**Context Switching Flow**:
1. User selects new workspace → Update context → Refetch projects
2. User selects new project → Update context → Reload tasks/metrics/repos
3. URL params updated → State persisted → Breadcrumbs updated
4. WebSocket reconnects with new workspace/project scope

#### 📂 Project Management

**Project Features**:
- **Project List View**: Browse all projects in workspace
  - Project cards with name, description, status
  - Quick stats (tasks count, last activity)
  - Repository connection indicator
  - Settings and delete actions

- **Project Creation**: Modal form for new projects
  - Project name and description
  - Workspace assignment
  - Initial settings configuration
  - Repository linking option

- **Project Settings** (`/mgx/projects/[id]/settings`)
  - General information (name, description)
  - Git repository configuration
  - Team members and permissions
  - Notification preferences
  - Danger zone (delete project)

**Project-Specific Features**:
- **Tasks**: Filtered by project ID
- **Metrics**: Scoped to project execution data
- **Repositories**: Linked per project (not workspace-wide)
- **Settings**: Project-level configuration
- **Monitoring**: Project-specific real-time updates

#### 🔒 Multi-Tenant UI & Data Isolation

**Data Scoping**:
```typescript
// All API requests include workspace and project context
GET /api/workspaces/{workspaceId}/projects/{projectId}/tasks
GET /api/workspaces/{workspaceId}/projects/{projectId}/metrics
GET /api/projects/{projectId}/repositories
POST /api/workspaces/{workspaceId}/projects

// WebSocket connections scoped to workspace and project
ws://api/workspaces/{workspaceId}/projects/{projectId}/stream
```

**Isolation Guarantees**:
- ✅ **Tasks**: Only tasks belonging to current project visible
- ✅ **Metrics**: Metrics calculated per project, not workspace-wide
- ✅ **Repositories**: Repos linked to specific project, not shared
- ✅ **Settings**: Project settings independent of other projects
- ✅ **WebSocket**: Events filtered by workspace and project ID
- ✅ **No Data Leakage**: Cross-workspace/project queries blocked

**Security Measures**:
- Context validation on every request
- URL tampering protection
- Authorization checks in middleware
- Workspace/project ownership verification

#### 🧭 Enhanced Navigation

**Breadcrumb Enhancement** (`components/mgx/breadcrumb.tsx`)
```tsx
// Example breadcrumb trail:
Workspace: Acme Corp / Project: Mobile App / Tasks / Task #123
```

**Navigation Features**:
- Current workspace and project always visible
- Clickable breadcrumb segments
- Icons for workspace and project
- Responsive collapsing on mobile
- Real-time context updates

**Sidebar Navigation**:
- Context-aware menu items
- Badge showing current project
- Quick workspace switcher
- Project-specific routes highlighted

#### 📊 Project-Specific Metrics

**Dashboard Metrics** (`/mgx`)
- **Task Statistics**: Total, completed, failed (per project)
- **Execution Metrics**: Average duration, success rate (per project)
- **Git Activity**: Commits, PRs, branches (per project)
- **Resource Usage**: API calls, storage (per project)

**Monitoring View** (`/mgx/monitoring`)
- Real-time task execution for current project
- Phase duration breakdown (per project)
- Performance trends (project-specific)
- Git event timeline (project's repository)

#### ✅ Phase 6 Checklist
- ✅ Workspace selector in header
- ✅ Project dropdown with filtering
- ✅ Multi-tenant context management
- ✅ Workspace and project creation
- ✅ Data isolation per project
- ✅ Scoped API requests
- ✅ WebSocket filtering by context
- ✅ Enhanced breadcrumb navigation
- ✅ Project-specific metrics
- ✅ Context persistence (localStorage + URL)
- ✅ Secure authorization checks
- ✅ Responsive design
- ✅ Comprehensive tests
- ✅ Updated documentation

---

## 🏗️ Complete Architecture Overview

### Frontend Architecture (Phase 4.5 + 5 + 6)

```
app/mgx/
├── layout.tsx                      # Admin shell with header, sidebar, breadcrumbs
├── page.tsx                        # Overview dashboard with metrics
├── config/
│   └── navigation.ts               # Centralized navigation config
├── tasks/
│   ├── page.tsx                    # Task list
│   └── [id]/
│       └── page.tsx                # Task detail + monitoring (with git badges)
├── monitoring/
│   └── page.tsx                    # Metrics & charts dashboard
├── results/
│   └── page.tsx                    # Results viewer
└── settings/
    ├── page.tsx                    # General settings
    └── git/
        └── page.tsx                # Git repository configuration (Phase 5)

components/mgx/
├── header.tsx                      # Header with workspace/project selector
├── sidebar.tsx                     # Desktop sidebar
├── sidebar-nav.tsx                 # Navigation component
├── breadcrumb.tsx                  # Breadcrumb with workspace/project
├── task-monitor.tsx                # Real-time task monitor
├── task-monitoring-view.tsx        # Task monitoring view (with git events)
├── repository-connect-form.tsx     # Repository connection form (Phase 5)
├── repositories-list.tsx           # Repository list (Phase 5)
├── git-metadata-badge.tsx          # Git metadata badges (Phase 5)
└── ui/
    ├── button.tsx
    ├── card.tsx
    ├── table.tsx
    ├── status-pill.tsx
    └── spinner.tsx

hooks/
├── useWebSocket.ts                 # WebSocket connection
├── useTasks.ts                     # Task data (workspace/project scoped)
├── useMetrics.ts                   # Metrics data (workspace/project scoped)
├── useRepositories.ts              # Repository data (Phase 5)
└── useApproval.ts                  # Plan approval

lib/
├── api.ts                          # API client with workspace/project scoping
├── types.ts                        # TypeScript types (includes GitMetadata, Repository)
├── utils.ts                        # Utility functions
└── mgx/
    ├── env.ts                      # Environment configuration
    ├── rest-client.ts              # REST API client
    └── workspace/
        ├── workspace-context.tsx   # Workspace provider (Phase 6)
        └── workspace-selector.tsx  # Workspace selector UI (Phase 6)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Interface (Next.js App Router)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  MgxHeader (Workspace + Project Selector)             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌────────────┬─────────────────────────────────────────┐  │
│  │  Sidebar   │  Main Content Area                       │  │
│  │  (Nav)     │  ┌─────────────────────────────────────┐│  │
│  │            │  │  Breadcrumb (Context)                ││  │
│  │            │  └─────────────────────────────────────┘│  │
│  │            │  ┌─────────────────────────────────────┐│  │
│  │            │  │  Page Content                        ││  │
│  │            │  │  • Tasks with git badges             ││  │
│  │            │  │  • Metrics (project-scoped)          ││  │
│  │            │  │  • Repository list & connection      ││  │
│  │            │  └─────────────────────────────────────┘│  │
│  └────────────┴─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  State Management Layer                                      │
│  ┌───────────────────────┬───────────────────────────────┐  │
│  │ WorkspaceContext      │  SWR Cache                    │  │
│  │ (Phase 6)             │  • Tasks                      │  │
│  │ • Current workspace   │  • Metrics                    │  │
│  │ • Current project     │  • Repositories (Phase 5)     │  │
│  │ • Persistence         │  • Smart invalidation         │  │
│  └───────────────────────┴───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  API Layer (lib/api.ts)                                      │
│  • Workspace/project scoping (Phase 6)                       │
│  • Repository endpoints (Phase 5)                            │
│  • Error handling                                            │
│  • Request/response transformation                           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  Backend API (NEXT_PUBLIC_MGX_API_BASE_URL)                  │
│  • Task management                                           │
│  • Metrics aggregation                                       │
│  • Repository operations (Phase 5)                           │
│  • Workspace/project management (Phase 6)                    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  WebSocket Connection (NEXT_PUBLIC_MGX_WS_URL)               │
│  • Real-time task updates                                    │
│  • Metric updates                                            │
│  • Git events (Phase 5)                                      │
│  • Workspace context filtering (Phase 6)                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

#### 1. **Multi-Tenant Context Management** (Phase 6)
```typescript
// WorkspaceProvider wraps entire app
<WorkspaceProvider>
  <MgxLayout>
    {/* All components have access to workspace/project context */}
    {children}
  </MgxLayout>
</WorkspaceProvider>

// Components use the context
const { currentWorkspace, currentProject } = useWorkspace();
```

#### 2. **SWR for Data Caching** (All Phases)
```typescript
// Repositories cached per project (Phase 5)
const { repositories } = useRepositories(projectId);

// Tasks cached with workspace/project scope (Phase 6)
const { tasks } = useTasks(workspaceId, projectId);
```

#### 3. **Real-time Updates via WebSocket**
```typescript
// WebSocket scoped to workspace/project (Phase 6)
const ws = useWebSocket(`/ws/workspaces/${wsId}/projects/${projId}`);

// Git events handled in task monitoring view (Phase 5)
useEffect(() => {
  if (message?.type === 'git_metadata_updated') {
    setGitMetadata(message.data.metadata);
  }
}, [message]);
```

#### 4. **Component Composition**
```typescript
// Task monitoring with git metadata (Phase 5)
<TaskMonitoringView taskId={id}>
  {gitMetadata && <GitMetadataBadge metadata={gitMetadata} />}
</TaskMonitoringView>
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-front

# Install dependencies
npm install

# Copy environment configuration
cp .env.local.example .env.local
```

### Configuration

Edit `.env.local` with your settings:

```env
# API Configuration
NEXT_PUBLIC_MGX_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MGX_WS_URL=ws://localhost:8000/ws

# GitHub OAuth Configuration (Phase 5)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/mgx/settings/git/callback

# Optional: Environment Label
NEXT_PUBLIC_ENV=development
```

**Environment Variables:**
- `NEXT_PUBLIC_MGX_API_BASE_URL`: Backend API endpoint for REST calls
- `NEXT_PUBLIC_MGX_WS_URL`: WebSocket endpoint for real-time updates
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`: GitHub OAuth App client ID (optional, for repository connection)
- `NEXT_PUBLIC_GITHUB_REDIRECT_URI`: OAuth callback URL (must match GitHub app settings)
- `NEXT_PUBLIC_ENV`: Environment label for header badge (DEV/PROD/custom)

### Running Development Server

```bash
npm run dev
```

Access the application:
- **Landing Page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/mgx
- **Overview**: http://localhost:3000/mgx
- **Tasks**: http://localhost:3000/mgx/tasks
- **Task Detail**: http://localhost:3000/mgx/tasks/[id]
- **Monitoring**: http://localhost:3000/mgx/monitoring
- **Settings**: http://localhost:3000/mgx/settings
- **Git Settings** (Phase 5): http://localhost:3000/mgx/settings/git

### Quick Start Guide

#### 1. Start the Application
```bash
npm run dev
```

#### 2. Set Up Workspace (Phase 6)
- Navigate to the dashboard header
- Click on the workspace selector dropdown
- Select or create a workspace
- Select or create a project within the workspace

#### 3. Connect GitHub Repository (Phase 5)
- Go to **Settings → Git Repository Configuration**
- Enter your repository URL (e.g., `https://github.com/owner/repo`)
- Select the branch to track
- (Optional) Add GitHub OAuth token or App Installation ID
- Click "Connect Repository"

#### 4. View Real-time Git Updates
- Navigate to **Tasks** page
- Open any task detail view
- See git metadata badges (branch, commit, PR)
- Watch badges update in real-time as git events occur

#### 5. Monitor Task Execution
- Create or view a task
- Watch real-time progress updates
- See git activity during task execution
- View branch creation, commits, and PR links

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.0.7 | App Router, SSR/SSG |
| **React** | 19.2.1 | UI component framework |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Recharts** | 3.2.1 | Chart & visualization |
| **SWR** | 2.3.4 | Data fetching & caching |
| **Lucide React** | 0.542.0 | Icon library |
| **React Syntax Highlighter** | 16.1.0 | Code syntax highlighting |
| **Sonner** | 2.0.7 | Toast notifications |
| **Jest** | 30.x | Unit testing |
| **React Testing Library** | 16.3.0 | Component testing |

---

## 📋 Routes & Pages

### Dashboard Routes

```
GET  /mgx                          Overview dashboard
GET  /mgx/tasks                    Task list view
GET  /mgx/tasks/:id                Task detail & monitor
GET  /mgx/monitoring               Metrics & monitoring
GET  /mgx/metrics                  Legacy metrics page
GET  /mgx/results                  Results viewer
GET  /mgx/settings                 General configuration
GET  /mgx/settings/git             Git repository configuration (Phase 5)
```

### API Expectations

The dashboard expects the following API endpoints from `NEXT_PUBLIC_MGX_API_BASE_URL`:

**Phase 4.5 - Core Dashboard**:
```
GET    /tasks                 Fetch task list
GET    /tasks/:id             Fetch task details
POST   /tasks                 Create new task
PUT    /tasks/:id             Update task
DELETE /tasks/:id             Delete task
GET    /metrics               Fetch metrics data
GET    /results               Fetch results
POST   /approval              Submit plan approval
```

**Phase 5 - Git Repository Integration**:
```
GET    /projects/{projectId}/repositories                    List connected repositories
POST   /projects/{projectId}/repositories/connect            Connect a new repository
DELETE /projects/{projectId}/repositories/{repoId}           Disconnect repository
POST   /projects/{projectId}/repositories/{repoId}/refresh   Refresh repository metadata
```

**Phase 6 - Workspace & Project Management**:
```
GET    /workspaces                                            List available workspaces
POST   /workspaces                                            Create new workspace
GET    /workspaces/{workspaceId}/projects                    List projects in workspace
POST   /workspaces/{workspaceId}/projects                    Create new project
GET    /workspaces/{workspaceId}/projects/{projectId}/tasks  Fetch tasks (scoped)
GET    /workspaces/{workspaceId}/projects/{projectId}/metrics Fetch metrics (scoped)
```

### WebSocket Events

Real-time updates via WebSocket (`NEXT_PUBLIC_MGX_WS_URL`):

**Phase 4.5 - Core Events**:
```javascript
Event: task:update
Payload: { id, status, progress, phase }

Event: task:complete
Payload: { id, result }

Event: metric:update
Payload: { timestamp, metric_name, value }

Event: plan:pending
Payload: { task_id, plan_content }
```

**Phase 5 - Git Events**:
```javascript
Event: git_metadata_updated
Payload: {
  projectId: string;
  taskId?: string;
  metadata: {
    branch?: string;
    commitSha?: string;
    commitMessage?: string;
    prUrl?: string;
    prNumber?: number;
    lastSyncTime?: string;
  }
}

Event: git_event
Payload: {
  eventType: 'branch_created' | 'commit_created' | 'pull_request_opened';
  branch?: string;
  commitSha?: string;
  prUrl?: string;
  prNumber?: number;
  message: string;
}
```

**Phase 6 - Workspace Events**:
```javascript
Event: workspace_switched
Payload: { workspaceId: string; workspaceName: string }

Event: project_switched
Payload: { projectId: string; projectName: string }
```

---

## 🎨 Styling & Theme

### Design System
- **Color Palette**: Zinc for neutrals with semantic colors
- **Typography**: Geist font via Next Font
- **Spacing**: Tailwind spacing scale (4px base unit)
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Dark Mode
- Automatic system preference detection
- CSS variables for theme customization
- Dark mode classes with `dark:` prefix
- Colors: `zinc-50` to `zinc-950`

### CSS Variables (in `app/globals.css`)
```css
--color-primary: rgb(var(--primary))
--color-secondary: rgb(var(--secondary))
--border-color: rgb(var(--border))
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- **Component Tests**: 55+ tests passing ✓
- **Unit Tests**: Hooks and utilities
- **Integration Tests**: API and WebSocket integration
- **Git Integration Tests**: Repository operations and metadata display
- **Multi-Tenant Tests**: Workspace isolation and context switching
- **E2E Tests**: Critical user flows

### Test Files Location
```
__tests__/
├── mgx/
│   ├── header.test.tsx
│   ├── sidebar-nav.test.tsx
│   ├── breadcrumb.test.tsx
│   ├── layout.test.tsx
│   ├── overview-page.test.tsx
│   ├── settings-page.test.tsx
│   ├── repository-connect-form.test.tsx (Phase 5)
│   ├── git-metadata-badge.test.tsx (Phase 5)
│   ├── task-monitoring-view.test.tsx (Phase 5 - git events)
│   └── ui/
│       ├── button.test.tsx
│       └── card.test.tsx
└── e2e/
    └── dashboard.spec.ts
```

### Phase 5 Test Coverage
- ✅ Repository connection form validation
- ✅ Repository connection success/error states
- ✅ Git metadata badge display
- ✅ WebSocket git event handling
- ✅ Repository list management
- ✅ Toast notifications for git events

### Phase 6 Test Coverage
- ✅ Workspace selector functionality
- ✅ Project switching
- ✅ Context persistence
- ✅ Data isolation verification
- ✅ Multi-tenant API scoping

---

## 🪝 Custom Hooks

### Phase 4.5 Hooks

#### `useWebSocket(url: string)`
Real-time WebSocket connection with automatic reconnection.

```typescript
const { data, isConnected, error } = useWebSocket('ws://localhost:8000/ws');
```

#### `useTasks()`
Fetch and manage task list with caching.

```typescript
const { tasks, isLoading, error, mutate } = useTasks();
```

#### `useMetrics()`
Fetch metrics data with real-time updates.

```typescript
const { metrics, isLoading, error } = useMetrics();
```

#### `useApproval()`
Handle plan approval workflow.

```typescript
const { approve, reject, isLoading } = useApproval();
```

### Phase 5 Hooks

#### `useRepositories(projectId: string)`
Fetch and manage repository connections per project with SWR caching.

```typescript
const { repositories, isLoading, error, mutate } = useRepositories(projectId);

// Trigger mutations
mutate(); // Refetch data
```

**Features**:
- Automatic caching per project
- Smart cache invalidation
- Optimistic UI updates
- Error handling with retry

### Phase 6 Hooks

#### `useWorkspace()`
Access workspace and project context from WorkspaceProvider.

```typescript
const {
  currentWorkspace,
  currentProject,
  workspaces,
  projects,
  selectWorkspace,
  selectProject,
  isLoading,
  error
} = useWorkspace();

// Switch workspace
await selectWorkspace(workspaceId);

// Switch project
await selectProject(projectId);
```

**Features**:
- Global workspace/project state
- Persistent selection (localStorage + URL)
- Automatic data refetching
- Loading and error states

---

## 🔧 Key Components

### Phase 4.5 Components

#### `MgxHeader`
Top navigation bar with environment badge, workspace selector, and user menu.

```tsx
<MgxHeader />
```

#### `MgxSidebar`
Desktop sidebar with config-driven navigation.

```tsx
<MgxSidebar />
```

#### `MgxSidebarNav`
Navigation component (desktop vertical / mobile horizontal).

```tsx
<MgxSidebarNav variant="horizontal" />
```

#### `MgxBreadcrumb`
Dynamic breadcrumb based on current route with workspace/project context.

```tsx
<MgxBreadcrumb />
```

#### `TaskMonitor`
Real-time task progress tracking.

```tsx
<TaskMonitor taskId="123" />
```

#### `MetricsDashboard`
Charts and metrics visualization.

```tsx
<MetricsDashboard />
```

#### `PlanApprovalModal`
Modal for plan review and approval.

```tsx
<PlanApprovalModal isOpen={true} onClose={() => {}} />
```

#### `ResultsViewer`
Code and results display with syntax highlighting.

```tsx
<ResultsViewer code={generatedCode} results={results} />
```

### Phase 5 Components

#### `RepositoryConnectForm`
Form for connecting GitHub repositories to projects.

```tsx
<RepositoryConnectForm projectId="proj_123" onSuccess={() => {}} />
```

**Props**:
- `projectId`: Project ID to connect repository to
- `onSuccess`: Callback after successful connection

**Features**:
- Repository URL input with validation
- Branch selection
- OAuth token and installation ID support
- Real-time validation feedback
- Loading states and error handling

#### `RepositoriesList`
Display and manage connected repositories.

```tsx
<RepositoriesList projectId="proj_123" />
```

**Features**:
- Table view of repositories
- Connection status badges
- Refresh metadata action
- Disconnect action
- Last sync timestamp

#### `GitMetadataBadge`
Display git metadata badges (branch, commit, PR).

```tsx
<GitMetadataBadge metadata={gitMetadata} />
```

**Props**:
- `metadata`: GitMetadata object with branch, commitSha, prUrl, etc.

**Features**:
- Color-coded badges (branch: blue, commit: purple, PR: green)
- Clickable commit and PR badges
- Icons from lucide-react
- Responsive design

### Phase 6 Components

#### `WorkspaceSelector`
Dropdown selector for workspaces and projects (in header).

```tsx
<WorkspaceSelector />
```

**Features**:
- Workspace dropdown with list
- Project dropdown filtered by workspace
- Create workspace/project options
- Loading states
- Persistent selection

#### `WorkspaceProvider`
React Context provider for workspace state.

```tsx
<WorkspaceProvider>
  <YourApp />
</WorkspaceProvider>
```

**Features**:
- Global workspace/project state
- Automatic API integration
- URL synchronization
- localStorage persistence

---

## 📊 Features Overview

### Phase 4.5 Features

#### Real-time Monitoring ⚡
- **Live Progress Tracking**: WebSocket-powered real-time updates
- **Phase Visualization**: Analyze → Plan → Execute → Review
- **Timeline Display**: Visual execution timeline with timestamps
- **Status Indicators**: Color-coded status badges
- **Performance Metrics**: Time elapsed and ETA tracking

#### Metrics Dashboard 📈
- **Interactive Charts**: Line, area, bar, and pie charts
- **Multiple Metrics**: Cache hit rate, memory usage, execution time
- **Performance Alerts**: Real-time performance monitoring
- **Trend Analysis**: Historical data visualization
- **Responsive Design**: Mobile-optimized charts

#### Task Management 📋
- **List View**: Browsable task list with filters
- **Create Tasks**: Form-based task creation
- **Execution Control**: Cancel, retry, and pause operations
- **Search**: Full-text task search
- **History**: Track task execution history

#### Plan Approval Workflow ✅
- **Modal Interface**: Clean modal for plan review
- **Approval Actions**: Approve or reject with comments
- **Real-time Status**: Live status updates
- **Auto-redirect**: Navigate after approval completion

#### Results Viewer 🔍
- **Code Display**: Syntax-highlighted generated code
- **Test Results**: Formatted test output
- **Comments**: Review and feedback display
- **Export Options**: Download results
- **Copy-to-Clipboard**: Easy code copying

### Phase 5 Features

#### GitHub Repository Integration 🔗
- **Repository Connection**: Connect GitHub repos via OAuth or App Installation
- **Branch Tracking**: Monitor specific branches for commits
- **Commit Display**: Show commit SHA with direct GitHub links
- **PR Integration**: Display pull request links and status
- **Real-time Sync**: Automatic metadata updates via WebSocket
- **Repository Management**: Refresh metadata, disconnect repos
- **Error Handling**: User-friendly error messages and retry options
- **OAuth Support**: Personal access tokens and GitHub app installations

#### Git Metadata Display 🏷️
- **Branch Badges**: Visual branch indicators in task views
- **Commit Badges**: Clickable commit SHA links
- **PR Badges**: Pull request links with PR numbers
- **Real-time Updates**: Badges update automatically on git events
- **Toast Notifications**: Alerts for new branches, commits, PRs
- **Dark Mode Support**: Consistent styling across themes

### Phase 6 Features

#### Multi-Tenant Workspace Management 🏢
- **Workspace Selector**: Easy switching between workspaces
- **Project Management**: Create and manage projects per workspace
- **Context Persistence**: Selections saved across sessions
- **URL Synchronization**: Deep linking with workspace/project context
- **Breadcrumb Navigation**: Clear context display in UI
- **Loading States**: Visual feedback during data loading

#### Data Isolation & Security 🔒
- **Project Scoping**: All data filtered by current project
- **Workspace Isolation**: No cross-workspace data leakage
- **API Scoping**: Automatic workspace/project context in requests
- **WebSocket Filtering**: Real-time events scoped to context
- **Authorization**: Context validation on every request
- **Secure Switching**: Safe transitions between workspaces/projects

#### Project-Specific Views 📂
- **Scoped Tasks**: Only see tasks for current project
- **Project Metrics**: Metrics calculated per project
- **Repository Links**: Repos connected per project
- **Settings**: Project-level configuration
- **Real-time Updates**: Events filtered by project context

---

## 🌐 Environment & Deployment

### Environment Badge
The header displays the current environment:
- **Default**: Detects `NODE_ENV`
- **Custom**: Set `NEXT_PUBLIC_ENV` for custom label

### Development Environment
```bash
NEXT_PUBLIC_MGX_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MGX_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_ENV=development
```

### Production Environment
```bash
NEXT_PUBLIC_MGX_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_MGX_WS_URL=wss://api.yourdomain.com/ws
NEXT_PUBLIC_ENV=production
```

### 🚀 Netlify Deployment

Bu proje Netlify'a deploy edilmek için hazırlanmıştır. `netlify.toml` dosyası proje root'unda bulunmaktadır.

#### Önkoşullar
- Netlify hesabı ([app.netlify.com](https://app.netlify.com))
- GitHub repository'ye push yetkisi
- Backend API URL'i (production ortamı için)

#### Deployment Adımları

**1. Netlify Dashboard'da Site Oluşturma**
1. [Netlify Dashboard](https://app.netlify.com)'a giriş yapın
2. "Add new site" > "Import an existing project" seçin
3. GitHub'ı bağlayın (ilk kez ise yetkilendirme gerekir)
4. Repository'yi seçin (`ai-team` veya frontend repository'niz)
5. Branch: `main` (veya `master`)

**2. Build Ayarları**
Netlify otomatik olarak `netlify.toml` dosyasını algılar, ancak manuel kontrol için:
- **Base directory**: `frontend` (proje root'unda değilse)
- **Build command**: `npm install && npm run build` (netlify.toml'da tanımlı)
- **Publish directory**: `.next` (netlify.toml'da tanımlı)
- **Node version**: 18.x (netlify.toml'da tanımlı)

**3. Environment Variables Ayarlama**
Site settings > Environment variables bölümüne gidin ve şu değişkenleri ekleyin:

```bash
# Zorunlu
NEXT_PUBLIC_MGX_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_MGX_WS_URL=wss://api.yourdomain.com/ws

# Opsiyonel
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

**4. İlk Deploy**
- "Deploy site" butonuna tıklayın
- Build işlemi başlayacak (yaklaşık 2-5 dakika)
- Deploy tamamlandığında site URL'i gösterilecek

**5. Otomatik Deploy**
- Her `main` branch'e push işlemi otomatik deploy tetikler
- Pull request'ler için preview deploy'lar oluşturulur
- Deploy durumunu Netlify dashboard'dan takip edebilirsiniz

#### Netlify Yapılandırması

`netlify.toml` dosyası şunları içerir:
- **Build settings**: Node.js versiyonu, build komutu
- **Next.js plugin**: `@netlify/plugin-nextjs` otomatik yüklenir
- **Redirects**: API routes için gerekli yönlendirmeler
- **Headers**: Güvenlik ve cache ayarları

#### Troubleshooting

**Build hatası alıyorsanız:**
- Node.js versiyonunu kontrol edin (18.x gerekli)
- Environment variables'ların doğru ayarlandığından emin olun
- Build loglarını Netlify dashboard'dan inceleyin

**API bağlantı sorunları:**
- Backend CORS ayarlarını kontrol edin (Netlify domain'i için)
- `NEXT_PUBLIC_MGX_API_BASE_URL` değerinin doğru olduğundan emin olun
- WebSocket URL'inin `wss://` (secure) protokolü kullandığından emin olun

**Custom domain kullanımı:**
- Site settings > Domain management
- Custom domain ekleyin ve DNS ayarlarını yapın

#### Daha Fazla Bilgi
- [Netlify Next.js Dokümantasyonu](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

### 🏢 Workspace Selection & Management

The MGX Dashboard now includes comprehensive workspace and project management functionality:

#### Features
- **Multi-tenant Architecture**: Users can switch between different workspaces and projects
- **Context-Aware Data**: All API requests automatically include workspace/project scoping
- **Persistent Selection**: Workspace and project selections persist across sessions via URL params and localStorage
- **Real-time Context**: Breadcrumbs and navigation show current workspace/project context
- **WebSocket Integration**: Live data streams are automatically filtered by workspace/project context

#### Backend Endpoints
The workspace system integrates with the following backend endpoints:
- `GET /api/workspaces` - Fetch available workspaces
- `GET /api/projects?workspace_id=...` - Fetch projects within a workspace

#### Implementation Components
- **WorkspaceProvider** (`lib/mgx/workspace/workspace-context.tsx`): React context managing workspace state
- **WorkspaceSelector** (`lib/mgx/workspace/workspace-selector.tsx`): UI component for workspace/project selection
- **Updated API Layer** (`lib/api.ts`): Enhanced with workspace/project scoping
- **Updated Hooks**: `useTasks`, `useMetrics`, `useWebSocket` now automatically include workspace context

#### Usage
```tsx
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

function MyComponent() {
  const {
    currentWorkspace,
    currentProject,
    selectWorkspace,
    selectProject,
    workspaces,
    projects,
  } = useWorkspace();

  // Access current selections and trigger changes
  return (
    <div>
      <h3>Current Context:</h3>
      <p>Workspace: {currentWorkspace?.name}</p>
      <p>Project: {currentProject?.name}</p>
    </div>
  );
}
```

#### UI Integration
- **Header Integration**: Workspace/project selectors appear in the main dashboard header
- **Breadcrumb Enhancement**: Shows current workspace/project context with icons
- **Context Switching**: Dropdown selectors for both workspace and project levels
- **Loading States**: Visual feedback during workspace/project data fetching
- **Error Handling**: Graceful degradation when API calls fail
- **Empty States**: Clear messaging when no workspaces or projects are available

#### Environment Variables
- `NEXT_PUBLIC_MGX_API_BASE_URL`: Backend API base URL for workspace endpoints
- `NEXT_PUBLIC_MGX_WS_URL`: WebSocket URL for real-time workspace-scoped updates

---

## 🔗 GitHub Repository Connection

The MGX Dashboard includes comprehensive GitHub repository integration for automated branch tracking and metadata sync:

#### Features
- **Repository Connection**: Connect GitHub repositories with automatic validation
- **Branch Tracking**: Track specific branches for commits and metadata
- **Git Metadata Display**: Show branch badges, commit SHA, and PR links in task views
- **Real-time Updates**: WebSocket events trigger automatic UI updates on git events
- **OAuth Support**: Support for GitHub OAuth tokens and app installations
- **Repository Management**: Refresh metadata, disconnect repositories, and view sync status

#### Configuration (`/mgx/settings/git`)
1. Navigate to **Settings → Git Repository Configuration**
2. Fill in the Repository URL (e.g., `https://github.com/owner/repo`)
3. Select the Branch to track (default: `main`)
4. Optionally provide:
   - **GitHub OAuth Token**: Personal access token for private repos (scope: `repo`, `read:user`)
   - **GitHub App Installation ID**: For app-based authentication
5. Click "Connect Repository"

#### API Integration
The frontend communicates with these backend endpoints:
- `GET /api/projects/{projectId}/repositories` - List connected repositories
- `POST /api/projects/{projectId}/repositories/connect` - Connect a repository
- `DELETE /api/projects/{projectId}/repositories/{repoId}` - Disconnect a repository
- `POST /api/projects/{projectId}/repositories/{repoId}/refresh` - Refresh repository metadata

#### WebSocket Events
The dashboard listens for git-related WebSocket events:
- `git_metadata_updated` - Repository metadata (branch, commit, PR) updated
- `git_event` - General git events from the backend

#### Git Metadata in Task Views
When git metadata is available, tasks display:
- **Branch Badge**: Current tracked branch (blue)
- **Commit Badge**: Short commit SHA (purple)
- **PR Badge**: Pull request link with number (green, clickable)

#### Environment Variables
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`: (Optional) GitHub OAuth app client ID for app-based auth
- `NEXT_PUBLIC_MGX_API_BASE_URL`: Backend API for repository endpoints

#### Git Metadata Types
```typescript
interface GitMetadata {
  branch?: string;              // Current branch name
  commitSha?: string;           // Full commit hash
  commitMessage?: string;       // Commit message
  authorName?: string;          // Author name
  authorEmail?: string;         // Author email
  prUrl?: string;               // Pull request URL
  prNumber?: number;            // Pull request number
  lastSyncTime?: string;        // Last sync timestamp
}
```

#### Optimizations
- **SWR Caching**: Repository lists cached per project with smart invalidation
- **Optimistic Updates**: UI updates reflect changes immediately
- **Error Handling**: User-friendly error messages for connection failures
- **Metadata Refresh**: Manual refresh available to sync latest repository state

---

## 📚 Documentation

### Core Documentation
- **Implementation Guide**: `MGX_DASHBOARD_IMPLEMENTATION.md` - Detailed implementation walkthrough
- **This README**: Comprehensive overview and quick start guide

### Component Documentation
- **Component Library**: `components/mgx/ui/` - Reusable UI components
- **Git Components**: `components/mgx/repository-*.tsx` and `git-metadata-badge.tsx`
- **Workspace Components**: `lib/mgx/workspace/` - Context and selectors

### Hook Documentation
- **Core Hooks**: `hooks/` directory
  - `useTasks.ts` - Task data management
  - `useMetrics.ts` - Metrics fetching
  - `useRepositories.ts` (Phase 5) - Repository management
  - `useWebSocket.ts` - WebSocket connection
- **Context Hooks**: `lib/mgx/workspace/workspace-context.tsx`
  - `useWorkspace()` (Phase 6) - Workspace/project state

### API Documentation
- **API Functions**: `lib/api.ts`
  - Core task/metric endpoints
  - Repository connection endpoints (Phase 5)
  - Workspace/project scoped requests (Phase 6)
- **WebSocket Events**: See [WebSocket Events](#websocket-events) section

### Type Definitions
- **Core Types**: `lib/types.ts`
  - `Repository`, `GitMetadata`, `RepositoryStatus`
  - `GitEvent`, `WebSocketMessage`
  - `Task`, `Metric`, and more

### Configuration
- **Navigation Config**: `app/mgx/config/navigation.ts` - Menu structure
- **Environment Variables**: See [Configuration](#configuration) section

### Recommended Reading Order
1. Start with this README for overview
2. Review `MGX_DASHBOARD_IMPLEMENTATION.md` for implementation details
3. Check specific component files for usage patterns
4. Explore hooks in `hooks/` directory for data management
5. Review `lib/types.ts` for full type definitions

---

## 🚀 Performance Optimizations

- **Data Caching**: SWR for automatic cache management
- **Lazy Loading**: Dynamic imports for route components
- **Code Splitting**: Automatic by Next.js
- **Image Optimization**: Next.js Image component
- **Memoization**: React.memo for expensive components
- **Web Vitals**: Optimized for Core Web Vitals

---

## 🔐 Security Considerations

- **Type Safety**: Full TypeScript coverage
- **Input Validation**: Data validation on API calls
- **Environment Secrets**: Use `.env.local` for sensitive data
- **CORS**: Configure backend for frontend domain
- **CSP Headers**: Set content security policy
- **XSS Protection**: Sanitized dynamic content

---

## 📅 Roadmap

### ✅ Phase 4.5: Core Dashboard (COMPLETED)
- ✅ Admin dashboard shell with responsive layout
- ✅ Real-time monitoring with WebSocket integration
- ✅ Task management and execution control
- ✅ Metrics dashboard with charts
- ✅ Plan approval workflow
- ✅ Results viewer with syntax highlighting
- ✅ Comprehensive component library
- ✅ Dark mode support

### ✅ Phase 5: GitHub Repository Integration (COMPLETED)
- ✅ Repository connection UI with OAuth support
- ✅ Git metadata display (branch, commit, PR)
- ✅ Real-time git event handling
- ✅ Repository management (connect, disconnect, refresh)
- ✅ SWR-based repository caching
- ✅ Git metadata badges in task views
- ✅ WebSocket git events (branch_created, commit_created, PR_opened)
- ✅ Comprehensive test coverage
- ✅ Git settings page

### ✅ Phase 6: Workspace & Project Management (COMPLETED)
- ✅ Multi-tenant workspace architecture
- ✅ Workspace selector in header
- ✅ Project management within workspaces
- ✅ Context-aware API integration (workspace/project scoping)
- ✅ Data isolation per project
- ✅ Persistent workspace/project selection (localStorage + URL)
- ✅ Enhanced breadcrumb navigation
- ✅ WebSocket filtering by workspace/project
- ✅ Project-specific metrics and views
- ✅ Comprehensive tests

### Phase 7: Authentication & Authorization 🔐
- User authentication (JWT/OAuth2)
- Role-based access control (RBAC)
- Permission management UI
- Session handling and token refresh
- Workspace-level permissions
- Project access controls
- User profile management
- Login/logout flows

### Phase 8: Team Collaboration & Management 👥
- Multi-user support
- Team member invitations
- Activity logging and audit trails
- Team management dashboard
- Notifications & alerts system
- Workspace sharing & collaboration
- Cross-project task assignment
- Real-time presence indicators
- Comments and mentions

### Phase 9: Advanced Analytics & Reporting 📊
- Custom dashboard builder
- Data export (CSV, Excel, PDF)
- Advanced filtering and search
- Custom report generation
- Cross-workspace analytics
- Workspace performance comparison
- Predictive analytics
- Trend analysis and forecasting

---

## ✅ Complete Features Checklist

### Core Dashboard Features
- ✅ Responsive admin layout (mobile, tablet, desktop)
- ✅ Config-driven navigation system
- ✅ Dynamic breadcrumb navigation
- ✅ Environment badge (DEV/PROD)
- ✅ Dark mode support
- ✅ Real-time WebSocket connection
- ✅ Loading states and error handling
- ✅ Toast notifications

### Task Management
- ✅ Task list with filtering and sorting
- ✅ Task creation form
- ✅ Task detail view
- ✅ Real-time progress tracking
- ✅ Phase indicators (Analyze → Plan → Execute → Review)
- ✅ Execution timeline visualization
- ✅ Task execution control (cancel, retry)
- ✅ Search functionality

### Git Integration (Phase 5)
- ✅ Repository connection UI
- ✅ GitHub OAuth flow
- ✅ Repository selection and validation
- ✅ Default branch configuration
- ✅ Connection status indicators
- ✅ Git metadata display (branch, commit, PR)
- ✅ Branch badge in task views
- ✅ Commit SHA links to GitHub
- ✅ PR URL buttons
- ✅ Real-time git event updates
- ✅ git_branch_created event handling
- ✅ git_commit_created event handling
- ✅ pull_request_opened event handling
- ✅ Toast notifications for git events
- ✅ Repository management (connect, disconnect, refresh)
- ✅ Error state handling
- ✅ SWR caching for repositories

### Workspace & Project Features (Phase 6)
- ✅ Workspace selector in header
- ✅ Workspace dropdown with list
- ✅ Switch between workspaces
- ✅ Workspace name display
- ✅ Project selector dropdown
- ✅ Projects list per workspace
- ✅ Create new project
- ✅ Project settings access
- ✅ Repository linking per project
- ✅ Project-specific metrics
- ✅ Multi-tenant UI with data isolation
- ✅ Workspace isolation (no data leakage)
- ✅ Project-scoped tasks
- ✅ Project-scoped metrics
- ✅ Project-specific repositories
- ✅ Breadcrumbs with workspace/project context
- ✅ Context persistence (localStorage + URL)
- ✅ Secure API calls with context validation

### Metrics & Monitoring
- ✅ Real-time metrics dashboard
- ✅ Interactive charts (line, area, bar, pie)
- ✅ Cache hit rate gauge
- ✅ Memory usage trends
- ✅ Phase duration breakdown
- ✅ Performance alerts
- ✅ Project-scoped metrics

### Real-time Updates
- ✅ WebSocket connection management
- ✅ Automatic reconnection
- ✅ Task status updates
- ✅ Metric updates
- ✅ Git metadata updates
- ✅ Workspace context filtering
- ✅ Project context filtering

### UI Components Library
- ✅ Button component with variants
- ✅ Card component
- ✅ Table component
- ✅ Status pills
- ✅ Spinner/loading indicators
- ✅ Repository connect form
- ✅ Repository list
- ✅ Git metadata badges
- ✅ Workspace selector
- ✅ Project selector

### Testing & Quality
- ✅ Unit tests (55+ passing)
- ✅ Component tests
- ✅ Integration tests
- ✅ Git feature tests
- ✅ Multi-tenant tests
- ✅ WebSocket event tests
- ✅ Error handling tests

### Documentation
- ✅ Comprehensive README
- ✅ Implementation guide (MGX_DASHBOARD_IMPLEMENTATION.md)
- ✅ Component usage examples
- ✅ API documentation
- ✅ WebSocket events documentation
- ✅ Environment setup guide
- ✅ Git features documentation
- ✅ Workspace/project documentation

---

## 🤝 Contributing

1. Follow the existing code patterns in `components/mgx/`
2. Update navigation config in `app/mgx/config/navigation.ts` for new routes
3. Use TypeScript for all new code
4. Add tests for new features
5. Ensure responsive design works on all breakpoints

### Code Standards
- Components use `React.forwardRef` for DOM elements
- Icons from `lucide-react`
- Styling via Tailwind utilities
- Dark mode support required (`dark:` prefix)
- All pages exported as async components (RSC)
- Git features: Use types from `lib/types.ts`
- SWR hooks: Include project/workspace context
- API functions: Build scoped URLs with workspace/project

---

## 📝 License

This project is part of the TEM (Temporal Execution Manager) platform.

---

## 🆘 Support & Troubleshooting

### WebSocket Connection Issues
- Verify `NEXT_PUBLIC_MGX_WS_URL` is correct
- Check backend WebSocket server is running
- Review browser console for connection errors

### API Integration
- Ensure `NEXT_PUBLIC_MGX_API_BASE_URL` points to correct backend
- Verify CORS headers are configured
- Check network tab for failed requests

### Dark Mode Not Working
- Verify system preference in OS settings
- Check `@tailwindcss/postcss` version
- Clear browser cache and rebuild

### Performance Issues
- Check network tab for slow API responses
- Verify WebSocket connection is stable
- Profile components with React DevTools

---

## 📞 Contact & Questions

For questions or issues:
1. Check existing documentation
2. Review the implementation guide
3. Check component examples in `/components/mgx/`
4. Consult custom hooks in `/hooks/`

---

**Version**: 1.0.0 | **Last Updated**: Phase 5-6 Complete | **Status**: 🚀 Production-Ready
