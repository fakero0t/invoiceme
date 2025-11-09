<template>
  <MainLayout
    :sidebar-items="sidebarItems"
    :bottom-nav-items="bottomNavItems"
  >
    <div class="customer-list">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Customers</h1>
        <VButton variant="primary" @click="goToCreate">
          <svg class="button-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Customer
        </VButton>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-bar">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <VInput
            v-model="searchQuery"
            placeholder="Search customers..."
            @input="onSearchInput"
            class="search-input"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-clear"
            @click="clearSearch"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <template v-if="customerStore.isLoading">
        <div class="loading-state">
          <VSkeleton variant="rect" height="60px" />
          <div class="customer-cards">
            <VSkeleton v-for="i in 6" :key="i" variant="rect" height="150px" />
          </div>
        </div>
      </template>

      <!-- Error State -->
      <VCard v-else-if="customerStore.error" class="error-card">
        <div class="error-content">
          <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ customerStore.error }}</span>
        </div>
      </VCard>

      <!-- Empty State -->
      <VEmptyState
        v-else-if="!customerStore.hasCustomers"
        heading="No customers yet"
        description="Add your first customer to get started"
        @action="goToCreate"
      >
        <template #icon>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </template>
        <template #default>
          <VButton variant="primary" @click="goToCreate">Add Customer</VButton>
        </template>
      </VEmptyState>

      <!-- Content -->
      <template v-else>
        <!-- Mobile: Customer Cards -->
        <div class="customer-cards mobile-only">
          <VCard
            v-for="customer in customerStore.customers"
            :key="customer.id"
            class="customer-card"
          >
            <div class="card-header">
              <VAvatar
                :name="customer.name"
                size="lg"
                class="customer-avatar"
              />
              <div class="customer-info">
                <h3 class="customer-name">{{ customer.name }}</h3>
                <p class="customer-email">{{ customer.email }}</p>
              </div>
            </div>
            
            <VDivider spacing="sm" />
            
            <div class="card-stats">
              <span class="stat-text">{{ customer.invoiceCount || 0 }} invoices</span>
              <span class="stat-divider">|</span>
              <span class="stat-text">Total: {{ formatCurrency(customer.totalAmount || 0) }}</span>
            </div>
            
            <div class="card-actions">
              <VButton variant="secondary" size="sm" @click="goToView(customer.id)">
                View
              </VButton>
              <VButton variant="secondary" size="sm" @click="goToEdit(customer.id)">
                Edit
              </VButton>
              <VDropdown :items="getMoreActions(customer)" placement="bottom">
                <template #trigger>
                  <VButton variant="ghost" size="sm">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </VButton>
                </template>
              </VDropdown>
            </div>
          </VCard>
        </div>

        <!-- Desktop: Table View -->
        <div class="desktop-only">
          <VTable
            :columns="tableColumns"
            :data="customerStore.customers"
            sortable
            hoverable
          >
            <template #cell-name="{ row }">
              <div class="name-cell">
                <VAvatar :name="row.name" size="sm" />
                <span>{{ row.name }}</span>
              </div>
            </template>
            
            <template #cell-invoices="{ row }">
              {{ row.invoiceCount || 0 }}
            </template>
            
            <template #cell-total="{ row }">
              {{ formatCurrency(row.totalAmount || 0) }}
            </template>
            
            <template #cell-actions="{ row }">
              <div class="table-actions">
                <button class="action-btn" @click="goToView(row.id)" aria-label="View customer">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button class="action-btn" @click="goToEdit(row.id)" aria-label="Edit customer">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="action-btn action-btn--danger" @click="confirmDelete(row)" aria-label="Delete customer">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </template>
          </VTable>
        </div>

        <!-- Pagination -->
        <div v-if="customerStore.totalPages > 1" class="pagination-section">
          <VPagination
            v-model:currentPage="currentPage"
            :total-pages="customerStore.totalPages"
            @change="goToPage"
          />
        </div>
      </template>

      <!-- Delete Confirmation Modal -->
      <VModal v-model="showDeleteModal" size="sm">
        <div class="modal-content">
          <h3 class="modal-title">Confirm Delete</h3>
          <p class="modal-text">
            Are you sure you want to delete <strong>{{ customerToDelete?.name }}</strong>?
            This action cannot be undone.
          </p>
          <div class="modal-actions">
            <VButton variant="ghost" @click="cancelDelete">Cancel</VButton>
            <VButton variant="primary" @click="performDelete" :loading="isDeleting">
              Delete
            </VButton>
          </div>
        </div>
      </VModal>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../../stores/customers';
