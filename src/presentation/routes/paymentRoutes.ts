import { Router } from 'express';
import { DependencyContainer } from 'tsyringe';
import { RecordPaymentCommandHandler } from '../../application/commands/payments/RecordPayment/RecordPaymentCommandHandler';
import { GetPaymentQueryHandler } from '../../application/queries/payments/GetPayment/GetPaymentQueryHandler';
import { ListPaymentsQueryHandler } from '../../application/queries/payments/ListPayments/ListPaymentsQueryHandler';

export function createPaymentRoutes(container: DependencyContainer): Router {
  const router = Router();
  
  // POST /payments - Record new payment
  router.post('/', async (req, res, next) => {
    try {
      const handler = container.resolve(RecordPaymentCommandHandler);
      const paymentId = await handler.handle({
        invoiceId: req.body.invoiceId,
        userId: req.user!.id,
        amount: req.body.amount,
        paymentMethod: req.body.paymentMethod,
        paymentDate: new Date(req.body.paymentDate),
        reference: req.body.reference,
        notes: req.body.notes,
      });
      
      res.status(201).json({
        success: true,
        data: { id: paymentId }
      });
    } catch (error) {
      next(error);
    }
  });
  
  // GET /payments/:id - Get single payment
  router.get('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(GetPaymentQueryHandler);
      const payment = await handler.handle({
        paymentId: req.params.id,
        userId: req.user!.id,
      });
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  });
  
  // GET /payments - List all payments for an invoice
  router.get('/', async (req, res, next) => {
    try {
      if (!req.query.invoiceId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_INVOICE_ID',
            message: 'invoiceId query parameter is required'
          }
        });
      }
      
      const handler = container.resolve(ListPaymentsQueryHandler);
      const payments = await handler.handle({
        invoiceId: req.query.invoiceId as string,
        userId: req.user!.id,
      });
      
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}

