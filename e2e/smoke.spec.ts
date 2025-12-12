import { test, expect } from '@playwright/test';

test('smoke test: loads task list and navigates', async ({ page }) => {
  // Mock tasks API
  await page.route('**/tasks', async route => {
    const json = [
      {
        id: '1',
        name: 'E2E Task',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    await route.fulfill({ json });
  });

  // Mock metrics API
  await page.route('**/metrics', async route => {
    await route.fulfill({ json: [] });
  });

  await page.goto('/mgx/tasks');

  // Check if task is visible
  await expect(page.getByText('E2E Task')).toBeVisible();
  await expect(page.getByText('PENDING')).toBeVisible();

  // Mock task detail API
  await page.route('**/tasks/1', async route => {
    const json = {
        id: '1',
        name: 'E2E Task',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    await route.fulfill({ json });
  });
  
  // Navigate to detail
  await page.click('text=E2E Task');
  
  // Verify detail page
  await expect(page).toHaveURL(/\/mgx\/tasks\/1/);
  await expect(page.getByRole('heading', { name: 'E2E Task' })).toBeVisible();
});
