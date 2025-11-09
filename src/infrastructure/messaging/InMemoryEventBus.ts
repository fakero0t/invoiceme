import { injectable } from 'tsyringe';
import { DomainEvent } from '../../domain/shared/DomainEvent';
import { IEventBus } from '../../domain/shared/IEventBus';

@injectable()
export class InMemoryEventBus implements IEventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();
  
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    
    // CRITICAL: Sequential execution to ensure consistency
    for (const handler of handlers) {
      await handler(event);
    }
  }
  
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }
}

