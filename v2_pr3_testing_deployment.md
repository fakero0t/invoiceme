# PR3: Testing, Performance, Security & Deployment

**Scope:** Complete testing suite, performance validation, security audit, and production deployment  
**Dependencies:** PR1 and PR2 must be merged and validated

## Success Criteria
✅ >80% unit test coverage  
✅ 20+ integration tests passing  
✅ 10+ E2E tests passing  
✅ API response times <200ms  
✅ Security audit complete  
✅ Documentation updated  
✅ Production deployment successful  
✅ Monitoring operational

---

## Phase 6: Complete Testing Suite

### Unit Test Coverage

**Domain Layer Tests:**
```typescript
// Tests/Unit/Domain/Customers/Customer.test.ts
describe('Customer', () => {
  describe('create', () => {
    it('creates customer with valid data', () => {
      const customer = Customer.create({
        id: '123',
        userId: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        address: { /* valid address */ },
        phoneNumber: '555-1234',
      });
      
      expect(customer.id).toBe('123');
      expect(customer.name.value).toBe('John Doe');
    });
    
    it('throws ValidationException for invalid email', () => {
      expect(() => {
        Customer.create({ /* ... */, email: 'invalid-email' });
      }).toThrow(ValidationException);
    });
  });
  
  describe('update', () => {
    it('updates customer fields', () => {
      const customer = Customer.create(/* ... */);
      customer.update({ name: 'Jane Doe', /* ... */ });
      expect(customer.name.value).toBe('Jane Doe');
    });
  });
  
  describe('softDelete', () => {
    it('sets deletedAt timestamp', () => {
      const customer = Customer.create(/* ... */);
      customer.softDelete();
      expect(customer.deletedAt).toBeDefined();
      expect(customer.isDeleted()).toBe(true);
    });
  });
});
```

**Value Object Tests:**
```typescript
// Tests/Unit/Domain/Shared/Money.test.ts
describe('Money', () => {
  it('creates money with valid amount', () => {
    const money = new Money(100.50);
    expect(money.value).toBe(100.50);
  });
  
  it('throws for negative amounts', () => {
    expect(() => new Money(-10)).toThrow(ValidationException);
  });
  
  it('adds two money values', () => {
    const m1 = new Money(100);
    const m2 = new Money(50);
    const result = m1.add(m2);
    expect(result.value).toBe(150);
  });
  
  it('formats as JSON number', () => {
    const money = new Money(100.50);
    expect(money.toJSON()).toBe(100.50);
  });
});
```

**Invoice Aggregate Tests:**
```typescript
// Tests/Unit/Domain/Invoices/Invoice.test.ts
describe('Invoice', () => {
  describe('addLineItem', () => {
    it('adds line item and recalculates totals', () => {
      const invoice = Invoice.create(/* ... */);
      const lineItem = LineItem.create({
        id: '1',
        description: 'Service',
        quantity: 2,
        unitPrice: new Money(100),
      });
      
      invoice.addLineItem(lineItem);
      
      expect(invoice.lineItems.length).toBe(1);
      expect(invoice.subtotal.value).toBe(200);
      expect(invoice.total.value).toBeGreaterThan(200); // includes tax
    });
  });
  
  describe('markAsSent', () => {
    it('transitions from Draft to Sent', () => {
      const invoice = Invoice.create(/* ... */);
      invoice.addLineItem(/* ... */);
      invoice.markAsSent();
      expect(invoice.status).toBe('Sent');
      expect(invoice.sentDate).toBeDefined();
    });
    
    it('throws if no line items', () => {
      const invoice = Invoice.create(/* ... */);
      expect(() => invoice.markAsSent()).toThrow(DomainException);
    });
  });
  
  describe('markAsPaid', () => {
    it('transitions to Paid status', () => {
      const invoice = Invoice.create(/* ... */);
      invoice.markAsSent();
      invoice.markAsPaid();
      expect(invoice.status).toBe('Paid');
      expect(invoice.paidDate).toBeDefined();
    });
  });
});
```

