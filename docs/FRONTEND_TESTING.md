# Frontend Testing Strategy

This document outlines the testing strategy for the MGX Dashboard frontend.

## Test Types

### 1. API Service Layer (`__tests__/api/`)
Tests the `lib/api.ts` module to ensure:
- Correct URL construction with workspace/project scoping
- Proper request headers and authentication
- Error handling and response parsing
- Query parameter handling

### 2. Custom Hooks (`__tests__/hooks/`)
Tests custom React hooks to ensure:
- **WebSocket (`useWebSocket`)**: Connection management, subscription handling, and event filtering.
- **Data Fetching (`useRepositories`, etc.)**: SWR integration, caching, revalidation, and loading/error states.
- **Workflow Hooks (`useWorkflowExecutions`)**: Data transformation and API integration.

### 3. Integration Tests (`__tests__/integration/`)
Tests the interaction between hooks, context, and API mocks:
- Verifies that hooks correctly consume workspace context.
- Simulates complete data flows (fetch -> update -> refresh).
- Ensures state consistency across components.

### 4. E2E Tests (`e2e/`)
Browser-based tests using Playwright:
- **Workflows (`workflows.spec.ts`)**: Complete user journeys including creating, monitoring, and debugging workflows.
- **Execution (`workflow-execution.spec.ts`)**: Detailed testing of the execution timeline, logs, and real-time updates.
- **Smoke Tests**: Basic sanity checks for critical paths.

## Running Tests

### Unit & Integration Tests
Run all unit tests with Jest:
```bash
npm test
```

Run specific test file:
```bash
npm test __tests__/api/api.test.ts
```

### E2E Tests
Run Playwright tests:
```bash
npx playwright test
```

Run specific E2E test:
```bash
npx playwright test e2e/workflows.spec.ts
```

## Best Practices
- **Mocking**: Use `jest.mock` for external dependencies (API, WebSocket).
- **Isolation**: Each test should be independent. Reset mocks in `beforeEach`.
- **Async Handling**: Use `waitFor` and `await` for async operations.
- **Context**: Always mock `useWorkspace` to provide necessary context for scoped operations.
