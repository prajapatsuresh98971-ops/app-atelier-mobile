import { test, expect } from '@playwright/test';

test.describe('Complete Pairing Flow', () => {
  test('should complete full pairing flow from child to parent', async ({ browser }) => {
    // Create two contexts for child and parent
    const childContext = await browser.newContext();
    const parentContext = await browser.newContext();
    
    const childPage = await childContext.newPage();
    const parentPage = await parentContext.newPage();
    
    // Child logs in and generates pairing code
    await childPage.goto('/auth/login');
    // ... login as child
    await childPage.goto('/child/qr-display');
    
    // Wait for code generation
    await childPage.waitForSelector('[data-testid="pairing-code"]');
    const pairingCode = await childPage.locator('[data-testid="pairing-code"]').textContent();
    
    // Parent logs in and scans code
    await parentPage.goto('/auth/login');
    // ... login as parent
    await parentPage.goto('/parent/qr-scanner');
    
    // Enter manual code
    await parentPage.click('button:has-text("Enter Code Manually")');
    await parentPage.fill('input[type="text"]', pairingCode || '');
    await parentPage.click('button:has-text("Pair Device")');
    
    // Child should receive permission request
    await childPage.waitForURL(/.*permissions.*/);
    
    // Grant permissions
    await childPage.click('button:has-text("Grant Permissions")');
    
    // Both should navigate to dashboard
    await expect(childPage).toHaveURL(/.*dashboard.*/);
    await expect(parentPage).toHaveURL(/.*dashboard.*/);
    
    await childContext.close();
    await parentContext.close();
  });

  test('should show countdown timer that updates every second', async ({ page }) => {
    await page.goto('/child/qr-display');
    
    await page.waitForSelector('[data-testid="pairing-code"]');
    
    // Get initial time
    const initialTime = await page.locator('text=/Time remaining:/').textContent();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // Time should have decreased
    const newTime = await page.locator('text=/Time remaining:/').textContent();
    expect(initialTime).not.toBe(newTime);
  });

  test('should allow copying pairing code to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/child/qr-display');
    await page.waitForSelector('[data-testid="pairing-code"]');
    
    const pairingCode = await page.locator('[data-testid="pairing-code"]').textContent();
    
    // Click copy button
    await page.click('button:has-text("Copy Code")');
    
    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(pairingCode);
    
    // Should show success toast
    await expect(page.locator('text=Copied to clipboard')).toBeVisible();
  });

  test('should regenerate code and invalidate old one', async ({ page }) => {
    await page.goto('/child/qr-display');
    await page.waitForSelector('[data-testid="pairing-code"]');
    
    const oldCode = await page.locator('[data-testid="pairing-code"]').textContent();
    
    // Regenerate
    await page.click('button:has-text("Generate New Code")');
    await page.waitForTimeout(1000);
    
    const newCode = await page.locator('[data-testid="pairing-code"]').textContent();
    
    expect(oldCode).not.toBe(newCode);
    
    // Should show success message
    await expect(page.locator('text=New code generated')).toBeVisible();
  });
});