**Command Handler Unit Tests (Mock Dependencies):**
```typescript
// Tests/Unit/Application/Commands/CreateCustomer.test.ts
describe('CreateCustomerCommandHandler', () => {
  let handler: CreateCustomerCommandHandler;
  let mockRepo: jest.Mocked<ICustomerRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;
  
  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as any;
    mockEventBus = {
      publish: jest.fn(),
    } as any;
    handler = new CreateCustomerCommandHandler(mockRepo, mockEventBus);
  });
  
  it('creates customer when email is unique', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    
    const command = { /* valid command */ };
    const customerId = await handler.handle(command);
    
    expect(customerId).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'customer.created' })
    );
  });
  
  it('throws ValidationException when email exists', async () => {
    mockRepo.findByEmail.mockResolvedValue(/* existing customer */);
    
    await expect(handler.handle(/* command */)).rejects.toThrow(ValidationException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
```

**Unit Test Coverage Target:**
- Domain entities: 90%+
- Value objects: 95%+
- Command handlers: 85%+
- Query handlers: 80%+
- **Overall: >80%**

---

### Integration Test Coverage

**Test Database Strategy:**
```typescript
// Tests/Integration/setup.ts
import { Pool } from 'pg';

let pool: Pool;

beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await pool.query('BEGIN'); // Start transaction
});

afterAll(async () => {
  await pool.query('ROLLBACK'); // Rollback all test data
  await pool.end();
});

// Each test runs in its own savepoint
beforeEach(async () => {
  await pool.query('SAVEPOINT test_savepoint');
});

afterEach(async () => {
  await pool.query('ROLLBACK TO SAVEPOINT test_savepoint');
});
```

**Complete Flow Integration Test:**
```typescript
// Tests/Integration/CompleteInvoiceFlow.test.ts
describe('Complete Invoice Payment Flow', () => {
  it('creates customer, invoice, line items, marks sent, records payments', async () => {
    // 1. Create customer
    const createCustomerHandler = container.resolve(CreateCustomerCommandHandler);
    const customerId = await createCustomerHandler.handle({
      userId: 'test-user',
      name: 'Test Customer',
      email: 'test@example.com',
      address: { street: '123 Main', city: 'Springfield', state: 'IL', postalCode: '62701', country: 'USA' },
      phoneNumber: '555-1234',
    });
    
    // 2. Create invoice
    const createInvoiceHandler = container.resolve(CreateInvoiceCommandHandler);
    const invoiceId = await createInvoiceHandler.handle({
      userId: 'test-user',
      customerId,
      companyInfo: 'My Company',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: 0.08,
    });
    
    // 3. Add line items
    const addLineItemHandler = container.resolve(AddLineItemCommandHandler);
    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user',
      description: 'Service 1',
      quantity: 2,
      unitPrice: 250,
    });
    await addLineItemHandler.handle({
      invoiceId,
      userId: 'test-user',
      description: 'Service 2',
      quantity: 1,
      unitPrice: 500,
    });
    
    // 4. Get invoice and verify totals
    const getInvoiceHandler = container.resolve(GetInvoiceQueryHandler);
    let invoice = await getInvoiceHandler.handle({ invoiceId, userId: 'test-user' });
    expect(invoice.subtotal).toBe(1000); // (250*2) + (500*1)
    expect(invoice.taxAmount).toBe(80); // 1000 * 0.08
    expect(invoice.total).toBe(1080);
    expect(invoice.status).toBe('Draft');
    
    // 5. Mark as sent
    const markAsSentHandler = container.resolve(MarkInvoiceAsSentCommandHandler);
    await markAsSentHandler.handle({ invoiceId, userId: 'test-user' });
    
    invoice = await getInvoiceHandler.handle({ invoiceId, userId: 'test-user' });
    expect(invoice.status).toBe('Sent');
    
    // 6. Record partial payment
    const recordPaymentHandler = container.resolve(RecordPaymentCommandHandler);
    await recordPaymentHandler.handle({
      invoiceId,
      userId: 'test-user',
      amount: 500,
      paymentMethod: 'CreditCard',
      paymentDate: new Date(),
    });
    
    invoice = await getInvoiceHandler.handle({ invoiceId, userId: 'test-user' });
    expect(invoice.balance).toBe(580); // 1080 - 500
    expect(invoice.status).toBe('Sent');
    
    // 7. Record final payment
    await recordPaymentHandler.handle({
      invoiceId,
      userId: 'test-user',
      amount: 580,
      paymentMethod: 'CreditCard',
      paymentDate: new Date(),
    });
    
    invoice = await getInvoiceHandler.handle({ invoiceId, userId: 'test-user' });
    expect(invoice.balance).toBe(0);
    expect(invoice.status).toBe('Paid');
    
    // 8. Verify payment history
    const listPaymentsHandler = container.resolve(ListPaymentsQueryHandler);
    const payments = await listPaymentsHandler.handle({ invoiceId });
    expect(payments.length).toBe(2);
    expect(payments[0].amount).toBe(500);
    expect(payments[1].amount).toBe(580);
  });
});
```

