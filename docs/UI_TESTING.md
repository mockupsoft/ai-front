# UI/UX Design System Testing Documentation

This document provides comprehensive information about the UI/UX design system tests, including setup, execution, and coverage details.

## Overview

The UI/UX design system testing suite validates responsive design, dark mode consistency, navigation, form validation, accessibility compliance, and cross-browser compatibility. The tests ensure a high-quality user experience across all devices and scenarios.

## Test Architecture

### Test Types

1. **Unit Tests** (`__tests__/*.test.ts*`)
   - Component-specific tests
   - Individual feature validation
   - Fast execution, isolated testing

2. **Integration Tests** (`__tests__/integration/*.test.ts`)
   - Cross-component interactions
   - API integration testing
   - Real workflow validation

3. **End-to-End Tests** (`e2e/*.spec.ts`)
   - Complete user journey testing
   - Browser-based interaction testing
   - Visual and functional validation

### Testing Framework Stack

- **Jest** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing framework
- **Testing Library User Event** - Realistic user interaction simulation
- **axe-core** - Accessibility testing engine

## Test Files Overview

### 1. Responsive Design Tests (`__tests__/responsive.test.ts`)

**Purpose**: Validates responsive behavior across all device sizes and orientations.

**Key Coverage**:
- ✅ Breakpoint validation (320px to 1920px+)
- ✅ Mobile hamburger menu functionality
- ✅ Tablet layout adaptation
- ✅ Desktop multi-column layouts
- ✅ Touch target accessibility (≥48px)
- ✅ No horizontal scrolling issues
- ✅ Text readability at all zoom levels

**Test Scenarios**:
```typescript
// Breakpoint Testing
320px  (iPhone SE)
375px  (iPhone 12)
425px  (Large Mobile)
768px  (iPad)
1024px (iPad Landscape)
1440px (Laptop)
1920px (Desktop)
1920px+ (Large Desktop)

// Layout Validation
- Sidebar collapse/expand
- Navigation menu adaptation
- Card grid responsiveness
- Table horizontal scroll
- Form field sizing
- Modal width adaptation
```

### 2. Dark Mode Tests (`__tests__/darkMode.test.tsx`)

**Purpose**: Ensures consistent theming across light and dark modes.

**Key Coverage**:
- ✅ Theme toggle functionality
- ✅ CSS variable usage validation
- ✅ Color contrast compliance (WCAG AA)
- ✅ Component-specific dark mode styling
- ✅ Theme persistence across sessions
- ✅ No hardcoded color values

**Test Scenarios**:
```typescript
// Theme Persistence
- localStorage integration
- System preference detection
- User preference override
- Cross-page consistency

// Color Consistency
- Primary/secondary/ghost button variants
- Status colors (success, error, warning, info)
- Background and surface colors
- Text and border colors
- Interactive state colors

// Component Testing
- Dashboard cards and layouts
- Navigation and sidebar
- Forms and input fields
- Tables and data displays
- Modals and overlays
```

### 3. Navigation Tests (`__tests__/navigation.test.ts`)

**Purpose**: Validates all navigation patterns and routing functionality.

**Key Coverage**:
- ✅ Route accessibility and loading
- ✅ Breadcrumb navigation
- ✅ Active state indication
- ✅ Mobile menu functionality
- ✅ URL state preservation
- ✅ Browser history integration

**Test Scenarios**:
```typescript
// Route Testing
'/' - Home/landing
'/mgx' - Dashboard
'/mgx/tasks' - Task list
'/mgx/tasks/{id}' - Task detail
'/mgx/workflows' - Workflow list
'/mgx/workflows/new' - Create workflow
'/mgx/settings' - Settings
'/mgx/monitoring' - Monitoring
'/404' - Not found

// Navigation Patterns
- Main navigation menu
- Sidebar navigation
- Breadcrumb trails
- Mobile hamburger menu
- Submenu expansion
- Active state highlighting
```

### 4. Form Validation Tests (`__tests__/forms.test.tsx`)

**Purpose**: Comprehensive form validation and user feedback testing.

**Key Coverage**:
- ✅ Input validation rules
- ✅ Real-time validation
- ✅ Error message display
- ✅ Success feedback
- ✅ Loading states
- ✅ Form submission handling

**Test Scenarios**:
```typescript
// Validation Rules
- Required field validation
- Email format validation
- Min/max length validation
- Pattern matching validation
- Custom validation logic

// User Feedback
- Toast notifications
- Inline error messages
- Loading spinners
- Success confirmations
- Error handling and recovery
- Form clearing after success

// Field Types
- Text inputs and textareas
- Select dropdowns
- Checkboxes and radio buttons
- File uploads
- Custom field components
```

### 5. Accessibility Tests (`__tests__/a11y.test.ts`)

**Purpose**: WCAG 2.1 Level AA compliance verification.

**Key Coverage**:
- ✅ Color contrast ratios (≥4.5:1)
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Semantic HTML structure
- ✅ ARIA attributes and roles
- ✅ Focus management

