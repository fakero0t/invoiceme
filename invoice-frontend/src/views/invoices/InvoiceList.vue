<template>
  <MainLayout
    :sidebar-items="sidebarItems"
    :bottom-nav-items="bottomNavItems"
  >
    <div class="invoice-list-page">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Invoices</h1>
        <VButton variant="primary" @click="goToCreate" class="create-btn">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Create Invoice
        </VButton>
    </div>

    <!-- Filters -->
      <VCard class="filters-card">
    <div class="filters-bar">
          <VTabs v-model="activeTab" :items="statusTabs" @change="handleTabChange" />
          
          <div class="search-bar">
            <VInput
              v-model="searchQuery"
              type="text"
              placeholder="Search invoices..."
              @input="handleSearch"
            >
              <template #icon-left>
                <svg class="icon-md" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </template>
              <template #icon-right v-if="searchQuery">
                <button @click="searchQuery = ''; handleSearch()" class="clear-btn">
                  <svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </template>
            </VInput>
          </div>
        </div>
      </VCard>

      <!-- Loading State -->
      <div v-if="invoiceStore.isLoading" class="loading-container">
        <VSkeleton type="card" :count="5" />
      </div>

      <!-- Invoice List - Mobile Cards -->
      <div v-else-if="invoiceStore.hasInvoices && isMobile" class="invoices-mobile">
        <VCard
          v-for="invoice in invoiceStore.invoices"
          :key="invoice.id"
          class="invoice-card"
          :class="getStatusBorderClass(invoice.status)"
        >
          <div class="invoice-card-header">
            <div class="invoice-header-left">
              <div class="invoice-number">{{ invoice.invoiceNumber }}</div>
              <div class="invoice-customer">{{ invoice.customerId }}</div>
            </div>
            <VBadge :variant="getStatusVariant(invoice.status)">
              {{ invoice.status }}
            </VBadge>
          </div>

          <VDivider />

          <div class="invoice-card-body">
            <div class="invoice-detail-row">
              <span class="detail-label">Issue Date</span>
              <span class="detail-value">{{ formatDate(invoice.issueDate) }}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="detail-label">Due Date</span>
              <span class="detail-value">{{ formatDate(invoice.dueDate) }}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="detail-label">Amount</span>
              <span class="detail-value amount">${{ invoice.total.toFixed(2) }}</span>
      </div>
    </div>

          <div class="invoice-card-actions">
            <VButton variant="ghost" size="sm" @click="goToEdit(invoice.id)">
              Edit
            </VButton>
            <VButton
              v-if="invoice.status === 'Draft'"
              variant="primary"
              size="sm"
              :loading="isMarkingAsSent === invoice.id"
              @click="handleMarkAsSent(invoice)"
            >
              Mark as Sent
            </VButton>
            <VButton
              v-if="invoice.status !== 'Draft'"
              variant="secondary"
              size="sm"
              @click="handleDownloadPDF(invoice.id)"
            >
              <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </VButton>
            <VDropdown v-if="invoice.status === 'Draft'" align="right">
              <template #trigger>
                <VButton variant="ghost" size="sm">
                  <svg class="icon-md" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </VButton>
              </template>
              <VMenu :items="getInvoiceMenuItems(invoice)" />
            </VDropdown>
    </div>
        </VCard>
    </div>

      <!-- Invoice List - Desktop Table -->
      <VCard v-else-if="invoiceStore.hasInvoices && !isMobile" class="table-card">
        <VTable
          :columns="tableColumns"
          :data="tableRows"
          :sortable="true"
          @sort="handleSort"
        >
          <template #cell-invoiceNumber="{ row }">
            <span class="invoice-number-cell">{{ row.invoiceNumber }}</span>
          </template>
          <template #cell-status="{ row }">
            <VBadge :variant="getStatusVariant(row.status)">
              {{ row.status }}
            </VBadge>
          </template>
          <template #cell-total="{ row }">
            <span class="amount-cell">${{ row.total.toFixed(2) }}</span>
          </template>
          <template #cell-actions="{ row }">
            <div class="table-actions">
              <VButton variant="ghost" size="sm" @click="goToEdit(row.id)">
                Edit
              </VButton>
              <VButton
                v-if="row.status === 'Draft'"
                variant="primary"
                size="sm"
                :loading="isMarkingAsSent === row.id"
                @click="handleMarkAsSent(row)"
              >
                Mark as Sent
              </VButton>
              <VButton
                v-if="row.status !== 'Draft'"
                variant="ghost"
                size="sm"
                @click="handleDownloadPDF(row.id)"
              >
                <svg class="icon-md" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </VButton>
              <VDropdown v-if="row.status === 'Draft'" align="right">
                <template #trigger>
                  <VButton variant="ghost" size="sm">
                    <svg class="icon-md" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </VButton>
                </template>
                <VMenu :items="getInvoiceMenuItems(row)" />
              </VDropdown>
        </div>
          </template>
        </VTable>

        <div class="pagination-container">
          <VPagination
            :current-page="invoiceStore.currentPage"
            :total-pages="invoiceStore.totalPages"
            :total-items="invoiceStore.totalCount"
            :page-size="invoiceStore.pageSize"
            @change="handlePageChange"
          />
        </div>
      </VCard>

    <!-- Empty State -->
      <VEmptyState
        v-else-if="!invoiceStore.isLoading"
        :title="searchQuery ? 'No invoices found' : 'No invoices yet'"
        :description="searchQuery ? 'Try adjusting your search or filters' : 'Create your first invoice to get started'"
        icon="document"
      >
        <template #action v-if="!searchQuery">
          <VButton variant="primary" @click="goToCreate">
            Create Your First Invoice
          </VButton>
        </template>
      </VEmptyState>

      <!-- Mobile FAB -->
      <button v-if="isMobile" @click="goToCreate" class="mobile-fab">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '../../stores/invoices';
