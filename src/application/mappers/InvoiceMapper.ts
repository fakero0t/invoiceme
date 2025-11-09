import { Invoice } from '../../domain/invoice/Invoice';
import { InvoiceDTO } from '../dtos/InvoiceDTO';
import { LineItemMapper } from './LineItemMapper';
import { Money } from '../../domain/shared/Money';

export class InvoiceMapper {
  static toDTO(invoice: Invoice, balance?: Money): InvoiceDTO {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber.value,
      userId: invoice.userId,
      customerId: invoice.customerId,
      companyInfo: invoice.companyInfo,
      status: invoice.status,
      lineItems: LineItemMapper.toDTOList(invoice.lineItems),
      subtotal: invoice.subtotal.value,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount.value,
      total: invoice.total.value,
      balance: balance ? balance.value : undefined,
      notes: invoice.notes,
      terms: invoice.terms,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      sentDate: invoice.sentDate ? invoice.sentDate.toISOString() : null,
      paidDate: invoice.paidDate ? invoice.paidDate.toISOString() : null,
      pdfS3Keys: invoice.pdfS3Keys,
      deletedAt: invoice.deletedAt ? invoice.deletedAt.toISOString() : null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }
  
  static toDTOList(invoices: Invoice[]): InvoiceDTO[] {
    return invoices.map(i => this.toDTO(i));
  }
}