**Integration Test Coverage Required:**
- All 13 commands
- All 7 queries
- Cross-aggregate operations
- Event publishing verification
- Transaction rollback scenarios
- Authorization checks
- **Target: 20+ integration tests**

---

## Phase 7: Performance Testing

### Load Testing Setup

**Artillery Configuration:**
```yaml
# artillery-config.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests/second
    - duration: 120
      arrivalRate: 50  # Ramp to 50 requests/second
    - duration: 60
      arrivalRate: 100 # Peak at 100 concurrent users
  defaults:
    headers:
      Authorization: "Bearer {{ $auth_token }}"
scenarios:
  - name: "Create and List Invoices"
    flow:
      - post:
          url: "/api/v1/invoices"
          json:
            customerId: "{{ $randomCustomerId }}"
            companyInfo: "Test Company"
            issueDate: "2025-01-01"
            dueDate: "2025-02-01"
            taxRate: 0.08
      - get:
          url: "/api/v1/invoices"
      - get:
          url: "/api/v1/invoices/{{ invoiceId }}"
```

**Run:** `artillery run artillery-config.yml`

**Performance Targets:**
- Create customer: <100ms (p95)
- Create invoice: <150ms (p95)
- List invoices (25 items): <150ms (p95)
- Get invoice: <100ms (p95)
- Record payment: <100ms (p95)
- Generate PDF: <5s (p95)

**Database Query Optimization:**
```sql
-- Add indexes for common queries
CREATE INDEX idx_invoices_user_id_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_user_id_created_at ON invoices(user_id, created_at DESC);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_customers_user_id_email ON customers(user_id, email);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM invoices WHERE user_id = 'xxx' AND status = 'Sent' ORDER BY created_at DESC LIMIT 25;
```

---

## Security Audit

### Authentication Verification

**Test Scenarios:**
1. ✅ All protected endpoints require valid JWT
2. ✅ Expired tokens are rejected (401)
3. ✅ Invalid tokens are rejected (401)
4. ✅ Refresh token flow works correctly

**Example Test:**
```typescript
describe('Authentication Security', () => {
  it('rejects request without token', async () => {
    const response = await request(app)
      .get('/api/v1/customers')
      .expect(401);
    
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
  
  it('rejects expired token', async () => {
    const expiredToken = generateExpiredToken();
    const response = await request(app)
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
});
```

### Authorization Verification

**Test Scenarios:**
1. ✅ Users can only access their own data
2. ✅ Cross-user access blocked
3. ✅ userId validation in all commands/queries

**Example Test:**
```typescript
describe('Authorization Security', () => {
  it('prevents user from accessing another users customer', async () => {
    // Create customer for user1
    const customerId = await createCustomer('user1');
    
    // Try to access as user2
    const user2Token = generateToken('user2');
    const response = await request(app)
      .get(`/api/v1/customers/${customerId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(404); // Or 403
  });
});
```

### Input Validation

**SQL Injection Prevention:**
- ✅ All queries use parameterized statements
- ✅ No string concatenation in SQL
- ❌ Bad: `` `SELECT * FROM users WHERE id = '${userId}'` ``
- ✅ Good: `query('SELECT * FROM users WHERE id = $1', [userId])`

**XSS Prevention:**
- ✅ Frontend sanitizes user input
- ✅ Backend returns structured JSON (not HTML)
- ✅ CSP headers configured

**CSRF Protection:**
- ✅ SameSite cookie attributes
- ✅ Token-based auth (not cookie-based sessions)

### Dependency Audit

```bash
# Backend
cd /path/to/backend
npm audit
npm audit fix

# Frontend
cd /path/to/frontend
npm audit
npm audit fix
```

**Action:** Fix all critical and high vulnerabilities. Document accepted risks for others.

---

## Documentation Updates

### README.md

```markdown
# Invoice System v2 - DDD Architecture

## Architecture Overview

This application follows Domain-Driven Design (DDD), CQRS, and Vertical Slice Architecture (VSA) principles.

### Key Architectural Concepts

