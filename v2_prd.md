# Invoice System v2 - Domain-Driven Design Migration PRD

**Version:** 2.0  
**Date:** November 9, 2025  
**Status:** Planning

---

## Executive Summary

This PRD defines the architectural migration from the current MVP implementation to an enterprise-grade Domain-Driven Design (DDD) architecture incorporating CQRS, Vertical Slice Architecture (VSA), and Clean Architecture principles. The migration maintains 100% feature parity with zero regressions while establishing a foundation for long-term scalability and maintainability.

**Core Objectives:**
- Migrate to full DDD implementation with proper bounded contexts and aggregates
- Implement CQRS pattern with explicit Command/Query separation
- Reorganize codebase into Vertical Slices by feature
- Establish comprehensive integration testing strategy
- Maintain <200ms API response times
- Achieve zero functional regressions

---

## 1. Current State Analysis

### 1.1 Backend Architecture Assessment

**Strengths:**
- ✅ Rich domain entities with business logic (`Customer`, `Invoice`, `Payment`, `LineItem`)
- ✅ Value objects implemented (`Money`, `EmailAddress`, `PhoneNumber`, `Address`, `CustomerName`, `InvoiceNumber`)
- ✅ Factory methods for entity creation with validation
- ✅ Encapsulated business rules (invoice state transitions, payment validation)
- ✅ Repository pattern partially implemented
- ✅ PostgreSQL with proper indexing and constraints

**Current Structure:**
```
src/
├── domain/               # Domain entities & value objects
│   ├── customer/
│   ├── invoice/
│   ├── payment/
│   └── shared/
├── features/             # Handler functions (mixed concerns)
│   ├── auth/
│   ├── customers/
│   ├── invoices/
│   └── payments/
├── infrastructure/       # External concerns
│   ├── database/
│   ├── pdf/
│   └── storage/
└── shared/
    └── middleware/
```

**Gaps Identified:**

| **Gap** | **Impact** | **Current Issue** |
|---------|-----------|------------------|
| **No explicit Commands/Queries** | High | Handlers mix read/write operations; unclear boundaries |
| **Business logic in handlers** | High | Validation and orchestration scattered across handler functions |
| **No domain events** | Medium | No way to trigger side effects (future extensibility) |
| **Layered not vertical** | Medium | Features split across domain/infrastructure layers |
| **Anemic repositories** | Low | Repositories don't enforce aggregate boundaries |
| **Missing DTOs** | Medium | Domain entities exposed directly through APIs |
| **No application services** | High | No orchestration layer between API and domain |

### 1.2 Frontend Architecture Assessment

**Current State:**
```
invoice-frontend/src/
├── features/             # Pages by feature
│   ├── auth/
│   └── customers/
├── views/               # More pages
│   ├── customers/
│   └── invoices/
├── stores/              # Pinia stores (state mgmt)
│   ├── auth.ts
│   ├── customers.ts
│   ├── invoices.ts
│   └── payments.ts
├── shared/
│   └── api/             # API client functions
└── components/
```

**Gaps:**
- State management is anemic (just API wrappers)
- No domain models on frontend
- Business logic mixed with UI components
- No separation between commands and queries
- API calls directly from components in some places

---

## 2. Target Architecture

### 2.1 Domain-Driven Design Principles

#### Bounded Contexts

Define clear boundaries for each subdomain:

**1. Customer Management Context**
- **Aggregate Root:** `Customer`
- **Entities:** Customer
- **Value Objects:** CustomerName, EmailAddress, PhoneNumber, Address
- **Responsibilities:** Customer CRUD, uniqueness validation, soft delete

**2. Invoicing Context**
- **Aggregate Root:** `Invoice` (contains LineItems)
- **Entities:** Invoice, LineItem
- **Value Objects:** InvoiceNumber, Money, InvoiceStatus
- **Responsibilities:** Invoice lifecycle (Draft→Sent→Paid), line item management, total calculations, PDF generation

**3. Payment Context**
- **Aggregate Root:** `Payment`
- **Entities:** Payment
- **Value Objects:** Money, PaymentMethod
- **Responsibilities:** Record payments, validate against invoice balance, trigger invoice state changes

**4. Identity & Access Context**
- **Aggregate Root:** `User`
- **Responsibilities:** Authentication, authorization, user management

#### Aggregate Design Rules

1. **Transaction Boundaries:** Each aggregate is a transaction boundary
2. **Reference by ID:** Aggregates reference other aggregates only by ID (not object references)
3. **Invariant Protection:** Aggregates enforce all their invariants
4. **Small Aggregates:** Keep aggregates small for concurrency and performance

**Example - Invoice Aggregate:**
```typescript
// Invoice is the aggregate root
// LineItems are part of the aggregate (not separate entities)
class Invoice {
  private lineItems: LineItem[] = [];
  
  addLineItem(item: LineItem): void {
    if (this.status !== 'Draft') {
      throw new DomainException('CANNOT_MODIFY_NON_DRAFT_INVOICE');
    }
    
    if (this.lineItems.length >= 100) {
      throw new DomainException('MAX_LINE_ITEMS_EXCEEDED');
    }
    
    this.lineItems.push(item);
    this.recalculateTotals(); // Maintain invariant
  }
  
  // All modifications go through the aggregate root
}
```

### 2.2 CQRS Architecture

**Strict Separation:**

**Commands** (Write Operations)
- Modify system state
- Return success/failure
- Validated against business rules
- Trigger domain events
- May fail due to business rule violations

**Queries** (Read Operations)
- Return data without side effects
- No validation beyond authorization
- Optimized for read performance
- Can use denormalized views if needed
- Never fail due to business rules

**Validation Layer Responsibilities:**

1. **Domain Layer Validation:**
   - Business rules and invariants (e.g., "invoice must have line items before sending")
   - Value object constraints (e.g., email format, money > 0)
   - State transition rules (e.g., Draft → Sent → Paid)
   - Aggregate consistency (e.g., invoice total = subtotal + tax)

2. **Command Handler Validation:**
   - Input shape and required fields (e.g., "customerId is required")
   - Authorization (e.g., "user owns this resource")
   - Cross-aggregate validation (e.g., "customer exists")
   - Request-level constraints (e.g., "file size limits")

**Rule of Thumb:** If it's about the **business concept** → Domain. If it's about the **API request** → Handler.

**Command Structure:**
```typescript
// Command: Pure data structure
interface CreateInvoiceCommand {
  userId: string;
  customerId: string;
  companyInfo: string;
  issueDate: Date;
  dueDate: Date;
  taxRate: number;
  notes?: string;
  terms?: string;
}

// Command Handler: Orchestrates domain operations
class CreateInvoiceCommandHandler {
  async handle(command: CreateInvoiceCommand): Promise<InvoiceId> {
    // 1. Validation
    await this.validateCustomerExists(command.customerId);
    
    // 2. Create domain entity
    const invoice = Invoice.create({
      userId: command.userId,
      customerId: command.customerId,
      // ...other props
    });
    
    // 3. Persist
    await this.invoiceRepository.save(invoice);
    
    // 4. Dispatch events
    this.eventBus.dispatch(new InvoiceCreatedEvent(invoice.id));
    
    return invoice.id;
  }
}
```

**Query Structure:**
```typescript
// Query: Request with filter/pagination
interface ListInvoicesQuery {
  userId: string;
  status?: InvoiceStatus;
  page: number;
  pageSize: number;
}

// Query Handler: Optimized data retrieval
class ListInvoicesQueryHandler {
  async handle(query: ListInvoicesQuery): Promise<PagedResult<InvoiceDTO>> {
    // Direct database query (no domain logic)
    const result = await this.invoiceRepository.findAllByUserId(
      query.userId,
      query.page,
      query.pageSize,
      query.status
    );
    
    return {
      items: result.items.map(inv => InvoiceDTO.fromDomain(inv)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }
}
```

### 2.3 Vertical Slice Architecture

**Organization by Feature:**

Current (Layered):
```
features/customers/
├── createCustomer.ts
├── getCustomer.ts
├── updateCustomer.ts
├── deleteCustomer.ts
└── listCustomers.ts
```

Target (Vertical Slices):
```
Features/
├── Customers/
│   ├── CreateCustomer/
│   │   ├── CreateCustomerCommand.ts
│   │   ├── CreateCustomerCommandHandler.ts
│   │   ├── CreateCustomerValidator.ts
│   │   └── CreateCustomerEndpoint.ts
│   ├── GetCustomer/
│   │   ├── GetCustomerQuery.ts
│   │   ├── GetCustomerQueryHandler.ts
│   │   └── GetCustomerEndpoint.ts
│   ├── UpdateCustomer/
│   │   ├── UpdateCustomerCommand.ts
│   │   ├── UpdateCustomerCommandHandler.ts
│   │   └── UpdateCustomerEndpoint.ts
│   └── ListCustomers/
│       ├── ListCustomersQuery.ts
│       ├── ListCustomersQueryHandler.ts
│       └── ListCustomersEndpoint.ts
```

Each slice contains:
1. Command/Query definition
2. Handler (orchestration logic)
3. Validator (input validation)
4. Endpoint (HTTP mapping)
5. Tests (unit + integration)

### 2.4 Clean Architecture Layers

**Layer Responsibilities:**

```
┌─────────────────────────────────────────┐
│      Presentation Layer (API)           │  ← Express controllers, DTOs
├─────────────────────────────────────────┤
│     Application Layer (Use Cases)       │  ← Command/Query handlers
├─────────────────────────────────────────┤
│        Domain Layer (Business)          │  ← Entities, Value Objects, Events
├─────────────────────────────────────────┤
│    Infrastructure Layer (Technical)     │  ← Database, S3, Cognito, PDF
└─────────────────────────────────────────┘
```

