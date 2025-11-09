import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { CreateCustomerCommand } from './CreateCustomerCommand';
import { ICustomerRepository } from '../../../../domain/customer/ICustomerRepository';
import { IEventBus } from '../../../../domain/shared/IEventBus';
import { Customer } from '../../../../domain/customer/Customer';
import { CustomerCreatedEvent } from '../../../../domain/customer/events/CustomerCreatedEvent';
import { ValidationException } from '../../../../domain/shared/DomainException';

@injectable()
export class CreateCustomerCommandHandler {
  constructor(
    @inject('ICustomerRepository') private repo: ICustomerRepository,
    @inject('IEventBus') private eventBus: IEventBus
  ) {}
  
  async handle(command: CreateCustomerCommand): Promise<string> {
    // Cross-aggregate validation: Check email uniqueness
    const existing = await this.repo.findByEmail(command.email, command.userId);
    if (existing) {
      throw new ValidationException('EMAIL_ALREADY_EXISTS', 'A customer with this email already exists');
    }
    
    // Create domain entity (domain validation happens here)
    const customer = Customer.create({
      id: randomUUID(),
      userId: command.userId,
      name: command.name,
      email: command.email,
      address: command.address,
      phoneNumber: command.phoneNumber,
    });
    
    // Persist
    await this.repo.save(customer);
    
    // Publish event
    await this.eventBus.publish(new CustomerCreatedEvent(customer.id, customer.userId));
    
    return customer.id;
  }
}

