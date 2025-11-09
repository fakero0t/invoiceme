import { inject, injectable } from 'tsyringe';
import { GetCustomerQuery } from './GetCustomerQuery';
import { ICustomerRepository } from '../../../../domain/customer/ICustomerRepository';
import { CustomerDTO } from '../../../dtos/CustomerDTO';
import { CustomerMapper } from '../../../mappers/CustomerMapper';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class GetCustomerQueryHandler {
  constructor(@inject('ICustomerRepository') private repo: ICustomerRepository) {}
  
  async handle(query: GetCustomerQuery): Promise<CustomerDTO> {
    const customer = await this.repo.findById(query.customerId, query.userId);
    
    if (!customer) {
      throw new NotFoundException('CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    
    return CustomerMapper.toDTO(customer);
  }
}