import { MainLayout } from '../../shared/layouts';
import {
  VButton,
  VCard,
  VInput,
  VBadge,
  VTable,
  VPagination,
  VEmptyState,
  VTabs,
  VDivider,
  VDropdown,
  VMenu,
  VSkeleton,
} from '../../shared/components';
import { useToast, useBreakpoint } from '../../shared/composables';
import type { Invoice } from '../../shared/api/invoices';

const router = useRouter();
const invoiceStore = useInvoiceStore();
const toast = useToast();
const { isMobile } = useBreakpoint();

const sidebarItems = [
  { label: 'Dashboard', to: '/dashboard', icon: null },
  { label: 'Invoices', to: '/invoices', icon: null },
  { label: 'Customers', to: '/customers', icon: null },
];

const bottomNavItems = [
  { label: 'Home', to: '/dashboard', icon: null },
  { label: 'Invoices', to: '/invoices', icon: null },
  { label: 'Customers', to: '/customers', icon: null },
  { label: 'More', to: '/settings', icon: null },
];

const activeTab = ref('all');
const searchQuery = ref('');
const searchTimeout = ref<number | null>(null);
const isMarkingAsSent = ref<string | null>(null);

const statusTabs = [
  { id: 'all', label: 'All' },
  { id: 'Draft', label: 'Drafts' },
  { id: 'Sent', label: 'Sent' },
  { id: 'Paid', label: 'Paid' },
];

