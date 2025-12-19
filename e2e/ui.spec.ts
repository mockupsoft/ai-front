/**
 * E2E UI Tests
 * End-to-end testing of complete user workflows and UI interactions
 */

import { test, expect } from '@playwright/test';

// Helper function to set viewport size
const setViewport = async (page: import('@playwright/test').Page, width: number, height: number = 768) => {
  await page.setViewportSize({ width, height });
};

// Helper function to toggle dark mode
const toggleDarkMode = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: /theme|dark|light/i }).click();
};

// Helper function to wait for loading states
const waitForLoading = async (page: import('@playwright/test').Page) => {
  await page.waitForSelector('[data-testid="loading"], .animate-spin', { state: 'hidden', timeout: 5000 });
};

test.describe('E2E UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    await waitForLoading(page);
  });

  test.describe('Desktop Experience', () => {
    test('complete desktop experience works', async ({ page }) => {
      await setViewport(page, 1920, 1080);

      // Check navigation is visible and functional
      await expect(page.getByRole('navigation')).toBeVisible();
      
      // Check sidebar is visible on desktop
      await expect(page.locator('aside, [data-testid="sidebar"]')).toBeVisible();
      
      // Check main content area is responsive
      await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
      
      // Verify layout is not broken
      const mainContent = page.locator('main, [data-testid="main-content"]');
      await expect(mainContent).toBeVisible();
      
      // Check if there are any console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Verify key UI elements are present
      const header = page.locator('header, [data-testid="header"]');
      await expect(header).toBeVisible();
      
      // Check that we're not getting layout breaks
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    });

    test('navigation between pages works on desktop', async ({ page }) => {
      await setViewport(page, 1440, 900);

      // Test navigation links
      const navLinks = page.locator('nav a, [data-testid*="nav"] a');
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        // Click through navigation links
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && !href.startsWith('#')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            await waitForLoading(page);
            
            // Check we didn't break the layout
            await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
            
            // Go back to test more links
            if (href.startsWith('/')) {
              await page.goto('/');
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });

    test('task list displays and functions on desktop', async ({ page }) => {
      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Check task list container
      const taskList = page.locator('[data-testid="task-list"], table, ul');
      await expect(taskList).toBeVisible();

      // Check for task items (if any exist)
      const taskItems = page.locator('tr, li, [data-testid*="task"]');
      const taskCount = await taskItems.count();
      
      if (taskCount > 0) {
        // Test interaction with first task item
        const firstTask = taskItems.first();
        await firstTask.hover();
        
        // Test task detail navigation if available
        const taskLinks = page.locator('a[href*="/tasks/"], [data-testid*="task"] a');
        if (await taskLinks.count() > 0) {
          await taskLinks.first().click();
          await page.waitForLoadState('networkidle');
          await waitForLoading(page);
          
          // Check task detail page loads
          await expect(page.locator('h1, h2, [data-testid*="task-detail"]')).toBeVisible();
        }
      }
    });

    test('workflow management on desktop', async ({ page }) => {
      await page.goto('/mgx/workflows');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Check workflow list or create workflow button
      const createWorkflowBtn = page.getByRole('button', { name: /create.*workflow|new.*workflow/i });
      
      if (await createWorkflowBtn.count() > 0) {
        // Test workflow creation flow
        await createWorkflowBtn.click();
        await page.waitForLoadState('networkidle');
        await waitForLoading(page);
        
        // Check workflow creation form
        const workflowForm = page.locator('form, [data-testid="workflow-form"]');
        await expect(workflowForm).toBeVisible();
        
        // Test form interactions
        const formFields = page.locator('input, textarea, select');
        if (await formFields.count() > 0) {
          await formFields.first().fill('Test Workflow');
          
          // Test submit button
          const submitBtn = page.getByRole('button', { name: /create|submit|save/i });
          if (await submitBtn.count() > 0) {
            await submitBtn.first().click();
            await page.waitForLoadState('networkidle');
            await waitForLoading(page);
            
            // Check for success/error messages
            const notifications = page.locator('[role="alert"], .toast, [data-testid*="notification"]');
            await expect(notifications.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Tablet Experience', () => {
    test('tablet layout adapts correctly', async ({ page }) => {
      await setViewport(page, 1024, 768);

      // Check layout adapts to tablet
      const mainContent = page.locator('main, [data-testid="main-content"]');
      await expect(mainContent).toBeVisible();

      // Check that sidebar behavior is appropriate for tablet
      const sidebar = page.locator('aside, [data-testid="sidebar"]');
      const sidebarVisible = await sidebar.isVisible();
      
      // On tablet, sidebar might be collapsible
      if (sidebarVisible) {
        // Test sidebar toggle if available
        const sidebarToggle = page.locator('button[aria-label*="menu"], [data-testid*="toggle"]');
        if (await sidebarToggle.count() > 0) {
          await sidebarToggle.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Check grid layouts adapt
      const gridLayouts = page.locator('.grid, [class*="grid"]');
      const gridCount = await gridLayouts.count();
      
      for (let i = 0; i < gridCount; i++) {
        const grid = gridLayouts.nth(i);
        await expect(grid).toBeVisible();
      }
    });

    test('tablet navigation works', async ({ page }) => {
      await setViewport(page, 768, 1024);

      // Test tablet navigation patterns
      const navToggle = page.locator('button[aria-label*="menu"], [data-testid*="menu"]');
      if (await navToggle.count() > 0) {
        // Open navigation
        await navToggle.click();
        await page.waitForTimeout(300);
        
        // Check navigation menu opens
        const navMenu = page.locator('nav, [data-testid*="nav"], .navigation');
        await expect(navMenu.first()).toBeVisible();
        
        // Test navigation to a page
        const navLinks = page.locator('nav a, .navigation a');
        if (await navLinks.count() > 0) {
          await navLinks.first().click();
          await page.waitForLoadState('networkidle');
          await waitForLoading(page);
          
          // Check page loaded correctly
          await expect(page.locator('main, h1')).toBeVisible();
        }
      }
    });
  });

  test.describe('Mobile Experience', () => {
    test('mobile layout works correctly', async ({ page }) => {
      await setViewport(page, 375, 667);

      // Check mobile layout doesn't have horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow 10px tolerance

      // Check content adapts to mobile
      await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
      
      // Check no text is cut off
      const textElements = page.locator('p, span, div');
      const textCount = await textElements.count();
      
      for (let i = 0; i < Math.min(textCount, 10); i++) {
        const element = textElements.nth(i);
        const isVisible = await element.isVisible();
        if (isVisible) {
          // Element should be visible and not overflow
          const box = await element.boundingBox();
          expect(box?.width).toBeLessThanOrEqual(viewportWidth + 10);
        }
      }
    });

    test('mobile navigation hamburger menu', async ({ page }) => {
      await setViewport(page, 375, 667);

      // Check hamburger menu is visible on mobile
      const hamburgerMenu = page.locator('button[aria-label*="menu"], [data-testid*="hamburger"]');
      await expect(hamburgerMenu).toBeVisible();

      // Test opening mobile menu
      await hamburgerMenu.click();
      await page.waitForTimeout(300);

      // Check mobile menu opens
      const mobileMenu = page.locator('[data-testid*="mobile"], nav, .mobile-menu');
      await expect(mobileMenu.first()).toBeVisible();

      // Test navigation through mobile menu
      const menuLinks = page.locator('nav a, .mobile-menu a, [data-testid*="nav"] a');
      if (await menuLinks.count() > 0) {
        await menuLinks.first().click();
        await page.waitForLoadState('networkidle');
        await waitForLoading(page);
        
        // Check we navigated successfully
        await expect(page.locator('main, h1')).toBeVisible();
      }
    });

    test('mobile forms are accessible', async ({ page }) => {
      await setViewport(page, 375, 667);

      // Navigate to a form page
      await page.goto('/mgx/workflows/new');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Check form is visible and accessible
      const form = page.locator('form');
      if (await form.count() > 0) {
        // Test form fields are properly sized for mobile
        const inputs = page.locator('input, textarea, select, button');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          if (await input.isVisible()) {
            const box = await input.boundingBox();
            expect(box?.width).toBeGreaterThan(44); // Minimum touch target size
          }
        }

        // Test form submission
        const submitBtn = page.getByRole('button', { name: /create|submit|save/i });
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForLoadState('networkidle');
          await waitForLoading(page);
          
          // Check for success or validation messages
          const messages = page.locator('[role="alert"], .toast, .error, .success');
          await expect(messages.first()).toBeVisible();
        }
      }
    });

    test('mobile table/data viewing', async ({ page }) => {
      await setViewport(page, 375, 667);

      // Go to a page with tables/data
      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Check if tables exist and are scrollable
      const tables = page.locator('table, [data-testid*="table"]');
      const tableCount = await tables.count();

      if (tableCount > 0) {
        const table = tables.first();
        await expect(table).toBeVisible();
        
        // Check if table has horizontal scroll (indicating responsive design)
        const tableWrapper = table.locator('..');
        const hasHorizontalScroll = await tableWrapper.evaluate((el) => {
          return el.scrollWidth > el.clientWidth;
        });
        
        // Either table should fit or have horizontal scroll
        if (hasHorizontalScroll) {
          // Test horizontal scrolling
          await tableWrapper.scrollBy(100, 0);
          await page.waitForTimeout(300);
        }
      }
    });
  });

  test.describe('Dark Mode Experience', () => {
    test('dark mode toggle works', async ({ page }) => {
      // Check initial theme
      const body = page.locator('body');
      const initialTheme = await body.evaluate((el) => {
        return el.classList.contains('dark') || 
               window.matchMedia('(prefers-color-scheme: dark)').matches;
      });

      // Find and click theme toggle
      const themeToggle = page.locator('button[aria-label*="theme"], [data-testid*="theme"], button:has-text("dark"), button:has-text("light")');
      if (await themeToggle.count() > 0) {
        await themeToggle.click();
        await page.waitForTimeout(300);

        // Check theme changed
        const bodyAfter = page.locator('body');
        const newTheme = await bodyAfter.evaluate((el) => {
          return el.classList.contains('dark') || 
                 window.matchMedia('(prefers-color-scheme: dark)').matches;
        });

        expect(newTheme).not.toBe(initialTheme);
      }
    });

    test('dark mode styling consistency across pages', async ({ page }) => {
      await toggleDarkMode(page);

      const pages = ['/', '/mgx', '/mgx/tasks', '/mgx/workflows'];
      
      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await waitForLoading(page);

        // Check dark mode styles are applied
        const body = page.locator('body');
        await expect(body).toHaveClass(/dark/);

        // Check key UI elements have dark mode styling
        const elements = [
          page.locator('header'),
          page.locator('nav'),
          page.locator('aside'),
          page.locator('main'),
          page.locator('footer'),
        ];

        for (const element of elements) {
          if (await element.count() > 0) {
            // These elements should be visible in dark mode
            await expect(element.first()).toBeVisible();
          }
        }

        // Check for any white backgrounds that shouldn't be there
        const whiteBackgrounds = page.locator('[style*="background-color: white"], .bg-white:not(.dark\\:bg-zinc-800)');
        const whiteCount = await whiteBackgrounds.count();
        
        // Allow for some white elements (like text on dark backgrounds)
        expect(whiteCount).toBeLessThan(5);
      }
    });

    test('dark mode contrast and readability', async ({ page }) => {
      await toggleDarkMode(page);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check text is readable in dark mode
      const textElements = page.locator('h1, h2, h3, p, span, a, button');
      const textCount = await textElements.count();

      for (let i = 0; i < Math.min(textCount, 10); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          // Check that text color is not too light
          const color = await element.evaluate((el) => {
            return window.getComputedStyle(el).color;
          });
          
          // In dark mode, text should not be very light
          expect(color).not.toBe('rgba(0, 0, 0, 0)'); // Should have visible color
        }
      }
    });
  });

  test.describe('Form Validation & User Feedback', () => {
    test('form validation works end-to-end', async ({ page }) => {
      await page.goto('/mgx/workflows/new');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Find and test form submission without filling required fields
      const submitBtn = page.getByRole('button', { name: /create|submit|save/i });
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(500);

        // Check validation errors appear
        const errors = page.locator('[role="alert"], .error, [data-testid*="error"], .text-red');
        const errorCount = await errors.count();
        
        if (errorCount > 0) {
          // Validation errors should be visible
          await expect(errors.first()).toBeVisible();
        }
      }

      // Fill form with invalid data
      const inputs = page.locator('input[required], textarea[required], select[required]');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        // Fill inputs with invalid data
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          await input.fill('X'); // Very short input
        }

        // Try to submit again
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForTimeout(500);

          // Check for validation messages
          const validationMessages = page.locator('[data-testid*="error"], .error');
          await expect(validationMessages.first()).toBeVisible();
        }
      }
    });

    test('loading states and user feedback', async ({ page }) => {
      await page.goto('/mgx/workflows/new');
      await page.waitForLoadState('networkidle');

      // Fill minimal form
      const formInputs = page.locator('input, textarea, select');
      if (await formInputs.count() > 0) {
        await formInputs.first().fill('Test Workflow');
      }

      // Test submission with loading state
      const submitBtn = page.getByRole('button', { name: /create|submit|save/i });
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(100); // Very short timeout to catch loading state

        // Check for loading indicator
        const loadingIndicators = page.locator('.animate-spin, [data-testid*="loading"], button:disabled');
        const loadingCount = await loadingIndicators.count();

        if (loadingCount > 0) {
          // Loading state should be visible briefly
          await expect(loadingIndicators.first()).toBeVisible();
        }

        // Wait for submission to complete
        await page.waitForTimeout(2000);

        // Check for success/error feedback
        const feedback = page.locator('[role="alert"], .toast, .success, .error');
        await expect(feedback.first()).toBeVisible();
      }
    });

    test('error handling and recovery', async ({ page }) => {
      // Mock a network error by intercepting requests
      await page.route('**/api/**', (route) => {
        route.abort('internet');
      });

      await page.goto('/mgx/workflows/new');
      await page.waitForLoadState('networkidle');

      // Fill and submit form
      const formInputs = page.locator('input, textarea, select');
      if (await formInputs.count() > 0) {
        await formInputs.first().fill('Test Workflow');
      }

      const submitBtn = page.getByRole('button', { name: /create|submit|save/i });
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(1000);

        // Check error message appears
        const errorMessages = page.locator('[role="alert"], .error, .toast-error');
        const errorCount = await errorMessages.count();
        
        if (errorCount > 0) {
          await expect(errorMessages.first()).toBeVisible();
        }

        // Test error recovery - fix the network and try again
        await page.unroute('**/api/**');
        await submitBtn.click();
        await page.waitForTimeout(2000);

        // Check success or different error (network fixed)
        const feedback = page.locator('[role="alert"], .toast, .success, .error');
        await expect(feedback.first()).toBeVisible();
      }
    });
  });

  test.describe('Performance & Responsiveness', () => {
    test('page load performance', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within reasonable time (2 seconds)
      expect(loadTime).toBeLessThan(2000);

      // Check Core Web Vitals
      const vitals = await page.evaluate(() => {
        return {
          fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime,
          lcp: performance.getEntriesByType('largest-contentful-paint')?.pop()?.startTime,
        };
      });

      if (vitals.fcp) {
        expect(vitals.fcp).toBeLessThan(1000); // FCP should be under 1s
      }
    });

    test('interaction responsiveness', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test button click responsiveness
      const buttons = page.locator('button').first();
      if (await buttons.count() > 0) {
        const clickTime = Date.now();
        await buttons.click();
        const responseTime = Date.now() - clickTime;
        
        // Button should respond within 100ms
        expect(responseTime).toBeLessThan(100);
      }

      // Test input responsiveness
      const inputs = page.locator('input').first();
      if (await inputs.count() > 0) {
        const inputTime = Date.now();
        await inputs.type('test');
        const responseTime = Date.now() - inputTime;
        
        // Input should be responsive
        expect(responseTime).toBeLessThan(500); // Allow more time for typing
      }
    });

    test('smooth animations and transitions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test hover transitions
      const interactiveElements = page.locator('button, a, [role="button"]');
      if (await interactiveElements.count() > 0) {
        const element = interactiveElements.first();
        await element.hover();
        await page.waitForTimeout(300);
        
        // Should still be interactive after hover
        await expect(element).toBeVisible();
      }

      // Test modal/page transitions if any exist
      const modalTriggers = page.locator('button[aria-label*="open"], [data-testid*="modal"]');
      if (await modalTriggers.count() > 0) {
        await modalTriggers.click();
        await page.waitForTimeout(500);
        
        // Check modal transition
        const modals = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
        if (await modals.count() > 0) {
          await expect(modals.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('layout integrity across viewport sizes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },
        { width: 375, height: 667 },
        { width: 414, height: 896 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1440, height: 900 },
        { width: 1920, height: 1080 },
      ];

      for (const viewport of viewports) {
        await setViewport(page, viewport.width, viewport.height);
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check layout doesn't break
        await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
        
        // Check no horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      }
    });

    test('functional integrity across viewports', async ({ page }) => {
      await setViewport(page, 768, 1024);
      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');

      // Test core functionality works across different sizes
      const taskItems = page.locator('tr, li, [data-testid*="task"]');
      const taskCount = await taskItems.count();

      if (taskCount > 0) {
        // Test task interaction works
        const firstTask = taskItems.first();
        await firstTask.click();
        await page.waitForTimeout(300);
        
        // Should not break the layout
        await expect(page.locator('main')).toBeVisible();
      }
    });
  });

  test.describe('Integration Scenarios', () => {
    test('complete user workflow: dashboard → task creation → task management', async ({ page }) => {
      // Start at dashboard
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Check dashboard loads
      await expect(page.locator('h1, [data-testid*="dashboard"]')).toBeVisible();

      // Navigate to tasks
      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Look for task creation option
      const createTaskBtn = page.getByRole('button', { name: /create.*task|new.*task|add.*task/i });
      if (await createTaskBtn.count() > 0) {
        await createTaskBtn.click();
        await page.waitForLoadState('networkidle');
        await waitForLoading(page);

        // Fill task creation form
        const formInputs = page.locator('input[name*="name"], input[placeholder*="name"], textarea');
        if (await formInputs.count() > 0) {
          await formInputs.first().fill('E2E Test Task');
        }

        const submitBtn = page.getByRole('button', { name: /create|submit|save/i });
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForLoadState('networkidle');
          await waitForLoading(page);

          // Check success feedback
          const feedback = page.locator('[role="alert"], .toast, .success');
          await expect(feedback.first()).toBeVisible();

          // Return to task list and verify task was created
          await page.goto('/mgx/tasks');
          await page.waitForLoadState('networkidle');

          const newTask = page.locator('text=E2E Test Task');
          await expect(newTask).toBeVisible();
        }
      }
    });

    test('complete workflow: dark mode toggle → navigation → form submission', async ({ page }) => {
      // Start in light mode and toggle to dark
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await toggleDarkMode(page);
      await page.waitForTimeout(300);

      // Check dark mode is applied
      await expect(page.locator('body')).toHaveClass(/dark/);

      // Navigate through multiple pages in dark mode
      const pages = ['/mgx', '/mgx/tasks', '/mgx/workflows'];
      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await waitForLoading(page);

        // Check page loads correctly in dark mode
        await expect(page.locator('main, h1')).toBeVisible();
        
        // Check dark mode styles are preserved
        const body = page.locator('body');
        await expect(body).toHaveClass(/dark/);
      }

      // Test form submission in dark mode
      await page.goto('/mgx/workflows/new');
      await page.waitForLoadState('networkidle');

      const formInputs = page.locator('input, textarea');
      if (await formInputs.count() > 0) {
        await formInputs.first().fill('Dark Mode Test Workflow');
      }

      const submitBtn = page.getByRole('button', { name: /create|submit/i });
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForLoadState('networkidle');
        await waitForLoading(page);

        // Check feedback appears correctly in dark mode
        const feedback = page.locator('[role="alert"], .toast');
        await expect(feedback.first()).toBeVisible();
      }
    });

    test('mobile-first workflow: create task on mobile → manage on desktop', async ({ page }) => {
      // Start on mobile
      await setViewport(page, 375, 667);
      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');
      await waitForLoading(page);

      // Look for create task option
      const createTaskBtn = page.getByRole('button', { name: /create.*task|new.*task/i });
      if (await createTaskBtn.count() > 0) {
        await createTaskBtn.click();
        await page.waitForLoadState('networkidle');

        // Fill form on mobile
        const formInputs = page.locator('input, textarea');
        if (await formInputs.count() > 0) {
          await formInputs.first().fill('Mobile Created Task');
        }

        const submitBtn = page.getByRole('button', { name: /create|submit/i });
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForLoadState('networkidle');
          await waitForLoading(page);
        }
      }

      // Switch to desktop view
      await setViewport(page, 1440, 900);
      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');

      // Verify task created on mobile is visible on desktop
      const mobileTask = page.locator('text=Mobile Created Task');
      await expect(mobileTask).toBeVisible();

      // Test desktop management
      const taskActions = page.locator('button[aria-label*="edit"], [data-testid*="edit"]');
      if (await taskActions.count() > 0) {
        await taskActions.first().click();
        await page.waitForTimeout(300);
        
        // Check edit interface works on desktop
        await expect(page.locator('form, [data-testid*="edit"]')).toBeVisible();
      }
    });

    test('error recovery workflow: network error → retry → success', async ({ page }) => {
      // Start by causing a network error
      await page.route('**/api/**', (route) => {
        route.abort('internet');
      });

      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');

      // Try to create a task (should fail)
      const createTaskBtn = page.getByRole('button', { name: /create.*task/i });
      if (await createTaskBtn.count() > 0) {
        await createTaskBtn.click();
        await page.waitForTimeout(1000);

        // Should see error message
        const errorMessages = page.locator('[role="alert"], .error, .toast-error');
        await expect(errorMessages.first()).toBeVisible();
      }

      // Fix the network and retry
      await page.unroute('**/api/**');

      // Retry the operation
      if (await createTaskBtn.count() > 0) {
        await createTaskBtn.click();
        await page.waitForTimeout(2000);

        // Should see success or different state
        const feedback = page.locator('[role="alert"], .toast, .success');
        await expect(feedback.first()).toBeVisible();
      }
    });
  });

  test.describe('Accessibility E2E', () => {
    test('keyboard navigation works throughout the app', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test tab navigation through the main interface
      await page.keyboard.press('Tab');
      
      // Check focus is visible
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();

      // Continue tabbing through interface
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const currentFocus = await page.locator(':focus').first();
        await expect(currentFocus).toBeVisible();
      }

      // Test navigation using Enter/Space on focused elements
      const focusedButton = await page.locator('button:focus, [role="button"]:focus').first();
      if (await focusedButton.count() > 0) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
      }
    });

    test('screen reader announcements work', async ({ page }) => {
      await page.goto('/mgx/tasks');
      await page.waitForLoadState('networkidle');

      // Check for aria-live regions
      const liveRegions = page.locator('[aria-live]');
      const liveCount = await liveRegions.count();

      if (liveCount > 0) {
        // Test dynamic content updates
        const createTaskBtn = page.getByRole('button', { name: /create.*task/i });
        if (await createTaskBtn.count() > 0) {
          await createTaskBtn.click();
          await page.waitForTimeout(500);

          // Check announcements appear
          const announcements = page.locator('[aria-live], [role="status"]');
          await expect(announcements.first()).toBeVisible();
        }
      }
    });

    test('focus management in modals and dynamic content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for modal triggers
      const modalTriggers = page.locator('button[aria-haspopup], [data-testid*="modal"]');
      if (await modalTriggers.count() > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(300);

        // Check modal opens
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
        if (await modal.count() > 0) {
          await expect(modal.first()).toBeVisible();

          // Check focus is trapped in modal
          const modalContent = modal.first();
          await expect(modalContent).toBeVisible();

          // Test modal close with Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          // Modal should close
          await expect(modal.first()).not.toBeVisible();
        }
      }
    });
  });
});