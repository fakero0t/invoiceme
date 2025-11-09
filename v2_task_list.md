# Invoice System v2 - DDD Migration: Complete Implementation Guide

**Version:** 2.0  
**Date:** November 9, 2025

## Overview

This document provides complete implementation specifications for migrating to DDD/CQRS architecture. Each section includes code examples, interfaces, patterns, and acceptance criteria needed for full implementation.

**Pull Request Strategy:**
1. **PR1:** Backend Foundation + CQRS Migration (Customer, Invoice, Payment contexts)
2. **PR2:** Frontend Migration (Composables, Domain Models, API Services)
3. **PR3:** Testing, Performance, Security & Deployment

---

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


# PR2: Frontend Migration to DDD/CQRS

**Scope:** Complete frontend architecture migration with composables, domain models, and API services  
**Dependencies:** PR1 must be merged and deployed

## Success Criteria
✅ Lightweight frontend domain models implemented  
✅ All API services follow consistent pattern  
✅ Command composables for all mutations  
✅ Query composables for all data fetching  
✅ All components refactored to use composables  
✅ 10+ E2E tests passing  
✅ Zero UI regressions  
✅ Pinia only for cross-cutting concerns

---

## Phase 5: Frontend Architecture

### Folder Structure

```
invoice-frontend/src/
├── Domain/                     # Lightweight display models
│   ├── Customers/
│   │   └── CustomerModel.ts
│   ├── Invoices/
│   │   ├── InvoiceModel.ts
│   │   └── LineItemModel.ts
│   └── Payments/
│       └── PaymentModel.ts
├── Application/
│   ├── Commands/
│   │   ├── Customers/
│   │   │   ├── useCreateCustomer.ts
│   │   │   ├── useUpdateCustomer.ts
│   │   │   └── useDeleteCustomer.ts
│   │   ├── Invoices/
│   │   │   ├── useCreateInvoice.ts
│   │   │   ├── useUpdateInvoice.ts
│   │   │   ├── useDeleteInvoice.ts
│   │   │   ├── useMarkInvoiceAsSent.ts
│   │   │   ├── useAddLineItem.ts
│   │   │   ├── useUpdateLineItem.ts
│   │   │   └── useRemoveLineItem.ts
│   │   └── Payments/
│   │       └── useRecordPayment.ts
│   ├── Queries/
│   │   ├── Customers/
│   │   │   ├── useCustomer.ts
│   │   │   └── useCustomerList.ts
│   │   ├── Invoices/
│   │   │   ├── useInvoice.ts
│   │   │   └── useInvoiceList.ts
│   │   └── Payments/
│   │       └── usePaymentList.ts
│   └── DTOs/
│       ├── CustomerDTO.ts
│       ├── InvoiceDTO.ts
│       └── PaymentDTO.ts
├── Infrastructure/
│   └── Http/
│       ├── apiClient.ts
│       ├── CustomerApiService.ts
│       ├── InvoiceApiService.ts
│       └── PaymentApiService.ts
└── Presentation/
    ├── Features/
    │   ├── Customers/
    │   │   ├── CustomerList.vue
    │   │   └── CustomerForm.vue
    │   └── Invoices/
    │       ├── InvoiceList.vue
    │       └── InvoiceForm.vue
    └── Shared/Components/
```

---

## Domain Models (Lightweight Display Logic Only)

### Frontend Domain Model Philosophy

**What They ARE:**
- ✅ Display helpers (formatting, UI state flags)
- ✅ Computed properties for UI
- ✅ Type-safe DTO wrappers
- ✅ Factory methods `fromDTO()`

**What They ARE NOT:**
- ❌ Business rule enforcement
- ❌ Mutations or state changes
- ❌ Data validation
- ❌ Any operations that modify state

**InvoiceModel Example:**
```typescript
// Domain/Invoices/InvoiceModel.ts
export class InvoiceModel {
  constructor(
    public readonly id: string,
    public readonly invoiceNumber: string,
    public readonly status: InvoiceStatus,
    public readonly lineItems: LineItemModel[],
    public readonly total: Money,
    public readonly balance: Money,
    public readonly dueDate: Date,
    // ... other properties
  ) {}
  
  // ✅ Display logic
  get isDraft(): boolean {
    return this.status === 'Draft';
  }
  
  get canAddLineItems(): boolean {
    return this.isDraft && this.lineItems.length < 100;
  }
  
  get canMarkAsSent(): boolean {
    return this.isDraft && this.lineItems.length > 0;
  }
  
  get isOverdue(): boolean {
    return this.balance.value > 0 && new Date() > this.dueDate;
  }
  
  get formattedTotal(): string {
    return `$${this.total.value.toFixed(2)}`;
  }
  
  // ✅ Factory from DTO
  static fromDTO(dto: InvoiceDTO): InvoiceModel {
    return new InvoiceModel(
      dto.id,
      dto.invoiceNumber,
      dto.status as InvoiceStatus,
      dto.lineItems.map(LineItemModel.fromDTO),
      Money.from(dto.total),
      Money.from(dto.balance),
      new Date(dto.dueDate),
      // ... map other fields
    );
  }
  
  // ❌ NO mutations like this:
  // markAsSent() { /* ... */ }  // This should be a command!
}
```

