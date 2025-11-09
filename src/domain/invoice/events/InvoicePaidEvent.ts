import { DomainEvent } from '../../shared/DomainEvent';

export class InvoicePaidEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly userId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'invoice.paid';
  }
}

