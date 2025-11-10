import { inject, injectable } from 'tsyringe';
import { Pool, PoolClient } from 'pg';
import { IInvoiceRepository } from '../../domain/invoice/IInvoiceRepository';
import { Invoice } from '../../domain/invoice/Invoice';
import { LineItem } from '../../domain/invoice/LineItem';

@injectable()
export class PostgreSQLInvoiceRepository implements IInvoiceRepository {
  constructor(@inject('DatabasePool') private db: Pool) {}
  
  async save(invoice: Invoice, tx?: PoolClient): Promise<void> {
    const client = tx || await this.db.connect();
    const isOwnTransaction = !tx;
    
    try {
      if (isOwnTransaction) await client.query('BEGIN');
      
      // 1. Save invoice
      const invoiceQuery = `
        INSERT INTO invoices (
          id, invoice_number, user_id, customer_id, company_info, status, 
          subtotal, tax_rate, tax_amount, total, notes, terms, 
          issue_date, due_date, sent_date, paid_date, pdf_s3_keys, 
          deleted_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (id) DO UPDATE SET
          invoice_number = EXCLUDED.invoice_number,
          company_info = EXCLUDED.company_info,
          status = EXCLUDED.status,
          subtotal = EXCLUDED.subtotal,
          tax_rate = EXCLUDED.tax_rate,
          tax_amount = EXCLUDED.tax_amount,
          total = EXCLUDED.total,
          notes = EXCLUDED.notes,
          terms = EXCLUDED.terms,
          issue_date = EXCLUDED.issue_date,
          due_date = EXCLUDED.due_date,
          sent_date = EXCLUDED.sent_date,
          paid_date = EXCLUDED.paid_date,
          pdf_s3_keys = EXCLUDED.pdf_s3_keys,
          deleted_at = EXCLUDED.deleted_at,
          updated_at = EXCLUDED.updated_at
      `;
      
      await client.query(invoiceQuery, [
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
      ]);
      
      // 2. Delete existing line items
      await client.query(
        'DELETE FROM line_items WHERE invoice_id = $1',
        [invoice.id]
      );
      
      // 3. Insert current line items
      for (const item of invoice.lineItems) {
        const lineItemQuery = `
          INSERT INTO line_items (
            id, invoice_id, description, quantity, unit_price, amount, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await client.query(lineItemQuery, [
          item.id,
          item.invoiceId,
          item.description,
          item.quantity,
          item.unitPrice.value,
          item.amount.value,
          item.createdAt,
        ]);
      }
      
      if (isOwnTransaction) await client.query('COMMIT');
    } catch (error) {
      if (isOwnTransaction) await client.query('ROLLBACK');
      throw error;
    } finally {
      if (isOwnTransaction) client.release();
    }
  }
  
  async findById(id: string, userId: string, tx?: PoolClient): Promise<Invoice | null> {
    const client = tx || this.db;
    
    // Load invoice
    const invoiceQuery = `
      SELECT * FROM invoices
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    const invoiceResult = await client.query(invoiceQuery, [id, userId]);
    
    if (invoiceResult.rows.length === 0) {
      return null;
    }
    
    // Load line items
    const lineItemsQuery = `
      SELECT * FROM line_items
      WHERE invoice_id = $1
      ORDER BY created_at ASC
    `;
    
    const lineItemsResult = await client.query(lineItemsQuery, [id]);
    
    return this.mapRowToInvoice(invoiceResult.rows[0], lineItemsResult.rows);
  }
  
  async findAll(
    userId: string,
    filters?: { status?: string; search?: string },
    tx?: PoolClient
  ): Promise<Invoice[]> {
    const client = tx || this.db;
    
    let query = `
      SELECT i.* FROM invoices i
      WHERE i.user_id = $1 AND i.deleted_at IS NULL
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (filters?.status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    if (filters?.search) {
      query += ` AND (i.invoice_number ILIKE $${paramIndex} OR i.notes ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    const result = await client.query(query, params);
    
    // Load all line items for these invoices in ONE query (prevents N+1)
    const invoiceIds = result.rows.map(row => row.id);
    let lineItemsByInvoiceId: Map<string, any[]> = new Map();
    
    if (invoiceIds.length > 0) {
      const lineItemsQuery = `
        SELECT * FROM line_items
        WHERE invoice_id = ANY($1)
        ORDER BY invoice_id, created_at ASC
      `;
      const lineItemsResult = await client.query(lineItemsQuery, [invoiceIds]);
      
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
    for (const row of result.rows) {
      const lineItems = lineItemsByInvoiceId.get(row.id) || [];
      invoices.push(this.mapRowToInvoice(row, lineItems));
    }
    
    return invoices;
  }
  
  async delete(id: string, userId: string, tx?: PoolClient): Promise<void> {
    const client = tx || this.db;
    
    const query = `
      UPDATE invoices
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    await client.query(query, [id, userId]);
  }
  
  async generateInvoiceNumber(userId: string): Promise<string> {
    const query = `
      SELECT invoice_number FROM invoices
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await this.db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return 'INV-0001';
    }
    
    const lastNumber = result.rows[0].invoice_number;
    const match = lastNumber.match(/INV-(\d+)/);
    
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `INV-${nextNumber.toString().padStart(4, '0')}`;
    }
    
    return 'INV-0001';
  }
  
  private mapRowToInvoice(row: any, lineItemRows: any[]): Invoice {
    const lineItems = lineItemRows.map(li => 
      LineItem.create({
        id: li.id,
        invoiceId: li.invoice_id,
        description: li.description,
        quantity: li.quantity,
        unitPrice: parseFloat(li.unit_price),
        createdAt: li.created_at,
      })
    );
    
    return Invoice.create({
      id: row.id,
      invoiceNumber: row.invoice_number,
      userId: row.user_id,
      customerId: row.customer_id,
      companyInfo: row.company_info,
      status: row.status,
      lineItems: lineItems,
      subtotal: parseFloat(row.subtotal),
      taxRate: parseFloat(row.tax_rate),
      taxAmount: parseFloat(row.tax_amount),
      total: parseFloat(row.total),
      notes: row.notes,
      terms: row.terms,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      sentDate: row.sent_date,
      paidDate: row.paid_date,
      pdfS3Keys: row.pdf_s3_keys || [],
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}