const tableColumns = [
  { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
  { key: 'customerId', label: 'Customer', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'issueDate', label: 'Issue Date', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true },
  { key: 'total', label: 'Amount', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
];

const tableRows = computed(() => {
  return invoiceStore.invoices.map(invoice => ({
    ...invoice,
    issueDate: formatDate(invoice.issueDate),
    dueDate: formatDate(invoice.dueDate),
  }));
});

onMounted(async () => {
  await invoiceStore.fetchInvoices();
});

const handleTabChange = async (tabId: string) => {
  const statusFilter = tabId === 'all' ? undefined : tabId;
  await invoiceStore.fetchInvoices(1, statusFilter, searchQuery.value || undefined);
};

const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = window.setTimeout(async () => {
    const statusFilter = activeTab.value === 'all' ? undefined : activeTab.value;
    await invoiceStore.fetchInvoices(1, statusFilter, searchQuery.value || undefined);
  }, 300);
};

const handleSort = (key: string, direction: 'asc' | 'desc') => {
  // Implement sorting logic if backend supports it
  console.log('Sort by', key, direction);
};

const handlePageChange = async (page: number) => {
  const statusFilter = activeTab.value === 'all' ? undefined : activeTab.value;
  await invoiceStore.fetchInvoices(page, statusFilter, searchQuery.value || undefined);
};

const goToCreate = () => {
  router.push('/invoices/new');
};

const goToEdit = (id: string) => {
  router.push(`/invoices/${id}/edit`);
};

const handleMarkAsSent = async (invoice: Invoice) => {
  isMarkingAsSent.value = invoice.id;
  try {
    await invoiceStore.markAsSent(invoice.id);
    toast.success('Invoice marked as sent successfully!');
  } catch (error) {
    toast.error('Failed to mark invoice as sent');
  } finally {
    isMarkingAsSent.value = null;
  }
};

const handleDownloadPDF = async (id: string) => {
  try {
    await invoiceStore.downloadPDF(id);
    toast.success('PDF downloaded successfully');
  } catch (error) {
    toast.error('Failed to download PDF');
  }
};

const handleDelete = async (invoice: Invoice) => {
  try {
    await invoiceStore.deleteInvoice(invoice.id);
    toast.success(`Invoice ${invoice.invoiceNumber} deleted`);
  } catch (error) {
    toast.error('Failed to delete invoice');
  }
};

const getInvoiceMenuItems = (invoice: Invoice) => [
  {
    label: 'Delete',
    icon: null,
    onClick: () => handleDelete(invoice),
    variant: 'danger' as const,
  },
];

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Draft':
      return 'default';
    case 'Sent':
      return 'info';
    case 'Paid':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusBorderClass = (status: string): string => {
  switch (status) {
    case 'Draft':
      return 'border-draft';
    case 'Sent':
      return 'border-sent';
    case 'Paid':
      return 'border-paid';
    default:
      return 'border-draft';
  }
};
</script>

<style scoped>
.invoice-list-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.btn-icon {
  width: var(--icon-md);
  height: var(--icon-md);
}

.filters-card {
  padding: var(--spacing-4);
}

.filters-bar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.search-bar {
  width: 100%;
  max-width: 400px;
}

.clear-btn {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  transition: color var(--duration-fast) var(--ease-out);
}

.clear-btn:hover {
  color: var(--color-text-secondary);
}

.icon-sm {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.icon-md {
  width: var(--icon-md);
  height: var(--icon-md);
}

/* Mobile Cards */
.invoices-mobile {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.invoice-card {
  padding: var(--spacing-4);
  border-left: 4px solid transparent;
  transition: all var(--duration-fast) var(--ease-out);
}

.border-draft {
  border-left-color: var(--color-text-tertiary);
}

.border-sent {
  border-left-color: var(--color-venmo-blue);
}

.border-paid {
  border-left-color: var(--color-success);
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}

.invoice-header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.invoice-number {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.invoice-customer {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}

.invoice-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin: var(--spacing-4) 0;
}

.invoice-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.detail-value.amount {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-venmo-blue);
}

.invoice-card-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
  flex-wrap: wrap;
}

/* Desktop Table */
.table-card {
  overflow: hidden;
}

.invoice-number-cell {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.amount-cell {
  font-weight: var(--font-weight-semibold);
  color: var(--color-venmo-blue);
}

.table-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.pagination-container {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border-gray);
  background-color: var(--color-background-secondary);
}

/* Mobile FAB */
.mobile-fab {
  position: fixed;
  bottom: calc(var(--spacing-6) + 60px); /* Above bottom nav */
  right: var(--spacing-4);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-venmo-blue) 0%, var(--color-venmo-light-blue) 100%);
  color: white;
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
  z-index: var(--z-index-fab);
}

.mobile-fab svg {
  width: 24px;
  height: 24px;
}

.mobile-fab:active {
  transform: scale(0.95);
}

.loading-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* Hide elements based on screen size */
@media (min-width: 769px) {
  .mobile-fab {
    display: none;
  }
  
  .create-btn {
    display: flex;
  }
}

@media (max-width: 768px) {
  .create-btn {
    display: none;
  }

  .page-title {
    font-size: var(--font-size-h2);
  }

  .search-bar {
    max-width: 100%;
  }
}
</style>
