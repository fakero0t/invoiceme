import { Request, Response } from 'express';
import { Customer } from '../../domain/customer/Customer';
import { customerRepository } from '../../infrastructure/database/CustomerRepository';

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - address
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - postalCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: 123 Main St
 *                   city:
 *                     type: string
 *                     example: San Francisco
 *                   state:
 *                     type: string
 *                     example: CA
 *                   postalCode:
 *                     type: string
 *                     example: "94102"
 *                   country:
 *                     type: string
 *                     example: United States
 *               phoneNumber:
 *                 type: string
 *                 example: "+14155551234"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Customer with email already exists
 *       500:
 *         description: Server error
 */
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }

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

    // Check if email already exists for this user
    const existingCustomer = await customerRepository().findByEmail(email, req.user.id);
    if (existingCustomer) {
      res.status(409).json({
        error: 'DUPLICATE_EMAIL',
        message: 'A customer with this email already exists',
      });
      return;
    }

    // Create customer domain entity
    const customer = Customer.create({
      userId: req.user.id,
      name,
      email,
      address,
      phoneNumber,
    });

    // Save to database
    const savedCustomer = await customerRepository().save(customer);

    res.status(201).json(savedCustomer.toJSON());
  } catch (error: any) {
    console.error('Create customer error:', error);

    if (error.message.includes('INVALID_')) {
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

