import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays the welcome message', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Sage', exact: true })).toBeVisible();
    await expect(page.getByText('Welcome to Sage')).toBeVisible();
  });

  test('has navigation buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Knowledge' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Graph' })).toBeVisible();
  });

  test('has a search input', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('e.g., Machine Learning basics');
    await expect(input).toBeVisible();
  });
});

test.describe('API Health', () => {
  test('API health endpoint returns ok', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });
});
