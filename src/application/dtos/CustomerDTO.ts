export interface CustomerDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

