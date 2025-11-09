import { Request, Response } from 'express';
import { customerRepository } from '../../infrastructure/database/CustomerRepository';

/**
 * PUT /api/v1/customers/:id
 * Update a customer
 */
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { name, email, address, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !email || !address || !phoneNumber) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Name, email, address, and phone number are required',
      });
      return;
    }

    // Validate address fields
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.postalCode ||
      !address.country
    ) {
      res.status(400).json({
        error: 'INVALID_ADDRESS',
        message: 'Complete address is required (street, city, state, postal code, country)',
      });
      return;
    }

    // Fetch existing customer
    const customer = await customerRepository().findById(id, req.user.id);

    if (!customer) {
      res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
      });
      return;
    }

    // Check if email changed and if new email already exists
    if (email.toLowerCase() !== customer.email.value.toLowerCase()) {
      const emailExists = await customerRepository().emailExistsForOtherCustomer(
        email,
        req.user.id,
        id
      );

      if (emailExists) {
        res.status(409).json({
          error: 'DUPLICATE_EMAIL',
          message: 'A customer with this email already exists',
        });
        return;
      }
    }

    // Update customer
    customer.update({ name, email, address, phoneNumber });

    // Save to database
    const updatedCustomer = await customerRepository().save(customer);

    res.json(updatedCustomer.toJSON());
  } catch (error: any) {
    console.error('Update customer error:', error);

    if (error.message.includes('INVALID_') || error.message === 'CANNOT_UPDATE_DELETED_CUSTOMER') {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.message,
      });
      return;
    }

    if (error.message === 'DUPLICATE_EMAIL') {
      res.status(409).json({
        error: 'DUPLICATE_EMAIL',
        message: 'A customer with this email already exists',
      });
      return;
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

