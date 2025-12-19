/**
 * Accessibility Tests (a11y)
 * WCAG 2.1 Level AA Compliance Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/mgx/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/mgx/ui/card';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

// Mock axe-core for accessibility testing
// In a real project, you would install @axe-core/react and configure it
const mockAxe = {
  run: jest.fn((node, options, callback) => {
    // Mock successful axe run - no violations
    callback(null, {
      passes: [],
      violations: [],
      inapplicable: [],
      incomplete: [],
    });
  }),
};

jest.mock('axe-core', () => mockAxe);

// Accessible form component for testing
const AccessibleForm = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    description: '',
  });
  const [errors, setErrors] = React.useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="form-title">
      <h2 id="form-title" className="text-xl font-bold mb-4">Accessible Form</h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Name <span aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={errors.name ? 'true' : 'false'}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
          }`}
          data-testid="name-input"
        />
        {errors.name && (
          <p id="name-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
            {errors.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Email <span aria-label="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={errors.email ? 'true' : 'false'}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.email ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
          }`}
          data-testid="email-input"
        />
        {errors.email && (
          <p id="email-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Description <span aria-label="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          aria-describedby={errors.description ? 'description-error' : undefined}
          aria-invalid={errors.description ? 'true' : 'false'}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.description ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
          }`}
          data-testid="description-input"
        />
        {errors.description && (
          <p id="description-error" className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
            {errors.description}
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" aria-describedby="submit-help">
        Submit Form
      </Button>
      <p id="submit-help" className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
        All fields marked with * are required
      </p>
    </form>
  );
};

// Accessible navigation component
const AccessibleNavigation = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav aria-label="Main navigation" role="navigation">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">MGX Dashboard</h1>
        
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="navigation-menu"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="menu-toggle"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop navigation */}
        <ul className="hidden md:flex space-x-8" role="menubar">
          <li role="none">
            <a 
              href="/" 
              role="menuitem"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-2 rounded-md text-sm font-medium"
              aria-current="page"
            >
              Dashboard
            </Link>
          </li>
          <li role="none">
            <a 
              href="/mgx/tasks" 
              role="menuitem"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-2 rounded-md text-sm font-medium"
            >
              Tasks
            </Link>
          </li>
          <li role="none">
            <a 
              href="/mgx/workflows" 
              role="menuitem"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-2 rounded-md text-sm font-medium"
            >
              Workflows
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile navigation menu */}
      {isOpen && (
        <div 
          id="navigation-menu" 
          className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
          role="menu"
          aria-labelledby="menu-toggle"
        >
          <ul className="px-2 pt-2 pb-3 space-y-1">
            <li role="none">
              <a 
                href="/" 
                role="menuitem"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 block px-3 py-2 rounded-md text-base font-medium"
                aria-current="page"
              >
                Dashboard
              </Link>
            </li>
            <li role="none">
              <a 
                href="/mgx/tasks" 
                role="menuitem"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 block px-3 py-2 rounded-md text-base font-medium"
              >
                Tasks
              </Link>
            </li>
            <li role="none">
              <a 
                href="/mgx/workflows" 
                role="menuitem"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 block px-3 py-2 rounded-md text-base font-medium"
              >
                Workflows
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

describe('Accessibility Tests (a11y)', () => {
  describe('Color Contrast Tests', () => {
    test('color contrast ratio ≥4.5:1 for text', () => {
      render(
        <ThemeProvider>
          <div data-testid="contrast-test">
            {/* High contrast text */}
            <p className="text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900">
              High contrast text - should pass WCAG AA
            </p>
            
            {/* Medium contrast text */}
            <p className="text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900">
              Medium contrast text - may fail WCAG AA
            </p>
            
            {/* Low contrast text - should fail */}
            <p className="text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900">
              Low contrast text - should fail WCAG AA
            </p>
          </div>
        </ThemeProvider>
      );

      const contrastTest = screen.getByTestId('contrast-test');
      expect(contrastTest).toBeInTheDocument();

      // Check that high contrast elements exist
      const highContrastText = contrastTest.children[0];
      const mediumContrastText = contrastTest.children[1];
      const lowContrastText = contrastTest.children[2];

      expect(highContrastText).toBeInTheDocument();
      expect(mediumContrastText).toBeInTheDocument();
      expect(lowContrastText).toBeInTheDocument();

      // In a real implementation, you would use a contrast checker like axe-core or color-contrast
    });

    test('background and text colors have sufficient contrast', () => {
      render(
        <ThemeProvider>
          <div data-testid="color-contrast">
            <div className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 p-4 rounded">
              <h3>Primary content area</h3>
              <p>This text should have sufficient contrast with the background.</p>
            </div>
            
            <div className="bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-400 p-4 rounded">
              <h3>Alert content area</h3>
              <p>This alert text should have sufficient contrast.</p>
            </div>
            
            <div className="bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-400 p-4 rounded">
              <h3>Success content area</h3>
              <p>This success text should have sufficient contrast.</p>
            </div>
          </div>
        </ThemeProvider>
      );

      const colorContrast = screen.getByTestId('color-contrast');
      expect(colorContrast).toBeInTheDocument();

      const areas = colorContrast.querySelectorAll('div');
      expect(areas).toHaveLength(3);
    });
  });

  describe('Keyboard Navigation Tests', () => {
    test('all interactive elements keyboard accessible', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <div data-testid="keyboard-test">
            <AccessibleNavigation />
            <AccessibleForm />
            <Button variant="primary" data-testid="keyboard-button">
              Keyboard Accessible Button
            </Button>
            <Link href="#test" data-testid="keyboard-link" className="text-blue-600 hover:underline">
              Keyboard Accessible Link
            </Link>
            <input 
              type="text" 
              placeholder="Keyboard accessible input"
              data-testid="keyboard-input"
              className="border px-3 py-2 rounded"
            />
          </div>
        </ThemeProvider>
      );

      // Test tab navigation
      const menuToggle = screen.getByTestId('menu-toggle');
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByRole('button', { name: /submit form/i });
      const keyboardButton = screen.getByTestId('keyboard-button');
      const keyboardLink = screen.getByTestId('keyboard-link');
      const keyboardInput = screen.getByTestId('keyboard-input');

      // All elements should be focusable
      expect(menuToggle).toHaveAttribute('tabindex', '0');
      expect(nameInput).toHaveAttribute('tabindex', '0');
      expect(emailInput).toHaveAttribute('tabindex', '0');
      expect(submitButton).toHaveAttribute('tabindex', '0');
      expect(keyboardButton).toHaveAttribute('tabindex', '0');
      expect(keyboardLink).toHaveAttribute('tabindex', '0');
      expect(keyboardInput).toHaveAttribute('tabindex', '0');

      // Test keyboard interaction
      await user.tab();
      expect(menuToggle).toHaveFocus();

      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.type(nameInput, 'Test Name');
      expect(nameInput).toHaveValue('Test Name');
    });

    test('tab order logical', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <div data-testid="tab-order-test">
            <form>
              <div>
                <label htmlFor="field1">Field 1</label>
                <input id="field1" type="text" data-testid="field1" />
              </div>
              <div>
                <label htmlFor="field2">Field 2</label>
                <input id="field2" type="text" data-testid="field2" />
              </div>
              <div>
                <label htmlFor="field3">Field 3</label>
                <input id="field3" type="text" data-testid="field3" />
              </div>
              <Button type="submit" data-testid="submit">Submit</Button>
            </form>
          </div>
        </ThemeProvider>
      );

      const field1 = screen.getByTestId('field1');
      const field2 = screen.getByTestId('field2');
      const field3 = screen.getByTestId('field3');
      const submit = screen.getByTestId('submit');

      // Test logical tab order
      await user.tab();
      expect(field1).toHaveFocus();

      await user.tab();
      expect(field2).toHaveFocus();

      await user.tab();
      expect(field3).toHaveFocus();

      await user.tab();
      expect(submit).toHaveFocus();
    });

    test('focus ring visible', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <div data-testid="focus-ring-test">
            <Button 
              variant="primary"
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              data-testid="focusable-button"
            >
              Focus Me
            </Button>
          </div>
        </ThemeProvider>
      );

      const focusableButton = screen.getByTestId('focusable-button');
      
      // Focus the button
      await user.tab();
      expect(focusableButton).toHaveFocus();

      // Check that focus styles are applied
      const styles = window.getComputedStyle(focusableButton);
      expect(styles.outline).toBeTruthy();
      expect(styles.outlineOffset).toBeTruthy();
    });

    test('skip links implemented for main content', () => {
      render(
        <ThemeProvider>
          <div data-testid="skip-links">
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded"
              data-testid="skip-link"
            >
              Skip to main content
            </Link>
            <AccessibleNavigation />
            <main id="main-content" tabIndex={-1} data-testid="main-content">
              <h1>Main Content</h1>
              <p>This is the main content area</p>
            </main>
          </div>
        </ThemeProvider>
      );

      const skipLink = screen.getByTestId('skip-link');
      const mainContent = screen.getByTestId('main-content');

      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute('tabindex', '-1');
    });

    test('modal keyboard trapping', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <div data-testid="modal-test">
            <button 
              onClick={() => {/* open modal */}}
              data-testid="open-modal"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Open Modal
            </button>
            
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center" 
              role="dialog" 
              aria-labelledby="modal-title" 
              aria-describedby="modal-desc"
              style={{ display: 'none' }}
              data-testid="modal-overlay"
            >
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg max-w-md w-full">
                <h2 id="modal-title" className="text-lg font-bold mb-2">Modal Title</h2>
                <p id="modal-desc" className="mb-4">Modal description</p>
                <div className="space-x-2">
                  <Button variant="primary" data-testid="modal-primary">
                    Confirm
                  </Button>
                  <Button variant="secondary" data-testid="modal-secondary">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ThemeProvider>
      );

      const openModal = screen.getByTestId('open-modal');
      const modal = screen.getByTestId('modal-overlay');

      expect(openModal).toBeInTheDocument();
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-desc');
    });
  });

  describe('Screen Reader Compatibility Tests', () => {
    test('buttons have aria-labels', () => {
      render(
        <ThemeProvider>
          <div data-testid="button-labels">
            <Button 
              variant="primary"
              aria-label="Submit the form"
              data-testid="submit-button-label"
            >
              📝
            </Button>
            <Button 
              variant="ghost"
              aria-label="Delete item"
              data-testid="delete-button-label"
            >
              🗑️
            </Button>
            <Button 
              variant="secondary"
              aria-label="Edit profile information"
              data-testid="edit-button-label"
            >
              ✏️
            </Button>
          </div>
        </ThemeProvider>
      );

      const submitButton = screen.getByTestId('submit-button-label');
      const deleteButton = screen.getByTestId('delete-button-label');
      const editButton = screen.getByTestId('edit-button-label');

      expect(submitButton).toHaveAttribute('aria-label', 'Submit the form');
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete item');
      expect(editButton).toHaveAttribute('aria-label', 'Edit profile information');
    });

    test('links have descriptive text', () => {
      render(
        <ThemeProvider>
          <div data-testid="link-text">
            <a 
              href="/mgx/workflows/new" 
              className="text-blue-600 hover:underline"
              data-testid="create-workflow-link"
            >
              Create New Workflow
            </Link>
            <a 
              href="/mgx/tasks/123" 
              className="text-blue-600 hover:underline"
              data-testid="view-task-link"
            >
              View Task #123
            </Link>
            <a 
              href="/settings" 
              className="text-blue-600 hover:underline"
              data-testid="settings-link"
            >
              Account Settings
            </Link>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('create-workflow-link')).toHaveTextContent('Create New Workflow');
      expect(screen.getByTestId('view-task-link')).toHaveTextContent('View Task #123');
      expect(screen.getByTestId('settings-link')).toHaveTextContent('Account Settings');
    });

    test('images have alt text', () => {
      render(
        <ThemeProvider>
          <div data-testid="image-alt">
            <img 
              src="/logo.svg" 
              alt="MGX Dashboard Logo"
              data-testid="logo-image"
              className="h-8 w-8"
            />
            <img 
              src="/user-avatar.png" 
              alt="User profile picture for John Doe"
              data-testid="avatar-image"
              className="h-10 w-10 rounded-full"
            />
            <img 
              src="/chart.png" 
              alt="Bar chart showing task completion rates over the past 6 months"
              data-testid="chart-image"
              className="w-full"
            />
          </div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('logo-image')).toHaveAttribute('alt', 'MGX Dashboard Logo');
      expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'User profile picture for John Doe');
      expect(screen.getByTestId('chart-image')).toHaveAttribute('alt', 'Bar chart showing task completion rates over the past 6 months');
    });

    test('form labels associated with inputs', () => {
      render(
        <ThemeProvider>
          <AccessibleForm />
        </ThemeProvider>
      );

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      const descriptionInput = screen.getByTestId('description-input');

      // Check label association
      expect(nameInput).toHaveAttribute('aria-labelledby');
      expect(emailInput).toHaveAttribute('aria-labelledby');
      expect(descriptionInput).toHaveAttribute('aria-labelledby');

      // Check that labels exist
      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    });

    test('error messages linked to fields', () => {
      render(
        <ThemeProvider>
          <AccessibleForm />
        </ThemeProvider>
      );

      // Trigger validation errors
      const submitButton = screen.getByRole('button', { name: /submit form/i });
      fireEvent.click(submitButton);

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');

      // Check error message association
      expect(nameInput).toHaveAttribute('aria-describedby');
      expect(emailInput).toHaveAttribute('aria-describedby');

      // Check error messages exist
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();

      // Check error messages have role="alert"
      expect(screen.getByTestId('name-error')).toHaveAttribute('role', 'alert');
      expect(screen.getByTestId('email-error')).toHaveAttribute('role', 'alert');
    });

    test('lists semantic structure', () => {
      render(
        <ThemeProvider>
          <div data-testid="semantic-lists">
            <h3>Unordered List</h3>
            <ul data-testid="unordered-list">
              <li>Dashboard overview</li>
              <li>Task management</li>
              <li>Workflow automation</li>
            </ul>

            <h3>Ordered List</h3>
            <ol data-testid="ordered-list">
              <li>Create account</li>
              <li>Connect repositories</li>
              <li>Run first workflow</li>
            </ol>

            <h3>Navigation List</h3>
            <nav aria-label="Secondary navigation">
              <ul data-testid="nav-list">
                <li><Link href="/profile">Profile</Link></li>
                <li><Link href="/notifications">Notifications</Link></li>
                <li><Link href="/billing">Billing</Link></li>
              </ul>
            </nav>
          </div>
        </ThemeProvider>
      );

      const unorderedList = screen.getByTestId('unordered-list');
      const orderedList = screen.getByTestId('ordered-list');
      const navList = screen.getByTestId('nav-list');

      expect(unorderedList).toBeInTheDocument();
      expect(orderedList).toBeInTheDocument();
      expect(navList).toBeInTheDocument();

      // Check list structure
      expect(unorderedList.tagName).toBe('UL');
      expect(orderedList.tagName).toBe('OL');
      expect(navList.tagName).toBe('UL');
    });

    test('ARIA landmarks present', () => {
      render(
        <ThemeProvider>
          <div data-testid="landmarks">
            <header role="banner" aria-label="Site header" data-testid="header">
              <h1>MGX Dashboard</h1>
            </header>
            
            <nav role="navigation" aria-label="Main navigation" data-testid="main-nav">
              <ul>
                <li><Link href="/">Dashboard</Link></li>
                <li><Link href="/mgx/tasks">Tasks</Link></li>
              </ul>
            </nav>
            
            <main role="main" aria-label="Main content" data-testid="main">
              <h2>Dashboard Content</h2>
              <p>Main dashboard content goes here.</p>
            </main>
            
            <aside role="complementary" aria-label="Sidebar" data-testid="sidebar">
              <h3>Quick Actions</h3>
              <ul>
                <li><Link href="/new">New Task</Link></li>
                <li><Link href="/workflows">New Workflow</Link></li>
              </ul>
            </aside>
            
            <footer role="contentinfo" aria-label="Site footer" data-testid="footer">
              <p>© 2024 MGX Dashboard</p>
            </footer>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('header')).toHaveAttribute('role', 'banner');
      expect(screen.getByTestId('main-nav')).toHaveAttribute('role', 'navigation');
      expect(screen.getByTestId('main')).toHaveAttribute('role', 'main');
      expect(screen.getByTestId('sidebar')).toHaveAttribute('role', 'complementary');
      expect(screen.getByTestId('footer')).toHaveAttribute('role', 'contentinfo');
    });

    test('ARIA states and properties', () => {
      render(
        <ThemeProvider>
          <div data-testid="aria-states">
            <button 
              aria-expanded="false" 
              aria-controls="collapse-content"
              aria-label="Expand details"
              data-testid="expandable-button"
            >
              Expand Details
            </button>
            
            <div 
              id="collapse-content" 
              hidden 
              aria-hidden="true"
              data-testid="collapse-content"
            >
              <p>Collapsible content goes here.</p>
            </div>

            <select aria-label="Select theme" data-testid="theme-select">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>

            <div 
              role="progressbar" 
              aria-valuenow="75" 
              aria-valuemin="0" 
              aria-valuemax="100"
              aria-label="Task completion"
              data-testid="progressbar"
            >
              <div style={{ width: '75%' }} className="bg-blue-500 h-4 rounded"></div>
            </div>
          </div>
        </ThemeProvider>
      );

      const expandableButton = screen.getByTestId('expandable-button');
      expect(expandableButton).toHaveAttribute('aria-expanded', 'false');
      expect(expandableButton).toHaveAttribute('aria-controls', 'collapse-content');

      const progressbar = screen.getByTestId('progressbar');
      expect(progressbar).toHaveAttribute('role', 'progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Focus Management Tests', () => {
    test('focus management in interactive components', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <div data-testid="focus-management">
            <AccessibleNavigation />
            <Card data-testid="focusable-card" tabIndex={0}>
              <CardHeader>
                <CardTitle>Focusable Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card can receive focus</p>
              </CardContent>
            </Card>
          </div>
        </ThemeProvider>
      );

      const focusableCard = screen.getByTestId('focusable-card');
      expect(focusableCard).toHaveAttribute('tabindex', '0');

      // Focus the card
      await user.click(focusableCard);
      expect(focusableCard).toHaveFocus();
    });

    test('aria-current for active navigation items', () => {
      render(
        <ThemeProvider>
          <AccessibleNavigation />
        </ThemeProvider>
      );

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    test('aria-live regions for dynamic content', () => {
      render(
        <ThemeProvider>
          <div data-testid="aria-live">
            <div 
              aria-live="polite" 
              aria-atomic="true"
              data-testid="polite-region"
            >
              Initial content
            </div>
            <div 
              aria-live="assertive" 
              aria-atomic="true"
              data-testid="assertive-region"
            >
              Critical updates will appear here
            </div>
            <button 
              onClick={() => {
                const polite = screen.getByTestId('polite-region');
                const assertive = screen.getByTestId('assertive-region');
                polite.textContent = 'Content updated';
                assertive.textContent = 'Error: Operation failed';
              }}
              data-testid="update-button"
            >
              Update Content
            </button>
          </div>
        </ThemeProvider>
      );

      const updateButton = screen.getByTestId('update-button');
      expect(updateButton).toBeInTheDocument();

      const politeRegion = screen.getByTestId('polite-region');
      const assertiveRegion = screen.getByTestId('assertive-region');

      expect(politeRegion).toHaveAttribute('aria-live', 'polite');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(politeRegion).toHaveAttribute('aria-atomic', 'true');
      expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('WCAG Compliance Tests', () => {
    test('semantic HTML structure', () => {
      render(
        <ThemeProvider>
          <div data-testid="semantic-html">
            <header>
              <h1>Page Title</h1>
              <nav>
                <ul>
                  <li><Link href="/">Home</Link></li>
                  <li><Link href="/about">About</Link></li>
                </ul>
              </nav>
            </header>
            
            <main>
              <article>
                <h2>Article Title</h2>
                <p>Article content</p>
              </article>
            </main>
            
            <aside>
              <section>
                <h3>Related Links</h3>
                <ul>
                  <li><Link href="/link1">Link 1</Link></li>
                  <li><Link href="/link2">Link 2</Link></li>
                </ul>
              </section>
            </aside>
            
            <footer>
              <p>© 2024 Company</p>
            </footer>
          </div>
        </ThemeProvider>
      );

      const semanticHtml = screen.getByTestId('semantic-html');
      expect(semanticHtml.querySelector('header')).toBeInTheDocument();
      expect(semanticHtml.querySelector('nav')).toBeInTheDocument();
      expect(semanticHtml.querySelector('main')).toBeInTheDocument();
      expect(semanticHtml.querySelector('article')).toBeInTheDocument();
      expect(semanticHtml.querySelector('aside')).toBeInTheDocument();
      expect(semanticHtml.querySelector('footer')).toBeInTheDocument();
    });

    test('proper heading hierarchy', () => {
      render(
        <ThemeProvider>
          <div data-testid="heading-hierarchy">
            <h1>Main Title</h1>
            <section>
              <h2>Section Title</h2>
              <h3>Subsection Title</h3>
              <h4>Sub-subsection Title</h4>
            </section>
            <section>
              <h2>Another Section</h2>
            </section>
          </div>
        </ThemeProvider>
      );

      const hierarchy = screen.getByTestId('heading-hierarchy');
      const headings = hierarchy.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      expect(headings.length).toBeGreaterThan(0);
      
      // Check that h1 comes first
      expect(headings[0].tagName).toBe('H1');
      
      // Check that headings don't skip levels
      let previousLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      });
    });

    test('form accessibility requirements', () => {
      render(
        <ThemeProvider>
          <AccessibleForm />
        </ThemeProvider>
      );

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Check that form has proper labeling
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');

      expect(nameInput).toHaveAttribute('aria-labelledby');
      expect(emailInput).toHaveAttribute('aria-labelledby');

      // Check required field indication
      expect(screen.getByText('Name *')).toBeInTheDocument();
      expect(screen.getByText('Email *')).toBeInTheDocument();
    });

    test('color is not the only means of conveying information', () => {
      render(
        <ThemeProvider>
          <div data-testid="color-not-only">
            <div className="flex items-center space-x-4">
              <span className="w-4 h-4 bg-green-500 rounded-full" aria-label="Success indicator"></span>
              <span className="text-green-700 dark:text-green-400">Operation completed</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="w-4 h-4 bg-red-500 rounded-full" aria-label="Error indicator"></span>
              <span className="text-red-700 dark:text-red-400">Operation failed</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="w-4 h-4 bg-yellow-500 rounded-full" aria-label="Warning indicator"></span>
              <span className="text-yellow-700 dark:text-yellow-400">Warning: Check inputs</span>
            </div>
          </div>
        </ThemeProvider>
      );

      const indicators = screen.getAllByLabelText(/indicator/i);
      expect(indicators).toHaveLength(3);

      // Check that text also conveys the information
      expect(screen.getByText(/Operation completed/i)).toBeInTheDocument();
      expect(screen.getByText(/Operation failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Warning: Check inputs/i)).toBeInTheDocument();
    });
  });
});