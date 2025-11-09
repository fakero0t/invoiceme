import { Router } from 'express';
import {
  createInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  listInvoices,
  addLineItem,
  updateLineItem,
  removeLineItem,
  markInvoiceAsSent,
  downloadInvoicePDF,
} from './invoiceHandlers';
import { authMiddleware } from '../../shared/middleware/auth';

const invoiceRouter = Router();

// All invoice routes require authentication
invoiceRouter.use(authMiddleware);

// Invoice CRUD operations
invoiceRouter.post('/', createInvoice);
invoiceRouter.get('/', listInvoices);
invoiceRouter.get('/:id', getInvoice);
invoiceRouter.put('/:id', updateInvoice);
invoiceRouter.delete('/:id', deleteInvoice);

// Line item operations
invoiceRouter.post('/:id/line-items', addLineItem);
invoiceRouter.put('/:id/line-items/:lineItemId', updateLineItem);
invoiceRouter.delete('/:id/line-items/:lineItemId', removeLineItem);

// Invoice actions
invoiceRouter.post('/:id/mark-as-sent', markInvoiceAsSent);
invoiceRouter.get('/:id/pdf', downloadInvoicePDF);

export default invoiceRouter;

