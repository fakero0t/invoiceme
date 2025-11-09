import { randomUUID } from 'crypto';

export abstract class DomainEvent {
  readonly occurredOn: Date = new Date();
  readonly eventId: string = randomUUID();
  
  abstract get eventName(): string;
}

