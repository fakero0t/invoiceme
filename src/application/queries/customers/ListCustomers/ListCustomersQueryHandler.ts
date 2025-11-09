import { inject, injectable } from 'tsyringe';
import { ListCustomersQuery } from './ListCustomersQuery';
import { ICustomerRepository } from '../../../../domain/customer/ICustomerRepository';
import { CustomerDTO } from '../../../dtos/CustomerDTO';
import { CustomerMapper } from '../../../mappers/CustomerMapper';

@injectable()
export class ListCustomersQueryHandler {
  constructor(@inject('ICustomerRepository') private repo: ICustomerRepository) {}
  
  async handle(query: ListCustomersQuery): Promise<CustomerDTO[]> {
    try {
      console.log('ListCustomersQueryHandler: Fetching customers for userId:', query.userId);
      const customers = await this.repo.findAll(query.userId);
      console.log('ListCustomersQueryHandler: Found', customers.length, 'customers');
      const dtos = CustomerMapper.toDTOList(customers);
      console.log('ListCustomersQueryHandler: Mapped to DTOs successfully');
      return dtos;
    } catch (error) {
      console.error('ListCustomersQueryHandler: Error in handle:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }
}

