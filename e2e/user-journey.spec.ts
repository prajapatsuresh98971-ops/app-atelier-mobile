import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  const parentEmail = `parent-${Date.now()}@test.com`;
  const childEmail = `child-${Date.now()}@test.com`;
  const password = 'TestPassword123!';
  const name = 'Test User';

  test('Parent registration and onboarding flow', async ({ page }) => {
    // Go to registration
    await page.goto('/auth/register');
    
    // Fill registration form
    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', parentEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for role selection
    await expect(page).toHaveURL('/auth/role-selection', { timeout: 10000 });
    
    // Select parent role
    await page.click('text=I\'m a Parent');
    
    // Should redirect to parent dashboard or onboarding
    await expect(page.url()).toMatch(/\/(parent\/dashboard|parent\/onboarding)/);
  });

  test('Child registration flow', async ({ page }) => {
    // Go to registration
    await page.goto('/auth/register');
    
    // Fill registration form
    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', childEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for role selection
    await expect(page).toHaveURL('/auth/role-selection', { timeout: 10000 });
    
    // Select child role
    await page.click('text=I\'m a Child');
    
    // Should redirect to child dashboard
    await expect(page).toHaveURL('/child/dashboard', { timeout: 10000 });
  });

  test('Login flow', async ({ page }) => {
    // Register first
    await page.goto('/auth/register');
    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', parentEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/auth/role-selection', { timeout: 10000 });
    await page.click('text=I\'m a Parent');
    
    // Logout
    await page.goto('/profile/settings');
    await page.click('text=Logout');
    
    // Login again
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', parentEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/parent/dashboard', { timeout: 10000 });
  });

  test('Profile management and settings', async ({ page, context }) => {
    // Login as parent
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', parentEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Navigate to settings
    await page.goto('/profile/settings');
    
    // Verify settings page loads
    await expect(page.locator('h1')).toContainText('Profile Settings');
    
    // Update name
    const newName = 'Updated Name';
    await page.fill('input[name="name"]', newName);
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 5000 });
  });

  test('QR code pairing flow', async ({ page, context }) => {
    // This test would require two browser contexts
    const parentContext = await context.browser()?.newContext();
    const childContext = await context.browser()?.newContext();
    
    if (!parentContext || !childContext) return;

    const parentPage = await parentContext.newPage();
    const childPage = await childContext.newPage();

    try {
      // Parent logs in
      await parentPage.goto('/auth/login');
      await parentPage.fill('input[type="email"]', parentEmail);
      await parentPage.fill('input[type="password"]', password);
      await parentPage.click('button[type="submit"]');
      await parentPage.waitForURL('/parent/dashboard', { timeout: 10000 });

      // Child logs in
      await childPage.goto('/auth/login');
      await childPage.fill('input[type="email"]', childEmail);
      await childPage.fill('input[type="password"]', password);
      await childPage.click('button[type="submit"]');
      await childPage.waitForURL('/child/dashboard', { timeout: 10000 });

      // Child goes to QR display
      await childPage.goto('/child/qr-display');
      
      // Get pairing code
      const pairingCode = await childPage.locator('text=/\\d{3}-\\d{3}-\\d{3}-\\d{3}-\\d{3}/').textContent();
      
      // Parent goes to scanner and enters code
      await parentPage.goto('/parent/qr-scanner');
      if (pairingCode) {
        await parentPage.fill('input[type="text"]', pairingCode.replace(/-/g, ''));
        await parentPage.click('button:has-text("Connect")');
      }

      // Child accepts pairing
      await childPage.click('button:has-text("Accept")');
      
      // Verify pairing successful
      await expect(parentPage.locator('text=Pairing successful')).toBeVisible({ timeout: 10000 });
    } finally {
      await parentContext.close();
      await childContext.close();
    }
  });

  test('Account deletion flow', async ({ page }) => {
    // Register and login
    const email = `delete-test-${Date.now()}@test.com`;
    await page.goto('/auth/register');
    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/auth/role-selection', { timeout: 10000 });
    await page.click('text=I\'m a Parent');
    
    // Go to settings
    await page.goto('/profile/settings');
    
    // Find and click delete button
    await page.click('button:has-text("Delete Account")');
    
    // Confirm deletion
    await page.click('button:has-text("Delete"):last-of-type');
    
    // Should redirect to intro or login
    await expect(page.url()).toMatch(/\/(onboarding\/intro-1|auth\/login)/);
  });

  test('Navigation accessibility', async ({ page }) => {
    // Login as parent
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', parentEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Test navigation to various pages
    const pages = [
      '/parent/dashboard',
      '/parent/location',
      '/settings/geofencing',
      '/settings/privacy',
      '/help/about',
      '/help/support',
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await expect(page).toHaveURL(pagePath);
      // Verify page loads without errors
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
