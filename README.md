# AI-Front: MGX Admin Dashboard

A modern, production-ready admin dashboard built with Next.js 15, React 19, and TypeScript. Part of the TEM (Temporal Execution Manager) platform featuring real-time monitoring, multi-tenant workspace management, GitHub repository integration, comprehensive testing suite, and visual workflow orchestration.

## 🚀 Status: Production-Ready

| Component | Status | Description |
|-----------|--------|-------------|
| **Dashboard Shell** | ✅ Complete | Responsive admin interface with dark mode |
| **Real-time Monitoring** | ✅ Complete | WebSocket integration with live updates |
| **Git Integration** | ✅ Complete | GitHub repos, branches, commits, PRs |
| **Workspace Support** | ✅ Complete | Multi-tenant UI with data isolation |
| **Agent Management** | ✅ Complete | Multi-agent orchestration with live telemetry |
| **Workflow Builder** | ✅ Complete | Visual drag-and-drop workflow composer |
| **Workflow Timeline** | ✅ Complete | Real-time execution tracking with Gantt charts |
| **Testing Suite** | ✅ Complete | Unit, integration, and E2E tests with full coverage |
| **API Integration** | ✅ Complete | REST API with workspace/project scoping |
| **Responsive Design** | ✅ Complete | Mobile/Tablet/Desktop optimized |

## ✨ Features

- ✅ **Workspace & Project Management UI** - Multi-tenant architecture with complete data isolation
- ✅ **Workflow Builder & Execution Timeline** - Visual workflow composer with real-time monitoring
- ✅ **Multi-Agent Orchestration Visualization** - Live agent status and activity feeds
- ✅ **Real-time Updates (WebSocket)** - Instant UI updates for all system events
- ✅ **Git Integration UI** - GitHub repository linking with metadata badges
- ✅ **Artifact Management Interface** - File management and download capabilities
- ✅ **Template Library UI** - Pre-built workflow templates and patterns
- ✅ **Comprehensive Testing** - Unit, integration, and E2E tests (Jest, Testing Library, Playwright)
- ✅ **Next.js 15 & React 19 Compatible** - Latest framework versions with TypeScript support

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Data Fetching**: SWR for optimal caching
- **Real-time**: WebSocket integration with auto-reconnection
- **Charts**: Recharts for data visualization
- **Testing**: Jest + Testing Library + Playwright
- **Code Quality**: ESLint with Next.js config

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ai-front
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   # Configure your API endpoints and environment variables
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production
```bash
npm run build
npm run start
```

## 🏗 Architecture

### Component Organization
```
app/                    # Next.js App Router
├── mgx/               # Admin dashboard pages
├── workflows/         # Workflow management pages
├── api/              # API routes (if needed)
└── layout.tsx        # Global layout with providers

components/            # Reusable UI components
├── mgx/              # Dashboard-specific components
├── ui/               # Base UI components (Button, Card, etc.)
└── workflows/        # Workflow builder components

lib/                   # Core business logic
├── api.ts           # API client and endpoints
├── types.ts         # TypeScript type definitions
└── utils.ts         # Utility functions

hooks/                # Custom React hooks
├── useWebSocket.ts  # WebSocket connection management
├── useWorkspaces.ts # Workspace context hooks
└── useRepositories.ts # Git repository management
```

### State Management
- **SWR**: Data fetching and caching with optimistic updates
- **Context API**: Workspace and project selection state
- **Local State**: Component-level state with useState/useReducer
- **WebSocket**: Real-time event handling and subscriptions

### API Integration
- RESTful API endpoints with automatic workspace/project scoping
- Comprehensive error handling with retry logic
- SWR-based data fetching with intelligent cache invalidation
- WebSocket integration for real-time updates

## 📁 Project Structure

### Core Directories

**`app/` (Next.js App Router)**
- `/mgx` - Admin dashboard with workspace navigation
- `/mgx/workflows` - Workflow builder and management
- `/mgx/settings` - Configuration and integrations

**`components/`**
- `/ui` - Base UI components (buttons, cards, forms, tables)
- `/mgx` - Dashboard-specific components (header, sidebar, navigation)
- `/workflows` - Workflow builder and timeline components