**Dependency Rules:**
- Presentation depends on Application
- Application depends on Domain
- Infrastructure depends on Domain (implements interfaces)
- Domain depends on NOTHING (pure business logic)

---

## 3. Migration Plan: Backend

### 3.1 New Folder Structure

```
src/
├── Domain/                              # Pure business logic
│   ├── Customers/
│   │   ├── Customer.ts                  # Aggregate root
│   │   ├── CustomerName.ts              # Value object
│   │   ├── EmailAddress.ts
│   │   ├── PhoneNumber.ts
│   │   ├── Address.ts
│   │   ├── ICustomerRepository.ts       # Interface
│   │   └── Events/
│   │       ├── CustomerCreatedEvent.ts
│   │       └── CustomerDeletedEvent.ts
│   ├── Invoices/
│   │   ├── Invoice.ts                   # Aggregate root
│   │   ├── LineItem.ts                  # Entity (part of aggregate)
│   │   ├── InvoiceNumber.ts
│   │   ├── InvoiceStatus.ts
│   │   ├── IInvoiceRepository.ts
│   │   └── Events/
│   │       ├── InvoiceCreatedEvent.ts
│   │       ├── InvoiceSentEvent.ts
│   │       └── InvoicePaidEvent.ts
│   ├── Payments/
│   │   ├── Payment.ts
│   │   ├── PaymentMethod.ts
│   │   ├── IPaymentRepository.ts
│   │   └── Events/
│   │       └── PaymentRecordedEvent.ts
│   ├── Shared/
│   │   ├── Money.ts
│   │   ├── DomainEvent.ts
│   │   ├── Entity.ts
│   │   └── ValueObject.ts
│   └── Users/
│       ├── User.ts
│       └── IUserRepository.ts
│
├── Application/                         # Use case orchestration
│   ├── Commands/
│   │   ├── Customers/
│   │   │   ├── CreateCustomer/
│   │   │   │   ├── CreateCustomerCommand.ts
│   │   │   │   ├── CreateCustomerCommandHandler.ts
│   │   │   │   └── CreateCustomerCommandValidator.ts
│   │   │   ├── UpdateCustomer/
│   │   │   ├── DeleteCustomer/
│   │   ├── Invoices/
│   │   │   ├── CreateInvoice/
│   │   │   ├── AddLineItem/
│   │   │   ├── MarkInvoiceAsSent/
│   │   └── Payments/
│   │       └── RecordPayment/
│   ├── Queries/
│   │   ├── Customers/
│   │   │   ├── GetCustomer/
│   │   │   │   ├── GetCustomerQuery.ts
│   │   │   │   ├── GetCustomerQueryHandler.ts
│   │   │   │   └── CustomerDTO.ts
│   │   │   └── ListCustomers/
│   │   ├── Invoices/
│   │   │   ├── GetInvoice/
│   │   │   └── ListInvoices/
│   │   └── Payments/
│   │       └── ListPayments/
│   ├── DTOs/
│   │   ├── CustomerDTO.ts
│   │   ├── InvoiceDTO.ts
│   │   ├── PaymentDTO.ts
│   │   └── PagedResultDTO.ts
│   └── Mappers/
│       ├── CustomerMapper.ts
│       ├── InvoiceMapper.ts
│       └── PaymentMapper.ts
│
├── Infrastructure/                      # External concerns
│   ├── Persistence/
│   │   ├── PostgreSQL/
│   │   │   ├── CustomerRepository.ts
│   │   │   ├── InvoiceRepository.ts
│   │   │   ├── PaymentRepository.ts
│   │   │   └── UnitOfWork.ts
│   │   └── Migrations/
│   ├── ExternalServices/
│   │   ├── InvoiceGeneratorService.ts
│   │   ├── S3StorageService.ts
│   │   └── CognitoAuthService.ts
│   ├── Messaging/
│   │   └── InMemoryEventBus.ts
│   └── Configuration/
│       ├── DatabaseConfig.ts
│       └── AppConfig.ts
│
├── Presentation/                        # HTTP API layer
│   ├── Controllers/
│   │   ├── CustomersController.ts
│   │   ├── InvoicesController.ts
│   │   └── PaymentsController.ts
│   ├── Middleware/
│   │   ├── AuthMiddleware.ts
│   │   ├── ErrorHandlerMiddleware.ts
│   │   └── ValidationMiddleware.ts
│   └── Routes/
│       ├── customerRoutes.ts
│       ├── invoiceRoutes.ts
│       └── paymentRoutes.ts
│
└── Tests/
    ├── Unit/                            # Domain & handler tests
    ├── Integration/                     # Full flow tests
    └── Fixtures/
```

### 3.2 Command Implementation Example

**CreateInvoice Command:**

```typescript
// Application/Commands/Invoices/CreateInvoice/CreateInvoiceCommand.ts
export interface CreateInvoiceCommand {
  readonly userId: string;
  readonly customerId: string;
  readonly companyInfo: string;
  readonly issueDate: Date;
  readonly dueDate: Date;
  readonly taxRate: number;
  readonly notes?: string;
  readonly terms?: string;
}

// CreateInvoiceCommandHandler.ts
export class CreateInvoiceCommandHandler {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly eventBus: IEventBus
  ) {}

  async handle(command: CreateInvoiceCommand): Promise<string> {
    // 1. Validate customer exists and belongs to user
    const customer = await this.customerRepository.findById(
      command.customerId,
      command.userId
    );
    
    if (!customer) {
      throw new DomainException('CUSTOMER_NOT_FOUND');
    }
    
    // 2. Generate invoice number
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();
    
    // 3. Create domain entity (business rules enforced here)
    const invoice = Invoice.create({
      id: randomUUID(),
      userId: command.userId,
      customerId: command.customerId,
      invoiceNumber: invoiceNumber.value,
      companyInfo: command.companyInfo,
      issueDate: command.issueDate,
      dueDate: command.dueDate,
      taxRate: command.taxRate,
      notes: command.notes || '',
      terms: command.terms || '',
      status: 'Draft',
      lineItems: [],
    });
    
    // 4. Persist
    await this.invoiceRepository.save(invoice);
    
    // 5. Dispatch domain event
    await this.eventBus.publish(
      new InvoiceCreatedEvent(invoice.id, invoice.userId, invoice.customerId)
    );
    
    return invoice.id;
  }
}

// CreateInvoiceEndpoint.ts (Controller)
export class InvoicesController {
  constructor(private readonly commandHandler: CreateInvoiceCommandHandler) {}
  
  async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const command: CreateInvoiceCommand = {
        userId: req.user!.id,
        customerId: req.body.customerId,
        companyInfo: req.body.companyInfo || '',
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : new Date(),
        dueDate: req.body.dueDate
          ? new Date(req.body.dueDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        taxRate: req.body.taxRate ?? 0,
        notes: req.body.notes,
        terms: req.body.terms,
      };
      
      const invoiceId = await this.commandHandler.handle(command);
      
      res.status(201).json({ success: true, data: { id: invoiceId } });
    } catch (error) {
      // Error handling middleware catches this
      throw error;
    }
  }
}
```

### 3.3 Query Implementation Example

**GetInvoice Query:**

```typescript
// Application/Queries/Invoices/GetInvoice/GetInvoiceQuery.ts
export interface GetInvoiceQuery {
  readonly invoiceId: string;
  readonly userId: string;
}

// GetInvoiceQueryHandler.ts
export class GetInvoiceQueryHandler {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly invoiceMapper: InvoiceMapper
  ) {}

  async handle(query: GetInvoiceQuery): Promise<InvoiceDTO> {
    const invoice = await this.invoiceRepository.findById(
      query.invoiceId,
      query.userId
    );
    
    if (!invoice) {
      throw new NotFoundException('INVOICE_NOT_FOUND');
    }
    
    // Calculate balance
    const totalPayments = await this.paymentRepository.getTotalPayments(
      invoice.id
    );
    const balance = invoice.total.subtract(new Money(totalPayments));
    
    // Map to DTO
    return this.invoiceMapper.toDTO(invoice, balance);
  }
}

// InvoiceDTO.ts
export class InvoiceDTO {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly userId: string;
  readonly customerId: string;
  readonly companyInfo: string;
  readonly status: string;
  readonly lineItems: LineItemDTO[];
  readonly subtotal: number;
  readonly taxRate: number;
  readonly taxAmount: number;
  readonly total: number;
  readonly balance: number;
  readonly notes: string;
  readonly terms: string;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly sentDate: string | null;
  readonly paidDate: string | null;
  readonly pdfS3Keys: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// InvoiceMapper.ts
export class InvoiceMapper {
  toDTO(invoice: Invoice, balance: Money): InvoiceDTO {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber.value,
      userId: invoice.userId,
      customerId: invoice.customerId,
      companyInfo: invoice.companyInfo,
      status: invoice.status,
      lineItems: invoice.lineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toJSON(),
        amount: item.amount.toJSON(),
        createdAt: item.createdAt.toISOString(),
      })),
      subtotal: invoice.subtotal.toJSON(),
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount.toJSON(),
      total: invoice.total.toJSON(),
      balance: balance.toJSON(),
      notes: invoice.notes,
      terms: invoice.terms,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      sentDate: invoice.sentDate?.toISOString() || null,
      paidDate: invoice.paidDate?.toISOString() || null,
      pdfS3Keys: invoice.pdfS3Keys,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }
}
```

### 3.4 Domain Events

**Event Structure:**

