import { Request, Response } from 'express';
import { Payment } from '../../domain/payment/Payment';
import { paymentRepository } from '../../infrastructure/database/PaymentRepository';
import { invoiceRepository } from '../../infrastructure/database/InvoiceRepository';
import { Money } from '../../domain/shared/Money';

/**
 * POST /api/v1/invoices/:id/payments
 * Record a payment for an invoice
 */
export const recordPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const { id: invoiceId } = req.params;
    const { amount, paymentMethod, paymentDate, reference, notes } = req.body;

    // Validate required fields
    if (!amount || !paymentMethod) {
      res.status(400).json({ error: 'AMOUNT_AND_METHOD_REQUIRED' });
      return;
    }

    // Fetch invoice
    const invoice = await invoiceRepository().findById(invoiceId, req.user.id);
    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    // Verify invoice is Sent or Paid (not Draft)
    if (invoice.status === 'Draft') {
      res.status(400).json({ error: 'INVALID_STATE_TRANSITION' });
      return;
    }

    // Calculate current balance
    const totalPayments = await paymentRepository().getTotalPayments(invoiceId);
    const currentBalance = invoice.total.subtract(new Money(totalPayments));

    // Validate payment amount
    const paymentAmount = new Money(amount);
    if (paymentAmount.value <= 0) {
      res.status(400).json({ error: 'INVALID_PAYMENT_AMOUNT' });
      return;
    }

    if (paymentAmount.value > currentBalance.value) {
      res.status(400).json({ error: 'PAYMENT_EXCEEDS_BALANCE' });
      return;
    }

    // Create payment
    const payment = Payment.create({
      invoiceId,
      amount: paymentAmount.value,
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      reference,
      notes,
    });

    // Save payment
    await paymentRepository().save(payment);

    // Calculate new balance
    const newBalance = currentBalance.subtract(paymentAmount);

    // If balance is 0, mark invoice as Paid
    if (newBalance.value === 0) {
      invoice.markAsPaid();
      await invoiceRepository().save(invoice);
    }

    res.status(201).json({
      payment: payment.toJSON(),
      balance: newBalance.toJSON(),
      invoiceStatus: invoice.status,
    });
  } catch (error: unknown) {
    console.error('Error recording payment:', error);

    if (
      error instanceof Error &&
      (error.message === 'INVALID_PAYMENT_AMOUNT' ||
        error.message === 'INVALID_PAYMENT_METHOD' ||
        error.message === 'PAYMENT_DATE_IN_FUTURE' ||
        error.message === 'REFERENCE_TOO_LONG' ||
        error.message === 'NOTES_TOO_LONG')
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * GET /api/v1/payments/:id
 * Get payment by ID
 */
export const getPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const { id } = req.params;

    // Fetch payment
    const payment = await paymentRepository().findById(id);
    if (!payment) {
      res.status(404).json({ error: 'PAYMENT_NOT_FOUND' });
      return;
    }

    // Verify user owns the invoice
    const invoice = await invoiceRepository().findById(
      payment.invoiceId,
      req.user.id
    );
    if (!invoice) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    res.status(200).json(payment.toJSON());
  } catch (error: unknown) {
    console.error('Error getting payment:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

/**
 * GET /api/v1/invoices/:invoiceId/payments
 * List all payments for an invoice
 */
export const listPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'AUTH_REQUIRED' });
      return;
    }

    const { invoiceId } = req.params;

    // Verify user owns the invoice
    const invoice = await invoiceRepository().findById(invoiceId, req.user.id);
    if (!invoice) {
      res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
      return;
    }

    // Fetch payments
    const payments = await paymentRepository().findByInvoiceId(invoiceId);

    // Calculate total payments and balance
    const totalPayments = payments.reduce(
      (sum, payment) => sum.add(payment.amount),
      Money.zero()
    );
    const balance = invoice.total.subtract(totalPayments);

    res.status(200).json({
      payments: payments.map((p) => p.toJSON()),
      totalPayments: totalPayments.toJSON(),
      invoiceTotal: invoice.total.toJSON(),
      balance: balance.toJSON(),
    });
  } catch (error: unknown) {
    console.error('Error listing payments:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};
