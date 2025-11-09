import axios from 'axios';
import { Invoice } from '../../domain/invoice/Invoice';
import { Customer } from '../../domain/customer/Customer';

/**
 * Service for generating PDF invoices using Invoice-Generator.com API
 */
export class InvoiceGeneratorService {
  /**
   * Generate PDF from invoice data
   */
  async generatePDF(invoice: Invoice, customer: Customer): Promise<Buffer> {
    const invoiceData = {
      from: invoice.companyInfo || 'No Company Info',
      to: this.formatCustomerAddress(customer),
      number: invoice.invoiceNumber.value,
      currency: 'usd',
      date: invoice.issueDate.toISOString().split('T')[0],
      due_date: invoice.dueDate.toISOString().split('T')[0],
      items: invoice.lineItems.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        unit_cost: item.unitPrice.value,
      })),
      fields: {
        tax: '%',
      },
      tax: invoice.taxRate,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
    };

    const response = await axios.post(
      'https://invoice-generator.com',
      invoiceData,
      {
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    return Buffer.from(response.data);
  }

  /**
   * Generate PDF with retry logic (3 attempts with exponential backoff)
   */
  async generatePDFWithRetry(
    invoice: Invoice,
    customer: Customer
  ): Promise<Buffer> {
    const maxAttempts = 3;
    const backoffMs = [1000, 2000, 4000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.generatePDF(invoice, customer);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `PDF generation failed (attempt ${attempt}/${maxAttempts})`,
          {
            invoiceId: invoice.id,
            error: errorMessage,
          }
        );

        if (attempt < maxAttempts) {
          await this.delay(backoffMs[attempt - 1]);
        } else {
          throw new Error('PDF_GENERATION_FAILED');
        }
      }
    }

    // TypeScript needs this, but it will never reach here
    throw new Error('PDF_GENERATION_FAILED');
  }

  /**
   * Format customer address for invoice
   */
  private formatCustomerAddress(customer: Customer): string {
    const street = customer.address?.street || 'N/A';
    const city = customer.address?.city || 'N/A';
    const state = customer.address?.state || 'N/A';
    const postalCode = customer.address?.postalCode || 'N/A';
    const country = customer.address?.country || 'N/A';

    return `${customer.name.value}\n${street}\n${city}, ${state} ${postalCode}\n${country}\n${customer.email.value}`;
  }

  /**
   * Delay helper for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