```typescript
// Domain/Shared/DomainEvent.ts
export abstract class DomainEvent {
  readonly occurredOn: Date;
  readonly eventId: string;
  
  constructor() {
    this.occurredOn = new Date();
    this.eventId = randomUUID();
  }
  
  abstract get eventName(): string;
}

// Domain/Invoices/Events/InvoiceCreatedEvent.ts
export class InvoiceCreatedEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly userId: string,
    readonly customerId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'invoice.created';
  }
}

// Domain/Invoices/Events/InvoiceSentEvent.ts
export class InvoiceSentEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly userId: string,
    readonly pdfS3Key: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'invoice.sent';
  }
}
```

**Event Bus (In-Memory for MVP):**

```typescript
// Infrastructure/Messaging/InMemoryEventBus.ts
export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();
  
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }
  
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    
    // Execute handlers sequentially (not in parallel)
    for (const handler of handlers) {
      await handler(event);
    }
  }
}

// Example handler registration
eventBus.subscribe('invoice.sent', async (event: InvoiceSentEvent) => {
  // Future: Send email notification
  console.log(`Invoice ${event.invoiceId} sent with PDF ${event.pdfS3Key}`);
});
```

**Transaction and Event Handling Rules:**

1. **Transaction Ownership:** Command Handlers own the transaction scope. Handlers begin transactions, commit on success, and rollback on failure.

2. **Event Failure Handling:** If an event handler fails during execution, the entire transaction MUST be rolled back. Events are part of the transactional boundary.

3. **Event Execution:** Events are published BEFORE transaction commit. If any event handler throws an exception, the transaction rolls back and the command fails.

4. **Event Execution Order:** When multiple events are published in a single command, they execute **sequentially** in the order they were published. This ensures deterministic behavior and makes debugging easier.

**Example Transaction Flow:**
```typescript
export class CreateInvoiceCommandHandler {
  async handle(command: CreateInvoiceCommand): Promise<string> {
    const transaction = await this.db.beginTransaction();
    
    try {
      // 1. Domain operations
      const invoice = Invoice.create(command);
      await this.invoiceRepository.save(invoice, transaction);
      
      // 2. Publish events (within transaction)
      await this.eventBus.publish(new InvoiceCreatedEvent(invoice.id));
      
      // 3. Commit if all succeeds
      await transaction.commit();
      return invoice.id;
    } catch (error) {
      // 4. Rollback on any failure (domain, persistence, or events)
      await transaction.rollback();
      throw error;
    }
  }
}
```

### 3.5 Repository Pattern Refinement

**Interface (Domain Layer):**

```typescript
// Domain/Invoices/IInvoiceRepository.ts
export interface IInvoiceRepository {
  findById(id: string, userId: string): Promise<Invoice | null>;
  findAllByUserId(
    userId: string,
    page: number,
    pageSize: number,
    status?: string,
    searchTerm?: string
  ): Promise<PagedResult<Invoice>>;
  save(invoice: Invoice, transaction?: Transaction): Promise<void>;
  generateInvoiceNumber(): Promise<InvoiceNumber>;
}
```

**Transaction Interface:**

Repositories accept an optional `transaction` parameter:
- If transaction provided → use it (handler-managed transaction)
- If no transaction → create and manage own transaction (standalone operation)

This allows both transactional and non-transactional usage.

**Implementation (Infrastructure Layer):**

```typescript
// Infrastructure/Persistence/PostgreSQL/InvoiceRepository.ts
export class PostgreSQLInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly db: Pool) {}
  
  async save(invoice: Invoice, transaction?: Transaction): Promise<void> {
    const client = transaction?.client || await this.db.connect();
    const shouldManageTransaction = !transaction;
    
    try {
      if (shouldManageTransaction) {
        await client.query('BEGIN');
      }
      
      // Upsert invoice
      await client.query(
        `INSERT INTO invoices (...) VALUES (...)
         ON CONFLICT (id) DO UPDATE SET ...`,
        [/* invoice data */]
      );
      
      // Delete and re-insert line items (simpler than diff)
      await client.query('DELETE FROM line_items WHERE invoice_id = $1', [invoice.id]);
      
      if (invoice.lineItems.length > 0) {
        // Bulk insert line items
      }
      
      if (shouldManageTransaction) {
        await client.query('COMMIT');
      }
    } catch (error) {
      if (shouldManageTransaction) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (shouldManageTransaction) {
        client.release();
      }
    }
  }
  
  // Other methods...
}
```

### 3.6 Dependency Injection

**Container:** Use **tsyringe** for dependency injection.

**Registration Strategy:**

```typescript
// Infrastructure/Configuration/DependencyContainer.ts
import { container } from 'tsyringe';
import { Pool } from 'pg';

// Register infrastructure
container.register<Pool>('DatabasePool', {
  useFactory: () => createDatabasePool()
});

container.register<IEventBus>('EventBus', {
  useClass: InMemoryEventBus
});

// Register repositories (singletons)
container.registerSingleton<ICustomerRepository>(
  'CustomerRepository',
  PostgreSQLCustomerRepository
);

container.registerSingleton<IInvoiceRepository>(
  'InvoiceRepository', 
  PostgreSQLInvoiceRepository
);

// Register handlers (singletons)
container.registerSingleton(CreateInvoiceCommandHandler);
container.registerSingleton(GetInvoiceQueryHandler);
// ... register all handlers

export { container };
```

**Handler Injection:**

```typescript
import { injectable, inject } from 'tsyringe';

@injectable()
export class CreateInvoiceCommandHandler {
  constructor(
    @inject('CustomerRepository') private readonly customerRepository: ICustomerRepository,
    @inject('InvoiceRepository') private readonly invoiceRepository: IInvoiceRepository,
    @inject('EventBus') private readonly eventBus: IEventBus
  ) {}
  
  async handle(command: CreateInvoiceCommand): Promise<string> {
    // Implementation
  }
}
```

**Controller Resolution:**

```typescript
// Presentation/Controllers/InvoicesController.ts
import { container } from '@/Infrastructure/Configuration/DependencyContainer';

export class InvoicesController {
  async createInvoice(req: Request, res: Response): Promise<void> {
    const handler = container.resolve(CreateInvoiceCommandHandler);
    const invoiceId = await handler.handle(command);
    res.status(201).json({ success: true, data: { id: invoiceId } });
  }
}
```

**Lifecycle:**
- Repositories: Singleton (one instance per application)
- Handlers: Singleton (stateless, safe to reuse)
- Event Bus: Singleton (global event coordinator)

**Database Connection Management:**

```typescript
// Infrastructure/Configuration/DatabaseConfig.ts
import { Pool } from 'pg';

let pool: Pool | null = null;

export function createDatabasePool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  
  return pool;
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Register in DI container
container.register<Pool>('DatabasePool', {
  useFactory: () => createDatabasePool()
});
```

### 3.7 Error Handling & HTTP Mapping

**Domain Exceptions:**

```typescript
// Domain/Shared/DomainException.ts
export class DomainException extends Error {
  constructor(
    public readonly code: string,
    message?: string
  ) {
    super(message || code);
    this.name = 'DomainException';
  }
}

export class NotFoundException extends DomainException {
  constructor(code: string) {
    super(code);
    this.name = 'NotFoundException';
  }
}

export class ValidationException extends DomainException {
  constructor(code: string, message?: string) {
    super(code, message);
    this.name = 'ValidationException';
  }
}

export class AuthorizationException extends DomainException {
  constructor(code: string = 'FORBIDDEN') {
    super(code);
    this.name = 'AuthorizationException';
  }
}
```

**Global Error Handling Middleware:**

```typescript
// Presentation/Middleware/ErrorHandlerMiddleware.ts
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);
  
  // Domain exceptions → HTTP status mapping
  if (error instanceof NotFoundException) {
    res.status(404).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }
  
  if (error instanceof ValidationException || error instanceof DomainException) {
    res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }
  
  if (error instanceof AuthorizationException) {
    res.status(403).json({
      success: false,
      error: {
        code: error.code,
        message: 'Access denied'
      }
    });
    return;
  }
  
  // Unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

**Standardized API Response Format:**

All endpoints return:
```typescript
{
  success: boolean;
  data?: T;           // Present on success
  error?: {           // Present on failure
    code: string;
    message: string;
  };
}
```

**Commands return:**
```typescript
{ success: true, data: { id: string } }
```

**Queries return:**
```typescript
{ success: true, data: DTO }
```

**Errors return:**
```typescript
{ 
  success: false, 
  error: { code: 'CUSTOMER_NOT_FOUND', message: '...' } 
}
```

### 3.8 Query Performance Strategy

**Rule:** Optimize based on query type.

**Single Entity Queries (GetById):**
- Load full domain aggregate
- Apply business logic if needed
- Map to DTO

```typescript
export class GetInvoiceQueryHandler {
  async handle(query: GetInvoiceQuery): Promise<InvoiceDTO> {
    // Load full aggregate with line items
    const invoice = await this.invoiceRepository.findById(query.invoiceId);
    return InvoiceMapper.toDTO(invoice);
  }
}
```

**List Queries (Pagination):**
- Query database directly
- Map raw rows to DTOs without domain hydration
- Skip domain entity creation for performance

```typescript
export class ListInvoicesQueryHandler {
  async handle(query: ListInvoicesQuery): Promise<PagedResult<InvoiceDTO>> {
    // Direct SQL projection to DTO shape
    const result = await this.db.query(`
      SELECT 
        i.id, i.invoice_number, i.status, i.total,
        c.name as customer_name
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2 OFFSET $3
    `, [query.userId, query.pageSize, offset]);
    
    return {
      items: result.rows.map(row => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        status: row.status,
        total: row.total,
        customerName: row.customer_name,
        // ... lightweight DTO
      })),
      totalCount,
      page,
      pageSize,
      totalPages
    };
  }
}
```

**Trade-off:** List queries sacrifice domain logic for performance. Single entity queries maintain full domain behavior.

### 3.9 API Routes & Middleware Configuration

**Express Application Setup:**

```typescript
// src/index.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { container } from './Infrastructure/Configuration/DependencyContainer';
import { errorHandler } from './Presentation/Middleware/ErrorHandlerMiddleware';
import { authMiddleware } from './Presentation/Middleware/AuthMiddleware';
import { getLimiter } from './Presentation/Middleware/RateLimiterMiddleware';
import { createCustomerRoutes } from './Presentation/Routes/customerRoutes';
import { createInvoiceRoutes } from './Presentation/Routes/invoiceRoutes';
import { createPaymentRoutes } from './Presentation/Routes/paymentRoutes';

