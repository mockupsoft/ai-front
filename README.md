# AI-Front: MGX Admin Dashboard

A modern, feature-rich admin dashboard built with Next.js 16, React 19, and TypeScript. Part of the TEM (Temporal Execution Manager) platform featuring real-time monitoring, metrics visualization, and WebSocket integration.

## 🎯 Project Status

| Component | Status | Details |
|-----------|--------|---------|
| Dashboard Shell | ✅ LIVE | Production-ready admin interface |
| Real-time Monitoring | ✅ Working | WebSocket integration operational |
| WebSocket Connection | ✅ Connected | Live data streaming enabled |
| API Integration | ✅ Complete | REST API fully integrated |
| Responsive Design | ✅ Complete | Mobile/Tablet/Desktop optimized |

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

# Optional: Environment Label
NEXT_PUBLIC_ENV=development
```

**Environment Variables:**
- `NEXT_PUBLIC_MGX_API_BASE_URL`: Backend API endpoint (default: `/api/mgx`)
- `NEXT_PUBLIC_MGX_WS_URL`: WebSocket endpoint for real-time updates
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
- **Monitoring**: http://localhost:3000/mgx/monitoring
- **Settings**: http://localhost:3000/mgx/settings

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
GET  /mgx                     Overview dashboard
GET  /mgx/tasks               Task list view
GET  /mgx/tasks/:id           Task detail & monitor
GET  /mgx/monitoring          Metrics & monitoring
GET  /mgx/metrics             Legacy metrics page
GET  /mgx/results             Results viewer
GET  /mgx/settings            Configuration
```

### API Expectations

The dashboard expects the following API endpoints from `NEXT_PUBLIC_MGX_API_BASE_URL`:

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

### WebSocket Events

Real-time updates via WebSocket (`NEXT_PUBLIC_MGX_WS_URL`):

```
Event: task:update
Payload: { id, status, progress, phase }

Event: task:complete
Payload: { id, result }

Event: metric:update
Payload: { timestamp, metric_name, value }

Event: plan:pending
Payload: { task_id, plan_content }
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
- **Component Tests**: 43+ tests passing ✓
- **Unit Tests**: Hooks and utilities
- **Integration Tests**: API and WebSocket integration
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
│   └── ui/
│       ├── button.test.tsx
│       └── card.test.tsx
└── e2e/
    └── dashboard.spec.ts
```

---

## 🪝 Custom Hooks

### `useWebSocket(url: string)`
Real-time WebSocket connection with automatic reconnection.

```typescript
const { data, isConnected, error } = useWebSocket('ws://localhost:8000/ws');
```

### `useTasks()`
Fetch and manage task list with caching.

```typescript
const { tasks, isLoading, error, mutate } = useTasks();
```

### `useMetrics()`
Fetch metrics data with real-time updates.

```typescript
const { metrics, isLoading, error } = useMetrics();
```

### `useApproval()`
Handle plan approval workflow.

```typescript
const { approve, reject, isLoading } = useApproval();
```

---

## 🔧 Key Components

### MgxHeader
Top navigation bar with environment badge, search, and user menu.

```tsx
<MgxHeader />
```

### MgxSidebar
Desktop sidebar with config-driven navigation.

```tsx
<MgxSidebar />
```

### MgxSidebarNav
Navigation component (desktop vertical / mobile horizontal).

```tsx
<MgxSidebarNav variant="horizontal" />
```

### MgxBreadcrumb
Dynamic breadcrumb based on current route.

```tsx
<MgxBreadcrumb />
```

### TaskMonitor
Real-time task progress tracking.

```tsx
<TaskMonitor taskId="123" />
```

### MetricsDashboard
Charts and metrics visualization.

```tsx
<MetricsDashboard />
```

### PlanApprovalModal
Modal for plan review and approval.

```tsx
<PlanApprovalModal isOpen={true} onClose={() => {}} />
```

### ResultsViewer
Code and results display with syntax highlighting.

```tsx
<ResultsViewer code={generatedCode} results={results} />
```

---

## 📊 Features Overview

### Real-time Monitoring ⚡
- **Live Progress Tracking**: WebSocket-powered real-time updates
- **Phase Visualization**: Analyze → Plan → Execute → Review
- **Timeline Display**: Visual execution timeline with timestamps
- **Status Indicators**: Color-coded status badges
- **Performance Metrics**: Time elapsed and ETA tracking

### Metrics Dashboard 📈
- **Interactive Charts**: Line, area, bar, and pie charts
- **Multiple Metrics**: Cache hit rate, memory usage, execution time
- **Performance Alerts**: Real-time performance monitoring
- **Trend Analysis**: Historical data visualization
- **Responsive Design**: Mobile-optimized charts

### Task Management 📋
- **List View**: Browsable task list with filters
- **Create Tasks**: Form-based task creation
- **Execution Control**: Cancel, retry, and pause operations
- **Search**: Full-text task search
- **History**: Track task execution history

### Plan Approval Workflow ✅
- **Modal Interface**: Clean modal for plan review
- **Approval Actions**: Approve or reject with comments
- **Real-time Status**: Live status updates
- **Auto-redirect**: Navigate after approval completion

### Results Viewer 🔍
- **Code Display**: Syntax-highlighted generated code
- **Test Results**: Formatted test output
- **Comments**: Review and feedback display
- **Export Options**: Download results
- **Copy-to-Clipboard**: Easy code copying

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

---

## 📚 Documentation

Additional documentation available:
- **Implementation Guide**: See `MGX_DASHBOARD_IMPLEMENTATION.md`
- **Component Library**: Check `components/mgx/ui/` for component usage
- **Hook Documentation**: Review hooks in `hooks/` directory

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

### Phase 5: Security & Authentication 🔒
- User authentication (JWT/OAuth)
- Role-based access control
- Permission management
- Session handling

### Phase 6: Advanced Analytics 📊
- Custom dashboard builder
- Data export (CSV, PDF)
- Advanced filtering
- Custom reports

### Phase 7: Team Collaboration 👥
- Multi-user support
- Activity logging
- Team management
- Notifications & alerts

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

**Version**: 0.1.0 | **Last Updated**: Phase 4.5 | **Status**: ✅ LIVE
