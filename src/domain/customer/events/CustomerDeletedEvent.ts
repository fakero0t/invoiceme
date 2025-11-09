import { DomainEvent } from '../../shared/DomainEvent';

export class CustomerDeletedEvent extends DomainEvent {
  constructor(
    readonly customerId: string,
    readonly userId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'customer.deleted';
  }
}