const app: Application = express();

// 1. Security & Performance Middleware (before body parsing)
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// 2. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rate Limiting (before routes)
app.use(getLimiter());

// 4. Health Check (no auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 5. API Routes (with auth middleware applied)
app.use('/api/v1/customers', authMiddleware, createCustomerRoutes(container));
app.use('/api/v1/invoices', authMiddleware, createInvoiceRoutes(container));
app.use('/api/v1/payments', authMiddleware, createPaymentRoutes(container));

// 6. Error Handler (MUST be last)
app.use(errorHandler);

export default app;
```

**Route Factory Pattern:**

```typescript
// Presentation/Routes/invoiceRoutes.ts
import { Router } from 'express';
import { DependencyContainer } from 'tsyringe';
import { CreateInvoiceCommandHandler } from '@/Application/Commands/Invoices/CreateInvoice/CreateInvoiceCommandHandler';
import { GetInvoiceQueryHandler } from '@/Application/Queries/Invoices/GetInvoice/GetInvoiceQueryHandler';

export function createInvoiceRoutes(container: DependencyContainer): Router {
  const router = Router();
  
  // POST /api/v1/invoices
  router.post('/', async (req, res, next) => {
    try {
      const handler = container.resolve(CreateInvoiceCommandHandler);
      const command = {
        userId: req.user!.id,
        customerId: req.body.customerId,
        companyInfo: req.body.companyInfo || '',
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : new Date(),
        dueDate: req.body.dueDate 
          ? new Date(req.body.dueDate) 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        taxRate: req.body.taxRate ?? 0,
        notes: req.body.notes,
        terms: req.body.terms,
      };
      
      const invoiceId = await handler.handle(command);
      res.status(201).json({ success: true, data: { id: invoiceId } });
    } catch (error) {
      next(error); // Passes to error handler middleware
    }
  });
  
  // GET /api/v1/invoices/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(GetInvoiceQueryHandler);
      const query = {
        invoiceId: req.params.id,
        userId: req.user!.id,
      };
      
      const invoice = await handler.handle(query);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  });
  
  // ... other routes
  
  return router;
}
```

**Middleware Execution Order (Critical):**

1. **Security/Performance** (helmet, compression, cors) - First layer of protection
2. **Body Parsing** (express.json) - Parse request bodies
3. **Rate Limiting** - Prevent abuse
4. **Health Check** - Unauthenticated endpoint
5. **Authentication** - Verify JWT and attach user to request
6. **Route Handlers** - Business logic execution
7. **Error Handler** - MUST be last to catch all errors

### 3.10 DTO Mapper Implementation Pattern

**Consistent Mapper Structure:**

All mappers follow this pattern:

```typescript
// Application/Mappers/CustomerMapper.ts
import { Customer } from '@/Domain/Customers/Customer';
import { CustomerDTO } from '@/Application/DTOs/CustomerDTO';

export class CustomerMapper {
  static toDTO(customer: Customer): CustomerDTO {
    return {
      id: customer.id,
      name: customer.name.value,
      email: customer.email.value,
      address: {
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        postalCode: customer.address.postalCode,
        country: customer.address.country,
      },
      phoneNumber: customer.phoneNumber.value,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
  
  static toDTOList(customers: Customer[]): CustomerDTO[] {
    return customers.map(c => this.toDTO(c));
  }
}

// Application/Mappers/PaymentMapper.ts
import { Payment } from '@/Domain/Payments/Payment';
import { PaymentDTO } from '@/Application/DTOs/PaymentDTO';

export class PaymentMapper {
  static toDTO(payment: Payment): PaymentDTO {
    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount.toJSON(),
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate.toISOString(),
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
    };
  }
  
  static toDTOList(payments: Payment[]): PaymentDTO[] {
    return payments.map(p => this.toDTO(p));
  }
}
```

**Mapper Rules:**

1. **One mapper per aggregate** (CustomerMapper, InvoiceMapper, PaymentMapper)
2. **Static methods only** (no state, pure transformation)
3. **Always include toDTO and toDTOList**
4. **Value objects → primitives** (Money → number, EmailAddress → string)
5. **Dates → ISO strings** (Date → string)
6. **Nested entities mapped inline** (LineItems within InvoiceDTO)

### 3.11 Migration Coexistence Strategy

**Phase-by-Phase Approach:**

During migration (Phases 2-4), old handlers and new CQRS handlers coexist:

**Step 1: Create new structure alongside old**

```
src/
├── features/              # OLD (keep working)
│   └── customers/
│       └── createCustomer.ts
├── Application/           # NEW (being built)
│   └── Commands/
│       └── Customers/
│           └── CreateCustomer/
```

**Step 2: Dual route registration**

```typescript
// Temporary during migration
import { createCustomer as oldCreateCustomer } from './features/customers/createCustomer';
import { createCustomerRoutes as newRoutes } from './Presentation/Routes/customerRoutes';

// Use environment variable to toggle
if (process.env.USE_NEW_ARCHITECTURE === 'true') {
  app.use('/api/v1/customers', newRoutes(container));
} else {
  // Old implementation
  customerRouter.post('/', oldCreateCustomer);
  app.use('/api/v1/customers', customerRouter);
}
```

**Step 3: Feature flag per endpoint (granular)**

```typescript
router.post('/', async (req, res, next) => {
  // Feature flag check
  if (req.headers['x-use-new-api'] === 'true') {
    // New CQRS implementation
    const handler = container.resolve(CreateCustomerCommandHandler);
    const result = await handler.handle(command);
    return res.json({ success: true, data: result });
  } else {
    // Fallback to old handler
    return oldCreateCustomer(req, res, next);
  }
});
```

**Step 4: Complete phase, remove old code**

Once all tests pass for a phase:
1. Remove old handlers
2. Remove feature flags
3. Delete old route registrations
4. Clean up unused imports

**Benefits:**
- Zero downtime migration
- Rollback capability per feature
- Test new implementation in production safely
- Gradual confidence building

---

## 4. Migration Plan: Frontend

### 4.1 New Folder Structure

```
invoice-frontend/src/
├── Domain/                              # Domain models (frontend)
│   ├── Customers/
│   │   ├── CustomerModel.ts
│   │   ├── EmailAddress.ts
│   │   └── Address.ts
│   ├── Invoices/
│   │   ├── InvoiceModel.ts
│   │   ├── LineItemModel.ts
│   │   └── InvoiceStatus.ts
│   ├── Payments/
│   │   ├── PaymentModel.ts
│   │   └── PaymentMethod.ts
│   └── Shared/
│       └── Money.ts
│
├── Application/                         # Frontend use cases
│   ├── Commands/
│   │   ├── Customers/
│   │   │   ├── CreateCustomerCommand.ts
│   │   │   └── useCreateCustomer.ts     # Vue composable
│   │   ├── Invoices/
│   │   │   ├── CreateInvoiceCommand.ts
│   │   │   └── useCreateInvoice.ts
│   │   └── Payments/
│   │       └── useRecordPayment.ts
│   ├── Queries/
│   │   ├── Customers/
│   │   │   ├── useCustomerList.ts
│   │   │   └── useCustomerDetail.ts
│   │   ├── Invoices/
│   │   │   ├── useInvoiceList.ts
│   │   │   └── useInvoiceDetail.ts
│   │   └── Payments/
│   │       └── usePaymentList.ts
│   └── DTOs/
│       ├── CustomerDTO.ts
│       ├── InvoiceDTO.ts
│       └── PaymentDTO.ts
│
├── Infrastructure/                      # API & external services
│   ├── Http/
│   │   ├── ApiClient.ts
│   │   ├── CustomerApiService.ts
│   │   ├── InvoiceApiService.ts
│   │   └── PaymentApiService.ts
│   └── Storage/
│       └── LocalStorageService.ts
│
├── Presentation/                        # UI components & views
│   ├── Features/
│   │   ├── Customers/
│   │   │   ├── CustomerList.vue
│   │   │   ├── CustomerForm.vue
│   │   │   └── Components/
│   │   │       ├── CustomerCard.vue
│   │   │       └── CustomerFormFields.vue
│   │   ├── Invoices/
│   │   │   ├── InvoiceList.vue
│   │   │   ├── InvoiceForm.vue
│   │   │   └── Components/
│   │   │       ├── LineItemsTable.vue
│   │   │       ├── InvoiceTotals.vue
│   │   │       └── InvoiceStatusBadge.vue
│   │   └── Payments/
│   │       ├── PaymentHistory.vue
│   │       └── RecordPaymentModal.vue
│   ├── Shared/
│   │   ├── Components/
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   └── Modal.vue
│   │   └── Layouts/
│   │       └── MainLayout.vue
│   └── Router/
│       └── index.ts
│
└── Tests/
    ├── Unit/
    └── E2E/
```

### 4.2 Frontend Command Pattern

**Vue Composable for Commands:**

```typescript
// Application/Commands/Invoices/useCreateInvoice.ts
import { ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';
import type { CreateInvoiceCommand } from './CreateInvoiceCommand';

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
      error.value = err.response?.data?.message || 'Failed to create invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    execute,
    isLoading,
    error,
  };
}