**`lib/`**
- `/api.ts` - API client and endpoint definitions
- `/types.ts` - TypeScript type definitions
- `/utils.ts` - Helper functions and utilities

**`__tests__/`**
- `/api` - API testing with fetch mocking
- `/hooks` - Custom hook testing with renderHook
- `/integration` - Component integration testing
- `/mgx` - Dashboard-specific component tests

**`e2e/`**
- Playwright end-to-end tests for full user workflows
- Cross-browser testing support
- Automated visual regression testing

## 🔑 Key Features Details

### Workflow Management UI
Create and manage complex workflows with an intuitive drag-and-drop interface. Features step palette, dependency mapping, real-time validation, and template system for rapid workflow creation.

### Execution Timeline & Monitoring
Monitor workflow executions with Gantt-style visualizations, real-time log streaming, performance metrics, and step-by-step progress tracking with retry indicators.

### Multi-Agent Visualization
Track agent status, activity feeds, and task assignments across your workflow executions. Real-time updates via WebSocket with offline fallback support.

### Real-time WebSocket Integration
Live updates for all system events including workflow executions, agent status changes, git events, and task progress with automatic reconnection handling.

### Git Integration Interface
Connect GitHub repositories, display branch/commit/PR metadata as badges, and track git events in real-time throughout the dashboard.

### Template Library UI
Pre-built workflow templates for common patterns including data processing, CI/CD pipelines, and agent orchestration workflows.

## 🧪 Testing & Quality

### Test Structure
- **Unit Tests**: Component and function testing with Jest
- **Integration Tests**: API and hook integration testing
- **End-to-End Tests**: Full user workflow testing with Playwright
- **Accessibility Tests**: Automated a11y compliance testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **API Layer**: 95%+ coverage for request/response handling
- **Components**: 90%+ coverage for UI components
- **Hooks**: 100% coverage for custom hooks
- **Integration**: Critical user flows fully tested

### CI/CD Pipeline
- GitHub Actions for automated testing
- Multi-OS testing (Ubuntu, Windows, macOS)
- Automated build and deployment
- Quality gates with coverage thresholds

## 💻 Development Setup

### Prerequisites
- Node.js 18+ 
- Git
- npm or yarn

### Local Development
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment configuration**
   ```bash
   # Copy environment template
   cp .env.local.example .env.local
   
   # Configure required variables:
   # NEXT_PUBLIC_API_URL
   # NEXT_PUBLIC_WS_URL
   # NEXT_PUBLIC_GITHUB_CLIENT_ID
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Code Quality
- **Linting**: ESLint with Next.js recommended rules
- **Formatting**: Prettier integration available
- **Type Safety**: Full TypeScript coverage with strict mode
- **Testing**: Jest + Testing Library + Playwright

### Component Development Guidelines
- Use TypeScript for all components and functions
- Implement responsive design with Tailwind CSS
- Follow accessibility best practices (WCAG 2.1 AA)
- Write comprehensive tests for new features
- Use semantic HTML and proper ARIA labels

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

### Deployment Options
- **Vercel** (recommended for Next.js)
- **Netlify** (with configuration provided)
- **Docker** (containerization supported)
- **AWS/Azure/GCP** (with custom deployment)

### Production Considerations
- Environment variables for API endpoints
- WebSocket connection configuration
- CDN setup for static assets
- Monitoring and error tracking integration

## 🤝 Contributing

### Setup for Contributors
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Make your changes with tests
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow the existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use semantic commit messages

### Component Development
- Create reusable components in `/components/ui/`
- Follow the established naming conventions
- Use TypeScript for all new components
- Include responsive design considerations
- Add comprehensive tests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Common Issues
- **WebSocket Connection**: Ensure API URL is correctly configured
- **Build Errors**: Clear `.next` folder and rebuild
- **Test Failures**: Check environment variables and mock configurations

### Getting Help
- Check the [documentation](./docs/) for detailed guides
- Review existing [GitHub Issues](https://github.com/mockupsoft/ai-front/issues)
- Create a new issue for bugs or feature requests

---

**Built with ❤️ using Next.js 15, React 19, and modern web technologies.**