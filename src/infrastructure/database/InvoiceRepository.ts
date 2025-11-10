import { Pool } from 'pg';
import { Invoice } from '../../domain/invoice/Invoice';
import { LineItem } from '../../domain/invoice/LineItem';
import { InvoiceNumber } from '../../domain/invoice/InvoiceNumber';
import { pool } from '../database';
import type { PagedResult } from './CustomerRepository';

/**
 * Invoice Repository
 * Handles persistence operations for Invoice entities
 */
export class InvoiceRepository {
  constructor(private db: Pool) {}

  /**
   * Generate next invoice number
   */
  async generateInvoiceNumber(): Promise<InvoiceNumber> {
    return InvoiceNumber.generate(this.db);
  }

  /**
   * Find invoice by ID with line items
   */
  async findById(id: string, userId: string): Promise<Invoice | null> {
    try {
      // Fetch invoice
      const invoiceResult = await this.db.query(
        'SELECT * FROM invoices WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
        [id, userId]
      );

      if (invoiceResult.rows.length === 0) {
        return null;
      }

      // Fetch line items
      const lineItemsResult = await this.db.query(
        'SELECT * FROM line_items WHERE invoice_id = $1 ORDER BY created_at ASC',
        [id]
      );

      return this.toDomain(invoiceResult.rows[0], lineItemsResult.rows);
    } catch (error) {
      console.error('Error finding invoice by ID:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Save invoice (insert or update) with line items
   */
  async save(invoice: Invoice): Promise<Invoice> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Upsert invoice
      await client.query(
        `INSERT INTO invoices (
          id, invoice_number, user_id, customer_id, company_info, status,
          subtotal, tax_rate, tax_amount, total, notes, terms,
          issue_date, due_date, sent_date, paid_date, pdf_s3_keys,
          deleted_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (id) DO UPDATE
        SET 
          customer_id = $4,
          company_info = $5,
          status = $6,
          subtotal = $7,
          tax_rate = $8,
          tax_amount = $9,
          total = $10,
          notes = $11,
          terms = $12,
          issue_date = $13,
          due_date = $14,
          sent_date = $15,
          paid_date = $16,
          pdf_s3_keys = $17,
          deleted_at = $18,
          updated_at = $20`,
        [
          invoice.id,
          invoice.invoiceNumber.value,
          invoice.userId,
          invoice.customerId,
          invoice.companyInfo,
          invoice.status,
          invoice.subtotal.value,
          invoice.taxRate,
          invoice.taxAmount.value,
          invoice.total.value,
          invoice.notes,
          invoice.terms,
          invoice.issueDate,
          invoice.dueDate,
          invoice.sentDate,
          invoice.paidDate,
          invoice.pdfS3Keys,
          invoice.deletedAt,
          invoice.createdAt,
          invoice.updatedAt,
        ]
      );

      // Delete existing line items
      await client.query('DELETE FROM line_items WHERE invoice_id = $1', [invoice.id]);

      // Insert new line items
      if (invoice.lineItems.length > 0) {
        const lineItemValues = invoice.lineItems
          .map(
            (_item, index) =>
              `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${
                index * 6 + 5
              }, $${index * 6 + 6})`
          )
          .join(', ');

        const lineItemParams = invoice.lineItems.flatMap((item) => [
          item.id,
          item.invoiceId,
          item.description,
          item.quantity,
          item.unitPrice.value,
          item.amount.value,
        ]);

        await client.query(
          `INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount)
           VALUES ${lineItemValues}`,
          lineItemParams
        );
      }

      await client.query('COMMIT');
      return invoice;
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error saving invoice:', error);
      throw new Error('DATABASE_ERROR');
    } finally {
      client.release();
    }
  }

  /**
   * List invoices with pagination and filters
   */
  async findAllByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 25,
    status?: string,
    searchTerm?: string
  ): Promise<PagedResult<Invoice>> {
    try {
      const validPage = Math.max(1, page);
      const validPageSize = Math.min(100, Math.max(1, pageSize));
      const offset = (validPage - 1) * validPageSize;

      // Build filters
      const filters: string[] = ['user_id = $1', 'deleted_at IS NULL'];
      const params: any[] = [userId];
      let paramIndex = 2;

      if (status) {
        filters.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (searchTerm) {
        filters.push(`invoice_number ILIKE $${paramIndex}`);
        params.push(`%${searchTerm}%`);
        paramIndex++;
      }

      const whereClause = filters.join(' AND ');

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM invoices WHERE ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].total, 10);

      // Get paginated results
      const dataQuery = `
        SELECT i.*
        FROM invoices i
        WHERE ${whereClause}
        ORDER BY i.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      const dataResult = await this.db.query(dataQuery, [
        ...params,
        validPageSize,
        offset,
      ]);

      // Load all line items for these invoices in ONE query (prevents N+1)
      const invoiceIds = dataResult.rows.map(row => row.id);
      let lineItemsByInvoiceId: Map<string, any[]> = new Map();
      
      if (invoiceIds.length > 0) {
        const lineItemsQuery = `
          SELECT * FROM line_items
          WHERE invoice_id = ANY($1)
          ORDER BY invoice_id, created_at ASC
        `;
        const lineItemsResult = await this.db.query(lineItemsQuery, [invoiceIds]);
        
        // Group line items by invoice_id
        for (const lineItem of lineItemsResult.rows) {
          if (!lineItemsByInvoiceId.has(lineItem.invoice_id)) {
            lineItemsByInvoiceId.set(lineItem.invoice_id, []);
          }
          lineItemsByInvoiceId.get(lineItem.invoice_id)!.push(lineItem);
        }
      }

      // Build invoices with their line items
      const invoices: Invoice[] = [];
      for (const row of dataResult.rows) {
        const lineItems = lineItemsByInvoiceId.get(row.id) || [];
        invoices.push(this.toDomain(row, lineItems));
      }

      const totalPages = Math.ceil(totalCount / validPageSize);

      return {
        items: invoices,
        totalCount,
        page: validPage,
        pageSize: validPageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error listing invoices:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Convert database rows to Invoice domain entity
   */
  private toDomain(invoiceRow: any, lineItemRows: any[]): Invoice {
    const lineItems = lineItemRows.map((row) =>
      LineItem.create({
        id: row.id,
        invoiceId: row.invoice_id,
        description: row.description,
        quantity: parseFloat(row.quantity),
        unitPrice: parseFloat(row.unit_price),
        createdAt: new Date(row.created_at),
      })
    );

    return Invoice.create({
      id: invoiceRow.id,
      invoiceNumber: invoiceRow.invoice_number,
      userId: invoiceRow.user_id,
      customerId: invoiceRow.customer_id,
      companyInfo: invoiceRow.company_info,
      status: invoiceRow.status,
      lineItems,
      subtotal: parseFloat(invoiceRow.subtotal),
      taxRate: parseFloat(invoiceRow.tax_rate),
      taxAmount: parseFloat(invoiceRow.tax_amount),
      total: parseFloat(invoiceRow.total),
      notes: invoiceRow.notes,
      terms: invoiceRow.terms,
      issueDate: new Date(invoiceRow.issue_date),
      dueDate: new Date(invoiceRow.due_date),
      sentDate: invoiceRow.sent_date ? new Date(invoiceRow.sent_date) : null,
      paidDate: invoiceRow.paid_date ? new Date(invoiceRow.paid_date) : null,
      pdfS3Keys: invoiceRow.pdf_s3_keys || [],
      deletedAt: invoiceRow.deleted_at ? new Date(invoiceRow.deleted_at) : null,
      createdAt: new Date(invoiceRow.created_at),
      updatedAt: new Date(invoiceRow.updated_at),
    });
  }
}

// Export lazy singleton instance
let invoiceRepositoryInstance: InvoiceRepository | null = null;
export const invoiceRepository = (): InvoiceRepository => {
  if (!invoiceRepositoryInstance) {
    invoiceRepositoryInstance = new InvoiceRepository(pool());
  }
  return invoiceRepositoryInstance;
};

