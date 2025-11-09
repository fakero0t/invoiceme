# PR1: Backend Foundation & CQRS Architecture

**Scope:** Foundation (Phase 1) + Customer Context (Phase 2) + Invoice Context (Phase 3) + Payment Context (Phase 4)

## Success Criteria
✅ All domain entities in proper DDD structure  
✅ 13 commands + 7 queries fully implemented  
✅ Event bus with 10+ domain events  
✅ Transaction management operational  
✅ 20+ integration tests passing  
✅ Feature flags for migration coexistence  
✅ 100% existing API parity maintained

---

## Phase 1: Foundation Setup

### Base Classes & Interfaces

**Domain Event Base:**
```typescript
// Domain/Shared/DomainEvent.ts
export abstract class DomainEvent {
  readonly occurredOn: Date = new Date();
  readonly eventId: string = randomUUID();
  abstract get eventName(): string;
}
```

**Exception Hierarchy:**
```typescript
// Domain/Shared/DomainException.ts
export class DomainException extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message || code);
  }
}
export class NotFoundException extends DomainException {}
export class ValidationException extends DomainException {}
export class AuthorizationException extends DomainException {}
```

**Event Bus (Sequential Execution):**
```typescript
// Infrastructure/Messaging/InMemoryEventBus.ts
export class InMemoryEventBus implements IEventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();
  
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    // CRITICAL: Sequential execution
    for (const handler of handlers) {
      await handler(event);
    }
  }
}
```

**Transaction Rules:**
- Command Handlers own transaction scope
- Events published BEFORE commit
- Event failure → full transaction rollback
- Events execute sequentially

### Dependency Injection

```typescript
// Infrastructure/Configuration/DependencyContainer.ts
import { container } from 'tsyringe';

container.register<Pool>('DatabasePool', { useFactory: () => createDatabasePool() });
container.registerSingleton<IEventBus>('IEventBus', InMemoryEventBus);
container.registerSingleton<ICustomerRepository>('ICustomerRepository', PostgreSQLCustomerRepository);
// ... register all repositories, handlers
```

### Error Handling Middleware

```typescript
// Presentation/Middleware/ErrorHandlerMiddleware.ts
export const errorHandler = (error: Error, req, res, next) => {
  if (error instanceof NotFoundException) {
    return res.status(404).json({ success: false, error: { code: error.code, message: error.message } });
  }
  if (error instanceof ValidationException) {
    return res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
  }
  if (error instanceof AuthorizationException) {
    return res.status(403).json({ success: false, error: { code: error.code, message: 'Access denied' } });
  }
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' } });
};
```

**Standardized Response Format:**
- Success: `{ success: true, data: T }`
- Error: `{ success: false, error: { code: string, message: string } }`
- Commands return: `{ success: true, data: { id: string } }`
- Queries return: `{ success: true, data: DTO }`

### DTOs & Mappers

**Mapper Pattern (All follow this):**
```typescript
// Application/Mappers/CustomerMapper.ts
export class CustomerMapper {
  static toDTO(customer: Customer): CustomerDTO {
    return {
      id: customer.id,
      name: customer.name.value,
      email: customer.email.value,
      address: { /* spread address fields */ },
      phoneNumber: customer.phoneNumber.value,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
  
  static toDTOList(customers: Customer[]): CustomerDTO[] {
    return customers.map(c => this.toDTO(c));
  }
}
```

**Mapper Rules:**
1. One mapper per aggregate
2. Static methods only
3. Always include toDTO + toDTOList
4. Value objects → primitives
5. Dates → ISO strings

### Repository Transaction Pattern

```typescript
// Domain/Customers/ICustomerRepository.ts
export interface ICustomerRepository {
  save(customer: Customer, tx?: PoolClient): Promise<void>;
  findById(id: string, userId: string, tx?: PoolClient): Promise<Customer | null>;
  // ... other methods
}

// Implementation accepts optional transaction
async save(customer: Customer, tx?: PoolClient): Promise<void> {
  const client = tx || this.db;
  await client.query(/* SQL */, /* params */);
}
```

### Express App Configuration

