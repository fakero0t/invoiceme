# E2E Tests with Playwright

## Setup

### Install Dependencies
```bash
npm install
npx playwright install
```

### Install Browsers
```bash
npx playwright install chromium firefox webkit
```

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test e2e/auth/login.spec.ts
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Tests on Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## View Test Reports

```bash
npm run test:e2e:report
```

## Writing Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code (e.g., login)
  });

  test('should do something', async ({ page }) => {
    // Test code
  });
});
```

### Common Patterns

#### Navigation
```typescript
await page.goto('/customers');
await page.click('a:has-text("Invoices")');
```

#### Form Interactions
```typescript
await page.fill('input[name="email"]', 'test@example.com');
await page.selectOption('select[name="status"]', 'Sent');
await page.check('input[type="checkbox"]');
await page.click('button[type="submit"]');
```

#### Assertions
```typescript
await expect(page).toHaveURL(/\/dashboard/);
await expect(page.locator('h1')).toContainText('Dashboard');
await expect(page.locator('button')).toBeVisible();
await expect(page.locator('input')).toBeEnabled();
```

#### Waiting
```typescript
await page.waitForSelector('table');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);
```

## Test Organization

```
e2e/
├── auth/
│   └── login.spec.ts           # Authentication tests
├── customers/
│   └── create-customer.spec.ts # Customer management
├── invoices/
│   ├── invoice-workflow.spec.ts # Complete workflow
│   └── invoice-crud.spec.ts     # CRUD operations
└── README.md
```

## Best Practices

1. **Use Data Attributes**: Add `data-testid` attributes for stable selectors
   ```html
   <button data-testid="submit-button">Submit</button>
   ```
   ```typescript
   await page.click('[data-testid="submit-button"]');
   ```

2. **Avoid Hardcoded Waits**: Use Playwright's auto-waiting
   ```typescript
   // Bad
   await page.waitForTimeout(5000);
   
   // Good
   await page.waitForSelector('table');
   await expect(page.locator('table')).toBeVisible();
   ```

3. **Use Page Object Pattern** (for complex tests)
   ```typescript
   class LoginPage {
     constructor(public page: Page) {}
     
     async login(email: string, password: string) {
       await this.page.fill('[name="email"]', email);
       await this.page.fill('[name="password"]', password);
       await this.page.click('button[type="submit"]');
     }
   }
   ```

4. **Clean Up Test Data**: Use `afterEach` or `afterAll` hooks
   ```typescript
   test.afterEach(async ({ page, request }) => {
     // Clean up created test data via API
   });
   ```

5. **Parallel Execution**: Tests run in parallel by default
   - Ensure tests are independent
   - Don't rely on specific execution order

## Configuration

See `playwright.config.ts` for:
- Browsers to test
- Timeouts
- Screenshots/videos
- Base URL
- Test retries

## CI Integration

In CI/CD pipeline:
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    CI: true

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests Flaking
- Increase timeouts
- Use more specific selectors
- Wait for network idle: `await page.waitForLoadState('networkidle');`

### Selector Not Found
- Check if element is in an iframe
- Verify element exists in DOM
- Use Playwright Inspector: `npx playwright test --debug`

### Slow Tests
- Run fewer browsers locally (only chromium)
- Use `test.only()` to run single test
- Check for unnecessary waits

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)

