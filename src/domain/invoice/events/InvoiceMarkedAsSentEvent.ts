import { DomainEvent } from '../../shared/DomainEvent';

export class InvoiceMarkedAsSentEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly userId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'invoice.marked_as_sent';
  }
}