// Usage in component:
// <script setup lang="ts">
// const { execute, isLoading, error } = useCreateInvoice();
// 
// const handleSubmit = async () => {
//   const invoiceId = await execute({
//     customerId: selectedCustomerId.value,
//     companyInfo: form.companyInfo,
//     issueDate: form.issueDate,
//     dueDate: form.dueDate,
//     taxRate: form.taxRate,
//   });
//   
//   router.push(`/invoices/${invoiceId}/edit`);
// };
// </script>
```

**Frontend Domain Model:**

```typescript
// Domain/Invoices/InvoiceModel.ts
import { Money } from '@/Domain/Shared/Money';
import { LineItemModel } from './LineItemModel';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export class InvoiceModel {
  constructor(
    public readonly id: string,
    public readonly invoiceNumber: string,
    public readonly customerId: string,
    public readonly status: InvoiceStatus,
    public readonly lineItems: LineItemModel[],
    public readonly subtotal: Money,
    public readonly taxRate: number,
    public readonly taxAmount: Money,
    public readonly total: Money,
    public readonly balance: Money,
    public readonly notes: string,
    public readonly terms: string,
    public readonly issueDate: Date,
    public readonly dueDate: Date
  ) {}
  
  // Display logic only (NOT business rules)
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
  
  // Factory method from DTO
  static fromDTO(dto: InvoiceDTO): InvoiceModel {
    return new InvoiceModel(
      dto.id,
      dto.invoiceNumber,
      dto.customerId,
      dto.status as InvoiceStatus,
      dto.lineItems.map(LineItemModel.fromDTO),
      Money.from(dto.subtotal),
      dto.taxRate,
      Money.from(dto.taxAmount),
      Money.from(dto.total),
      Money.from(dto.balance),
      dto.notes,
      dto.terms,
      new Date(dto.issueDate),
      new Date(dto.dueDate)
    );
  }
}
```

**Frontend Domain Model Philosophy:**

Frontend models are **lightweight and focused on display logic only**:

1. **What They Are:**
   - Rich data structures with computed properties for UI state
   - Type-safe wrappers around DTOs
   - Helper methods for formatting, display rules, and UI flags

2. **What They Are NOT:**
   - They do NOT enforce business rules (backend owns this)
   - They do NOT perform mutations or state changes
   - They do NOT validate data (validation happens on backend)

3. **Examples of Display Logic:**
   - ✅ `isOverdue()` - determines if UI shows "overdue" badge
   - ✅ `canMarkAsSent()` - determines if "Mark as Sent" button is enabled
   - ✅ `formatCurrency()` - formats money for display
   - ❌ `markAsSent()` - this is a command, not display logic
   - ❌ `validateInvoice()` - this is business validation, not display logic

**All business rules and state changes happen through Commands sent to the backend.**

### 4.3 Frontend State Management Pattern

**Primary API:** Composables are the main interface for components.

**When to Use Pinia Stores:**
- Global state shared across multiple unrelated components
- Authentication state (user, tokens)
- App-level configuration

**When to Use Composables Only:**
- Feature-specific state (invoice list, customer detail)
- Component-local concerns
- Most CQRS operations

**Pattern:**

```typescript
// Composables handle commands/queries directly
export function useInvoiceList() {
  const invoices = ref<InvoiceModel[]>([]);
  const isLoading = ref(false);
  
  const fetchInvoices = async () => {
    isLoading.value = true;
    const response = await InvoiceApiService.listInvoices();
    invoices.value = response.items.map(InvoiceModel.fromDTO);
    isLoading.value = false;
  };
  
  return { invoices, isLoading, fetchInvoices };
}

// Pinia stores only for cross-cutting concerns
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);
  
  return { user, isAuthenticated };
});
```

**Cache Strategy:**
- Composables cache in reactive refs
- Invalidate on mutations (after successful command)
- No automatic sync - manual refetch when needed

```typescript
const { execute: createInvoice } = useCreateInvoice();
const { invoices, refetch } = useInvoiceList();

const handleCreate = async () => {
  await createInvoice(command);
  await refetch(); // Manual cache invalidation
};
```

### 4.4 Frontend API Service Layer

**Complete Service Pattern:**

All API services follow this consistent structure:

```typescript
// Infrastructure/Http/InvoiceApiService.ts
import { apiClient } from './apiClient';
import type { 
  CreateInvoiceCommand, 
  UpdateInvoiceCommand,
  InvoiceDTO,
  InvoiceListDTO 
} from '@/Application/DTOs';

export class InvoiceApiService {
  private static readonly BASE_URL = '/api/v1/invoices';
  
  // Commands (mutations)
  static async createInvoice(command: CreateInvoiceCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  static async updateInvoice(
    id: string, 
    command: UpdateInvoiceCommand
  ): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${id}`, command);
  }
  
  static async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }
  
  static async markAsSent(id: string): Promise<void> {
    await apiClient.post(`${this.BASE_URL}/${id}/mark-sent`);
  }
  
  // Queries (reads)
  static async getInvoice(id: string): Promise<InvoiceDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listInvoices(params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<InvoiceListDTO> {
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

// Infrastructure/Http/CustomerApiService.ts
export class CustomerApiService {
  private static readonly BASE_URL = '/api/v1/customers';
  
  static async createCustomer(command: CreateCustomerCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  static async updateCustomer(
    id: string, 
    command: UpdateCustomerCommand
  ): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${id}`, command);
  }
  
  static async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }
  
  static async getCustomer(id: string): Promise<CustomerDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listCustomers(): Promise<CustomerDTO[]> {
    const response = await apiClient.get(this.BASE_URL);
    return response.data.data;
  }
}

// Infrastructure/Http/PaymentApiService.ts
export class PaymentApiService {
  private static readonly BASE_URL = '/api/v1/payments';
  
