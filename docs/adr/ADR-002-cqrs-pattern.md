# ADR-002: Implement CQRS Pattern

## Status
Accepted

## Context
In traditional CRUD applications, the same models are used for reading and writing data. This leads to several issues:
- Complex queries that join multiple tables
- DTOs that try to serve multiple purposes
- Performance challenges when read and write patterns differ
- Difficulty optimizing reads without affecting writes

Our invoice system has different read and write patterns:
- **Writes**: Create invoices, add line items, record payments (transactional)
- **Reads**: List invoices, search customers, generate reports (query-optimized)

## Decision
We will implement **CQRS (Command Query Responsibility Segregation)** to separate read and write operations.

### Commands (Write Operations)
- Encapsulate state-changing operations
- Return minimal data (usually just ID)
- Enforce business rules and invariants
- Trigger domain events
- Use transactional repositories

**Command Examples:**
- CreateCustomerCommand
- AddLineItemCommand
- RecordPaymentCommand

### Queries (Read Operations)
- Pure read operations with no side effects
- Return DTOs optimized for presentation
- Can bypass domain layer for performance
- Support filtering, pagination, sorting
- Can be cached

**Query Examples:**
- GetInvoiceQuery
- ListCustomersQuery
- GetInvoiceWithPaymentsQuery

### Implementation

```typescript
// Command Handler Pattern
interface CommandHandler<TCommand, TResult> {
  handle(command: TCommand): Promise<TResult>;
}

// Query Handler Pattern
interface QueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<TResult>;
}
```

## Consequences

### Positive
- **Optimized Operations**: Separate optimization strategies for reads/writes
- **Scalability**: Can scale read and write sides independently
- **Clarity**: Clear intent (is this changing state or just reading?)
- **Performance**: Queries can be optimized without affecting write logic
- **Caching**: Queries can be cached without worrying about stale data from commands
- **Testability**: Commands and queries can be tested independently

### Negative
- **More Code**: Separate handlers for commands and queries
- **Complexity**: Additional abstractions to understand
- **Consistency**: Eventual consistency if using separate read/write databases (not in MVP)
- **Overhead**: Might feel excessive for simple CRUD operations

### Mitigation
- Use templates/generators for handler boilerplate
- Document patterns clearly
- Start with simple CQRS (shared database)
- Evolve to separate read/write stores if needed

## Alternatives Considered

### 1. Traditional CRUD Repositories
**Rejected because:**
- Mixes read and write concerns
- Hard to optimize independently
- Complex queries affect write operations
- Tight coupling between read and write models

### 2. Full Event Sourcing with CQRS
**Rejected for MVP because:**
- Significant complexity increase
- Event store infrastructure needed
- Event replay complexity
- Can be added later if needed

## Implementation Details

### Shared Database (MVP)
- Commands and queries use the same PostgreSQL database
- Queries can read directly from tables (optimized)
- Commands go through domain layer (business rules)

### Future Evolution
- Add Redis cache for queries
- Implement read replicas for queries
- Consider event sourcing for audit trail
- Separate read models if needed

## Examples

### Command Flow
```
Client → API → CommandHandler → Domain Entity → Repository → Database
                                     ↓
                                Event Bus
```

### Query Flow
```
Client → API → QueryHandler → Repository → Database
                   ↓
                 DTO Mapping
```

## References
- [CQRS Pattern by Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [CQRS Journey by Microsoft](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10))

## Related ADRs
- ADR-001: Domain-Driven Design
- ADR-003: Event Bus (Not Event Sourcing)
- ADR-005: Frontend State Management

## Date
2025-01-XX

## Authors
Development Team

