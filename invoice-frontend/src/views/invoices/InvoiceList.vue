<template>
  <div class="invoice-list">
    <div class="header">
      <h1>Invoices</h1>
      <button @click="goToCreate" class="btn-primary">Create Invoice</button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>Status</label>
        <select
          v-model="statusFilter"
          @change="handleFilterChange"
          class="filter-select"
        >
          <option value="">All</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
        </select>
      </div>
      <div class="search-group">
        <label>Search</label>
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search by invoice number or customer..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="invoiceStore.error" class="error-message">
      {{ invoiceStore.error }}
      <button @click="invoiceStore.clearError()" class="close-btn">×</button>
    </div>

    <!-- Loading State -->
    <div v-if="invoiceStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading invoices...</p>
    </div>

    <!-- Invoice List -->
    <div v-if="invoiceStore.hasInvoices" class="table-container">
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoiceStore.invoices" :key="invoice.id">
            <td class="invoice-number">{{ invoice.invoiceNumber }}</td>
            <td>{{ invoice.customerId }}</td>
            <td>
              <span :class="getStatusBadgeClass(invoice.status)" class="status-badge">
                {{ invoice.status }}
              </span>
            </td>
            <td>{{ formatDate(invoice.issueDate) }}</td>
            <td>{{ formatDate(invoice.dueDate) }}</td>
            <td class="amount-cell">${{ invoice.total.toFixed(2) }}</td>
            <td class="balance-cell">
              <span v-if="invoice.status === 'Draft'" class="balance-draft">-</span>
              <span v-else-if="invoice.status === 'Paid'" class="balance-paid">$0.00</span>
              <span v-else class="balance-due">View Details</span>
            </td>
            <td class="actions">
              <router-link :to="`/invoices/${invoice.id}/edit`" class="btn-small btn-edit">
                Edit
              </router-link>
              <button
                v-if="invoice.status === 'Draft'"
                @click="handleMarkAsSent(invoice)"
                :disabled="isMarkingAsSent === invoice.id"
                class="btn-small btn-success"
              >
                {{ isMarkingAsSent === invoice.id ? 'Sending...' : 'Mark as Sent' }}
              </button>
              <button
                v-if="invoice.status === 'Sent' || invoice.status === 'Paid'"
                @click="handleDownloadPDF(invoice.id)"
                class="btn-small btn-download"
              >
                Download PDF
              </button>
              <button
                v-if="invoice.status === 'Draft'"
                @click="handleDelete(invoice)"
                class="btn-small btn-delete"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <div class="page-info">
          Showing {{ (invoiceStore.currentPage - 1) * invoiceStore.pageSize + 1 }} to
          {{ Math.min(invoiceStore.currentPage * invoiceStore.pageSize, invoiceStore.totalCount) }} of
          {{ invoiceStore.totalCount }} results
        </div>
        <div class="pagination-buttons">
          <button
            @click="goToPage(invoiceStore.currentPage - 1)"
            :disabled="invoiceStore.currentPage === 1"
            class="btn-page"
          >
            Previous
          </button>
          <button
            @click="goToPage(invoiceStore.currentPage + 1)"
            :disabled="invoiceStore.currentPage >= invoiceStore.totalPages"
            class="btn-page"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!invoiceStore.isLoading" class="empty-state">
      <p>No invoices found</p>
      <p class="hint">Get started by creating your first invoice</p>
      <button @click="goToCreate" class="btn-primary">Create Invoice</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '../../stores/invoices';
import type { Invoice } from '../../shared/api/invoices';

const router = useRouter();
const invoiceStore = useInvoiceStore();
const statusFilter = ref('');
const searchQuery = ref('');
const searchTimeout = ref<number | null>(null);
const isMarkingAsSent = ref<string | null>(null);

onMounted(async () => {
  await invoiceStore.fetchInvoices();
});

const goToCreate = () => {
  router.push('/invoices/new');
};

const handleFilterChange = async () => {
  await invoiceStore.fetchInvoices(1, statusFilter.value || undefined);
};

const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = window.setTimeout(async () => {
    await invoiceStore.fetchInvoices(1, statusFilter.value || undefined, searchQuery.value || undefined);
  }, 300);
};

const goToPage = async (page: number) => {
  await invoiceStore.fetchInvoices(page, statusFilter.value || undefined, searchQuery.value || undefined);
};

const handleMarkAsSent = async (invoice: Invoice) => {
  if (!confirm('Generate PDF and mark invoice as sent?')) {
    return;
  }

  isMarkingAsSent.value = invoice.id;
  try {
    await invoiceStore.markAsSent(invoice.id);
    alert('Invoice marked as sent successfully!');
  } catch (error) {
    alert('Failed to mark invoice as sent. Please try again.');
  } finally {
    isMarkingAsSent.value = null;
  }
};

const handleDownloadPDF = async (id: string) => {
  try {
    await invoiceStore.downloadPDF(id);
  } catch (error) {
    alert('Failed to download PDF. Please try again.');
  }
};

const handleDelete = async (invoice: Invoice) => {
  if (!confirm(`Delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
    return;
  }

  try {
    await invoiceStore.deleteInvoice(invoice.id);
  } catch (error) {
    alert('Failed to delete invoice. Please try again.');
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Draft':
      return 'status-draft';
    case 'Sent':
      return 'status-sent';
    case 'Paid':
      return 'status-paid';
    default:
      return 'status-draft';
  }
};
</script>

<style scoped>
.invoice-list {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  min-width: 200px;
}

.search-group {
  flex: 1;
  max-width: 500px;
}

.filter-group label,
.search-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
}

.filter-select,
.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Error Message */
.error-message {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 0.5rem;
  color: #c00;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #c00;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  opacity: 0.7;
}

/* Loading State */
.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  color: #333;
  font-size: 0.875rem;
}

.invoice-table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  font-size: 0.9rem;
}

.invoice-number {
  font-weight: 600;
  color: #333;
}

.amount-cell {
  font-weight: 600;
  color: #333;
}

.balance-cell {
  font-weight: 500;
}

.balance-draft {
  color: #999;
}

.balance-paid {
  color: #28a745;
  font-weight: bold;
}

.balance-due {
  color: #667eea;
  font-weight: 600;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-draft {
  background: #e9ecef;
  color: #495057;
}

.status-sent {
  background: #cfe2ff;
  color: #084298;
}

.status-paid {
  background: #d1e7dd;
  color: #0a3622;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-success,
.btn-delete,
.btn-download,
.btn-edit,
.btn-small,
.btn-page {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: opacity 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-small {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.btn-edit {
  background: #28a745;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-download {
  background: #6f42c1;
  color: white;
}

.btn-primary:hover,
.btn-edit:hover,
.btn-success:hover:not(:disabled),
.btn-delete:hover,
.btn-download:hover {
  opacity: 0.85;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.page-info {
  font-size: 0.875rem;
  color: #666;
}

.pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.3s;
}

.btn-page:hover:not(:disabled) {
  background: #f8f9fa;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state .hint {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .invoice-list {
    padding: 1rem;
  }

  .filters-bar {
    flex-direction: column;
  }

  .search-group {
    max-width: 100%;
  }

  .invoice-table {
    font-size: 0.85rem;
  }

  .invoice-table th,
  .invoice-table td {
    padding: 0.75rem 0.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .page-info {
    text-align: center;
  }
}
</style>