  static async recordPayment(command: RecordPaymentCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  static async getPayment(id: string): Promise<PaymentDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listPayments(invoiceId: string): Promise<PaymentDTO[]> {
    const response = await apiClient.get(this.BASE_URL, {
      params: { invoiceId }
    });
    return response.data.data;
  }
}
```

**API Client Configuration:**

```typescript
// Infrastructure/Http/apiClient.ts
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**API Service Rules:**

1. **One service class per aggregate** (InvoiceApiService, CustomerApiService)
2. **Static methods only** (no instance state)
3. **Commands return void or { id }** (minimal response)
4. **Queries return typed DTOs** (full data)
5. **Always use apiClient** (centralized config)
6. **Group by operation type** (Commands first, then Queries)
7. **Handle HTTP-specific concerns** (response type, params)

### 4.5 Query Pattern with Caching

**Vue Query Composable:**

```typescript
// Application/Queries/Invoices/useInvoiceList.ts
import { ref, computed, watch } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';
import { InvoiceModel } from '@/Domain/Invoices/InvoiceModel';
import type { InvoiceDTO } from '@/Application/DTOs/InvoiceDTO';

export function useInvoiceList(options: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const invoices = ref<InvoiceModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const totalPages = ref(0);
  
  const fetchInvoices = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await InvoiceApiService.listInvoices({
        status: options.status,
        page: options.page || 1,
        pageSize: options.pageSize || 25,
      });
      
      invoices.value = response.items.map((dto: InvoiceDTO) =>
        InvoiceModel.fromDTO(dto)
      );
      totalCount.value = response.totalCount;
      totalPages.value = response.totalPages;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch invoices';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-refetch when params change
  watch(
    () => [options.status, options.page, options.pageSize],
    fetchInvoices,
    { immediate: true }
  );
  
  return {
    invoices: computed(() => invoices.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    totalCount: computed(() => totalCount.value),
    totalPages: computed(() => totalPages.value),
    refetch: fetchInvoices,
  };
}
```

---

## 5. Complete Feature Example: RecordPayment

### 5.1 Backend Implementation

**Command:**

```typescript
// Application/Commands/Payments/RecordPayment/RecordPaymentCommand.ts
export interface RecordPaymentCommand {
  readonly invoiceId: string;
  readonly amount: number;
  readonly paymentMethod: 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer';
  readonly paymentDate: Date;
  readonly reference?: string;
  readonly notes?: string;
}

// RecordPaymentCommandHandler.ts
export class RecordPaymentCommandHandler {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly eventBus: IEventBus
  ) {}

  async handle(command: RecordPaymentCommand, userId: string): Promise<string> {
    // 1. Load invoice aggregate
    const invoice = await this.invoiceRepository.findById(command.invoiceId, userId);
    if (!invoice) {
      throw new NotFoundException('INVOICE_NOT_FOUND');
    }
    
    // 2. Validate invoice state
    if (invoice.status === 'Draft') {
      throw new DomainException('INVALID_STATE_TRANSITION', 
        'Cannot record payment on Draft invoice');
    }
    
    // 3. Calculate current balance
    const totalPayments = await this.paymentRepository.getTotalPayments(invoice.id);
    const currentBalance = invoice.total.subtract(new Money(totalPayments));
    
    // 4. Validate payment amount
    const paymentAmount = new Money(command.amount);
    if (paymentAmount.value > currentBalance.value) {
      throw new DomainException('PAYMENT_EXCEEDS_BALANCE');
    }
    
    // 5. Create payment entity
    const payment = Payment.create({
      invoiceId: invoice.id,
      amount: paymentAmount.value,
      paymentMethod: command.paymentMethod,
      paymentDate: command.paymentDate,
      reference: command.reference,
      notes: command.notes,
    });
    
    // 6. Save payment
    await this.paymentRepository.save(payment);
    
    // 7. Check if invoice is fully paid
    const newBalance = currentBalance.subtract(paymentAmount);
    if (newBalance.value === 0) {
      invoice.markAsPaid();
      await this.invoiceRepository.save(invoice);
    }
    
    // 8. Dispatch events
    await this.eventBus.publish(
      new PaymentRecordedEvent(payment.id, invoice.id, paymentAmount.value)
    );
    
    if (newBalance.value === 0) {
      await this.eventBus.publish(new InvoicePaidEvent(invoice.id, userId));
    }
    
    return payment.id;
  }
}

// RecordPaymentEndpoint.ts
export class PaymentsController {
  constructor(private readonly commandHandler: RecordPaymentCommandHandler) {}
  
  async recordPayment(req: Request, res: Response): Promise<void> {
    const command: RecordPaymentCommand = {
      invoiceId: req.params.invoiceId,
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
      reference: req.body.reference,
      notes: req.body.notes,
    };
    
    const paymentId = await this.commandHandler.handle(command, req.user!.id);
    
    res.status(201).json({
      success: true,
      data: { id: paymentId },
    });
  }
}
```

### 5.2 Frontend Implementation

**Command Composable:**

```typescript
// Application/Commands/Payments/useRecordPayment.ts
export function useRecordPayment() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (command: RecordPaymentCommand): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await PaymentApiService.recordPayment(command);
      return response.id;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to record payment';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}
```

**Component:**

```vue
<!-- Presentation/Features/Payments/RecordPaymentModal.vue -->
<template>
  <Modal :show="show" @close="$emit('close')">
    <h2>Record Payment</h2>
    
    <div class="invoice-summary">
      <p><strong>Invoice:</strong> {{ invoice?.invoiceNumber }}</p>
      <p><strong>Total:</strong> {{ formatCurrency(invoice?.total) }}</p>
      <p><strong>Balance:</strong> {{ formatCurrency(currentBalance) }}</p>
    </div>
    
    <form @submit.prevent="handleSubmit">
      <Input
        v-model="form.amount"
        type="number"
        label="Payment Amount"
        :max="currentBalance"
        required
      />
      
      <Select
        v-model="form.paymentMethod"
        label="Payment Method"
        :options="paymentMethods"
        required
      />
      
      <Input
        v-model="form.paymentDate"
        type="date"
        label="Payment Date"
        required
      />
      
      <Input
        v-model="form.reference"
        label="Reference"
      />
      
      <Textarea
        v-model="form.notes"
        label="Notes"
      />
      
      <div class="form-actions">
        <Button @click="$emit('close')" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" :loading="isLoading" :disabled="!isValid">
          Record Payment
        </Button>
      </div>
    </form>
    
    <p v-if="error" class="error">{{ error }}</p>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRecordPayment } from '@/Application/Commands/Payments/useRecordPayment';
import type { InvoiceModel } from '@/Domain/Invoices/InvoiceModel';

interface Props {
  show: boolean;
  invoice: InvoiceModel | null;
  currentBalance: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

const { execute, isLoading, error } = useRecordPayment();

const form = reactive({
  amount: 0,
  paymentMethod: 'Cash',
  paymentDate: new Date().toISOString().split('T')[0],
  reference: '',
  notes: '',
});

const paymentMethods = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Check', label: 'Check' },
  { value: 'CreditCard', label: 'Credit Card' },
  { value: 'BankTransfer', label: 'Bank Transfer' },
];

const isValid = computed(() => {
  return (
    form.amount > 0 &&
    form.amount <= props.currentBalance &&
    form.paymentMethod &&
    form.paymentDate
  );
});

const handleSubmit = async () => {
  if (!props.invoice || !isValid.value) return;
  
  try {
    await execute({
      invoiceId: props.invoice.id,
      amount: form.amount,
      paymentMethod: form.paymentMethod as any,
      paymentDate: new Date(form.paymentDate),
      reference: form.reference || undefined,
      notes: form.notes || undefined,
    });
    
    emit('success');
    emit('close');
  } catch (err) {
    // Error is already set by composable
  }
};

const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};
</script>
```

---

## 6. Integration Testing Strategy

### 6.1 Test Pyramid

```
           /\
          /  \
         / E2E \           5-10 tests
        /--------\
       /  Integ-  \        20-30 tests
      /   ration  \
     /-------------\
    /     Unit      \      100+ tests
   /-----------------\
```

### 6.1.1 Integration Test Database Strategy

**Approach:** Transaction-per-test with rollback for speed.

**Setup:**

```typescript
// Tests/Integration/setup.ts
import { Pool } from 'pg';

let testDb: Pool;
let testTransaction: any;

export async function setupTestDatabase() {
  // Create separate test database connection
  testDb = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
    max: 1 // Single connection for test isolation
  });
  
  // Run migrations
  await runMigrations(testDb);
}

export async function beforeEachTest() {
  // Start transaction for test
  const client = await testDb.connect();
  await client.query('BEGIN');
  testTransaction = client;
  return testTransaction;
}

export async function afterEachTest() {
  // Rollback transaction (cleanup)
  if (testTransaction) {
    await testTransaction.query('ROLLBACK');
    testTransaction.release();
  }
}

export async function teardownTestDatabase() {
  await testDb.end();
}
```

**Benefits:**
- Fast (no database cleanup needed)
- Isolated (each test in own transaction)
- Consistent (rollback always returns to clean state)

**Test Structure:**

```typescript
describe('CreateInvoice Integration', () => {
  let db: any;
  
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  beforeEach(async () => {
    db = await beforeEachTest();
  });
  
  afterEach(async () => {
    await afterEachTest();
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  it('should create invoice with line items', async () => {
    // Test runs in transaction, auto-rollback after
  });
});
```

### 6.2 Integration Test Example: Complete Payment Flow

```typescript
// Tests/Integration/CompletePaymentFlow.test.ts
describe('Complete Invoice Payment Flow', () => {
  let app: Application;
  let db: Pool;
  let testUserId: string;
  let testCustomerId: string;
  
  beforeAll(async () => {
    // Setup test environment
    db = await createTestDatabase();
    app = createTestApplication(db);
    
    // Seed test user
    testUserId = await seedTestUser(db);
  });
  
  afterAll(async () => {
    await cleanupTestDatabase(db);
  });
  
  it('should create customer, invoice, and process payment end-to-end', async () => {
    // 1. Create Customer
    const createCustomerResponse = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'Test Country',
        },
        phoneNumber: '+1234567890',
      })
      .expect(201);
    
    testCustomerId = createCustomerResponse.body.data.id;
    expect(testCustomerId).toBeDefined();
    
    // 2. Create Invoice (Draft)
    const createInvoiceResponse = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        customerId: testCustomerId,
        companyInfo: 'Test Company',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        taxRate: 10,
      })
      .expect(201);
    
    const invoiceId = createInvoiceResponse.body.data.id;
    
    // 3. Add Line Items
    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/line-items`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        description: 'Service 1',
        quantity: 2,
        unitPrice: 100.00,
      })
      .expect(201);
    
    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/line-items`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        description: 'Service 2',
        quantity: 1,
        unitPrice: 50.00,
      })
      .expect(201);
    
    // 4. Verify Invoice Totals
    const getInvoiceResponse = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .expect(200);
    
    const invoice = getInvoiceResponse.body.data;
    expect(invoice.subtotal).toBe(250.00);  // 200 + 50
    expect(invoice.taxAmount).toBe(25.00);  // 10% of 250
    expect(invoice.total).toBe(275.00);
    expect(invoice.balance).toBe(275.00);
    expect(invoice.status).toBe('Draft');
    
    // 5. Mark Invoice as Sent
    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/mark-as-sent`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .expect(200);
    
    // 6. Verify Status Changed to Sent
    const sentInvoice = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .expect(200);
    
    expect(sentInvoice.body.data.status).toBe('Sent');
    expect(sentInvoice.body.data.pdfS3Keys).toHaveLength(1);
    
    // 7. Record Partial Payment
    const partialPaymentResponse = await request(app)
      .post(`/api/v1/invoices/${invoiceId}/payments`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        amount: 175.00,
        paymentMethod: 'Cash',
        paymentDate: new Date().toISOString(),
        notes: 'Partial payment',
      })
      .expect(201);
    
    expect(partialPaymentResponse.body.data.balance).toBe(100.00);
    expect(partialPaymentResponse.body.data.invoiceStatus).toBe('Sent');
    
    // 8. Record Final Payment
    const finalPaymentResponse = await request(app)
      .post(`/api/v1/invoices/${invoiceId}/payments`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        amount: 100.00,
        paymentMethod: 'Check',
        paymentDate: new Date().toISOString(),
        reference: 'CHECK-001',
        notes: 'Final payment',
      })
      .expect(201);
    
    expect(finalPaymentResponse.body.data.balance).toBe(0);
    expect(finalPaymentResponse.body.data.invoiceStatus).toBe('Paid');
    
    // 9. Verify Invoice Status
    const paidInvoice = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .expect(200);
    
    expect(paidInvoice.body.data.status).toBe('Paid');
    expect(paidInvoice.body.data.balance).toBe(0);
    expect(paidInvoice.body.data.paidDate).toBeDefined();
    
    // 10. Verify Payment History
    const paymentsResponse = await request(app)
      .get(`/api/v1/invoices/${invoiceId}/payments`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .expect(200);
    
    expect(paymentsResponse.body.data.payments).toHaveLength(2);
    expect(paymentsResponse.body.data.totalPayments).toBe(275.00);
    
    // 11. Attempt to record additional payment (should fail)
    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/payments`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        amount: 10.00,
        paymentMethod: 'Cash',
        paymentDate: new Date().toISOString(),
      })
      .expect(400)
      .then(res => {
        expect(res.body.error).toBe('PAYMENT_EXCEEDS_BALANCE');
      });
  });
  
  it('should reject payment on Draft invoice', async () => {
    // Create draft invoice
    const invoiceResponse = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        customerId: testCustomerId,
        companyInfo: 'Test Company',
      })
      .expect(201);
    
    const invoiceId = invoiceResponse.body.data.id;
    
    // Attempt to record payment on Draft invoice
    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/payments`)
      .set('Authorization', `Bearer ${getTestToken(testUserId)}`)
      .send({
        amount: 100.00,
        paymentMethod: 'Cash',
        paymentDate: new Date().toISOString(),
      })
      .expect(400)
      .then(res => {
        expect(res.body.error).toBe('INVALID_STATE_TRANSITION');
      });
  });
});
```

### 6.3 Frontend E2E Test Example

```typescript
// Tests/E2E/InvoicePaymentFlow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should create customer, invoice, and record payment', async ({ page }) => {
    // 1. Create Customer
    await page.goto('/customers/new');
    await page.fill('[name="name"]', 'E2E Test Customer');
    await page.fill('[name="email"]', `e2e-${Date.now()}@example.com`);
    await page.fill('[name="address.street"]', '123 E2E St');
    await page.fill('[name="address.city"]', 'Test City');
    await page.fill('[name="address.state"]', 'TS');
    await page.fill('[name="address.postalCode"]', '12345');
    await page.fill('[name="address.country"]', 'Test Country');
    await page.fill('[name="phoneNumber"]', '+1234567890');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/customers$/);
    await expect(page.locator('text=E2E Test Customer')).toBeVisible();
    
    // 2. Create Invoice
    await page.goto('/invoices/new');
    await page.selectOption('[name="customerId"]', { label: /E2E Test Customer/ });
    await page.fill('[name="companyInfo"]', 'E2E Test Company');
    await page.fill('[name="taxRate"]', '10');
    await page.click('button:has-text("Create Invoice")');
    
    await expect(page).toHaveURL(/\/invoices\/[^/]+\/edit$/);
    
    // 3. Add Line Items
    await page.click('button:has-text("Add Line Item")');
    await page.fill('[name="description"]', 'E2E Service 1');
    await page.fill('[name="quantity"]', '2');
    await page.fill('[name="unitPrice"]', '100');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=E2E Service 1')).toBeVisible();
    await expect(page.locator('text=$200.00')).toBeVisible(); // Amount
    
    // 4. Verify Totals
    await expect(page.locator('text=Subtotal')).toBeVisible();
    await expect(page.locator('text=$200.00').first()).toBeVisible();
    await expect(page.locator('text=Tax (10%)')).toBeVisible();
    await expect(page.locator('text=$20.00')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=$220.00')).toBeVisible();
    
    // 5. Mark as Sent
    await page.click('button:has-text("Mark as Sent")');
    await page.click('button:has-text("OK")'); // Confirm dialog
    
    // Wait for PDF generation
    await expect(page.locator('text=Invoice marked as sent')).toBeVisible({
      timeout: 10000,
    });
    
    // 6. Record Payment
    await page.click('button:has-text("Record Payment")');
    
    // Fill payment modal
    await page.fill('[name="amount"]', '220');
    await page.selectOption('[name="paymentMethod"]', 'Cash');
    await page.click('button[type="submit"]:has-text("Record Payment")');
    
    // Verify success
    await expect(page.locator('text=Payment recorded successfully')).toBeVisible();
    await expect(page.locator('text=Balance: $0.00')).toBeVisible();
    await expect(page.locator('text=Paid')).toBeVisible();
  });
});
```

---

## 7. Feature Parity Mapping

### 7.1 Customer Management

| **Current Feature** | **MVP Implementation** | **V2 Architecture** | **Status** |
|-------------------|---------------------|------------------|---------|
| Create Customer | `createCustomer.ts` handler | `CreateCustomerCommand` + Handler | ✅ Mapped |
| Get Customer | `getCustomer.ts` handler | `GetCustomerQuery` + Handler | ✅ Mapped |
| Update Customer | `updateCustomer.ts` handler | `UpdateCustomerCommand` + Handler | ✅ Mapped |
| Delete Customer | `deleteCustomer.ts` handler | `DeleteCustomerCommand` + Handler | ✅ Mapped |
| List Customers | `listCustomers.ts` handler | `ListCustomersQuery` + Handler | ✅ Mapped |
| Email Uniqueness | Application layer check | Domain validation in Customer aggregate | ✅ Enhanced |
| Soft Delete | Repository implementation | Domain method `customer.softDelete()` | ✅ Maintained |

### 7.2 Invoice Management

| **Current Feature** | **MVP Implementation** | **V2 Architecture** | **Status** |
|-------------------|---------------------|------------------|---------|
| Create Invoice | `invoiceHandlers.ts` | `CreateInvoiceCommand` + Handler | ✅ Mapped |
| Get Invoice | `invoiceHandlers.ts` | `GetInvoiceQuery` + Handler | ✅ Mapped |
| Update Invoice | `invoiceHandlers.ts` | `UpdateInvoiceCommand` + Handler | ✅ Mapped |
| Delete Invoice | `invoiceHandlers.ts` | `DeleteInvoiceCommand` + Handler | ✅ Mapped |
| List Invoices | `invoiceHandlers.ts` | `ListInvoicesQuery` + Handler | ✅ Mapped |
| Add Line Item | `invoiceHandlers.ts` | `AddLineItemCommand` + Handler | ✅ Mapped |
| Update Line Item | `invoiceHandlers.ts` | `UpdateLineItemCommand` + Handler | ✅ Mapped |
| Remove Line Item | `invoiceHandlers.ts` | `RemoveLineItemCommand` + Handler | ✅ Mapped |
| Mark as Sent | `invoiceHandlers.ts` | `MarkInvoiceAsSentCommand` + Handler | ✅ Mapped |
| Download PDF | `invoiceHandlers.ts` | `DownloadInvoicePDFQuery` + Handler | ✅ Mapped |
| Total Calculation | Domain logic in Invoice | Maintained in Invoice aggregate | ✅ Maintained |
| State Transitions | Domain logic in Invoice | Enhanced with domain events | ✅ Enhanced |
| Invoice Numbering | Repository method | Domain service `InvoiceNumberGenerator` | ✅ Enhanced |

### 7.3 Payment Management

| **Current Feature** | **MVP Implementation** | **V2 Architecture** | **Status** |
|-------------------|---------------------|------------------|---------|
| Record Payment | `paymentHandlers.ts` | `RecordPaymentCommand` + Handler | ✅ Mapped |
| Get Payment | `paymentHandlers.ts` | `GetPaymentQuery` + Handler | ✅ Mapped |
| List Payments | `paymentHandlers.ts` | `ListPaymentsQuery` + Handler | ✅ Mapped |
| Balance Calculation | Handler logic | Domain aggregate method | ✅ Enhanced |
| Auto-mark Paid | Handler logic | Domain event `PaymentRecordedEvent` triggers | ✅ Enhanced |
| Overpayment Check | Handler validation | Domain validation in Payment aggregate | ✅ Enhanced |

---

## 8. Performance Requirements

### 8.1 API Response Time Targets

| **Operation Type** | **Current** | **Target** | **Strategy** |
|------------------|-----------|----------|-----------|
| Create Customer | ~150ms | <200ms | ✅ Maintained |
| Create Invoice | ~150ms | <200ms | ✅ Maintained |
| Add Line Item | ~150ms | <200ms | ✅ Maintained |
| List Invoices (25 items) | ~200ms | <200ms | Pagination, indexes |
| Mark as Sent (PDF gen) | ~3-5s | <5s | ✅ Maintained |
| Record Payment | ~150ms | <200ms | ✅ Maintained |

### 8.2 Optimization Strategies

**No performance regressions expected** because:
- DDD adds business logic organization, not processing overhead
- CQRS separates concerns but doesn't add network hops
- VSA is organizational only (compile-time structure)
- Repository pattern already exists
- Domain events are in-memory for MVP

**Potential improvements:**
- Better aggregate boundary enforcement → fewer unnecessary queries
- Explicit DTOs → selective field loading
- Query-side optimization → read models

---

## 9. Implementation Roadmap

### Phase 1: Foundation
- [ ] Create new folder structure
- [ ] Implement base classes (DomainEvent, Entity, ValueObject, DomainException)
- [ ] Implement in-memory event bus
- [ ] Set up dependency injection container
- [ ] Create DTO base classes and mappers

### Phase 2: Customer Context
- [ ] Migrate Customer domain entity (already 90% complete)
- [ ] Create Customer commands (Create, Update, Delete)
- [ ] Create Customer queries (Get, List)
- [ ] Implement command/query handlers
- [ ] Create CustomerDTO and mapper
- [ ] Wire up controllers
- [ ] Write integration tests
- [ ] Verify feature parity

### Phase 3: Invoice Context
- [ ] Migrate Invoice aggregate (Invoice + LineItems)
- [ ] Create Invoice commands (Create, Update, Delete, MarkAsSent)
- [ ] Create LineItem commands (Add, Update, Remove)
- [ ] Create Invoice queries (Get, List, GetBalance)
- [ ] Implement handlers
- [ ] Create InvoiceDTO and mapper
- [ ] Wire up controllers
- [ ] Write integration tests
- [ ] Verify feature parity

### Phase 4: Payment Context
- [ ] Migrate Payment domain entity
- [ ] Create RecordPayment command and handler
- [ ] Create Payment queries (Get, List)
- [ ] Implement PaymentDTO and mapper
- [ ] Wire up controllers
- [ ] Implement PaymentRecordedEvent and InvoicePaidEvent
- [ ] Write integration tests
- [ ] Verify feature parity

### Phase 5: Frontend Migration
- [ ] Create frontend domain models
- [ ] Implement command composables
- [ ] Implement query composables
- [ ] Refactor components to use composables
- [ ] Create API service layer
- [ ] Write E2E tests
- [ ] Verify UI feature parity

### Phase 6: Testing & Validation
- [ ] Complete integration test suite (20+ tests)
- [ ] Complete E2E test suite (10+ tests)
- [ ] Performance testing and profiling
- [ ] Load testing (100 concurrent users)
- [ ] Security audit
- [ ] Documentation updates

### Phase 7: Deployment
- [ ] Backward compatibility verification
- [ ] Staging deployment
- [ ] Smoke testing
- [ ] Production deployment
- [ ] Monitoring and observability
- [ ] Post-deployment validation

---

## 10. Success Criteria

### 10.1 Functional Requirements

✅ **100% Feature Parity:**
- All 15 customer operations work identically
- All 23 invoice operations work identically
- All 5 payment operations work identically
- All validation rules preserved
- All error codes unchanged
- All HTTP status codes unchanged

### 10.2 Architectural Requirements

✅ **DDD Implementation:**
- Clear bounded contexts (Customer, Invoice, Payment, User)
- Aggregates with enforced boundaries
- Value objects for all domain concepts
- Domain events for state changes
- No business logic in handlers (only orchestration)

✅ **CQRS Implementation:**
- Explicit Command classes for all write operations
- Explicit Query classes for all read operations
- Separate handlers for commands and queries
- Commands return IDs/success, Queries return DTOs

✅ **VSA Implementation:**
- Each use case in its own folder
- Feature slices contain command/query + handler + endpoint + tests
- No cross-feature dependencies (only through domain)

✅ **Clean Architecture:**
- Domain layer has zero external dependencies
- Application layer depends only on Domain
- Infrastructure implements Domain interfaces
- Presentation depends only on Application

### 10.3 Code Quality Requirements

✅ **Testing:**
- >80% unit test coverage (domain + application layers)
- 20+ integration tests covering complete flows
- 10+ E2E tests covering user journeys
- All tests passing

✅ **Performance:**
- All API endpoints <200ms (except PDF generation <5s)
- No performance regressions vs. MVP
- Memory usage within 10% of MVP

✅ **Documentation:**
- All commands/queries documented
- All domain events documented
- Architecture decision records (ADRs) for key decisions
- Updated README with new structure

---

## 11. Code Examples: Before & After

### 11.1 Before: Current MVP Handler

```typescript
// src/features/invoices/invoiceHandlers.ts
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const { customerId, companyInfo, issueDate, dueDate, taxRate, notes, terms } = req.body;

    // Validation
    if (!customerId) {
      res.status(400).json({ error: 'CUSTOMER_ID_REQUIRED' });
      return;
    }

    // Check customer exists
    const customer = await customerRepository().findById(customerId, req.user.id);
    if (!customer) {
      res.status(404).json({ error: 'CUSTOMER_NOT_FOUND' });
      return;
    }

    // Business logic + infrastructure mixed together
    const invoiceIssueDate = issueDate ? new Date(issueDate) : new Date();
    const invoiceDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invoiceNumber = await invoiceRepository().generateInvoiceNumber();

    const invoice = Invoice.create({
      invoiceNumber: invoiceNumber.value,
      userId: req.user.id,
      customerId,
      companyInfo: companyInfo || '',
      taxRate: taxRate ?? 0,
      notes: notes || '',
      terms: terms || '',
      issueDate: invoiceIssueDate,
      dueDate: invoiceDueDate,
    });

    await invoiceRepository().save(invoice);

    res.status(201).json(invoice.toJSON());
  } catch (error: any) {
    console.error('Create invoice error:', error);

    if (error.message.includes('INVALID_') || error.message.includes('_TOO_LONG')) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};
