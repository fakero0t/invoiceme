import { Request, Response } from 'express';
import { Invoice } from '../../domain/invoice/Invoice';
import { LineItem } from '../../domain/invoice/LineItem';
import { invoiceRepository } from '../../infrastructure/database/InvoiceRepository';
import { customerRepository } from '../../infrastructure/database/CustomerRepository';
import { InvoiceGeneratorService } from '../../infrastructure/pdf/InvoiceGeneratorService';
import { S3Service } from '../../infrastructure/storage/S3Service';

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the customer
 *               companyInfo:
 *                 type: string
 *                 description: Your company information
 *                 example: "Acme Inc, 123 Business St, San Francisco, CA 94102"
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-09"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-09"
 *               taxRate:
 *                 type: number
 *                 example: 7.5
 *                 description: Tax rate percentage
 *               notes:
 *                 type: string
 *                 example: "Thank you for your business"
 *               terms:
 *                 type: string
 *                 example: "Payment due within 30 days"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const { customerId, companyInfo, issueDate, dueDate, taxRate, notes, terms } = req.body;

    // Validate required fields
    if (!customerId) {
      res.status(400).json({ error: 'CUSTOMER_ID_REQUIRED' });
      return;
    }

    // Verify customer exists and belongs to user
    const customer = await customerRepository().findById(customerId, req.user.id);
    if (!customer) {
      res.status(404).json({ error: 'CUSTOMER_NOT_FOUND' });
      return;
    }

    // Set defaults
    const invoiceIssueDate = issueDate ? new Date(issueDate) : new Date();
    const invoiceDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Generate invoice number
    const invoiceNumber = await invoiceRepository().generateInvoiceNumber();

    // Create invoice
    const invoice = Invoice.create({
      invoiceNumber: invoiceNumber.value,
      userId: req.user.id,
      customerId,
      companyInfo: companyInfo || '',
      taxRate: taxRate ?? 0,
      notes: notes || '',
      terms: terms || '',
      issueDate: invoiceIssueDate,
      dueDate: invoiceDueDate,
    });

    // Save to database
    const savedInvoice = await invoiceRepository().save(invoice);

    res.status(201).json(savedInvoice.toJSON());
  } catch (error: any) {
    console.error('Create invoice error:', error);

    if (error.message.includes('INVALID_') || error.message.includes('_TOO_LONG')) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * GET /api/v1/invoices/:id
 * Get invoice by ID
 */
export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const invoice = await invoiceRepository().findById(req.params.id, req.user.id);

    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    res.json(invoice.toJSON());
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * PUT /api/v1/invoices/:id
 * Update invoice
 */
export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const invoice = await invoiceRepository().findById(req.params.id, req.user.id);

    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    const { notes, terms, dueDate } = req.body;

    invoice.update({
      notes,
      terms,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await invoiceRepository().save(invoice);

    res.json(invoice.toJSON());
  } catch (error: any) {
    console.error('Update invoice error:', error);

    if (error.message.includes('INVALID_') || error.message.includes('_TOO_LONG')) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * DELETE /api/v1/invoices/:id
 * Soft delete invoice (Draft only)
 */
export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const invoice = await invoiceRepository().findById(req.params.id, req.user.id);

    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    invoice.softDelete();
    await invoiceRepository().save(invoice);

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete invoice error:', error);

    if (error.message === 'CANNOT_DELETE_NON_DRAFT_INVOICE') {
      res.status(400).json({ error: 'CANNOT_DELETE_NON_DRAFT_INVOICE' });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: List all invoices
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Sent, Paid]
 *         description: Filter by invoice status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by invoice number or customer name
 *     responses:
 *       200:
 *         description: List of invoices
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
 *                         $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 100);
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await invoiceRepository().findAllByUserId(
      req.user.id,
      page,
      pageSize,
      status,
      search
    );

    const response = {
      items: result.items.map((invoice) => invoice.toJSON()),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };

    res.json(response);
  } catch (error) {
    console.error('List invoices error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * @swagger
 * /invoices/{id}/line-items:
 *   post:
 *     summary: Add line item to invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - quantity
 *               - unitPrice
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Web Development Services"
 *               quantity:
 *                 type: number
 *                 example: 10
 *                 minimum: 0.0001
 *               unitPrice:
 *                 type: number
 *                 example: 150.00
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Line item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invalid input or invoice not in Draft status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
export const addLineItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const invoice = await invoiceRepository().findById(req.params.id, req.user.id);

    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    const { description, quantity, unitPrice } = req.body;

    if (!description || quantity === undefined || unitPrice === undefined) {
      res.status(400).json({ error: 'MISSING_REQUIRED_FIELDS' });
      return;
    }

    const lineItem = LineItem.create({
      invoiceId: invoice.id,
      description,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
    });

    invoice.addLineItem(lineItem);
    await invoiceRepository().save(invoice);

    res.status(201).json(lineItem.toJSON());
  } catch (error: any) {
    console.error('Add line item error:', error);

    if (error.message === 'CANNOT_MODIFY_NON_DRAFT_INVOICE') {
      res.status(400).json({ error: 'CANNOT_MODIFY_NON_DRAFT_INVOICE' });
      return;
    }

    if (error.message === 'MAX_LINE_ITEMS_EXCEEDED') {
      res.status(400).json({ error: 'MAX_LINE_ITEMS_EXCEEDED' });
      return;
    }

    if (error.message.includes('INVALID_')) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * PUT /api/v1/invoices/:id/line-items/:lineItemId
 * Update line item
 */
export const updateLineItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const invoice = await invoiceRepository().findById(req.params.id, req.user.id);

    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    const { description, quantity, unitPrice } = req.body;

    invoice.updateLineItem(req.params.lineItemId, {
      description,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
    });

    await invoiceRepository().save(invoice);

    res.json({ message: 'Line item updated' });
  } catch (error: any) {
    console.error('Update line item error:', error);

    if (
      error.message === 'CANNOT_MODIFY_NON_DRAFT_INVOICE' ||
      error.message === 'LINE_ITEM_NOT_FOUND'
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * DELETE /api/v1/invoices/:id/line-items/:lineItemId
 * Remove line item
 */
export const removeLineItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const invoice = await invoiceRepository().findById(req.params.id, req.user.id);

    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    invoice.removeLineItem(req.params.lineItemId);
    await invoiceRepository().save(invoice);

    res.status(204).send();
  } catch (error: any) {
    console.error('Remove line item error:', error);

    if (
      error.message === 'CANNOT_MODIFY_NON_DRAFT_INVOICE' ||
      error.message === 'LINE_ITEM_NOT_FOUND'
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * @swagger
 * /invoices/{id}/mark-as-sent:
 *   post:
 *     summary: Mark invoice as sent
 *     description: Generates PDF, uploads to S3, and changes invoice status from Draft to Sent
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice marked as sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 invoiceId:
 *                   type: string
 *                   format: uuid
 *                 s3Key:
 *                   type: string
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invalid state (not Draft) or no line items
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice or customer not found
 *       500:
 *         description: Server error (PDF generation or S3 upload failed)
 */
export const markInvoiceAsSent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const { id } = req.params;

    // Fetch invoice
    const invoice = await invoiceRepository().findById(id, req.user.id);
    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    // Verify invoice is in Draft status
    if (invoice.status !== 'Draft') {
      res.status(400).json({ error: 'INVALID_STATE_TRANSITION' });
      return;
    }

    // Verify invoice has line items
    if (invoice.lineItems.length === 0) {
      res.status(400).json({ error: 'INVOICE_MUST_HAVE_LINE_ITEMS' });
      return;
    }

    // Fetch customer
    const customer = await customerRepository().findById(
      invoice.customerId,
      req.user.id
    );
    if (!customer) {
      res.status(404).json({ error: 'CUSTOMER_NOT_FOUND' });
      return;
    }

    // Initialize services
    const pdfService = new InvoiceGeneratorService();
    const s3Service = new S3Service();

    try {
      // Generate PDF
      const pdfBuffer = await pdfService.generatePDFWithRetry(
        invoice,
        customer
      );

      // Upload to S3
      const s3Key = await s3Service.uploadPDFWithRetry(pdfBuffer, invoice.id);

      // Update invoice
      invoice.addPdfS3Key(s3Key);
      invoice.markAsSent();

      // Save to database
      await invoiceRepository().save(invoice);

      res.status(200).json({
        success: true,
        invoiceId: invoice.id,
        s3Key,
        invoice: invoice.toJSON(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error marking invoice as sent:', errorMessage);

      if (
        errorMessage === 'PDF_GENERATION_FAILED' ||
        errorMessage === 'S3_UPLOAD_FAILED'
      ) {
        res.status(500).json({
          error: 'PDF generation failed. Please try again.',
        });
        return;
      }

      throw error;
    }
  } catch (error: unknown) {
    console.error('Error in markInvoiceAsSent:', error);

    if (
      error instanceof Error &&
      (error.message === 'INVALID_STATE_TRANSITION' ||
        error.message === 'INVOICE_MUST_HAVE_LINE_ITEMS')
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * GET /api/v1/invoices/:id/pdf
 * Get PDF download URL for invoice
 * Returns pre-signed S3 URL with 15-minute expiration
 */
export const downloadInvoicePDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const { id } = req.params;

    // Fetch invoice
    const invoice = await invoiceRepository().findById(id, req.user.id);
    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    // Verify invoice has PDFs
    if (!invoice.pdfS3Keys || invoice.pdfS3Keys.length === 0) {
      res.status(400).json({ error: 'NO_PDF_AVAILABLE' });
      return;
    }

    // Get latest PDF
    const latestS3Key = invoice.pdfS3Keys[invoice.pdfS3Keys.length - 1];

    // Generate pre-signed URL
    const s3Service = new S3Service();
    const downloadUrl = await s3Service.getDownloadUrl(latestS3Key);

    res.status(200).json({
      url: downloadUrl,
      expiresIn: 900, // 15 minutes
    });
  } catch (error: unknown) {
    console.error('Error getting PDF download URL:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