**Middleware Order (CRITICAL):**
```typescript
// src/index.ts
app.use(helmet());              // 1. Security
app.use(compression());          // 2. Performance
app.use(cors());                 // 3. CORS
app.use(express.json());         // 4. Body parsing
app.use(getLimiter());           // 5. Rate limiting
app.get('/health', /* ... */);  // 6. Health check
app.use('/api/v1/customers', authMiddleware, createCustomerRoutes(container)); // 7. Routes
app.use(errorHandler);           // 8. Error handler (MUST BE LAST)
```

**Feature Flag Pattern:**
```typescript
if (process.env.USE_NEW_ARCHITECTURE === 'true') {
  app.use('/api/v1/customers', authMiddleware, createCustomerRoutes(container));
} else {
  app.use('/api/v1/customers', authMiddleware, oldCustomerRouter);
}
```

---

## Phase 2: Customer Context Migration

### Commands

**CreateCustomer:**
```typescript
// Application/Commands/Customers/CreateCustomer/CreateCustomerCommand.ts
export interface CreateCustomerCommand {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly address: { street, city, state, postalCode, country };
  readonly phoneNumber: string;
}

// CreateCustomerCommandHandler.ts
@injectable()
export class CreateCustomerCommandHandler {
  constructor(
    @inject('ICustomerRepository') private repo: ICustomerRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: CreateCustomerCommand): Promise<string> {
    // 1. Cross-aggregate validation
    const existing = await this.repo.findByEmail(command.email, command.userId);
    if (existing) throw new ValidationException('EMAIL_ALREADY_EXISTS');
    
    // 2. Create domain entity
    const customer = Customer.create({
      id: randomUUID(),
      userId: command.userId,
      name: command.name,
      email: command.email,
      address: command.address,
      phoneNumber: command.phoneNumber,
    });
    
    // 3. Persist
    await this.repo.save(customer);
    
    // 4. Publish event
    await this.eventBus.publish(new CustomerCreatedEvent(customer.id, customer.userId));
    
    return customer.id;
  }
}
```

**Validation Layers:**
- **Domain:** Business rules (email format, phone format)
- **Handler:** Input shape, authorization, cross-aggregate checks (uniqueness)

**UpdateCustomer & DeleteCustomer:** Follow same pattern

### Queries

**GetCustomer:**
```typescript
// Application/Queries/Customers/GetCustomer/GetCustomerQueryHandler.ts
@injectable()
export class GetCustomerQueryHandler {
  constructor(@inject('ICustomerRepository') private repo: ICustomerRepository) {}
  
  async handle(query: GetCustomerQuery): Promise<CustomerDTO> {
    const customer = await this.repo.findById(query.customerId, query.userId);
    if (!customer) throw new NotFoundException('CUSTOMER_NOT_FOUND');
    return CustomerMapper.toDTO(customer);
  }
}
```

**Query Performance Strategy:**
- **Single entity:** Load full domain aggregate
- **Lists:** Query DB directly, map raw rows to DTOs (skip domain hydration for performance)

### Routes

```typescript
// Presentation/Routes/customerRoutes.ts
export function createCustomerRoutes(container: DependencyContainer): Router {
  const router = Router();
  
  router.post('/', async (req, res, next) => {
    try {
      const handler = container.resolve(CreateCustomerCommandHandler);
      const customerId = await handler.handle({
        userId: req.user!.id,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
      });
      res.status(201).json({ success: true, data: { id: customerId } });
    } catch (error) {
      next(error);
    }
  });
  
  router.put('/:id', /* UpdateCustomer */);
  router.delete('/:id', /* DeleteCustomer */);
  router.get('/:id', /* GetCustomer */);
  router.get('/', /* ListCustomers */);
  
  return router;
}
```

### Domain Events

```typescript
// Domain/Customers/Events/CustomerCreatedEvent.ts
export class CustomerCreatedEvent extends DomainEvent {
  constructor(readonly customerId: string, readonly userId: string) { super(); }
  get eventName(): string { return 'customer.created'; }
}
```

### Integration Tests

