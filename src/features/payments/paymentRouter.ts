import { Router } from 'express';
import { recordPayment, getPayment, listPayments } from './paymentHandlers';
import { authMiddleware } from '../../shared/middleware/auth';

const paymentRouter = Router();

// All payment routes require authentication
paymentRouter.use(authMiddleware);

// Payment endpoints
paymentRouter.post('/invoices/:id/payments', recordPayment);
paymentRouter.get('/payments/:id', getPayment);
paymentRouter.get('/invoices/:invoiceId/payments', listPayments);

export default paymentRouter;