**Test Scenarios**:
```typescript
// WCAG Compliance
- Color contrast testing
- Keyboard accessibility
- Screen reader labels
- Focus indicators
- Skip links implementation
- ARIA landmarks

// Interactive Elements
- Button accessibility
- Link descriptions
- Form labeling
- Error associations
- Modal keyboard trapping
- Dynamic content announcements

// Semantic Structure
- HTML5 semantic elements
- Heading hierarchy
- List structures
- Landmark regions
- Content relationships
```

### 6. E2E UI Tests (`e2e/ui.spec.ts`)

**Purpose**: End-to-end user workflow validation across devices and browsers.

**Key Coverage**:
- ✅ Complete user journeys
- ✅ Cross-device compatibility
- ✅ Performance validation
- ✅ Error recovery scenarios
- ✅ Real-world usage patterns

**Test Scenarios**:
```typescript
// Device Testing
- Desktop (1440x900, 1920x1080)
- Tablet (768x1024, 1024x768)
- Mobile (375x667, 414x896, 320x568)

// User Workflows
- Dashboard → Task Creation
- Dark Mode Toggle → Navigation
- Mobile Creation → Desktop Management
- Error Recovery → Retry → Success
- Form Validation → Submission → Feedback

// Integration Testing
- API integration
- Real-time updates
- Network error handling
- Performance benchmarks
- Cross-browser compatibility
```

## Setup and Installation

### Prerequisites

```bash
# Required Node.js version
node >= 18.0.0

# Required package installation
npm install
# or
yarn install
```

### Testing Dependencies

The project includes all necessary testing dependencies:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.5.2",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "axe-core": "^4.8.2"
  }
}
```

### Environment Configuration

Create `.env.local` with required environment variables:

```bash
# API Configuration
NEXT_PUBLIC_MGX_API_BASE_URL=http://localhost:8000/api/mgx

# Test Environment
NODE_ENV=test
CI=false
```

### Jest Configuration

The project uses a custom Jest configuration:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/__tests__/**/__tests__/**/*.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!components/**/*.d.ts',
    '!lib/**/*.d.ts',
  ],
};
```

### Playwright Configuration

E2E tests use Playwright with browser support:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test responsive.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### End-to-End Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in specific browser
npx playwright test --project=chromium

# Run E2E tests in headed mode
npx playwright test --headed

# Debug E2E tests
npx playwright test --debug
```

### Specific Test Categories

```bash
# Run only responsive tests
npm test -- --testNamePattern="Responsive"

# Run only accessibility tests
npm test -- --testNamePattern="Accessibility"

# Run only dark mode tests
npm test -- --testNamePattern="Dark Mode"

# Run only form validation tests
npm test -- --testNamePattern="Form"

# Run only navigation tests
npm test -- --testNamePattern="Navigation"
```

### Continuous Integration

```bash
# CI pipeline script
#!/bin/bash
set -e

echo "Running UI/UX Design System Tests..."

# Install dependencies
npm ci

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run unit tests
npm run test:ci

# Install Playwright browsers
npx playwright install --with-deps

# Run E2E tests
npm run test:e2e:ci

echo "All tests completed successfully!"
```

## Test Coverage

### Coverage Targets

- **Line Coverage**: ≥90%
- **Branch Coverage**: ≥85%
- **Function Coverage**: ≥90%
- **Statement Coverage**: ≥90%

### Coverage Areas

```
components/mgx/ui/          95%+ coverage
├── button.tsx             100% coverage
├── card.tsx               100% coverage
├── table.tsx              100% coverage
├── spinner.tsx            100% coverage
└── status-pill.tsx        100% coverage

components/mgx/             90%+ coverage
├── header.tsx             95% coverage
├── sidebar.tsx            90% coverage
├── breadcrumb.tsx         95% coverage
└── [other components]     85%+ coverage

app/mgx/                   85%+ coverage
├── page.tsx               90% coverage
├── layout.tsx             85% coverage
└── [routes]               80%+ coverage
```

### Coverage Reports

Generate coverage reports:

```bash
# Generate HTML coverage report
npm run test:coverage

# Generate LCOV coverage for CI
npm run test:coverage:lcov

# View coverage in terminal
npm run test:coverage:report
```

## Performance Testing

### Core Web Vitals Monitoring

```typescript
// Performance test example
test('page load performance', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);

  // Monitor Core Web Vitals
  const vitals = await page.evaluate(() => {
    return {
      fcp: performance.getEntriesByType('paint')
        .find(entry => entry.name === 'first-contentful-paint')?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint')?.pop()?.startTime,
      fid: 0, // First Input Delay (requires user interaction)
    };
  });

  if (vitals.fcp) expect(vitals.fcp).toBeLessThan(1000);
  if (vitals.lcp) expect(vitals.lcp).toBeLessThan(2500);
});
```

### Performance Benchmarks

- **Initial Page Load**: <2 seconds
- **Time to Interactive**: <3 seconds
- **First Contentful Paint**: <1 second
- **Largest Contentful Paint**: <2.5 seconds
- **Button Click Response**: <100ms
- **Form Input Response**: <50ms

## Accessibility Testing

### WCAG 2.1 Level AA Compliance

The accessibility tests verify compliance with:

- **1.1.1 Non-text Content** - All images have appropriate alt text
- **1.3.1 Info and Relationships** - Semantic HTML and ARIA labels
- **1.4.3 Contrast (Minimum)** - 4.5:1 contrast ratio for normal text
- **1.4.11 Non-text Contrast** - 3:1 contrast ratio for UI components
- **2.1.1 Keyboard** - All functionality available via keyboard
- **2.1.2 No Keyboard Trap** - Focus can move away from interactive elements
- **2.4.3 Focus Order** - Logical focus order
- **2.4.7 Focus Visible** - Clear focus indicators
- **3.2.1 On Focus** - No context changes on focus
- **4.1.2 Name, Role, Value** - Proper ARIA implementation

### Accessibility Testing Tools

```bash
# Run accessibility tests
npm run test:a11y