import { MainLayout } from '../../shared/layouts';
import {
  VButton,
  VInput,
  VCard,
  VAvatar,
  VTable,
  VPagination,
  VEmptyState,
  VSkeleton,
  VModal,
  VDivider,
  VDropdown,
} from '../../shared/components';
import { useToast } from '../../shared/composables';
import type { Customer } from '../../shared/api/customers';

const router = useRouter();
const customerStore = useCustomerStore();
const toast = useToast();

const searchQuery = ref('');
const searchTimeout = ref<number | null>(null);
const showDeleteModal = ref(false);
const customerToDelete = ref<Customer | null>(null);
const isDeleting = ref(false);
const currentPage = ref(customerStore.currentPage || 1);

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

const tableColumns = [
  { key: 'name', label: 'Customer' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'total', label: 'Total' },
  { key: 'actions', label: 'Actions', sortable: false },
];

onMounted(async () => {
  await customerStore.fetchCustomers();
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getMoreActions(customer: Customer) {
  return [
    {
      label: 'View Invoices',
      onClick: () => router.push(`/invoices?customer=${customer.id}`),
    },
    { divider: true },
    {
      label: 'Delete',
      onClick: () => confirmDelete(customer),
    },
  ];
}

const onSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = window.setTimeout(() => {
    customerStore.fetchCustomers(1, searchQuery.value || undefined);
  }, 300);
};

const clearSearch = () => {
  searchQuery.value = '';
  customerStore.fetchCustomers(1);
};

const goToPage = async (page: number) => {
  currentPage.value = page;
  await customerStore.fetchCustomers(page, searchQuery.value || undefined);
};

const goToCreate = () => {
  router.push('/customers/new');
};

const goToView = (id: string) => {
  router.push(`/customers/${id}`);
};

const goToEdit = (id: string) => {
  router.push(`/customers/${id}/edit`);
};

const confirmDelete = (customer: Customer) => {
  customerToDelete.value = customer;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  customerToDelete.value = null;
};

const performDelete = async () => {
  if (!customerToDelete.value) return;

  isDeleting.value = true;
  try {
    await customerStore.deleteCustomer(customerToDelete.value.id);
    toast.success(`${customerToDelete.value.name} deleted successfully`);
    showDeleteModal.value = false;
    customerToDelete.value = null;
  } catch (error) {
    toast.error('Failed to delete customer');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
.customer-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.page-title {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.button-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  margin-right: var(--spacing-2);
}

.search-section {
  width: 100%;
}

.search-bar {
  position: relative;
  max-width: 600px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-text-tertiary);
  pointer-events: none;
  z-index: 1;
}

.search-input :deep(input) {
  padding-left: calc(var(--spacing-4) * 2 + var(--icon-md));
  padding-right: calc(var(--spacing-4) * 2 + var(--icon-md));
}

.search-clear {
  position: absolute;
  right: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color var(--duration-base) var(--ease-out);
  z-index: 1;
}

.search-clear:hover {
  color: var(--color-text-secondary);
}

.search-clear svg {
  width: var(--icon-md);
  height: var(--icon-md);
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.error-card {
  padding: var(--spacing-4);
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--color-error-dark);
}

.error-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  flex-shrink: 0;
}

/* Mobile Cards */
.customer-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.customer-card {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.customer-name {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.customer-email {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  margin: 0;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}

.stat-divider {
  color: var(--color-border-gray);
}

.card-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Table */
.name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.table-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background-color var(--duration-base) var(--ease-out),
              color var(--duration-base) var(--ease-out);
}

.action-btn:hover {
  background-color: var(--color-venmo-blue-50);
  color: var(--color-venmo-blue);
}

.action-btn--danger:hover {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.action-btn svg {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-4);
}

/* Modal */
.modal-content {
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.modal-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

/* Responsive */
.mobile-only {
  display: flex;
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }

  .search-bar {
    max-width: 400px;
  }
}
</style>
