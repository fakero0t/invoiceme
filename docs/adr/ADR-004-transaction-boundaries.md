# ADR-004: Command Handlers Own Transaction Scope

## Status
Accepted

## Context
In a CQRS/DDD application, we need to decide:
- Who manages database transactions?
- What happens if an event handler fails?
- How do we ensure data consistency?

Options:
1. Command handlers manage transactions
2. Repositories manage transactions
3. Application-level transaction management (middleware)

## Decision
**Command handlers own the transaction scope.**

### Pattern

```typescript
class CreateInvoiceCommandHandler {
  async handle(command: CreateInvoiceCommand): Promise<string> {
    // Start transaction (implicit with repository)
    const invoice = Invoice.create(command);
    
    try {
      // All database operations within transaction
      await this.invoiceRepo.save(invoice);
      
      // Transaction commits here
      
      // Events published AFTER transaction commit
      await this.eventBus.publish(new InvoiceCreatedEvent(invoice.id));
      
      return invoice.id;
    } catch (error) {
      // Transaction automatically rolled back
      throw error;
    }
  }
}
```

### Rules

1. **One Transaction Per Command**
   - Each command handler uses a single transaction
   - Aggregate consistency maintained within transaction
   - Cross-aggregate operations need careful design

2. **Events After Commit**
   - Domain events published AFTER transaction commits
   - If event publishing fails, command still succeeds
   - Event failures don't roll back database changes

3. **Repository Abstracts Transactions**
   - Repositories handle connection management
   - Command handlers don't see raw transactions
   - Clean separation of concerns

## Consequences

### Positive
- **Clear Responsibility**: Handler owns the use case including consistency
- **Simple Mental Model**: One command = one transaction
- **Testability**: Easy to mock transaction boundaries
- **Aggregate Consistency**: Enforced within transaction
- **Failure Handling**: Clear rollback semantics

### Negative
- **Event Inconsistency**: Events might fail after commit (eventual consistency)
- **No Cross-Aggregate Transactions**: Need sagas for multi-aggregate operations
- **Handler Complexity**: Handlers must understand transaction implications

### Mitigation
- Document event publishing semantics
- Implement retry logic for failed events
- Use saga pattern for complex workflows
- Monitor event failures

## Alternatives Considered

### 1. Repository-Managed Transactions
**Rejected because:**
- Multiple repository calls in handler = multiple transactions
- Hard to maintain consistency
- Unclear transaction boundaries
- Difficult to test

### 2. Middleware Transaction Management
**Rejected because:**
- Too coarse-grained
- Everything in one transaction (even events)
- Hard to reason about failure scenarios
- Hides transaction logic

### 3. Unit of Work Pattern
**Rejected for MVP because:**
- Added complexity
- Not necessary for current needs
- Can be added later if needed

## Implementation Details

### Success Path
```
1. Handler starts
2. Create domain entity (in-memory)
3. Repository.save() → BEGIN transaction
4. SQL INSERT/UPDATE
5. COMMIT transaction
6. Publish events (async)
7. Return success
```

### Failure Scenarios

#### Scenario 1: Validation Failure
```typescript
// Before any database operations
if (!customer.isValid()) {
  throw new ValidationException(); // No transaction started
}
```

#### Scenario 2: Database Failure
```typescript
try {
  await this.repo.save(customer); // Transaction starts
  // Database error occurs
} catch (error) {
  // Transaction automatically rolled back
  throw error;
}
```

#### Scenario 3: Event Publishing Failure
```typescript
await this.repo.save(customer); // COMMIT happens here
await this.eventBus.publish(event); // Fails, but DB change persists
// Log error, potentially retry event
```

### Repository Implementation

```typescript
class PostgreSQLCustomerRepository implements ICustomerRepository {
  async save(customer: Customer): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO customers (id, user_id, name, email, ...) VALUES ($1, $2, $3, $4, ...)',
        [customer.id, customer.userId, customer.name.value, customer.email.value, ...]
      );
      
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

## Consistency Guarantees

### Strong Consistency
- Within a single aggregate (e.g., Invoice + LineItems)
- Within a single transaction
- Enforced by database ACID properties

### Eventual Consistency
- Event handlers (async processing)
- Cross-aggregate operations
- External system integrations

## Error Handling Best Practices

1. **Validate Early**
   ```typescript
   // Before starting any operations
   if (!command.isValid()) throw new ValidationException();
   ```

2. **Let Transactions Roll Back**
   ```typescript
   // Don't catch and swallow database errors
   await this.repo.save(customer); // Let exceptions propagate
   ```

3. **Handle Event Failures Gracefully**
   ```typescript
   try {
     await this.eventBus.publish(event);
   } catch (error) {
     this.logger.error('Event publishing failed', error);
     // Don't fail the command
   }
   ```

4. **Idempotency for Retries**
   ```typescript
   // Use UUIDs for IDs (not auto-increment)
   // Support duplicate command detection if needed
   ```

## References
- [Transactions in Domain-Driven Design](https://enterprisecraftsmanship.com/posts/domain-events-simple-reliable-solution/)
- [Eventual Consistency](https://martinfowler.com/articles/microservice-trade-offs.html#consistency)

## Related ADRs
- ADR-001: Domain-Driven Design
- ADR-002: CQRS Pattern
- ADR-003: Event Bus (Not Event Sourcing)

## Date
2025-01-XX

## Authors
Development Team

