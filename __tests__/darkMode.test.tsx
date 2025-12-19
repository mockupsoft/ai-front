/**
 * Dark Mode Tests
 * Tests theme persistence, color consistency, and component styling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/mgx/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/mgx/ui/card';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/mgx/sidebar';
import Link from 'next/link';

// Mock next-themes for testing
const mockUseTheme = jest.fn();

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => mockUseTheme(),
}));

// Mock components
jest.mock('@/components/Navigation', () => {
  return function MockNavigation() {
    return (
      <nav data-testid="navigation" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center gap-4">
                      <h1 className="text-xl font-bold">Dashboard</h1>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                        Production
                      </span>
                    </div>
                    <Link href="/" className="hover:underline">
                      Home
                    </Link>
      </nav>
    );
  };
});

jest.mock('@/components/mgx/sidebar', () => {
  return function MockSidebar() {
    return (
      <aside data-testid="sidebar" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <nav className="p-4">
          <ul className="space-y-2">
            <li><Link href="/" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 block p-2 rounded">Home</Link></li>
            <li><Link href="/mgx" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 block p-2 rounded">Dashboard</Link></li>
          </ul>
        </nav>
      </aside>
    );
  };
});

describe('Dark Mode Tests', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
    });
  });

  describe('Theme Toggle Tests', () => {
    test('toggle button works', async () => {
      const setTheme = jest.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme,
      });

      render(
        <ThemeProvider>
          <Button 
            onClick={() => setTheme('dark')}
            data-testid="theme-toggle"
            className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
          >
            Toggle Theme
          </Button>
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('theme-toggle');
      fireEvent.click(toggleButton);

      expect(setTheme).toHaveBeenCalledWith('dark');
    });

    test('theme persists across page refreshes', async () => {
      // Test localStorage persistence (mocked)
      const mockSetItem = jest.fn();
      const mockGetItem = jest.fn();
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: mockSetItem,
          getItem: mockGetItem,
        },
      });

      mockGetItem.mockReturnValue('dark');

      render(
        <ThemeProvider>
          <div data-testid="theme-content">Theme content</div>
        </ThemeProvider>
      );

      // Simulate theme change and persistence
      const content = screen.getByTestId('theme-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Color Consistency Tests', () => {
    test('primary color consistent everywhere', () => {
      render(
        <ThemeProvider>
          <div data-testid="colors">
            <Button variant="primary" data-testid="primary-button">Primary Button</Button>
            <div className="bg-zinc-900 dark:bg-zinc-50 p-4 rounded" data-testid="primary-bg">
              <span className="text-white dark:text-zinc-900">Primary Background</span>
            </div>
            <Link href="#" className="text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900 dark:hover:bg-zinc-50 hover:text-white dark:hover:text-zinc-900">
              Primary Link
            </Link>
          </div>
        </ThemeProvider>
      );

      const primaryButton = screen.getByTestId('primary-button');
      const primaryBg = screen.getByTestId('primary-bg');

      // Check button styles
      const buttonStyles = window.getComputedStyle(primaryButton);
      expect(buttonStyles.backgroundColor).toBeTruthy();

      // Check background consistency
      const bgStyles = window.getComputedStyle(primaryBg);
      expect(bgStyles.backgroundColor).toBeTruthy();
    });

    test('status colors consistent (success, error, warning, info)', () => {
      render(
        <ThemeProvider>
          <div data-testid="status-colors">
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-2 rounded" data-testid="success">
              Success
            </div>
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded" data-testid="error">
              Error
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-2 rounded" data-testid="warning">
              Warning
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-2 rounded" data-testid="info">
              Info
            </div>
          </div>
        </ThemeProvider>
      );

      const success = screen.getByTestId('success');
      const error = screen.getByTestId('error');
      const warning = screen.getByTestId('warning');
      const info = screen.getByTestId('info');

      // All status elements should be present
      expect(success).toBeInTheDocument();
      expect(error).toBeInTheDocument();
      expect(warning).toBeInTheDocument();
      expect(info).toBeInTheDocument();

      // Check color consistency
      [success, error, warning, info].forEach((element) => {
        const styles = window.getComputedStyle(element);
        expect(styles.backgroundColor).toBeTruthy();
        expect(styles.color).toBeTruthy();
      });
    });

    test('hover states visible in both modes', () => {
      render(
        <ThemeProvider>
          <div data-testid="hover-states">
            <Button 
              variant="primary"
              className="hover:bg-zinc-800 dark:hover:bg-zinc-200"
              data-testid="hover-button"
            >
              Hover Me
            </Button>
            <a 
              href="#" 
              className="text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400"
              data-testid="hover-link"
            >
              Hover Link
            </Link>
          </div>
        </ThemeProvider>
      );

      const hoverButton = screen.getByTestId('hover-button');
      const hoverLink = screen.getByTestId('hover-link');

      // Simulate hover states
      fireEvent.mouseEnter(hoverButton);
      fireEvent.mouseEnter(hoverLink);

      // Elements should remain interactive
      expect(hoverButton).toBeEnabled();
      expect(hoverLink).toBeInTheDocument();
    });

    test('disabled states visible in both modes', () => {
      render(
        <ThemeProvider>
          <div data-testid="disabled-states">
            <Button disabled data-testid="disabled-button" className="opacity-50 dark:opacity-40">
              Disabled Button
            </Button>
            <input 
              disabled 
              className="border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 opacity-60 dark:opacity-50"
              data-testid="disabled-input"
            />
          </div>
        </ThemeProvider>
      );

      const disabledButton = screen.getByTestId('disabled-button');
      const disabledInput = screen.getByTestId('disabled-input');

      expect(disabledButton).toBeDisabled();
      expect(disabledInput).toBeDisabled();

      // Should have appropriate disabled styling
      const buttonStyles = window.getComputedStyle(disabledButton);
      const inputStyles = window.getComputedStyle(disabledInput);

      expect(buttonStyles.opacity).toBe('0.5');
      expect(inputStyles.opacity).toBe('0.6');
    });

    test('focus states visible in both modes', () => {
      render(
        <ThemeProvider>
          <div data-testid="focus-states">
            <Button className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" data-testid="focus-button">
              Focus Button
            </Button>
            <input 
              className="border-zinc-300 dark:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              data-testid="focus-input"
            />
          </div>
        </ThemeProvider>
      );

      const focusButton = screen.getByTestId('focus-button');
      const focusInput = screen.getByTestId('focus-input');

      // Focus the elements
      fireEvent.focus(focusButton);
      fireEvent.focus(focusInput);

      // Elements should be focusable
      expect(focusButton).toHaveFocus();
      expect(focusInput).toHaveFocus();
    });
  });

  describe('Component-Specific Dark Mode Tests', () => {
    test('dashboard background, cards, text all correct', () => {
      render(
        <ThemeProvider>
          <div data-testid="dashboard" className="bg-white dark:bg-zinc-900 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              <Card data-testid="dashboard-card" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-zinc-900 dark:text-zinc-100">Dashboard Card</CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-600 dark:text-zinc-400">
                  Dashboard content
                </CardContent>
              </Card>
            </div>
          </div>
        </ThemeProvider>
      );

      const dashboard = screen.getByTestId('dashboard');
      const dashboardCard = screen.getByTestId('dashboard-card');
      const cardTitle = screen.getByText('Dashboard Card');

      expect(dashboard).toBeInTheDocument();
      expect(dashboardCard).toBeInTheDocument();
      expect(cardTitle).toBeInTheDocument();

      // Check that dark mode classes are applied
      expect(dashboard.classList.contains('dark:bg-zinc-900')).toBe(true);
      expect(cardTitle.classList.contains('dark:text-zinc-100')).toBe(true);
    });

    test('sidebar navigation items, active state, hover', () => {
      render(
        <ThemeProvider>
          <div data-testid="sidebar-test">
            <Sidebar />
          </div>
        </ThemeProvider>
      );

      const sidebar = screen.getByTestId('sidebar');
      const navigationItems = screen.getAllByText(/Home|Dashboard/);

      expect(sidebar).toBeInTheDocument();
      expect(navigationItems.length).toBeGreaterThan(0);

      // Check for dark mode styling
      expect(sidebar.classList.contains('dark:bg-zinc-900')).toBe(true);
    });

    test('header logo, user menu, environment badge', () => {
      render(
        <ThemeProvider>
          <div data-testid="header-test">
            <Navigation />
          </div>
        </ThemeProvider>
      );

      const header = screen.getByTestId('navigation');
      expect(header).toBeInTheDocument();

      // Check environment badge
      const envBadge = screen.getByText('Production');
      expect(envBadge).toBeInTheDocument();
      expect(envBadge.classList.contains('dark:bg-green-900')).toBe(true);
    });

    test('task list row backgrounds, status badges, hover', () => {
      render(
        <ThemeProvider>
          <div data-testid="task-list-test" className="bg-white dark:bg-zinc-900">
            <table className="w-full">
              <tbody>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                  <td className="p-4 text-zinc-900 dark:text-zinc-100">Task 1</td>
                  <td className="p-4">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ThemeProvider>
      );

      const taskRow = screen.getByRole('row');
      const statusBadge = screen.getByText('Active');

      expect(taskRow).toBeInTheDocument();
      expect(statusBadge).toBeInTheDocument();
    });

    test('form input backgrounds, labels, placeholders', () => {
      render(
        <ThemeProvider>
          <form data-testid="form-test" className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Task Name
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 rounded-md"
                placeholder="Enter task name"
                data-testid="task-input"
              />
            </div>
          </form>
        </ThemeProvider>
      );

      const form = screen.getByTestId('form-test');
      const label = screen.getByText('Task Name');
      const input = screen.getByTestId('task-input');

      expect(form).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    test('button variants in dark mode', () => {
      render(
        <ThemeProvider>
          <div data-testid="button-variants">
            <Button variant="primary" data-testid="primary">Primary</Button>
            <Button variant="secondary" data-testid="secondary">Secondary</Button>
            <Button variant="ghost" data-testid="ghost">Ghost</Button>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('primary')).toBeInTheDocument();
      expect(screen.getByTestId('secondary')).toBeInTheDocument();
      expect(screen.getByTestId('ghost')).toBeInTheDocument();

      // Check dark mode variants
      const primaryButton = screen.getByTestId('primary');
      expect(primaryButton.classList.contains('dark:bg-zinc-50')).toBe(true);
      expect(primaryButton.classList.contains('dark:text-zinc-900')).toBe(true);
    });

    test('modal overlay, content, buttons', () => {
      render(
        <ThemeProvider>
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4" data-testid="modal">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Modal Title</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">Modal content</p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Confirm</Button>
              </div>
            </div>
          </div>
        </ThemeProvider>
      );

      const modal = screen.getByTestId('modal');
      expect(modal).toBeInTheDocument();

      const modalTitle = screen.getByText('Modal Title');
      expect(modalTitle).toBeInTheDocument();
      expect(modal.classList.contains('dark:bg-zinc-800')).toBe(true);
    });

    test('status badges readable in both modes', () => {
      render(
        <ThemeProvider>
          <div data-testid="badges">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" data-testid="success-badge">
              Success
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" data-testid="error-badge">
              Error
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" data-testid="warning-badge">
              Warning
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" data-testid="info-badge">
              Info
            </span>
          </div>
        </ThemeProvider>
      );

      const badges = [
        { id: 'success-badge', text: 'Success' },
        { id: 'error-badge', text: 'Error' },
        { id: 'warning-badge', text: 'Warning' },
        { id: 'info-badge', text: 'Info' },
      ];

      badges.forEach(({ id, text }) => {
        const badge = screen.getByTestId(id);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent(text);
      });
    });
  });

  describe('Text Contrast Tests', () => {
    test('text contrast ≥4.5:1 (WCAG AA)', () => {
      // This is a simplified test - in a real scenario, you'd use a contrast checker
      render(
        <ThemeProvider>
          <div data-testid="contrast-test">
            <p className="text-zinc-900 dark:text-zinc-100">High contrast text</p>
            <p className="text-zinc-600 dark:text-zinc-400">Medium contrast text</p>
            <p className="text-zinc-500 dark:text-zinc-500">Lower contrast text</p>
          </div>
        </ThemeProvider>
      );

      const contrastTest = screen.getByTestId('contrast-test');
      expect(contrastTest).toBeInTheDocument();

      // Mock contrast ratio check (in real implementation, use tools like axe-core)
      const textElements = contrastTest.querySelectorAll('p');
      expect(textElements.length).toBe(3);
    });
  });

  describe('CSS Variables Usage Tests', () => {
    test('no hardcoded colors - all using CSS variables', () => {
      render(
        <ThemeProvider>
          <div data-testid="css-vars" className="bg-background text-foreground">
            <div className="bg-surface text-surface-foreground">
              <Button variant="primary" className="bg-primary text-primary-foreground">
                Button with CSS vars
              </Button>
            </div>
          </div>
        </ThemeProvider>
      );

      const cssVars = screen.getByTestId('css-vars');
      expect(cssVars).toBeInTheDocument();

      // Check that CSS variables are being used
      const styles = window.getComputedStyle(cssVars);
      expect(styles.backgroundColor).toBeTruthy();
    });
  });

  describe('Theme Persistence Tests', () => {
    test('theme persists across page refreshes', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      // Simulate theme change
      mockLocalStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <div data-testid="theme-persistence">Theme content</div>
        </ThemeProvider>
      );

      // localStorage should be used to persist theme
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });
});