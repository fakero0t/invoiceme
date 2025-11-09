import { inject, injectable } from 'tsyringe';
import { UpdateCustomerCommand } from './UpdateCustomerCommand';
import { ICustomerRepository } from '../../../../domain/customer/ICustomerRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { CustomerUpdatedEvent } from '../../../../domain/customer/events/CustomerUpdatedEvent';
import { NotFoundException, ValidationException } from '../../../../domain/shared/DomainException';

@injectable()
export class UpdateCustomerCommandHandler {
  constructor(
    @inject('ICustomerRepository') private repo: ICustomerRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: UpdateCustomerCommand): Promise<void> {
    // Load customer
    const customer = await this.repo.findById(command.customerId, command.userId);
    if (!customer) {
      throw new NotFoundException('CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    
    // Check email uniqueness if changed
    if (customer.email.value !== command.email) {
      const existing = await this.repo.findByEmail(command.email, command.userId);
      if (existing && existing.id !== command.customerId) {
        throw new ValidationException('EMAIL_ALREADY_EXISTS', 'A customer with this email already exists');
      }
    }
    
    // Update domain entity (domain validation happens here)
    customer.update({
      name: command.name,
      email: command.email,
      address: command.address,
      phoneNumber: command.phoneNumber,
    });
    
    // Persist
    await this.repo.save(customer);
    
    // Publish event
    await this.eventBus.publish(new CustomerUpdatedEvent(customer.id, customer.userId));
  }
}