```

### 11.2 After: V2 DDD/CQRS Architecture

```typescript
// Domain/Invoices/Invoice.ts (unchanged, already good)
export class Invoice {
  static create(props: InvoiceProps): Invoice {
    // Validation and business logic
  }
}

// Application/Commands/Invoices/CreateInvoice/CreateInvoiceCommand.ts
export interface CreateInvoiceCommand {
  readonly userId: string;
  readonly customerId: string;
  readonly companyInfo: string;
  readonly issueDate: Date;
  readonly dueDate: Date;
  readonly taxRate: number;
  readonly notes?: string;
  readonly terms?: string;
}

// Application/Commands/Invoices/CreateInvoice/CreateInvoiceCommandHandler.ts
export class CreateInvoiceCommandHandler {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly eventBus: IEventBus
  ) {}

  async handle(command: CreateInvoiceCommand): Promise<string> {
    // 1. Validate customer exists
    const customer = await this.customerRepository.findById(
      command.customerId,
      command.userId
    );
    
    if (!customer) {
      throw new NotFoundException('CUSTOMER_NOT_FOUND');
    }
    
    // 2. Generate invoice number (domain service)
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();
    
    // 3. Create domain entity
    const invoice = Invoice.create({
      id: randomUUID(),
      userId: command.userId,
      customerId: command.customerId,
      invoiceNumber: invoiceNumber.value,
      companyInfo: command.companyInfo,
      issueDate: command.issueDate,
      dueDate: command.dueDate,
      taxRate: command.taxRate,
      notes: command.notes || '',
      terms: command.terms || '',
    });
    
    // 4. Persist
    await this.invoiceRepository.save(invoice);
    
    // 5. Dispatch event
    await this.eventBus.publish(
      new InvoiceCreatedEvent(invoice.id, invoice.userId, invoice.customerId)
    );
    
    return invoice.id;
  }
}

