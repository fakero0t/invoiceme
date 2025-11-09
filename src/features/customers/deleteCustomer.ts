import { Request, Response } from 'express';
import { customerRepository } from '../../infrastructure/database/CustomerRepository';

/**
 * DELETE /api/v1/customers/:id
 * Soft delete a customer
 */
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    // Fetch customer
    const customer = await customerRepository().findById(id, req.user.id);

    if (!customer) {
      res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
      });
      return;
    }

    // Soft delete
    customer.softDelete();

    // Save to database
    await customerRepository().save(customer);

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete customer error:', error);

    if (error.message === 'ALREADY_DELETED') {
      res.status(400).json({
        error: 'ALREADY_DELETED',
        message: 'Customer is already deleted',
      });
      return;
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

