import { test, expect } from '@playwright/test';

test.describe('Episode CMS', () => {

  test('Unauthenticated user is redirected to login', async ({ page }) => {
    // Try to access the episodes dashboard directly
    await page.goto('/episodes');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('Login UI renders correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Login');
  });

  // Note: We avoid testing the actual login with credentials to prevent
  // leaking or hardcoding passwords in tests, but we test the structure.
});
