import type { CustomerDTO } from '@/Application/DTOs/CustomerDTO';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class CustomerModel {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly address: Address,
    public readonly phoneNumber: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
  
  // Display helpers
  get displayName(): string {
    return this.name;
  }
  
  get formattedAddress(): string {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}`;
  }
  
  get initials(): string {
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  // Factory method
  static fromDTO(dto: CustomerDTO): CustomerModel {
    return new CustomerModel(
      dto.id,
      dto.userId,
      dto.name,
      dto.email,
      dto.address,
      dto.phoneNumber,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }
}