// Presentation/Controllers/InvoicesController.ts
export class InvoicesController {
  constructor(
    private readonly createInvoiceHandler: CreateInvoiceCommandHandler
  ) {}
  
  async createInvoice(req: Request, res: Response): Promise<void> {
    const command: CreateInvoiceCommand = {
      userId: req.user!.id,
      customerId: req.body.customerId,
      companyInfo: req.body.companyInfo || '',
      issueDate: req.body.issueDate ? new Date(req.body.issueDate) : new Date(),
      dueDate: req.body.dueDate
        ? new Date(req.body.dueDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: req.body.taxRate ?? 0,
      notes: req.body.notes,
      terms: req.body.terms,
    };
    
    // Validation middleware runs before this
    const invoiceId = await this.createInvoiceHandler.handle(command);
    
    res.status(201).json({ success: true, data: { id: invoiceId } });
    // Error handling middleware catches exceptions
  }
}
```

**Benefits of V2:**
1. ✅ Clear separation of concerns (Controller → Handler → Domain)
2. ✅ Command object is testable in isolation
3. ✅ Handler is pure orchestration (no HTTP concerns)
4. ✅ Domain events enable extensibility
5. ✅ Error handling centralized in middleware
6. ✅ Easy to add validation, caching, logging via decorators
7. ✅ Can swap infrastructure without changing domain/application

---

## Appendix A: Key Architectural Decisions

### ADR-001: Use In-Memory Event Bus for MVP
**Decision:** Implement domain events with in-memory event bus, not external message broker.

**Rationale:**
- Simpler implementation for MVP
- No additional infrastructure dependencies
- Events are not critical path (logging/future extensibility)
- Can migrate to RabbitMQ/SQS later without changing domain code

### ADR-002: Maintain Current Database Schema
**Decision:** Keep existing PostgreSQL schema unchanged during migration.

**Rationale:**
- Zero risk of data migration issues
- Easier rollback if needed
- Current schema already well-designed
- Repositories abstract database structure

### ADR-003: Explicit DTOs for All API Boundaries
**Decision:** Never expose domain entities through APIs; always use DTOs.

**Rationale:**
- Decouples API contracts from domain model evolution
- Enables API versioning
- Prevents accidental exposure of sensitive data
- Allows different representations for different use cases

### ADR-004: Commands Return IDs, Not Full Objects
**Decision:** Command handlers return entity IDs (string), not full domain objects or DTOs.

**Rationale:**
- Commands are write operations; clients can query for full data if needed
- Prevents handler from mixing command and query concerns
- Simpler testing (just verify ID returned)
- Follows CQRS principle strictly

---

## Appendix B: Glossary

- **Aggregate:** Cluster of entities and value objects with a single root
- **Aggregate Root:** The main entity that controls access to the aggregate
- **Bounded Context:** A boundary within which a domain model is valid
- **Command:** An instruction to change system state
- **Domain Event:** Something significant that happened in the domain
- **DTO (Data Transfer Object):** Simple object for transferring data across boundaries
- **Entity:** Object with identity that persists over time
- **Query:** Request to retrieve data without side effects
- **Repository:** Abstraction for accessing aggregates from persistence
- **Value Object:** Immutable object defined by its attributes, not identity
- **Vertical Slice:** Feature organized by use case, cutting across all layers

---

**Document Status:** Draft for Review  
**Owner:** Development Team  
**Approvers:** Technical Lead, Product Owner

