<template>
  <div class="customer-list">
    <div class="header">
      <h1>Customers</h1>
      <button @click="goToCreate" class="btn-primary">Create Customer</button>
    </div>

    <!-- Search bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="onSearchInput"
        type="text"
        placeholder="Search customers by name or email..."
        class="search-input"
      />
    </div>

    <!-- Loading state -->
    <div v-if="customerStore.isLoading" class="loading">Loading customers...</div>

    <!-- Error state -->
    <div v-if="customerStore.error" class="error-message">
      {{ customerStore.error }}
    </div>

    <!-- Empty state -->
    <div v-if="!customerStore.isLoading && !customerStore.hasCustomers" class="empty-state">
      <p>No customers found</p>
      <p class="hint">Get started by creating your first customer</p>
      <button @click="goToCreate" class="btn-primary">Create Customer</button>
    </div>

    <!-- Customer table -->
    <div v-if="customerStore.hasCustomers" class="table-container">
      <table class="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customerStore.customers" :key="customer.id">
            <td>{{ customer.name }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phoneNumber }}</td>
            <td>{{ customer.address.city }}, {{ customer.address.state }}</td>
            <td class="actions">
              <button @click="goToEdit(customer.id)" class="btn-small btn-edit">Edit</button>
              <button @click="confirmDelete(customer)" class="btn-small btn-delete">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button
          @click="goToPage(customerStore.currentPage - 1)"
          :disabled="customerStore.currentPage <= 1"
          class="btn-page"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ customerStore.currentPage }} of {{ customerStore.totalPages }} ({{
            customerStore.totalCount
          }}
          total)
        </span>
        <button
          @click="goToPage(customerStore.currentPage + 1)"
          :disabled="customerStore.currentPage >= customerStore.totalPages"
          class="btn-page"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete {{ customerToDelete?.name }}?</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-secondary">Cancel</button>
          <button @click="performDelete" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../../stores/customers';
import type { Customer } from '../../shared/api/customers';

const router = useRouter();
const customerStore = useCustomerStore();

const searchQuery = ref('');
const searchTimeout = ref<number | null>(null);
const showDeleteModal = ref(false);
const customerToDelete = ref<Customer | null>(null);

onMounted(async () => {
  await customerStore.fetchCustomers();
});

const onSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = window.setTimeout(() => {
    customerStore.fetchCustomers(1, searchQuery.value || undefined);
  }, 300);
};

const goToPage = async (page: number) => {
  await customerStore.fetchCustomers(page, searchQuery.value || undefined);
};

const goToCreate = () => {
  router.push('/customers/new');
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

  try {
    await customerStore.deleteCustomer(customerToDelete.value.id);
    showDeleteModal.value = false;
    customerToDelete.value = null;
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
</script>

<style scoped>
.customer-list {
  padding: 2rem;
  max-width: 1200px;
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
}

.search-bar {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.loading,
.error-message {
  padding: 2rem;
  text-align: center;
}

.error-message {
  color: #c00;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state .hint {
  color: #666;
  margin-bottom: 2rem;
}

.table-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}

.customer-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.customer-table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-edit,
.btn-delete,
.btn-small,
.btn-page {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.btn-edit {
  background: #4caf50;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 400px;
  width: 100%;
}

.modal h3 {
  margin: 0 0 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>

