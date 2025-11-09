import { DomainEvent } from '../../shared/DomainEvent';

export class CustomerUpdatedEvent extends DomainEvent {
  constructor(
    readonly customerId: string,
    readonly userId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'customer.updated';
  }
}

