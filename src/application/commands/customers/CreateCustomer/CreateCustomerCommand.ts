export interface CreateCustomerCommand {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  readonly phoneNumber: string;
}

