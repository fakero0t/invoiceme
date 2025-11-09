import { inject, injectable } from 'tsyringe';
import { DeleteCustomerCommand } from './DeleteCustomerCommand';
import { ICustomerRepository } from '../../../../domain/customer/ICustomerRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { CustomerDeletedEvent } from '../../../../domain/customer/events/CustomerDeletedEvent';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class DeleteCustomerCommandHandler {
  constructor(
    @inject('ICustomerRepository') private repo: ICustomerRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: DeleteCustomerCommand): Promise<void> {
    // Load customer to verify it exists
    const customer = await this.repo.findById(command.customerId, command.userId);
    if (!customer) {
      throw new NotFoundException('CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    
    // Soft delete
    customer.softDelete();
    
    // Persist
    await this.repo.save(customer);
    
    // Publish event
    await this.eventBus.publish(new CustomerDeletedEvent(customer.id, customer.userId));
  }
}

