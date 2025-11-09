import { DomainEvent } from '../../shared/DomainEvent';

export class LineItemAddedEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly lineItemId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'line_item.added';
  }
}

