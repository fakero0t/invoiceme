# ADR-003: In-Memory Event Bus Without Event Sourcing

## Status
Accepted

## Context
Domain events are crucial for:
- Decoupling components
- Audit logging
- Triggering side effects (notifications, analytics)
- Integration with external systems

Two main approaches exist:
1. **Simple Event Bus**: Publish events after state changes, current state stored in database
2. **Event Sourcing**: Store all state changes as events, rebuild state from event stream

Event sourcing provides complete audit trail and time-travel debugging but adds significant complexity.

## Decision
We will use a **simple in-memory event bus** for MVP, NOT full event sourcing.

### Implementation

```typescript
interface DomainEvent {
  eventId: string;
  eventName: string;
  occurredAt: Date;
  payload: Record<string, any>;
}

interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
}
```

### Event Flow
1. Command handler executes business logic
2. Domain entity publishes events
3. State changes persisted to database (transaction)
4. Events published to event bus (after transaction)
5. Event handlers execute asynchronously

### Events Published
- customer.created
- customer.updated
- customer.deleted
- invoice.created
- invoice.line_item_added
- invoice.sent
- invoice.paid
- payment.recorded

## Consequences

### Positive
- **Simplicity**: Easy to understand and implement
- **Low Complexity**: No event store infrastructure needed
- **Fast Development**: Can focus on business logic
- **Flexible**: Can add event sourcing later if needed
- **Good Enough**: Meets current requirements for audit and integration

### Negative
- **No Event Replay**: Can't rebuild state from events
- **No Time Travel**: Can't see historical state
- **Limited Audit**: Only current state in database
- **No Event Versioning**: Event schema changes require careful handling

### Mitigation
- Log all events for audit purposes
- Store critical events in database if needed
- Can migrate to event sourcing later using bounded contexts
- Use database audit columns (created_at, updated_at, deleted_at)

## Alternatives Considered

### 1. Full Event Sourcing
**Rejected for MVP because:**
- **Complexity**: Requires event store infrastructure
- **Learning Curve**: Team needs to understand event sourcing patterns
- **Query Complexity**: Need to rebuild state from events for queries
- **Event Versioning**: Complex to handle evolving event schemas
- **Overkill**: Current requirements don't justify the complexity

**When to Reconsider:**
- Need complete audit trail with replay capability
- Regulatory requirements for event history
- Need to support complex temporal queries
- Multiple consumers need different views of data

### 2. Message Queue (RabbitMQ, SQS)
**Rejected for MVP because:**
- Additional infrastructure to manage
- Overkill for current scale
- Adds operational complexity
- Can be added later for scaling

### 3. No Events (Direct Coupling)
**Rejected because:**
- Tight coupling between components
- Hard to add side effects later
- Poor testability
- Difficult to integrate with external systems

## Implementation Details

### Event Publishing

```typescript
// After successful transaction
class CreateCustomerCommandHandler {
  async handle(command: CreateCustomerCommand): Promise<string> {
    const customer = Customer.create(command);
    
    // Save to database (transaction)
    await this.repo.save(customer);
    
    // Publish event (async, non-blocking)
    await this.eventBus.publish(new CustomerCreatedEvent(customer.id));
    
    return customer.id;
  }
}
```

### Event Handlers

```typescript
// Example: Send welcome email
class CustomerCreatedEventHandler {
  async handle(event: CustomerCreatedEvent): Promise<void> {
    // Async processing, won't block command execution
    await this.emailService.sendWelcomeEmail(event.customerId);
  }
}
```

### Transaction Boundaries
- Events published AFTER database transaction commits
- If event publishing fails, it doesn't roll back the transaction
- Event handlers run asynchronously and independently

## Future Evolution

### Phase 1 (Current): In-Memory Event Bus
- Events for decoupling
- Simple audit logging
- No persistence

### Phase 2: Event Log Table
- Persist events to database table
- Maintain event history
- Still not full event sourcing

### Phase 3: Message Queue
- Add SQS or RabbitMQ
- Better scalability
- At-least-once delivery

### Phase 4: Event Sourcing (if needed)
- Implement event store
- Event-sourced aggregates
- Full temporal queries

## References
- [Domain Events by Martin Fowler](https://martinfowler.com/eaaDev/DomainEvent.html)
- [Event Sourcing by Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)

## Related ADRs
- ADR-001: Domain-Driven Design
- ADR-002: CQRS Pattern
- ADR-004: Transaction Boundaries

## Date
2025-01-XX

## Authors
Development Team

