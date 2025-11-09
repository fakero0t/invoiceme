import { Router } from 'express';
import { createCustomer } from './createCustomer';
import { getCustomer } from './getCustomer';
import { updateCustomer } from './updateCustomer';
import { deleteCustomer } from './deleteCustomer';
import { listCustomers } from './listCustomers';
import { authMiddleware } from '../../shared/middleware/auth';

const customerRouter = Router();

// All customer routes require authentication
customerRouter.use(authMiddleware);

// Customer CRUD operations
customerRouter.post('/', createCustomer);
customerRouter.get('/', listCustomers);
customerRouter.get('/:id', getCustomer);
customerRouter.put('/:id', updateCustomer);
customerRouter.delete('/:id', deleteCustomer);

export default customerRouter;

