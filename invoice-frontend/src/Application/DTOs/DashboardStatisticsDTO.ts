export interface RecentActivityItem {
  id: string;
  customerName: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  timestamp: string; // ISO string from API
  type: 'invoice' | 'payment';
}

export interface DashboardStatisticsDTO {
  totalOutstanding: number;
  paidThisMonth: number;
  pendingCount: number;
  totalPaid: number;
  totalPending: number;
  totalInvoices: number;
  totalRevenue: number;
  overdueCount: number;
  totalOverdue: number;
  recentActivity: RecentActivityItem[];
}