**Domain-Driven Design:**
- Domain entities encapsulate business logic
- Value objects for domain concepts (Money, Email, Address)
- Aggregates enforce consistency boundaries
- Domain events communicate state changes

**CQRS:**
- Commands: Write operations (Create, Update, Delete)
- Queries: Read operations (Get, List)
- Separate handlers for each operation

**Vertical Slice Architecture:**
- Features organized by use case
- Each feature contains: Command/Query + Handler + Tests
- Minimal cross-feature dependencies

### Folder Structure

[Include complete backend + frontend structure]

### Development Setup

1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env`
3. Run migrations: `npm run migrate`
4. Start dev server: `npm run dev`
5. Run tests: `npm test`

### Running Tests

- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`
- All tests: `npm test`

### API Documentation

Swagger docs available at: `http://localhost:3000/api-docs`

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md)
```

### ARCHITECTURE.md

Create new file documenting:
- Bounded contexts (Customer, Invoice, Payment, User)
- Aggregate definitions
- Complete command list (13)
- Complete query list (7)
- Complete domain event list (10+)
- Integration points (Invoice-Generator API, S3, Cognito)

### Architecture Decision Records (ADRs)

Create `docs/adr/` folder:

1. **ADR-001-domain-driven-design.md**
   - Decision: Adopt DDD architecture
   - Rationale: Scalability, maintainability, clear boundaries
   - Consequences: Learning curve, more files, explicit patterns

2. **ADR-002-cqrs-pattern.md**
   - Decision: Implement CQRS
   - Rationale: Separate read/write concerns, optimize each independently
   - Consequences: More code, clearer intent, better performance

3. **ADR-003-event-bus-not-event-sourcing.md**
   - Decision: Use in-memory event bus, NOT full event sourcing
   - Rationale: Simpler for current scale, can evolve later
   - Consequences: No event replay, simpler implementation

4. **ADR-004-transaction-boundaries.md**
   - Decision: Command handlers own transaction scope
   - Rationale: Clear responsibility, event failure rolls back
   - Consequences: Handlers must manage DB connections

5. **ADR-005-frontend-state-management.md**
   - Decision: Composables over Pinia for features
   - Rationale: Simpler, more localized, easier to test
   - Consequences: Manual cache invalidation, no global reactive state for features

---

## Staging Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review complete
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Rollback plan documented

### Deployment Steps

1. **Database Migrations:**
   ```bash
   # Ensure migrations are backward compatible
   npm run migrate -- --dry-run
   npm run migrate
   ```

2. **Backend Deployment:**
   ```bash
   # Build
   npm run build
   
   # Deploy (blue-green or canary)
   # Update environment variables
   # Restart services
   ```

3. **Frontend Deployment:**
   ```bash
   cd invoice-frontend
   npm run build
   # Deploy static assets to CDN/S3
   ```

### Smoke Testing

**Automated Smoke Tests:**
```typescript
// tests/smoke/health-check.spec.ts
test('health endpoint responds', async () => {
  const response = await fetch('https://staging.example.com/health');
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.status).toBe('ok');
});

