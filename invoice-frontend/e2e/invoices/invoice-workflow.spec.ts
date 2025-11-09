import { test, expect } from '@playwright/test';

test.describe('Complete Invoice Workflow', () => {
  test('creates invoice, adds line items, marks as sent, records payment', async ({ page }) => {
    // 1. Create customer first
    await page.goto('/customers/new');
    await page.fill('[name="name"]', 'Test Customer');
    await page.fill('[name="email"]', 'test@example.com');
    // ... fill required fields
    await page.click('button[type="submit"]');
    
    // 2. Create invoice
    await page.goto('/invoices/new');
    
    await page.selectOption('[name="customerId"]', { label: 'Test Customer' });
    await page.fill('[name="issueDate"]', '2024-01-01');
    await page.fill('[name="dueDate"]', '2024-02-01');
    await page.fill('[name="taxRate"]', '10');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to edit page
    await expect(page).toHaveURL(/\/invoices\/[^/]+\/edit$/);
    
    // 3. Add line items
    await page.fill('[name="lineItem.description"]', 'Web Development');
    await page.fill('[name="lineItem.quantity"]', '10');
    await page.fill('[name="lineItem.unitPrice"]', '100');
    await page.click('button:has-text("Add Line Item")');
    
    // Verify line item added
    await expect(page.locator('text=Web Development')).toBeVisible();
    await expect(page.locator('text=$1,000.00')).toBeVisible(); // Total
    
    // Add another line item
    await page.fill('[name="lineItem.description"]', 'Consulting');
    await page.fill('[name="lineItem.quantity"]', '5');
    await page.fill('[name="lineItem.unitPrice"]', '200');
    await page.click('button:has-text("Add Line Item")');
    
    // Verify updated total (1000 + 1000 = 2000 + tax)
    await expect(page.locator('text=$2,200.00')).toBeVisible(); // With 10% tax
    
    // 4. Mark as sent
    await page.click('button:has-text("Mark as Sent")');
    
    // Verify status changed
    await expect(page.locator('[data-status="Sent"]')).toBeVisible();
    
    // 5. Record partial payment
    await page.click('button:has-text("Record Payment")');
    
    await page.fill('[name="amount"]', '1000');
    await page.selectOption('[name="paymentMethod"]', 'CreditCard');
    await page.fill('[name="paymentDate"]', '2024-01-15');
    await page.click('button[type="submit"]');
    
    // Verify balance updated
    await expect(page.locator('text=Balance: $1,200.00')).toBeVisible();
    
    // 6. Record final payment
    await page.click('button:has-text("Record Payment")');
    
    await page.fill('[name="amount"]', '1200');
    await page.selectOption('[name="paymentMethod"]', 'BankTransfer');
    await page.click('button[type="submit"]');
    
    // Verify invoice marked as paid
    await expect(page.locator('[data-status="Paid"]')).toBeVisible();
    await expect(page.locator('text=Balance: $0.00')).toBeVisible();
  });
  
  test('prevents payment exceeding balance', async ({ page }) => {
    // Setup: Create invoice with $1000 total
    // ... setup code ...
    
    await page.click('button:has-text("Record Payment")');
    await page.fill('[name="amount"]', '2000'); // More than balance
    await page.click('button[type="submit"]');
    
    // Verify error
    await expect(page.locator('text=PAYMENT_EXCEEDS_BALANCE')).toBeVisible();
  });
  
  test('prevents marking draft invoice as sent without line items', async ({ page }) => {
    await page.goto('/invoices/new');
    // ... create invoice without line items ...
    
    const markSentBtn = page.locator('button:has-text("Mark as Sent")');
    await expect(markSentBtn).toBeDisabled();
  });
});

