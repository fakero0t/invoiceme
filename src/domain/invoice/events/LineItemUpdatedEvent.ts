import { DomainEvent } from '../../shared/DomainEvent';

export class LineItemUpdatedEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly lineItemId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'line_item.updated';
  }
}