**Pattern:**
```typescript
describe('CreateCustomerCommandHandler', () => {
  let pool: Pool;
  let handler: CreateCustomerCommandHandler;
  
  beforeEach(() => {
    // Setup with test DB
  });
  
  it('creates customer with valid data', async () => {
    const command = { /* valid data */ };
    const customerId = await handler.handle(command);
    expect(customerId).toBeDefined();
  });
  
  it('rejects duplicate email', async () => {
    await handler.handle(command);
    await expect(handler.handle(command)).rejects.toThrow('EMAIL_ALREADY_EXISTS');
  });
  
  it('publishes CustomerCreatedEvent', async () => {
    let eventPublished = false;
    eventBus.subscribe('customer.created', async () => { eventPublished = true; });
    await handler.handle(command);
    expect(eventPublished).toBe(true);
  });
});
```

**Test Coverage Required:**
- CreateCustomer, UpdateCustomer, DeleteCustomer
- GetCustomer, ListCustomers
- All validation scenarios
- Event publishing verification

---

## Phase 3: Invoice Context Migration

### Domain Model

**Invoice Aggregate Root:**
- Invoice controls LineItems lifecycle
- All LineItem operations through Invoice methods
- Totals recalculated on any LineItem change

### Commands (8 total)

1. **CreateInvoice** - Generate invoice number, create aggregate
2. **UpdateInvoice** - Update basic fields
3. **DeleteInvoice** - Soft delete
4. **MarkInvoiceAsSent** - State transition
5. **AddLineItem** - Add item, recalculate totals
6. **UpdateLineItem** - Update item, recalculate totals
7. **RemoveLineItem** - Remove item, recalculate totals
8. **GenerateInvoicePDF** - Call external service, upload S3, store key

