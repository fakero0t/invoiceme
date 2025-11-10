import { Router } from 'express';
import { DependencyContainer } from 'tsyringe';
import { CreateCustomerCommandHandler } from '../../application/commands/customers/CreateCustomer/CreateCustomerCommandHandler';
import { UpdateCustomerCommandHandler } from '../../application/commands/customers/UpdateCustomer/UpdateCustomerCommandHandler';
import { DeleteCustomerCommandHandler } from '../../application/commands/customers/DeleteCustomer/DeleteCustomerCommandHandler';
import { GetCustomerQueryHandler } from '../../application/queries/customers/GetCustomer/GetCustomerQueryHandler';
import { ListCustomersQueryHandler } from '../../application/queries/customers/ListCustomers/ListCustomersQueryHandler';

export function createCustomerRoutes(container: DependencyContainer): Router {
  const router = Router();
  
  // POST /customers - Create new customer
  router.post('/', async (req, res, next) => {
    try {
      console.log('POST /customers - Request received, userId:', req.user?.id);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      const handler = container.resolve(CreateCustomerCommandHandler);
      console.log('Handler resolved successfully');
      const customerId = await handler.handle({
        userId: req.user!.id,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
      });
      console.log('Customer created, id:', customerId);
      
      // Return customer id directly
      res.status(201).json({ id: customerId });
    } catch (error) {
      console.error('POST /customers - Error caught:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      next(error);
    }
  });
  
  // PUT /customers/:id - Update customer
  router.put('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(UpdateCustomerCommandHandler);
      await handler.handle({
        customerId: req.params.id,
        userId: req.user!.id,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
      });
      
      // Return customer id directly
      res.json({ id: req.params.id });
    } catch (error) {
      next(error);
    }
  });
  
  // DELETE /customers/:id - Soft delete customer
  router.delete('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(DeleteCustomerCommandHandler);
      await handler.handle({
        customerId: req.params.id,
        userId: req.user!.id,
      });
      
      // Return customer id directly
      res.json({ id: req.params.id });
    } catch (error) {
      next(error);
    }
  });
  
  // GET /customers/:id - Get single customer
  router.get('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(GetCustomerQueryHandler);
      const customer = await handler.handle({
        customerId: req.params.id,
        userId: req.user!.id,
      });
      
      // Return customer directly (not wrapped) to match frontend expectations
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });
  
  // GET /customers - List all customers
  router.get('/', async (req, res, next) => {
    try {
      console.log('GET /customers - Request received, userId:', req.user?.id);
      const handler = container.resolve(ListCustomersQueryHandler);
      console.log('Handler resolved successfully');
      
      // Parse pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 25;
      
      const customers = await handler.handle({
        userId: req.user!.id,
      });
      console.log('Customers fetched, count:', customers.length);
      
      // Return paginated format expected by frontend
      const totalCount = customers.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = customers.slice(startIndex, endIndex);
      
      res.json({
        items: paginatedItems,
        totalCount: totalCount,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages
      });
    } catch (error) {
      console.error('GET /customers - Error caught:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      next(error);
    }
  });
  
  return router;
}

