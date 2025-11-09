import { Request, Response } from 'express';
import { customerRepository } from '../../infrastructure/database/CustomerRepository';

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List all customers
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 100
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 100);
    const search = req.query.search as string | undefined;

    // Validate parameters
    if (page < 1) {
      res.status(400).json({
        error: 'INVALID_PAGE',
        message: 'Page must be greater than 0',
      });
      return;
    }

    if (pageSize < 1 || pageSize > 100) {
      res.status(400).json({
        error: 'INVALID_PAGE_SIZE',
        message: 'Page size must be between 1 and 100',
      });
      return;
    }

    // Fetch customers
    const result = await customerRepository().findAllByUserId(
      req.user.id,
      page,
      pageSize,
      search
    );

    // Convert customers to JSON
    const response = {
      items: result.items.map((customer) => customer.toJSON()),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };

    res.json(response);
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

