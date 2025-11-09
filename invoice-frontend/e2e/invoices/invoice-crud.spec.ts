import { test, expect, Page } from '@playwright/test';

// Helper function to login
async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('Invoice CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should list all invoices', async ({ page }) => {
    await page.goto('/invoices');
    
    // Wait for invoices to load
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Verify table headers
    await expect(page.locator('th:has-text("Invoice #")')).toBeVisible();
    await expect(page.locator('th:has-text("Customer")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Total")')).toBeVisible();
    await expect(page.locator('th:has-text("Due Date")')).toBeVisible();
  });

  test('should create new invoice', async ({ page }) => {
    await page.goto('/invoices');
    await page.click('button:has-text("New Invoice")');
    
    // Should navigate to create page
    await expect(page).toHaveURL(/\/invoices\/new/);
    
    // Fill invoice details
    await page.selectOption('[name="customerId"]', { index: 1 }); // Select first customer
    await page.fill('[name="companyInfo"]', 'Test Company');
    await page.fill('[name="issueDate"]', '2024-01-01');
    await page.fill('[name="dueDate"]', '2024-02-01');
    await page.fill('[name="taxRate"]', '8');
    
    await page.click('button:has-text("Create Invoice")');
    
    // Should redirect to edit page
    await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]+\/edit/);
    
    // Verify invoice details
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText('Draft');
  });

  test('should add line items to invoice', async ({ page }) => {
    // Create invoice first
    await page.goto('/invoices/new');
    await page.selectOption('[name="customerId"]', { index: 1 });
    await page.fill('[name="issueDate"]', '2024-01-01');
    await page.fill('[name="dueDate"]', '2024-02-01');
    await page.fill('[name="taxRate"]', '10');
    await page.click('button:has-text("Create Invoice")');
    
    await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]+\/edit/);
    
    // Add first line item
    await page.click('button:has-text("Add Line Item")');
    await page.fill('[name="description"]', 'Web Development');
    await page.fill('[name="quantity"]', '10');
    await page.fill('[name="unitPrice"]', '100');
    await page.click('button:has-text("Save Line Item")');
    
    // Verify line item added
    await expect(page.locator('text=Web Development')).toBeVisible();
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$1,000.00');
    
    // Add second line item
    await page.click('button:has-text("Add Line Item")');
    await page.fill('[name="description"]', 'Hosting');
    await page.fill('[name="quantity"]', '1');
    await page.fill('[name="unitPrice"]', '50');
    await page.click('button:has-text("Save Line Item")');
    
    // Verify totals updated
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$1,050.00');
    await expect(page.locator('[data-testid="tax"]')).toContainText('$105.00');
    await expect(page.locator('[data-testid="total"]')).toContainText('$1,155.00');
  });

  test('should edit line item', async ({ page }) => {
    // Setup: Create invoice with line item
    // ... (same as above)
    
    // Click edit on first line item
    await page.click('[data-testid="edit-line-item-0"]');
    
    // Update quantity
    await page.fill('[name="quantity"]', '15');
    await page.click('button:has-text("Update Line Item")');
    
    // Verify totals recalculated
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$1,500.00');
  });

  test('should delete line item', async ({ page }) => {
    // Setup: Create invoice with multiple line items
    // ...
    
    // Click delete on first line item
    await page.click('[data-testid="delete-line-item-0"]');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify line item removed
    await expect(page.locator('text=Web Development')).not.toBeVisible();
    
    // Verify totals updated
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$50.00');
  });

  test('should mark invoice as sent', async ({ page }) => {
    // Setup: Create invoice with line items
    // ...
    
    // Click mark as sent
    await page.click('button:has-text("Mark as Sent")');
    
    // Confirm
    await page.click('button:has-text("Confirm")');
    
    // Verify status changed
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText('Sent');
    
    // Verify edit buttons disabled
    await expect(page.locator('button:has-text("Add Line Item")')).toBeDisabled();
  });

  test('should not allow marking invoice as sent without line items', async ({ page }) => {
    // Create invoice without line items
    await page.goto('/invoices/new');
    await page.selectOption('[name="customerId"]', { index: 1 });
    await page.fill('[name="issueDate"]', '2024-01-01');
    await page.fill('[name="dueDate"]', '2024-02-01');
    await page.click('button:has-text("Create Invoice")');
    
    // Mark as sent button should be disabled
    await expect(page.locator('button:has-text("Mark as Sent")')).toBeDisabled();
  });

  test('should filter invoices by status', async ({ page }) => {
    await page.goto('/invoices');
    
    // Select "Sent" filter
    await page.selectOption('[name="status"]', 'Sent');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Verify all visible invoices have "Sent" status
    const statuses = await page.locator('[data-testid="invoice-status"]').all Text();
    for (const status of statuses) {
      expect(status).toContain('Sent');
    }
  });

  test('should search invoices', async ({ page }) => {
    await page.goto('/invoices');
    
    // Enter search term
    await page.fill('[name="search"]', 'Test Customer');
    await page.waitForTimeout(500);
    
    // Verify filtered results
    await expect(page.locator('text=Test Customer')).toBeVisible();
  });

  test('should delete draft invoice', async ({ page }) => {
    await page.goto('/invoices');
    
    // Find first draft invoice and delete
    const firstDraftRow = page.locator('tr:has([data-status="Draft"])').first();
    await firstDraftRow.locator('button:has-text("Delete")').click();
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify success message
    await expect(page.locator('text=Invoice deleted')).toBeVisible();
  });

  test('should not allow deleting sent invoice', async ({ page }) => {
    await page.goto('/invoices');
    
    // Find sent invoice - delete button should not exist or be disabled
    const sentRow = page.locator('tr:has([data-status="Sent"])').first();
    await expect(sentRow.locator('button:has-text("Delete")')).toBeHidden();
  });

  test('should paginate invoice list', async ({ page }) => {
    await page.goto('/invoices');
    
    // Wait for data to load
    await page.waitForSelector('table');
    
    // Click next page
    await page.click('button:has-text("Next")');
    
    // Verify URL updated
    await expect(page).toHaveURL(/page=2/);
    
    // Verify different data loaded
    // (This would need more specific testing based on your data)
  });

  test('should display invoice details', async ({ page }) => {
    await page.goto('/invoices');
    
    // Click on first invoice
    await page.click('tr[data-testid="invoice-row"]').first();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]+/);
    
    // Verify invoice details displayed
    await expect(page.locator('[data-testid="invoice-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="invoice-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="line-items-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-history"]')).toBeVisible();
  });
});

