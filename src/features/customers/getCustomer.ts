import { Request, Response } from 'express';
import { customerRepository } from '../../infrastructure/database/CustomerRepository';

/**
 * GET /api/v1/customers/:id
 * Get a customer by ID
 */
export const getCustomer = async (req: Request, res: Response): Promise<void> => {
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

    res.json(customer.toJSON());
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

