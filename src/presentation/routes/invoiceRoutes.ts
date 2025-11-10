import { Router } from 'express';
import { DependencyContainer } from 'tsyringe';
import { CreateInvoiceCommandHandler } from '../../application/commands/invoices/CreateInvoice/CreateInvoiceCommandHandler';
import { UpdateInvoiceCommandHandler } from '../../application/commands/invoices/UpdateInvoice/UpdateInvoiceCommandHandler';
import { DeleteInvoiceCommandHandler } from '../../application/commands/invoices/DeleteInvoice/DeleteInvoiceCommandHandler';
import { MarkInvoiceAsSentCommandHandler } from '../../application/commands/invoices/MarkInvoiceAsSent/MarkInvoiceAsSentCommandHandler';
import { AddLineItemCommandHandler } from '../../application/commands/invoices/AddLineItem/AddLineItemCommandHandler';
import { UpdateLineItemCommandHandler } from '../../application/commands/invoices/UpdateLineItem/UpdateLineItemCommandHandler';
import { RemoveLineItemCommandHandler } from '../../application/commands/invoices/RemoveLineItem/RemoveLineItemCommandHandler';
import { GenerateInvoicePDFCommandHandler } from '../../application/commands/invoices/GenerateInvoicePDF/GenerateInvoicePDFCommandHandler';
import { GetInvoiceQueryHandler } from '../../application/queries/invoices/GetInvoice/GetInvoiceQueryHandler';
import { ListInvoicesQueryHandler } from '../../application/queries/invoices/ListInvoices/ListInvoicesQueryHandler';
import { DownloadInvoicePDFQueryHandler } from '../../application/queries/invoices/DownloadInvoicePDF/DownloadInvoicePDFQueryHandler';

export function createInvoiceRoutes(container: DependencyContainer): Router {
  const router = Router();
  
  // POST /invoices - Create new invoice
  router.post('/', async (req, res, next) => {
    try {
      console.log('POST /invoices - Request received:', req.body);
      const handler = container.resolve(CreateInvoiceCommandHandler);
      const invoiceId = await handler.handle({
        userId: req.user!.id,
        customerId: req.body.customerId,
        companyInfo: req.body.companyInfo,
        notes: req.body.notes,
        terms: req.body.terms,
        taxRate: req.body.taxRate,
        issueDate: new Date(req.body.issueDate),
        dueDate: new Date(req.body.dueDate),
      });
      console.log('Invoice created successfully, id:', invoiceId);
      
      // Return invoice object directly to match frontend expectations
      res.status(201).json({ id: invoiceId });
    } catch (error) {
      console.error('POST /invoices - Error:', error);
      next(error);
    }
  });
  
  // PUT /invoices/:id - Update invoice
  router.put('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(UpdateInvoiceCommandHandler);
      await handler.handle({
        invoiceId: req.params.id,
        userId: req.user!.id,
        notes: req.body.notes,
        terms: req.body.terms,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      });
      
      // Return success response directly
      res.json({ id: req.params.id });
    } catch (error) {
      next(error);
    }
  });
  
  // DELETE /invoices/:id - Soft delete invoice
  router.delete('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(DeleteInvoiceCommandHandler);
      await handler.handle({
        invoiceId: req.params.id,
        userId: req.user!.id,
      });
      
      // Return success response directly
      res.json({ id: req.params.id });
    } catch (error) {
      next(error);
    }
  });
  
  // POST /invoices/:id/mark-sent - Mark invoice as sent
  router.post('/:id/mark-sent', async (req, res, next) => {
    try {
      const handler = container.resolve(MarkInvoiceAsSentCommandHandler);
      await handler.handle({
        invoiceId: req.params.id,
        userId: req.user!.id,
      });
      
      // Return success response directly
      res.json({ id: req.params.id });
    } catch (error) {
      next(error);
    }
  });
  
  // POST /invoices/:id/line-items - Add line item
  router.post('/:id/line-items', async (req, res, next) => {
    try {
      console.log('POST /invoices/:id/line-items - Request:', req.params.id, req.body);
      const handler = container.resolve(AddLineItemCommandHandler);
      const lineItemId = await handler.handle({
        invoiceId: req.params.id,
        userId: req.user!.id,
        description: req.body.description,
        quantity: req.body.quantity,
        unitPrice: req.body.unitPrice,
      });
      console.log('Line item added successfully, id:', lineItemId);
      
      // Return line item id directly
      res.status(201).json({ id: lineItemId });
    } catch (error) {
      console.error('POST /invoices/:id/line-items - Error:', error);
      next(error);
    }
  });
  
  // PUT /invoices/:id/line-items/:lineItemId - Update line item
  router.put('/:id/line-items/:lineItemId', async (req, res, next) => {
    try {
      const handler = container.resolve(UpdateLineItemCommandHandler);
      await handler.handle({
        invoiceId: req.params.id,
        lineItemId: req.params.lineItemId,
        userId: req.user!.id,
        description: req.body.description,
        quantity: req.body.quantity,
        unitPrice: req.body.unitPrice,
      });
      
      // Return success response directly
      res.json({ id: req.params.lineItemId });
    } catch (error) {
      next(error);
    }
  });
  
  // DELETE /invoices/:id/line-items/:lineItemId - Remove line item
  router.delete('/:id/line-items/:lineItemId', async (req, res, next) => {
    try {
      const handler = container.resolve(RemoveLineItemCommandHandler);
      await handler.handle({
        invoiceId: req.params.id,
        lineItemId: req.params.lineItemId,
        userId: req.user!.id,
      });
      
      // Return success response directly
      res.json({ id: req.params.lineItemId });
    } catch (error) {
      next(error);
    }
  });
  
  // POST /invoices/:id/generate-pdf - Generate PDF
  router.post('/:id/generate-pdf', async (req, res, next) => {
    try {
      const handler = container.resolve(GenerateInvoicePDFCommandHandler);
      const pdfKey = await handler.handle({
        invoiceId: req.params.id,
        userId: req.user!.id,
      });
      
      // Return PDF key directly
      res.json({ pdfKey });
    } catch (error) {
      next(error);
    }
  });
  
  // GET /invoices/:id - Get single invoice with balance
  router.get('/:id', async (req, res, next) => {
    try {
      const handler = container.resolve(GetInvoiceQueryHandler);
      const invoice = await handler.handle({
        invoiceId: req.params.id,
        userId: req.user!.id,
      });
      
      // Return invoice directly (not wrapped) to match frontend expectations
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  });
  
  // GET /invoices - List all invoices with filters
  router.get('/', async (req, res, next) => {
    try {
      const handler = container.resolve(ListInvoicesQueryHandler);
      
      // Parse pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 25;
      
      const invoices = await handler.handle({
        userId: req.user!.id,
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
      });
      
      // Return paginated format expected by frontend
      const totalCount = invoices.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = invoices.slice(startIndex, endIndex);
      
      res.json({
        items: paginatedItems,
        totalCount: totalCount,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages
      });
    } catch (error) {
      next(error);
    }
  });
  
  // GET /invoices/:id/pdf - Download PDF
  router.get('/:id/pdf', async (req, res, next) => {
    try {
      const handler = container.resolve(DownloadInvoicePDFQueryHandler);
      const pdfKey = await handler.handle({
        invoiceId: req.params.id,
        userId: req.user!.id,
      });
      
      res.json({
        success: true,
        data: { pdfKey }
      });
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}

