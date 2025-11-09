import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite for Device Pairing
 * Tests the critical flow of pairing a parent and child device
 * 
 * To run: npx playwright test
 */

test.describe('Device Pairing Flow', () => {
  test('Parent should be able to initiate pairing', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Login as parent
    await page.fill('input[type="email"]', 'parent@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL('/parent/dashboard');
    
    // Click QR Scanner button
    await page.click('text="QR Scanner"');
    
    // Verify QR scanner page loads
    await expect(page).toHaveURL('/parent/qr-scanner');
    await expect(page.locator('text="Scan QR Code"')).toBeVisible();
  });

  test('Child should be able to display QR code', async ({ page }) => {
    // Navigate and login as child
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'child@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to QR display
    await page.goto('/child/qr-display');
    
    // Verify QR code is displayed
    await expect(page.locator('svg')).toBeVisible(); // QR code SVG
    await expect(page.locator('text="Pairing Code"')).toBeVisible();
  });

  test('Permission request flow', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'child@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to permissions
    await page.goto('/pairing/permissions');
    
    // Verify all permission toggles exist
    await expect(page.locator('text="Camera Access"')).toBeVisible();
    await expect(page.locator('text="Location Access"')).toBeVisible();
    await expect(page.locator('text="Microphone Access"')).toBeVisible();
    await expect(page.locator('text="Screen Recording"')).toBeVisible();
    
    // Grant permissions
    const switches = page.locator('[role="switch"]');
    const count = await switches.count();
    for (let i = 0; i < count; i++) {
      await switches.nth(i).click();
    }
    
    // Submit permissions
    await page.click('text="Grant Permissions"');
  });
});

test.describe('Location Tracking', () => {
  test('Parent can view child location', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'parent@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to location page
    await page.goto('/parent/location');
    
    // Verify map is loaded
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    await expect(page.locator('text="Current Location"')).toBeVisible();
  });

  test('Geofencing setup', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'parent@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/settings/geofencing');
    
    // Click Add Safe Zone
    await page.click('text="Add Safe Zone"');
    
    // Fill form
    await page.fill('input[id="name"]', 'Home');
    await page.fill('input[id="latitude"]', '40.7128');
    await page.fill('input[id="longitude"]', '-74.0060');
    await page.fill('input[id="radius"]', '300');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify created
    await expect(page.locator('text="Home"')).toBeVisible();
  });
});

test.describe('Screen Recording', () => {
  test('Parent can start screen recording', async ({ page, context }) => {
    // Grant permissions for screen capture
    await context.grantPermissions(['display-capture']);
    
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'parent@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/parent/live-monitoring');
    
    // Click start recording
    await page.click('text="Start Recording"');
    
    // Verify recording state
    await expect(page.locator('text="Stop Recording"')).toBeVisible();
    await expect(page.locator('text="Recording:"')).toBeVisible();
  });
});