---

## API Service Layer

### API Client Configuration

```typescript
// Infrastructure/Http/apiClient.ts
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Response interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Service Pattern

**All services follow this exact structure:**
```typescript
// Infrastructure/Http/InvoiceApiService.ts
export class InvoiceApiService {
  private static readonly BASE_URL = '/api/v1/invoices';
  
  // COMMANDS (mutations)
  static async createInvoice(command: CreateInvoiceCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  static async updateInvoice(id: string, command: UpdateInvoiceCommand): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${id}`, command);
  }
  
  static async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }
  
  static async markAsSent(id: string): Promise<void> {
    await apiClient.post(`${this.BASE_URL}/${id}/mark-sent`);
  }
  
  // QUERIES (reads)
  static async getInvoice(id: string): Promise<InvoiceDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listInvoices(params: ListInvoicesParams): Promise<InvoiceListDTO> {
    const response = await apiClient.get(this.BASE_URL, { params });
    return response.data.data;
  }
  
  static async downloadPDF(id: string): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
}
```

**API Service Rules:**
1. One service class per aggregate
2. Static methods only (no instance state)
3. Commands return `void` or `{ id: string }`
4. Queries return typed DTOs
5. Always use `apiClient`
6. Group by operation type (Commands first, then Queries)
7. Handle HTTP-specific concerns (response type, params)

**Implement for:** CustomerApiService, InvoiceApiService, PaymentApiService

---

## Command Composables

### Pattern

```typescript
// Application/Commands/Invoices/useCreateInvoice.ts
import { ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';

export function useCreateInvoice() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (command: CreateInvoiceCommand): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await InvoiceApiService.createInvoice(command);
      return response.id;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to create invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}
```

**Usage in Component:**
```vue
<script setup lang="ts">
const { execute, isLoading, error } = useCreateInvoice();

const handleSubmit = async () => {
  const invoiceId = await execute({
    customerId: selectedCustomerId.value,
    companyInfo: form.companyInfo,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    taxRate: form.taxRate,
  });
  
  router.push(`/invoices/${invoiceId}/edit`);
};
</script>
```

**Implement for all commands:**
- Customer: Create, Update, Delete
- Invoice: Create, Update, Delete, MarkAsSent, AddLineItem, UpdateLineItem, RemoveLineItem
- Payment: RecordPayment

---

## Query Composables

### Pattern with Caching

```typescript
// Application/Queries/Invoices/useInvoice.ts
import { ref, computed, watch } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';
import { InvoiceModel } from '@/Domain/Invoices/InvoiceModel';

export function useInvoice(invoiceId: Ref<string>) {
  const invoice = ref<InvoiceModel | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const fetch = async () => {
    if (!invoiceId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dto = await InvoiceApiService.getInvoice(invoiceId.value);
      invoice.value = InvoiceModel.fromDTO(dto);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch invoice';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-fetch when invoiceId changes
  watch(invoiceId, fetch, { immediate: true });
  
  return { 
    invoice: computed(() => invoice.value), 
    isLoading: readonly(isLoading), 
    error: readonly(error),
    refetch: fetch
  };
}
```

**List Query with Filters:**
```typescript
// Application/Queries/Invoices/useInvoiceList.ts
export function useInvoiceList(options: {
  status?: Ref<string | undefined>;
  page?: Ref<number>;
  pageSize?: Ref<number>;
}) {
  const invoices = ref<InvoiceModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const totalPages = ref(0);
  
  const fetch = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await InvoiceApiService.listInvoices({
        status: options.status?.value,
        page: options.page?.value || 1,
        pageSize: options.pageSize?.value || 25,
      });
      
      invoices.value = response.items.map(InvoiceModel.fromDTO);
      totalCount.value = response.totalCount;
      totalPages.value = response.totalPages;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch invoices';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-refetch when filters change
  watch([() => options.status?.value, () => options.page?.value, () => options.pageSize?.value], fetch, { immediate: true });
  
  return {
    invoices: computed(() => invoices.value),
    isLoading: readonly(isLoading),
    error: readonly(error),
    totalCount: readonly(totalCount),
    totalPages: readonly(totalPages),
    refetch: fetch,
  };
}
```

**Implement for all queries:**
- Customer: useCustomer, useCustomerList
- Invoice: useInvoice, useInvoiceList
- Payment: usePaymentList

---

## State Management Pattern

### Composables vs Pinia

**Composables (Primary API):**
- ✅ Feature-specific state (invoice list, customer detail)
- ✅ Component-local concerns
- ✅ All CQRS operations
- ✅ Cache in reactive refs
- ✅ Manual cache invalidation

**Pinia Stores (Cross-Cutting Only):**
- ✅ Authentication state (user, tokens)
- ✅ App-level configuration
- ✅ Truly global shared state

```typescript
// stores/auth.ts (Keep this)
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!user.value);
  
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  
  return { user, token, isAuthenticated, login, logout };
});

// Delete or minimize:
// - stores/customers.ts (replaced by useCustomer/useCustomerList composables)
// - stores/invoices.ts (replaced by useInvoice/useInvoiceList composables)
// - stores/payments.ts (replaced by usePaymentList composable)
```

**Cache Invalidation Pattern:**
```typescript
const { execute: createInvoice } = useCreateInvoice();
const { invoices, refetch } = useInvoiceList();

const handleCreate = async () => {
  await createInvoice(command);
  await refetch(); // Manual invalidation after mutation
};
```

---

## Component Refactoring

### CustomerList.vue

```vue
<script setup lang="ts">
import { useCustomerList } from '@/Application/Queries/Customers/useCustomerList';
import { useDeleteCustomer } from '@/Application/Commands/Customers/useDeleteCustomer';

const { customers, isLoading, error, refetch } = useCustomerList();
const { execute: deleteCustomer } = useDeleteCustomer();

const handleDelete = async (customerId: string) => {
  if (confirm('Delete customer?')) {
    await deleteCustomer({ customerId, userId: authStore.user!.id });
    await refetch();
  }
};
</script>

<template>
  <div>
    <h1>Customers</h1>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <table v-else>
      <tr v-for="customer in customers" :key="customer.id">
        <td>{{ customer.name }}</td>
        <td>{{ customer.email }}</td>
        <td>
          <button @click="$router.push(`/customers/${customer.id}/edit`)">Edit</button>
          <button @click="handleDelete(customer.id)">Delete</button>
        </td>
      </tr>
    </table>
  </div>
</template>
```

### InvoiceForm.vue (Complex Example)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvoice } from '@/Application/Queries/Invoices/useInvoice';
import { useCreateInvoice } from '@/Application/Commands/Invoices/useCreateInvoice';
import { useUpdateInvoice } from '@/Application/Commands/Invoices/useUpdateInvoice';
import { useAddLineItem } from '@/Application/Commands/Invoices/useAddLineItem';
import { useUpdateLineItem } from '@/Application/Commands/Invoices/useUpdateLineItem';
import { useRemoveLineItem } from '@/Application/Commands/Invoices/useRemoveLineItem';
import { useMarkInvoiceAsSent } from '@/Application/Commands/Invoices/useMarkInvoiceAsSent';
import { useCustomerList } from '@/Application/Queries/Customers/useCustomerList';

const route = useRoute();
const router = useRouter();
const invoiceId = ref(route.params.id as string);
const isEditMode = computed(() => !!invoiceId.value);

// Data fetching
const { invoice, isLoading, refetch } = isEditMode.value 
  ? useInvoice(invoiceId) 
  : { invoice: ref(null), isLoading: ref(false), refetch: () => {} };
const { customers } = useCustomerList();

// Commands
const { execute: createInvoice } = useCreateInvoice();
const { execute: updateInvoice } = useUpdateInvoice();
const { execute: addLineItem } = useAddLineItem();
const { execute: updateLineItem } = useUpdateLineItem();
const { execute: removeLineItem } = useRemoveLineItem();
const { execute: markAsSent } = useMarkInvoiceAsSent();

// Form state
const form = ref({
  customerId: '',
  companyInfo: '',
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  taxRate: 0,
  notes: '',
  terms: '',
});

// Local line items for create mode
const localLineItems = ref<LineItemModel[]>([]);

// Use local or API line items based on mode
const lineItems = computed(() => 
  isEditMode.value ? invoice.value?.lineItems || [] : localLineItems.value
);

const handleSave = async () => {
  if (isEditMode.value) {
    await updateInvoice({
      invoiceId: invoiceId.value,
      userId: authStore.user!.id,
      ...form.value,
    });
  } else {
    const newId = await createInvoice({
      userId: authStore.user!.id,
      ...form.value,
    });
    router.push(`/invoices/${newId}/edit`);
  }
};

const handleAddLineItem = async () => {
  if (isEditMode.value) {
    await addLineItem({
      invoiceId: invoiceId.value,
      userId: authStore.user!.id,
      description: newLineItem.description,
      quantity: newLineItem.quantity,
      unitPrice: newLineItem.unitPrice,
    });
    await refetch();
  } else {
    localLineItems.value.push(/* create local line item */);
  }
};

const handleMarkAsSent = async () => {
  await markAsSent({ invoiceId: invoiceId.value, userId: authStore.user!.id });
  await refetch();
};
</script>

<template>
  <div>
    <h1>{{ isEditMode ? 'Edit Invoice' : 'Create Invoice' }}</h1>
    <form @submit.prevent="handleSave">
      <select v-model="form.customerId">
        <option v-for="customer in customers" :key="customer.id" :value="customer.id">
          {{ customer.name }}
        </option>
      </select>
      <!-- other form fields -->
      
      <h3>Line Items</h3>
      <table>
        <tr v-for="item in lineItems" :key="item.id">
          <td>{{ item.description }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.unitPrice }}</td>
          <td>{{ item.amount }}</td>
          <td><button @click="handleRemoveLineItem(item.id)">Remove</button></td>
        </tr>
      </table>
      
