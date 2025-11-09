import { DomainEvent } from '../../shared/DomainEvent';

export class PaymentRecordedEvent extends DomainEvent {
  constructor(
    readonly paymentId: string,
    readonly invoiceId: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'payment.recorded';
  }
}

