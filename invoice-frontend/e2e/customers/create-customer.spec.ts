import { test, expect } from '@playwright/test';

test.describe('Create Customer', () => {
  test.beforeEach(async ({ page }) => {
    // Login or setup authentication
    // await page.goto('/login');
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'password');
    // await page.click('button[type="submit"]');
  });
  
  test('creates customer with valid data', async ({ page }) => {
    await page.goto('/customers/new');
    
    // Fill form
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="address.street"]', '123 Main St');
    await page.fill('[name="address.city"]', 'New York');
    await page.fill('[name="address.state"]', 'NY');
    await page.fill('[name="address.postalCode"]', '10001');
    await page.fill('[name="address.country"]', 'USA');
    await page.fill('[name="phoneNumber"]', '+1-555-0100');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirect to list page
    await expect(page).toHaveURL(/\/customers$/);
    
    // Verify customer appears in list
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
  });
  
  test('shows validation error for duplicate email', async ({ page }) => {
    // Note: In real test, first create a customer via API
    // await createCustomerViaAPI({ email: 'duplicate@example.com' });
    
    await page.goto('/customers/new');
    
    await page.fill('[name="name"]', 'Duplicate User');
    await page.fill('[name="email"]', 'duplicate@example.com');
    // ... fill other fields
    
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('text=EMAIL_ALREADY_EXISTS')).toBeVisible();
  });
  
  test('shows validation error for invalid email format', async ({ page }) => {
    await page.goto('/customers/new');
    
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    // Verify error (could be client-side or server-side)
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});

test.describe('Customer List', () => {
  test('displays all customers', async ({ page }) => {
    await page.goto('/customers');
    
    // Wait for data to load
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Verify table exists
    await expect(page.locator('table')).toBeVisible();
  });
  
  test('deletes customer', async ({ page }) => {
    await page.goto('/customers');
    
    // Find first delete button and click
    const firstDeleteBtn = page.locator('button:has-text("Delete")').first();
    await firstDeleteBtn.click();
    
    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Verify customer removed
    await expect(page.locator('text=Customer deleted')).toBeVisible();
  });
});