      <button @click="handleAddLineItem">Add Line Item</button>
      <button type="submit">Save</button>
      <button v-if="invoice?.canMarkAsSent" @click="handleMarkAsSent">Mark as Sent</button>
    </form>
  </div>
</template>
```

**Refactor all components:**
- CustomerList.vue, CustomerForm.vue
- InvoiceList.vue, InvoiceForm.vue
- RecordPaymentModal.vue

---

## E2E Testing

### Setup Playwright/Cypress

```typescript
// e2e/customers/create-customer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create Customer', () => {
  test('creates customer with valid data', async ({ page }) => {
    await page.goto('/customers/new');
    
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="address.street"]', '123 Main St');
    // ... fill other fields
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/customers$/);
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
  
  test('shows validation error for duplicate email', async ({ page }) => {
    // Create first customer
    await createCustomerViaAPI({ email: 'john@example.com' });
    
    // Try to create duplicate
    await page.goto('/customers/new');
    await page.fill('[name="email"]', 'john@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=EMAIL_ALREADY_EXISTS')).toBeVisible();
  });
});
```

**E2E Test Coverage Required:**
- Customers: Create, Update, Delete
- Invoices: Create, Update, Delete, Add/Update/Remove line items, Mark as sent
- Payments: Record payment, verify balance updates
- Complete flow: Customer → Invoice → Line Items → Send → Payments → Paid

**Target:** 10+ E2E tests

---

## PR2 Acceptance Criteria

### Frontend Architecture
- ✅ Complete folder structure
- ✅ Lightweight domain models (display logic only)
- ✅ No business rules or mutations in models
- ✅ Factory methods `fromDTO()` for all models

### API Services
- ✅ 3 API service classes (Customer, Invoice, Payment)
- ✅ All follow consistent pattern
- ✅ apiClient configured with interceptors
- ✅ 401 handling redirects to login

### Command Composables
- ✅ 11 command composables implemented
- ✅ All return `{ execute, isLoading, error }`
- ✅ Error messages extracted from API responses

### Query Composables
- ✅ 5 query composables implemented
- ✅ All return `{ data, isLoading, error, refetch }`
- ✅ Cache in reactive refs
- ✅ Auto-refetch on parameter changes
- ✅ Manual `refetch()` for invalidation

### State Management
- ✅ Composables are primary API
- ✅ Pinia only for auth and global concerns
- ✅ Old stores removed/minimized

### Component Refactoring
- ✅ All components use composables
- ✅ No direct API calls in components
- ✅ Domain models used for display
- ✅ Manual cache invalidation after mutations

### E2E Testing
- ✅ Playwright/Cypress configured
- ✅ 10+ E2E tests
- ✅ All major workflows covered
- ✅ Error scenarios tested

### Feature Parity
- ✅ All UI functionality preserved
- ✅ Zero visual regressions
- ✅ All forms work identically
- ✅ All navigation preserved

---


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

