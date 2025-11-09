import { Customer } from '../../domain/customer/Customer';
import { CustomerDTO } from '../dtos/CustomerDTO';

export class CustomerMapper {
  static toDTO(customer: Customer): CustomerDTO {
    return {
      id: customer.id,
      userId: customer.userId,
      name: customer.name.value,
      email: customer.email.value,
      address: {
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        postalCode: customer.address.postalCode,
        country: customer.address.country,
      },
      phoneNumber: customer.phoneNumber.value,
      deletedAt: customer.deletedAt ? customer.deletedAt.toISOString() : null,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
  
  static toDTOList(customers: Customer[]): CustomerDTO[] {
    return customers.map(c => this.toDTO(c));
  }
}

