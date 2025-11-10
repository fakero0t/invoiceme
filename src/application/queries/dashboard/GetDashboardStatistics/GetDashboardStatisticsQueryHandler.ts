import { inject, injectable } from 'tsyringe';
import { Pool } from 'pg';
import { GetDashboardStatisticsQuery } from './GetDashboardStatisticsQuery';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { IPaymentRepository } from '../../../../domain/payment/IPaymentRepository';
import { DashboardStatisticsDTO, RecentActivityItem } from '../../../dtos/DashboardStatisticsDTO';
// Money import removed - not needed

@injectable()
export class GetDashboardStatisticsQueryHandler {
  constructor(
    @inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository,
    @inject('IPaymentRepository') private paymentRepo: IPaymentRepository,
    @inject('DatabasePool') private db: Pool
  ) {}

  async handle(query: GetDashboardStatisticsQuery): Promise<DashboardStatisticsDTO> {
    const userId = query.userId;

    // Get all invoices for the user
    const allInvoices = await this.invoiceRepo.findAll(userId);
    const nonDeletedInvoices = allInvoices.filter(inv => !inv.deletedAt);

    // Calculate statistics using SQL for efficiency
    const stats = await this.calculateStatistics(userId, nonDeletedInvoices);
    
    // Build recent activity
    const recentActivity = await this.buildRecentActivity(userId);

    return {
      totalOutstanding: stats.totalOutstanding,
      paidThisMonth: stats.paidThisMonth,
      pendingCount: stats.pendingCount,
      totalPaid: stats.totalPaid,
      totalPending: stats.totalPending,
      totalInvoices: stats.totalInvoices,
      totalRevenue: stats.totalRevenue,
      overdueCount: stats.overdueCount,
      totalOverdue: stats.totalOverdue,
      recentActivity,
    };
  }

  private async calculateStatistics(userId: string, invoices: any[]): Promise<{
    totalOutstanding: number;
    paidThisMonth: number;
    pendingCount: number;
    totalPaid: number;
    totalPending: number;
    totalInvoices: number;
    totalRevenue: number;
    overdueCount: number;
    totalOverdue: number;
  }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate totalOutstanding: sum of (invoice.total - payments) for non-paid invoices
    let totalOutstanding = 0;
    const sentInvoices = invoices.filter(inv => inv.status === 'Sent');
    const overdueInvoices = invoices.filter(inv => {
      if (inv.status === 'Paid') return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < now;
    });

    for (const invoice of invoices) {
      if (invoice.status !== 'Paid') {
        const totalPayments = await this.paymentRepo.getTotalPayments(invoice.id);
        const outstanding = invoice.total.value - totalPayments;
        if (outstanding > 0) {
          totalOutstanding += outstanding;
        }
      }
    }

    // Calculate paidThisMonth: sum of payments in current month
    const paidThisMonthResult = await this.db.query(
      `SELECT COALESCE(SUM(p.amount), 0) as total
       FROM payments p
       INNER JOIN invoices i ON p.invoice_id = i.id
       WHERE i.user_id = $1 
       AND p.payment_date >= $2
       AND p.payment_date < $3`,
      [userId, currentMonthStart, now]
    );
    const paidThisMonth = parseFloat(paidThisMonthResult.rows[0].total);

    // Calculate pendingCount: count of invoices with status 'Sent'
    const pendingCount = sentInvoices.length;

    // Calculate totalPaid: sum of all payments
    const totalPaidResult = await this.db.query(
      `SELECT COALESCE(SUM(p.amount), 0) as total
       FROM payments p
       INNER JOIN invoices i ON p.invoice_id = i.id
       WHERE i.user_id = $1`,
      [userId]
    );
    const totalPaid = parseFloat(totalPaidResult.rows[0].total);

    // Calculate totalPending: sum of invoice totals for 'Sent' status
    const totalPending = sentInvoices.reduce((sum, inv) => sum + inv.total.value, 0);

    // Calculate totalInvoices: count of non-deleted invoices
    const totalInvoices = invoices.length;

    // Calculate totalRevenue: sum of all invoice totals
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total.value, 0);

    // Calculate overdueCount: count of overdue invoices
    const overdueCount = overdueInvoices.length;

    // Calculate totalOverdue: sum of outstanding amounts for overdue invoices
    let totalOverdue = 0;
    for (const invoice of overdueInvoices) {
      const totalPayments = await this.paymentRepo.getTotalPayments(invoice.id);
      const outstanding = invoice.total.value - totalPayments;
      if (outstanding > 0) {
        totalOverdue += outstanding;
      }
    }

    return {
      totalOutstanding,
      paidThisMonth,
      pendingCount,
      totalPaid,
      totalPending,
      totalInvoices,
      totalRevenue,
      overdueCount,
      totalOverdue,
    };
  }

  private async buildRecentActivity(userId: string): Promise<RecentActivityItem[]> {
    const now = new Date();

    // Get recent invoices (last 10)
    const recentInvoicesResult = await this.db.query(
      `SELECT i.id, i.invoice_number, i.status, i.total, i.due_date, i.sent_date, i.created_at, c.name as customer_name
       FROM invoices i
       INNER JOIN customers c ON i.customer_id = c.id
       WHERE i.user_id = $1 AND i.deleted_at IS NULL
       ORDER BY COALESCE(i.sent_date, i.created_at) DESC
       LIMIT 10`,
      [userId]
    );

    // Get recent payments (last 10)
    const recentPaymentsResult = await this.db.query(
      `SELECT p.id, p.amount, p.created_at, i.invoice_number, c.name as customer_name
       FROM payments p
       INNER JOIN invoices i ON p.invoice_id = i.id
       INNER JOIN customers c ON i.customer_id = c.id
       WHERE i.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [userId]
    );

    const activities: RecentActivityItem[] = [];

    // Map invoices to activities
    for (const row of recentInvoicesResult.rows) {
      const dueDate = row.due_date ? new Date(row.due_date) : null;
      let status: 'paid' | 'pending' | 'overdue' = 'pending';
      
      if (row.status === 'Paid') {
        status = 'paid';
      } else if (row.status === 'Sent' && dueDate && dueDate < now) {
        status = 'overdue';
      } else {
        status = 'pending';
      }

      activities.push({
        id: row.id,
        customerName: row.customer_name,
        description: `Invoice #${row.invoice_number} ${row.status === 'Sent' ? 'sent' : row.status === 'Paid' ? 'paid' : 'created'}`,
        amount: parseFloat(row.total),
        status,
        timestamp: (row.sent_date ? new Date(row.sent_date) : new Date(row.created_at)).toISOString(),
        type: 'invoice',
      });
    }

    // Map payments to activities
    for (const row of recentPaymentsResult.rows) {
      activities.push({
        id: row.id,
        customerName: row.customer_name,
        description: `Payment received for Invoice #${row.invoice_number}`,
        amount: parseFloat(row.amount),
        status: 'paid',
        timestamp: new Date(row.created_at).toISOString(),
        type: 'payment',
      });
    }

    // Sort by timestamp DESC and take first 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, 10);
  }
}