test('can create customer', async () => {
  const response = await authenticatedFetch('https://staging.example.com/api/v1/customers', {
    method: 'POST',
    body: JSON.stringify({ /* test data */ }),
  });
  expect(response.status).toBe(201);
});
```

**Manual Smoke Tests:**
1. Login works
2. Create customer works
3. Create invoice works
4. Add line items works
5. Record payment works
6. PDF generation works

---

## Production Deployment

### Pre-Production Checklist

- [ ] Staging validated for 48+ hours
- [ ] All smoke tests passing
- [ ] Performance metrics acceptable
- [ ] Error rates < 0.1%
- [ ] Stakeholder approval
- [ ] Communication plan ready

### Deployment Window

**Recommended:** Low-traffic period (Sunday 2-4 AM)

**Steps:**
1. Database migrations (run first)
2. Backend deployment (blue-green)
3. Frontend deployment
4. Monitor for 1 hour
5. Roll back if error rate > 1%

### Post-Deployment Validation

**Immediate (0-1 hour):**
- [ ] Health check passing
- [ ] No 500 errors in logs
- [ ] API response times normal
- [ ] Manual test of critical paths

**Short-term (1-24 hours):**
- [ ] Error rate < 0.1%
- [ ] Performance within 10% of baseline
- [ ] No customer complaints
- [ ] All integrations working

**Long-term (1-7 days):**
- [ ] Memory usage stable
- [ ] No memory leaks
- [ ] Database performance stable
- [ ] User satisfaction maintained

---

## Monitoring & Observability

### Application Metrics

**CloudWatch/Datadog Dashboard:**
- Request rate (requests/minute)
- Error rate (errors/minute, %)
- API response time (p50, p95, p99)
- Database query time
- Event bus metrics (events published/handled)
- Active connections
- Memory usage
- CPU usage

### Alerts

**Critical Alerts (PagerDuty):**
- Error rate > 1% for 5 minutes
- API response time p95 > 1s for 5 minutes
- Database connection pool exhausted
- Memory usage > 90%

**Warning Alerts (Email):**
- Error rate > 0.5%
- API response time p95 > 500ms
- Failed event handlers
- Increased query times

### Logging

**Structured Logging Format:**
```typescript
logger.info('Invoice created', {
  invoiceId: invoice.id,
  userId: invoice.userId,
  customerId: invoice.customerId,
  total: invoice.total.value,
  timestamp: new Date().toISOString(),
});
```

**Log Aggregation:**
- All logs to CloudWatch/Datadog
- Searchable by userId, invoiceId, customerId
- Error logs include stack traces
- Performance logs include duration

---

## PR3 Acceptance Criteria

### Testing
- ✅ >80% unit test coverage
- ✅ 20+ integration tests passing
- ✅ 10+ E2E tests passing
- ✅ All test types automated in CI

### Performance
- ✅ All API endpoints <200ms (p95, except PDF <5s)
- ✅ Load testing passed (100 concurrent users)
- ✅ No N+1 query issues
- ✅ Database indexes optimized

### Security
- ✅ All endpoints require valid JWT
- ✅ Cross-user access blocked
- ✅ SQL injection prevented (parameterized queries)
- ✅ XSS prevention in place
- ✅ npm audit shows no critical/high vulnerabilities
- ✅ Authorization tests passing

### Documentation
- ✅ README updated with architecture overview
- ✅ ARCHITECTURE.md created
- ✅ 5 ADRs documented
- ✅ API documentation updated (Swagger)
- ✅ Deployment guide complete

### Deployment
- ✅ Staging deployment successful
- ✅ Smoke tests passing on staging
- ✅ 48-hour validation period complete
- ✅ Production deployment successful
- ✅ Post-deployment validation passed

### Monitoring
- ✅ Application metrics dashboard live
- ✅ Alerts configured (critical + warning)
- ✅ Structured logging operational
- ✅ Log aggregation working
- ✅ Error tracking active (Sentry/similar)

### Feature Parity
- ✅ 100% functionality preserved
- ✅ All 43 operations working (15 customer + 23 invoice + 5 payment)
- ✅ Zero regressions
- ✅ Performance maintained or improved
- ✅ User experience unchanged

---

## Final Migration Checklist

### Code
- [x] PR1 merged: Backend CQRS migration complete
- [x] PR2 merged: Frontend migration complete
- [x] PR3 merged: Testing & deployment complete
- [x] All old code removed
- [x] All feature flags removed
- [x] Codebase clean and documented

### Architecture
- [x] DDD principles implemented
- [x] CQRS pattern operational
- [x] VSA organization complete
- [x] Clean Architecture layers respected
- [x] Event bus operational
- [x] Transaction management working

### Quality
- [x] 80%+ test coverage
- [x] 20+ integration tests
- [x] 10+ E2E tests
- [x] Performance benchmarks met
- [x] Security audit passed
- [x] Code review complete

### Operations
- [x] Staging validated
- [x] Production deployed
- [x] Monitoring active
- [x] Alerts configured
- [x] Documentation complete
- [x] Team trained

### Validation
- [x] All 43 operations working
- [x] Zero regressions
- [x] Performance maintained
- [x] User satisfaction maintained
- [x] Stakeholder approval

---

## Success! 🎉

**Congratulations!** The DDD migration is complete. The application now has:
- ✅ Enterprise-grade architecture
- ✅ Clear separation of concerns
- ✅ Explicit command/query separation
- ✅ Comprehensive test coverage
- ✅ Production-ready monitoring
- ✅ 100% feature parity

**Next Steps:**
1. Monitor production for 7 days
2. Gather team feedback
3. Conduct retrospective
4. Document lessons learned
5. Plan next architectural improvements

---

**End of Implementation Guide**

