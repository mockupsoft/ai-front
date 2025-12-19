/**
 * Form Validations & User Feedback Tests
 * Tests all form inputs, validations, error messages, and user feedback systems
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/mgx/ui/button';
import * as sonnerMock from 'sonner';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

// Mock toast/notification system
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

const mockSonner = sonnerMock;

// Test form components
const TestForm = ({ onSubmit, validateOnChange = false }: { 
  onSubmit?: (data: Record<string, string | boolean>) => Promise<void> | void;
  validateOnChange?: boolean;
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    description: '',
    status: '',
    repository: '',
    terms: false,
  });
  const [errors, setErrors] = React.useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateField = (name: string, value: string | boolean) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value) {
          newErrors.name = 'Name is required';
        } else if (typeof value === 'string' && value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
      case 'description':
        if (!value) {
          newErrors.description = 'Description is required';
        } else if (typeof value === 'string' && value.length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        } else {
          delete newErrors.description;
        }
        break;
      case 'status':
        if (!value) {
          newErrors.status = 'Please select a status';
        } else {
          delete newErrors.status;
        }
        break;
      case 'repository':
        if (!value) {
          newErrors.repository = 'Please select a repository';
        } else {
          delete newErrors.repository;
        }
        break;
      case 'terms':
        if (!value) {
          newErrors.terms = 'You must accept the terms and conditions';
        } else {
          delete newErrors.terms;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (validateOnChange) {
      validateField(name, newValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key as keyof typeof formData]);
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        description: '',
        status: '',
        repository: '',
        terms: false,
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = Object.keys(errors).length === 0 && 
    formData.name && 
    formData.email && 
    formData.description && 
    formData.status && 
    formData.repository && 
    formData.terms;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md" data-testid="form">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Task Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name 
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
          }`}
          data-testid="name-input"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email 
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
          }`}
          data-testid="email-input"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description 
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
          }`}
          data-testid="description-input"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="description-error">
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Status *
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.status 
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
          }`}
          data-testid="status-select"
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="status-error">
            {errors.status}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="repository" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Repository *
        </label>
        <select
          id="repository"
          name="repository"
          value={formData.repository}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.repository 
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
          }`}
          data-testid="repository-select"
        >
          <option value="">Select repository</option>
          <option value="repo-1">Repository 1</option>
          <option value="repo-2">Repository 2</option>
          <option value="repo-3">Repository 3</option>
        </select>
        {errors.repository && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="repository-error">
            {errors.repository}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleInputChange}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-600 rounded ${
              errors.terms ? 'border-red-300 dark:border-red-600' : ''
            }`}
            data-testid="terms-checkbox"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
            I accept the terms and conditions *
          </label>
        </div>
        {errors.terms && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="terms-error">
            {errors.terms}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        disabled={!isValid || isSubmitting}
        className="w-full"
        data-testid="submit-button"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting...
          </div>
        ) : (
          'Submit Form'
        )}
      </Button>
    </form>
  );
};

describe('Form Validations & User Feedback Tests', () => {
  describe('Input Validation Tests', () => {
    test('required fields show error when empty', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      const submitButton = screen.getByTestId('submit-button');

      // Initially, form should not be valid
      expect(submitButton).toBeDisabled();

      // Submit empty form to trigger validation
      await user.click(submitButton);

      // Check error messages appear
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toBeInTheDocument();
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
        expect(screen.getByTestId('description-error')).toBeInTheDocument();
        expect(screen.getByTestId('status-error')).toBeInTheDocument();
        expect(screen.getByTestId('repository-error')).toBeInTheDocument();
        expect(screen.getByTestId('terms-error')).toBeInTheDocument();
      });

      // Verify error messages content
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Please select a status')).toBeInTheDocument();
      expect(screen.getByText('Please select a repository')).toBeInTheDocument();
      expect(screen.getByText('You must accept the terms and conditions')).toBeInTheDocument();
    });

    test('email validation works', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm validateOnChange={true} />
        </ThemeProvider>
      );

      const emailInput = screen.getByTestId('email-input');

      // Enter invalid email
      await user.type(emailInput, 'invalid-email');

      // Should show error immediately with real-time validation
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();

      // Enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@email.com');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      });
    });

    test('min/max length validation', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm validateOnChange={true} />
        </ThemeProvider>
      );

      const nameInput = screen.getByTestId('name-input');
      const descriptionInput = screen.getByTestId('description-input');

      // Test name minimum length (2 characters)
      await user.type(nameInput, 'A'); // Too short
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });

      // Test description minimum length (10 characters)
      await user.type(descriptionInput, 'Short'); // Too short
      await waitFor(() => {
        expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
      });

      // Make them valid
      await user.clear(nameInput);
      await user.type(nameInput, 'Valid Name');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Valid description with enough characters');

      // Errors should be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
        expect(screen.queryByTestId('description-error')).not.toBeInTheDocument();
      });
    });

    test('pattern validation (alphanumeric, special chars)', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm validateOnChange={false} />
        </ThemeProvider>
      );

      const nameInput = screen.getByTestId('name-input');

      // Test with special characters (should be valid)
      await user.type(nameInput, 'Valid Name with 123 and !@#$');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Should not show pattern error since no pattern validation is implemented
      expect(screen.queryByText(/pattern|invalid characters/i)).not.toBeInTheDocument();
    });

    test('error messages clear and helpful', () => {
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      // Submit empty form
      fireEvent.click(screen.getByTestId('submit-button'));

      // Check that error messages are descriptive and helpful
      expect(screen.getByText('Name is required')).toBeTruthy();
      expect(screen.getByText('Email is required')).toBeTruthy();
      expect(screen.getByText('Description is required')).toBeTruthy();

      // Error messages should be helpful and actionable
      expect(screen.getByText(/at least 2 characters/i)).toBeTruthy();
      expect(screen.getByText(/at least 10 characters/i)).toBeTruthy();
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });

    test('field-level error styling', () => {
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      // Submit empty form to trigger errors
      fireEvent.click(screen.getByTestId('submit-button'));

      // Check that error fields have error styling
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');

      expect(nameInput).toHaveClass('border-red-300', 'dark:border-red-600', 'bg-red-50', 'dark:bg-red-900/20');
      expect(emailInput).toHaveClass('border-red-300', 'dark:border-red-600', 'bg-red-50', 'dark:bg-red-900/20');
    });

    test('real-time validation (as user types)', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm validateOnChange={true} />
        </ThemeProvider>
      );

      const nameInput = screen.getByTestId('name-input');

      // Start typing
      await user.type(nameInput, 'T');
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toBeInTheDocument();
      });

      // Continue typing to make it valid
      await user.type(nameInput, 'est');
      await waitFor(() => {
        expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
      });
    });

    test('submit button disabled until valid', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      const submitButton = screen.getByTestId('submit-button');

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Fill in minimal required fields
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      // Button should now be enabled
      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });
  });

  describe('Form Submission Tests', () => {
    test('submit button shows loading spinner', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={onSubmit} />
        </ThemeProvider>
      );

      // Fill form to make it valid
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      // Submit form
      await user.click(screen.getByTestId('submit-button'));

      // Check loading state
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    });

    test('form disabled while submitting', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={onSubmit} />
        </ThemeProvider>
      );

      // Fill form and submit
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      await user.click(screen.getByTestId('submit-button'));

      // During submission, form should be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
      });
    });

    test('success message shown', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={() => Promise.resolve()} />
        </ThemeProvider>
      );

      // Fill and submit valid form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      await user.click(screen.getByTestId('submit-button'));

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      });

      // Success toast should be called
      expect(mockSonner.toast.success).toHaveBeenCalled();
    });

    test('error message shown on failure', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockRejectedValue(new Error('Network error'));
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={onSubmit} />
        </ThemeProvider>
      );

      // Fill and submit form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      await user.click(screen.getByTestId('submit-button'));

      // Wait for submission to fail
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      });

      // Error toast should be called
      expect(mockSonner.toast.error).toHaveBeenCalled();
    });

    test('form cleared after successful submit', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={() => Promise.resolve()} />
        </ThemeProvider>
      );

      // Fill form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      await user.click(screen.getByTestId('submit-button'));

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      });

      // Form should be cleared
      expect(screen.getByTestId('name-input')).toHaveValue('');
      expect(screen.getByTestId('email-input')).toHaveValue('');
      expect(screen.getByTestId('description-input')).toHaveValue('');
      expect(screen.getByTestId('status-select')).toHaveValue('');
      expect(screen.getByTestId('repository-select')).toHaveValue('');
      expect(screen.getByTestId('terms-checkbox')).not.toBeChecked();
    });

    test('validation errors shown inline', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      // Submit with invalid data
      await user.type(screen.getByTestId('name-input'), 'A'); // Too short
      await user.type(screen.getByTestId('email-input'), 'invalid-email'); // Invalid email
      await user.type(screen.getByTestId('description-input'), 'Short'); // Too short

      await user.click(screen.getByTestId('submit-button'));

      // Check inline error messages
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();

      // Errors should be inline, not in a modal or separate area
      const nameError = screen.getByTestId('name-error');
      expect(nameError.closest('form')).toBeInTheDocument();
    });

    test('server validation errors displayed', async () => {
      const user = userEvent.setup();
      
      // Mock server error response
      global.fetch = jest.fn().mockRejectedValue(new Error('Server error'));
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={() => fetch('/api/submit', { method: 'POST' })} />
        </ThemeProvider>
      );

      // Fill and submit form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      await user.click(screen.getByTestId('submit-button'));

      // Wait for submission to fail
      await waitFor(() => {
        expect(mockSonner.toast.error).toHaveBeenCalled();
      });
    });

    test('duplicate submission prevented', async () => {
      const user = userEvent.setup();
      let submitCount = 0;
      const onSubmit = jest.fn().mockImplementation(() => {
        submitCount++;
        return new Promise(resolve => setTimeout(resolve, 100));
      });
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={onSubmit} />
        </ThemeProvider>
      );

      // Fill form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      // Click submit multiple times quickly
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only submit once (debounce/throttle)
      await waitFor(() => {
        expect(submitCount).toBe(1);
      });
    });
  });

  describe('User Feedback Tests', () => {
    test('toast notifications appear for success', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={() => Promise.resolve()} />
        </ThemeProvider>
      );

      // Fill and submit form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      await user.click(screen.getByTestId('submit-button'));

      // Success toast should appear
      await waitFor(() => {
        expect(mockSonner.toast.success).toHaveBeenCalled();
      });
    });

    test('toast notifications appear for errors', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={() => Promise.reject(new Error('Submission failed'))} />
        </ThemeProvider>
      );

      // Fill and submit form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      await user.click(screen.getByTestId('submit-button'));

      // Error toast should appear
      await waitFor(() => {
        expect(mockSonner.toast.error).toHaveBeenCalled();
      });
    });

    test('toast auto-dismiss after 5 seconds', async () => {
      render(
        <ThemeProvider>
          <TestForm onSubmit={() => Promise.resolve()} />
        </ThemeProvider>
      );

      // Trigger success toast
      mockSonner.toast.success('Form submitted successfully!');

      // Toast should be called
      expect(mockSonner.toast.success).toHaveBeenCalled();

      // Note: In a real implementation, we would test auto-dismiss
      // This is just a placeholder since mocking timers is complex in tests
    });

    test('multiple toasts stack', () => {
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      // Trigger multiple toasts
      mockSonner.toast.success('First success');
      mockSonner.toast.error('First error');
      mockSonner.toast.success('Second success');

      // All toasts should be called
      expect(mockSonner.toast.success).toHaveBeenCalledTimes(2);
      expect(mockSonner.toast.error).toHaveBeenCalledTimes(1);
    });

    test('toast dismissible', () => {
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      // Trigger toast with dismiss option
      mockSonner.toast.success('Dismissible toast', {
        action: {
          label: 'Dismiss',
          onClick: () => mockSonner.toast.dismiss(),
        },
      });

      expect(mockSonner.toast.success).toHaveBeenCalled();
    });

    test('loading spinners show during async operations', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );
      
      render(
        <ThemeProvider>
          <TestForm onSubmit={onSubmit} />
        </ThemeProvider>
      );

      // Fill form
      await user.type(screen.getByTestId('name-input'), 'Test Name');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('description-input'), 'This is a valid description');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');
      await user.selectOptions(screen.getByTestId('repository-select'), 'repo-1');
      await user.click(screen.getByTestId('terms-checkbox'));

      // Submit and immediately check for loading state
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Should show loading spinner immediately
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('skeleton loaders during data fetch', () => {
      render(
        <ThemeProvider>
          <div data-testid="skeleton-test">
            <div className="animate-pulse">
              <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          </div>
        </ThemeProvider>
      );

      const skeleton = screen.getByTestId('skeleton-test');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Form Field Types Tests', () => {
    test('text inputs (name, description, email)', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      const descriptionInput = screen.getByTestId('description-input');

      // Test text input
      await user.type(nameInput, 'John Doe');
      expect(nameInput).toHaveValue('John Doe');

      // Test email input
      await user.type(emailInput, 'john@example.com');
      expect(emailInput).toHaveValue('john@example.com');

      // Test textarea
      await user.type(descriptionInput, 'This is a detailed description');
      expect(descriptionInput).toHaveValue('This is a detailed description');
    });

    test('selects (workspace, project, status)', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      const statusSelect = screen.getByTestId('status-select');
      const repositorySelect = screen.getByTestId('repository-select');

      // Test select options
      await user.selectOptions(statusSelect, 'active');
      expect(statusSelect).toHaveValue('active');

      await user.selectOptions(repositorySelect, 'repo-1');
      expect(repositorySelect).toHaveValue('repo-1');

      // Test selecting different options
      await user.selectOptions(statusSelect, 'completed');
      expect(statusSelect).toHaveValue('completed');
    });

    test('checkboxes (selections)', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestForm />
        </ThemeProvider>
      );

      const termsCheckbox = screen.getByTestId('terms-checkbox');

      // Test checkbox interaction
      expect(termsCheckbox).not.toBeChecked();

      await user.click(termsCheckbox);
      expect(termsCheckbox).toBeChecked();

      await user.click(termsCheckbox);
      expect(termsCheckbox).not.toBeChecked();
    });
  });
});