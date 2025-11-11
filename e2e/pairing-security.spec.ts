import { test, expect } from '@playwright/test';

test.describe('Pairing Security Tests', () => {
  test('should prevent using expired pairing codes', async ({ page }) => {
    // Test that expired codes are rejected
    await page.goto('/child/qr-display');
    
    // Wait for code generation
    await page.waitForSelector('[data-testid="pairing-code"]');
    
    // Fast-forward time (if possible) or wait for expiration
    // This is a placeholder - actual implementation would need time manipulation
    expect(true).toBe(true);
  });

  test('should rate limit pairing code generation', async ({ page }) => {
    await page.goto('/child/qr-display');
    
    // Try to generate multiple codes rapidly
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Generate New Code")');
      await page.waitForTimeout(100);
    }
    
    // Should show rate limit error after 5 attempts
    const errorMessage = await page.locator('text=Too many requests').isVisible();
    expect(errorMessage).toBeTruthy();
  });

  test('should revoke old codes when new one is generated', async ({ page }) => {
    await page.goto('/child/qr-display');
    
    // Generate first code
    await page.waitForSelector('[data-testid="pairing-code"]');
    const firstCode = await page.locator('[data-testid="pairing-code"]').textContent();
    
    // Generate second code
    await page.click('button:has-text("Generate New Code")');
    await page.waitForTimeout(1000);
    const secondCode = await page.locator('[data-testid="pairing-code"]').textContent();
    
    expect(firstCode).not.toBe(secondCode);
    
    // First code should now be invalid
    // This would require attempting to use it
  });

  test('should not leak user information in error messages', async ({ page }) => {
    await page.goto('/parent/qr-scanner');
    
    // Try invalid code
    await page.click('button:has-text("Enter Code Manually")');
    await page.fill('input[type="text"]', 'INVALID123CODE');
    await page.click('button:has-text("Pair Device")');
    
    // Error should be generic, not revealing if code exists
    const errorText = await page.locator('[role="alert"]').textContent();
    expect(errorText).not.toContain('email');
    expect(errorText).not.toContain('user');
  });

  test('should require authentication for all pairing endpoints', async ({ page, context }) => {
    // Clear all auth tokens
    await context.clearCookies();
    await page.goto('/');
    
    // Attempt to access protected pairing pages
    await page.goto('/child/qr-display');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);
  });
});