**Example Handler Pattern:**
```typescript
// Application/Commands/Invoices/AddLineItem/AddLineItemCommandHandler.ts
@injectable()
export class AddLineItemCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: AddLineItemCommand): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Load invoice aggregate
      const invoice = await this.invoiceRepo.findById(command.invoiceId, command.userId, client);
      if (!invoice) throw new NotFoundException('INVOICE_NOT_FOUND');
      
      // 2. Add line item (domain method)
      const lineItem = LineItem.create({
        id: randomUUID(),
        description: command.description,
        quantity: command.quantity,
        unitPrice: new Money(command.unitPrice),
      });
      invoice.addLineItem(lineItem);
      
      // 3. Recalculate totals (automatic in domain)
      // invoice.calculateTotals() called internally
      
      // 4. Save
      await this.invoiceRepo.save(invoice, client);
      
      // 5. Publish event
      await this.eventBus.publish(new LineItemAddedEvent(invoice.id, lineItem.id));
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### Queries (3 total)

1. **GetInvoice** - Load full aggregate with line items + calculate balance
2. **ListInvoices** - Paginated list with filters (status, search)
3. **DownloadInvoicePDF** - Return S3 signed URL or blob

**GetInvoice with Balance Calculation:**
```typescript
@injectable()
export class GetInvoiceQueryHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IPaymentRepository') private paymentRepo: IPaymentRepository
  ) {}
  
  async handle(query: GetInvoiceQuery): Promise<InvoiceDTO> {
    const invoice = await this.invoiceRepo.findById(query.invoiceId, query.userId);
    if (!invoice) throw new NotFoundException('INVOICE_NOT_FOUND');
    
    // Calculate balance
    const totalPayments = await this.paymentRepo.getTotalPayments(invoice.id);
    const balance = invoice.total.subtract(new Money(totalPayments));
    
    return InvoiceMapper.toDTO(invoice, balance);
  }
}
```

### Repository

**Save Invoice + LineItems in Transaction:**
```typescript
async save(invoice: Invoice, tx?: PoolClient): Promise<void> {
  const client = tx || await this.db.connect();
  const isOwnTransaction = !tx;
  
  try {
    if (isOwnTransaction) await client.query('BEGIN');
    
    // 1. Save invoice
    await client.query(`INSERT INTO invoices (...) VALUES (...) ON CONFLICT (id) DO UPDATE ...`);
    
    // 2. Delete existing line items
    await client.query(`DELETE FROM invoice_line_items WHERE invoice_id = $1`, [invoice.id]);
    
    // 3. Insert current line items
    for (const item of invoice.lineItems) {
      await client.query(`INSERT INTO invoice_line_items (...) VALUES (...)`);
    }
    
    if (isOwnTransaction) await client.query('COMMIT');
  } catch (error) {
    if (isOwnTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    if (isOwnTransaction) client.release();
  }
}
```

### Routes

All invoice routes follow same pattern as customer routes. Key endpoints:
- POST `/api/v1/invoices` → CreateInvoice
- PUT `/api/v1/invoices/:id` → UpdateInvoice
- DELETE `/api/v1/invoices/:id` → DeleteInvoice
- POST `/api/v1/invoices/:id/mark-sent` → MarkInvoiceAsSent
- POST `/api/v1/invoices/:id/line-items` → AddLineItem
- PUT `/api/v1/invoices/:id/line-items/:lineItemId` → UpdateLineItem
- DELETE `/api/v1/invoices/:id/line-items/:lineItemId` → RemoveLineItem
- GET `/api/v1/invoices/:id` → GetInvoice
- GET `/api/v1/invoices` → ListInvoices
- GET `/api/v1/invoices/:id/pdf` → DownloadInvoicePDF

### Domain Events (8)

- InvoiceCreatedEvent
- InvoiceUpdatedEvent
- InvoiceDeletedEvent
- InvoiceMarkedAsSentEvent
- InvoicePaidEvent
- LineItemAddedEvent
- LineItemUpdatedEvent
- LineItemRemovedEvent

### Integration Tests

Required test coverage:
- All 8 commands
- All 3 queries
- Line item operations recalculate totals correctly
- PDF generation and S3 upload
- Pagination for list query
- Status filter for list query

---

## Phase 4: Payment Context Migration

### Command

**RecordPayment (Complex Cross-Aggregate):**
```typescript
@injectable()
export class RecordPaymentCommandHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IPaymentRepository') private paymentRepo: IPaymentRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: RecordPaymentCommand): Promise<string> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Load invoice
      const invoice = await this.invoiceRepo.findById(command.invoiceId, command.userId, client);
      if (!invoice) throw new NotFoundException('INVOICE_NOT_FOUND');
      if (invoice.status === 'Draft') throw new ValidationException('INVALID_STATE_TRANSITION');
      
      // 2. Calculate balance
      const totalPayments = await this.paymentRepo.getTotalPayments(invoice.id);
      const balance = invoice.total.subtract(new Money(totalPayments));
      
      // 3. Validate payment amount
      const paymentAmount = new Money(command.amount);
      if (paymentAmount.value > balance.value) {
        throw new ValidationException('PAYMENT_EXCEEDS_BALANCE');
      }
      
      // 4. Create payment
      const payment = Payment.create({
        id: randomUUID(),
        invoiceId: invoice.id,
        amount: command.amount,
        paymentMethod: command.paymentMethod,
        paymentDate: command.paymentDate,
        reference: command.reference,
        notes: command.notes,
      });
      
      await this.paymentRepo.save(payment, client);
      await this.eventBus.publish(new PaymentRecordedEvent(payment.id, invoice.id));
      
      // 5. Check if invoice is fully paid
      const newBalance = balance.subtract(paymentAmount);
      if (newBalance.value === 0) {
        invoice.markAsPaid();
        await this.invoiceRepo.save(invoice, client);
        await this.eventBus.publish(new InvoicePaidEvent(invoice.id, invoice.userId));
      }
      
      await client.query('COMMIT');
      return payment.id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### Queries (2)

1. **GetPayment** - Single payment details
2. **ListPayments** - All payments for an invoice

### Domain Events (2)

- PaymentRecordedEvent
- InvoicePaidEvent (cross-aggregate)

### Integration Tests

**End-to-End Flow Test:**
```typescript
describe('Complete Invoice Payment Flow', () => {
  it('records multiple payments and marks invoice as paid', async () => {
    // 1. Create customer
    const customerId = await createCustomerHandler.handle(/* command */);
    
    // 2. Create invoice
    const invoiceId = await createInvoiceHandler.handle(/* command */);
    
    // 3. Add line items
    await addLineItemHandler.handle(/* command */);
    await addLineItemHandler.handle(/* command */);
    
    // 4. Mark as sent
    await markInvoiceAsSentHandler.handle({ invoiceId, userId });
    
    // 5. Record partial payment
    await recordPaymentHandler.handle({ invoiceId, amount: 500, /* ... */ });
    
    // 6. Record final payment
    await recordPaymentHandler.handle({ invoiceId, amount: 500, /* ... */ });
    
    // 7. Verify invoice is paid
    const invoice = await getInvoiceHandler.handle({ invoiceId, userId });
    expect(invoice.status).toBe('Paid');
    expect(invoice.balance).toBe(0);
  });
});
```

---

## Phase 5: Migration Cleanup

### Remove Old Code

Once all tests pass:

1. **Remove feature flags** from `src/index.ts`
2. **Delete old handlers:**
   - `src/features/customers/*`
   - `src/features/invoices/*`
   - `src/features/payments/*`
3. **Delete old routers**
4. **Update all imports**
5. **Verify all tests still pass**
6. **Update documentation**

### Migration Coexistence Strategy

**During Migration:**
```typescript
// Dual route registration
if (process.env.USE_NEW_ARCHITECTURE === 'true') {
  app.use('/api/v1/customers', authMiddleware, createCustomerRoutes(container));
} else {
  app.use('/api/v1/customers', authMiddleware, oldCustomerRouter);
}
```

**Per-Endpoint Feature Flags (if needed):**
```typescript
router.post('/', async (req, res, next) => {
  if (req.headers['x-use-new-api'] === 'true') {
    // New CQRS
    const handler = container.resolve(CreateCustomerCommandHandler);
    return res.json({ success: true, data: await handler.handle(command) });
  } else {
    // Old handler
    return oldCreateCustomer(req, res, next);
  }
});
```

**Rollback Steps:**
1. Set `USE_NEW_ARCHITECTURE=false`
2. Restart application
3. Verify old implementation works
4. Investigate new implementation issues

---

## PR1 Acceptance Criteria

### Architecture
- ✅ Complete DDD folder structure
- ✅ All domain entities in Domain layer
- ✅ All business rules in domain entities
- ✅ Zero dependencies from Domain to other layers
- ✅ Repository interfaces in Domain, implementations in Infrastructure
- ✅ Event bus operational

### Commands & Queries
- ✅ 13 commands implemented (Customer: 3, Invoice: 8, Payment: 2)
- ✅ 7 queries implemented (Customer: 2, Invoice: 3, Payment: 2)
- ✅ All handlers use dependency injection
- ✅ All handlers own transaction scope
- ✅ Event failure causes transaction rollback

### Domain Events
- ✅ 10+ events defined and published
- ✅ Events execute sequentially
- ✅ Event bus registered in DI container

### DTOs & Mappers
- ✅ 5 DTOs defined (Customer, Invoice, LineItem, Payment, PagedResult)
- ✅ 3 mappers implemented following consistent pattern
- ✅ Value objects mapped to primitives
- ✅ Dates mapped to ISO strings

### Error Handling
- ✅ Exception hierarchy (Domain, NotFound, Validation, Authorization)
- ✅ Global error middleware maps exceptions to HTTP status codes
- ✅ Standardized API response format

### Repositories
- ✅ All repositories support optional transaction parameter
- ✅ Transaction helper methods implemented
- ✅ Repository methods load full aggregates

### Routes & Controllers
- ✅ Route factory pattern for all contexts
- ✅ All routes use DI container to resolve handlers
- ✅ Feature flags enable old/new coexistence
- ✅ Middleware execution order correct

### Testing
- ✅ 20+ integration tests
- ✅ Test database strategy with transaction-per-test
- ✅ All commands tested (happy path + validations)
- ✅ All queries tested
- ✅ Domain events verified
- ✅ End-to-end flow test

### Feature Parity
- ✅ All 15 customer operations work identically
- ✅ All 23 invoice operations work identically
- ✅ All 5 payment operations work identically
- ✅ All validation rules preserved
- ✅ All error codes unchanged
- ✅ All HTTP status codes unchanged

---