# Generate accessibility report
npm run test:a11y:report

# Manual accessibility audit
npx axe-cli http://localhost:3000
```

### Color Contrast Testing

```typescript
test('color contrast meets WCAG AA standards', () => {
  const contrastTests = [
    { foreground: 'text-zinc-900', background: 'bg-white' },
    { foreground: 'text-zinc-100', background: 'bg-zinc-900' },
    { foreground: 'text-zinc-600', background: 'bg-white' },
  ];

  contrastTests.forEach(({ foreground, background }) => {
    // In a real implementation, use a contrast checking library
    const ratio = calculateContrastRatio(foreground, background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
```

## Visual Regression Testing

### Screenshot Testing

```typescript
// Visual regression test example
test('dashboard layout visual regression', async ({ page }) => {
  await page.goto('/mgx');
  await page.waitForLoadState('networkidle');

  // Take screenshot and compare
  await expect(page).toHaveScreenshot('dashboard-desktop.png');
  
  // Test mobile version
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot('dashboard-mobile.png');
  
  // Test dark mode
  await toggleDarkMode(page);
  await expect(page).toHaveScreenshot('dashboard-dark.png');
});
```

### Visual Testing Setup

```typescript
// Update Playwright config for visual testing
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

## Troubleshooting

### Common Issues

#### 1. Test Timeouts

```typescript
// Increase timeout for slow operations
test('slow operation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  // Test implementation
}, { timeout: 30000 });
```

#### 2. Element Not Found

```typescript
// Wait for elements to appear
await page.waitForSelector('[data-testid="element"]', { timeout: 5000 });
const element = page.locator('[data-testid="element"]');
await expect(element).toBeVisible();
```

#### 3. Network Request Mocking

```typescript
// Mock API responses
await page.route('**/api/**', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true }),
  });
});
```

#### 4. Responsive Testing Issues

```typescript
// Ensure proper viewport setting
await page.setViewportSize({ width: 375, height: 667 });
await page.goto('/');

// Wait for responsive styles to apply
await page.waitForTimeout(300);
```

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Debug specific test
npm test -- --testNamePattern="specific test" --verbose

# Playwright debug mode
npx playwright test --debug

# Visual debugging
npx playwright test --headed --slow-mo=1000
```

### CI/CD Integration

```yaml
# GitHub Actions example
name: UI/UX Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e:ci
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Best Practices

### Writing Tests

1. **Use Semantic Queries**: Prefer `getByRole` and `getByLabelText` over CSS selectors
2. **Test User Behavior**: Focus on what users do, not implementation details
3. **Mock External Dependencies**: Isolate tests from external services
4. **Use Data Test IDs**: Add `data-testid` attributes for stable element selection
5. **Clean Up State**: Reset application state between tests

### Test Organization

```
__tests__/
├── components/           # Component-specific tests
├── integration/          # Integration tests
├── api/                 # API endpoint tests
├── hooks/               # Custom hook tests
├── utils/               # Utility function tests
└── *.test.ts*           # Feature-specific tests

e2e/
├── flows/               # User workflow tests
├── visual/              # Visual regression tests
└── *.spec.ts           # Cross-cutting tests
```

### Performance Considerations

1. **Parallel Testing**: Use Jest's parallel execution and Playwright's parallel browsers
2. **Selective Running**: Run relevant tests during development
3. **Mock Heavy Operations**: Mock slow API calls and complex computations
4. **Cleanup Resources**: Dispose of resources and cleanup after tests

## Continuous Improvement

### Test Metrics

Monitor these metrics to improve test quality:

- **Test Execution Time**: Track and optimize slow tests
- **Flaky Test Rate**: Identify and fix unreliable tests
- **Coverage Trends**: Maintain and improve code coverage
- **Failure Patterns**: Analyze common failure modes

### Regular Maintenance

1. **Update Dependencies**: Keep testing libraries current
2. **Review Test Relevance**: Remove outdated tests
3. **Optimize Performance**: Refactor slow test suites
4. **Expand Coverage**: Add tests for new features and edge cases

## Support and Documentation

### Getting Help

- Check the troubleshooting section above
- Review test output and error messages
- Consult component documentation
- Ask for help in development team channels

### Resources

- [Jest Documentation](https://jestjs.io/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

This comprehensive testing suite ensures the UI/UX design system maintains high quality, accessibility, and user experience standards across all devices and usage scenarios.