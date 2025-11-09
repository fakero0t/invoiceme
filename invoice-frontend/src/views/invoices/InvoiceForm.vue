<template>
  <div class="invoice-form-page">
    <div class="form-header">
      <h1>{{ isEditMode ? 'Edit Invoice' : 'Create Invoice' }}</h1>
      <router-link to="/invoices" class="btn-secondary">Cancel</router-link>
    </div>

    <!-- Error Display -->
    <div v-if="invoiceStore.error" class="error-message">
      {{ invoiceStore.error }}
      <button @click="invoiceStore.clearError()" class="close-btn">×</button>
    </div>

    <!-- Invoice Form -->
    <div class="form-section-card">
      <h2 class="section-title">Invoice Details</h2>
      
      <div class="form-row-grid">
        <!-- Customer Selection -->
        <div class="form-group">
          <label>
            Customer <span class="required">*</span>
          </label>
          <select
            v-model="form.customerId"
            :disabled="isEditMode || isLoadingCustomers"
            class="form-input"
          >
            <option value="">{{ isLoadingCustomers ? 'Loading customers...' : 'Select a customer' }}</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }} ({{ customer.email }})
            </option>
          </select>
          <p v-if="customers.length === 0 && !isLoadingCustomers" class="form-error">
            No customers found. <router-link to="/customers/new" class="error-link">Create one first</router-link>.
          </p>
        </div>

        <!-- Company Info -->
        <div class="form-group">
          <label>Company Info</label>
          <input
            v-model="form.companyInfo"
            type="text"
            placeholder="Your company name and address"
            class="form-input"
          />
        </div>

        <!-- Issue Date -->
        <div class="form-group">
          <label>Issue Date</label>
          <input
            v-model="form.issueDate"
            type="date"
            :disabled="isEditMode"
            class="form-input"
          />
        </div>

        <!-- Due Date -->
        <div class="form-group">
          <label>Due Date</label>
          <input
            v-model="form.dueDate"
            type="date"
            class="form-input"
          />
        </div>

        <!-- Tax Rate -->
        <div class="form-group">
          <label>Tax Rate (%)</label>
          <input
            v-model.number="form.taxRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            :disabled="isEditMode"
            class="form-input"
          />
        </div>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label>Notes</label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="Additional notes..."
          class="form-input"
        ></textarea>
      </div>

      <!-- Terms -->
      <div class="form-group">
        <label>Terms</label>
        <textarea
          v-model="form.terms"
          rows="2"
          placeholder="Payment terms..."
          class="form-input"
        ></textarea>
      </div>
    </div>

    <!-- Line Items (Both Create and Edit Mode) -->
    <div class="form-section-card">
      <div class="section-header">
        <h2 class="section-title">Line Items</h2>
        <button
          v-if="!isEditMode || invoiceStore.currentInvoice?.status === 'Draft'"
          @click="showAddLineItemForm = true"
          class="btn-small btn-primary"
        >
          Add Line Item
        </button>
      </div>

      <!-- Add Line Item Form -->
      <div v-if="showAddLineItemForm" class="line-item-form">
        <h3 class="line-item-form-title">New Line Item</h3>
        <div class="line-item-grid">
          <div class="form-group">
            <label>Description</label>
            <input
              v-model="newLineItem.description"
              type="text"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <input
              v-model.number="newLineItem.quantity"
              type="number"
              step="0.0001"
              min="0"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Unit Price</label>
            <input
              v-model.number="newLineItem.unitPrice"
              type="number"
              step="0.0001"
              min="0"
              class="form-input"
            />
          </div>
        </div>
        <div class="form-actions-inline">
          <button
            @click="handleAddLineItem"
            class="btn-small btn-success"
          >
            Save
          </button>
          <button
            @click="cancelAddLineItem"
            class="btn-small btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Line Items Table -->
      <div v-if="displayLineItems.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in displayLineItems" :key="item.id || item.tempId">
              <td>{{ item.description }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ item.unitPrice.toFixed(2) }}</td>
              <td class="amount-cell">${{ (item.quantity * item.unitPrice).toFixed(2) }}</td>
              <td>
                <button
                  v-if="!isEditMode || invoiceStore.currentInvoice?.status === 'Draft'"
                  @click="handleRemoveLineItem(item.id || item.tempId)"
                  class="btn-small btn-delete"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        No line items yet. Click "Add Line Item" to add one.
      </div>

      <!-- Invoice Totals -->
      <div v-if="displayLineItems.length > 0" class="totals-section">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ calculatedSubtotal.toFixed(2) }}</span>
          </div>
          <div class="total-row">
            <span>Tax ({{ form.taxRate }}%):</span>
            <span>${{ calculatedTax.toFixed(2) }}</span>
          </div>
          <div class="total-row total-row-final">
            <span>Total:</span>
            <span>${{ calculatedTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History (Edit Mode, Sent/Paid only) -->
    <div v-if="isEditMode && invoiceStore.currentInvoice && (invoiceStore.currentInvoice.status === 'Sent' || invoiceStore.currentInvoice.status === 'Paid')" class="form-section-card">
      <div class="section-header">
        <h2 class="section-title">Payment History</h2>
        <div class="balance-display">
          <div class="balance-label">Current Balance</div>
          <div class="balance-amount" :class="paymentStore.balance > 0 ? 'balance-due' : 'balance-paid'">
            ${{ paymentStore.balance.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- Record Payment Button -->
      <button
        v-if="paymentStore.balance > 0"
        @click="showPaymentModal = true"
        class="btn-success payment-btn"
      >
        Record Payment
      </button>

      <!-- Fully Paid Badge -->
      <div v-if="paymentStore.balance === 0" class="success-message">
        <span class="success-icon">✓</span> Invoice Fully Paid
        <span v-if="invoiceStore.currentInvoice.paidDate" class="paid-date">
          on {{ formatDate(invoiceStore.currentInvoice.paidDate) }}
        </span>
      </div>

      <!-- Payments Table -->
      <div v-if="paymentStore.payments.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in paymentStore.payments" :key="payment.id">
              <td>{{ formatDate(payment.paymentDate) }}</td>
              <td>{{ formatPaymentMethod(payment.paymentMethod) }}</td>
              <td class="amount-cell">${{ payment.amount.toFixed(2) }}</td>
              <td>{{ payment.reference || '-' }}</td>
              <td>{{ payment.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="payment-total">
          Total Payments: ${{ paymentStore.totalPayments.toFixed(2) }}
        </div>
      </div>
      <div v-else class="empty-state">
        No payments recorded yet
      </div>
    </div>

    <!-- Record Payment Modal -->
    <RecordPaymentModal
      :show="showPaymentModal"
      :invoice="invoiceStore.currentInvoice"
      :current-balance="paymentStore.balance"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />

    <!-- Form Actions -->
    <div class="form-actions">
      <router-link to="/invoices" class="btn-secondary">
        Cancel
      </router-link>
      <button
        v-if="!isEditMode"
        @click="handleSubmit"
        :disabled="invoiceStore.isLoading"
        class="btn-primary"
      >
        {{ invoiceStore.isLoading ? 'Creating...' : 'Create Invoice' }}
      </button>
      <button
        v-if="isEditMode"
        @click="handleUpdate"
        :disabled="invoiceStore.isLoading"
        class="btn-primary"
      >
        {{ invoiceStore.isLoading ? 'Updating...' : 'Update Invoice' }}
      </button>
      <button
        v-if="isEditMode && invoiceStore.currentInvoice?.status === 'Draft'"
        @click="handleMarkAsSent"
        :disabled="invoiceStore.isLoading || !invoiceStore.currentInvoice?.lineItems.length"
        class="btn-success"
      >
        {{ invoiceStore.isLoading ? 'Generating PDF...' : 'Mark as Sent' }}
      </button>
      <button
        v-if="isEditMode && (invoiceStore.currentInvoice?.status === 'Sent' || invoiceStore.currentInvoice?.status === 'Paid')"
        @click="handleDownloadPDF"
        class="btn-download"
      >
        Download PDF
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useInvoiceStore } from '../../stores/invoices';
import { usePaymentStore } from '../../stores/payments';
import { useCustomerStore } from '../../stores/customers';
import RecordPaymentModal from '../../components/RecordPaymentModal.vue';
import type { CreateInvoiceData, CreateLineItemData } from '../../shared/api/invoices';

const router = useRouter();
const route = useRoute();
const invoiceStore = useInvoiceStore();
const paymentStore = usePaymentStore();
const customerStore = useCustomerStore();

const isEditMode = ref(false);
const showAddLineItemForm = ref(false);
const showPaymentModal = ref(false);
const isLoadingCustomers = ref(false);
const customers = ref<any[]>([]);

const form = reactive<CreateInvoiceData>({
  customerId: '',
  companyInfo: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  taxRate: 0,
  notes: '',
  terms: '',
});

const newLineItem = reactive<CreateLineItemData>({
  description: '',
  quantity: 1,
  unitPrice: 0,
});

// Local line items for create mode (before invoice exists)
const localLineItems = ref<Array<CreateLineItemData & { tempId: number }>>([]);
let nextTempId = 1;

onMounted(async () => {
  // Fetch customers list
  isLoadingCustomers.value = true;
  try {
    const result = await customerStore.fetchCustomers();
    customers.value = result.items;
  } catch (error) {
    console.error('Failed to load customers:', error);
    customers.value = [];
  } finally {
    isLoadingCustomers.value = false;
  }

  // Load invoice if editing
  const id = route.params.id as string;
  if (id) {
    isEditMode.value = true;
    try {
      const invoice = await invoiceStore.fetchInvoice(id);
      form.customerId = invoice.customerId;
      form.companyInfo = invoice.companyInfo;
      form.issueDate = invoice.issueDate.split('T')[0];
      form.dueDate = invoice.dueDate.split('T')[0];
      form.taxRate = invoice.taxRate;
      form.notes = invoice.notes;
      form.terms = invoice.terms;

      // Fetch payments if invoice is Sent or Paid
      if (invoice.status === 'Sent' || invoice.status === 'Paid') {
        await paymentStore.fetchPayments(id);
      }
    } catch (error) {
      alert('Failed to load invoice');
      router.push('/invoices');
    }
  }
});

// Computed properties
const displayLineItems = computed(() => {
  if (isEditMode.value && invoiceStore.currentInvoice) {
    return invoiceStore.currentInvoice.lineItems;
  }
  return localLineItems.value;
});

const calculatedSubtotal = computed(() => {
  if (isEditMode.value && invoiceStore.currentInvoice) {
    return invoiceStore.currentInvoice.subtotal;
  }
  return displayLineItems.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
});

const calculatedTax = computed(() => {
  if (isEditMode.value && invoiceStore.currentInvoice) {
    return invoiceStore.currentInvoice.taxAmount;
  }
  return calculatedSubtotal.value * (form.taxRate / 100);
});

const calculatedTotal = computed(() => {
  if (isEditMode.value && invoiceStore.currentInvoice) {
    return invoiceStore.currentInvoice.total;
  }
  return calculatedSubtotal.value + calculatedTax.value;
});

const handleSubmit = async () => {
  if (!form.customerId) {
    alert('Customer ID is required');
    return;
  }

  if (localLineItems.value.length === 0) {
    alert('Please add at least one line item');
    return;
  }

  try {
    const invoice = await invoiceStore.createInvoice(form);
    
    // Add all line items to the newly created invoice
    for (const item of localLineItems.value) {
      await invoiceStore.addLineItem(invoice.id, {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }
    
    alert('Invoice created successfully!');
    router.push(`/invoices/${invoice.id}/edit`);
  } catch (error) {
    alert('Failed to create invoice');
  }
};

const handleUpdate = async () => {
  if (!invoiceStore.currentInvoice) return;

  try {
    await invoiceStore.updateInvoice(invoiceStore.currentInvoice.id, {
      notes: form.notes,
      terms: form.terms,
      dueDate: form.dueDate,
    });
    alert('Invoice updated successfully!');
  } catch (error) {
    alert('Failed to update invoice');
  }
};

const handleAddLineItem = async () => {
  if (!newLineItem.description || newLineItem.quantity <= 0 || newLineItem.unitPrice < 0) {
    alert('Please fill in all line item fields with valid values');
    return;
  }

  if (isEditMode.value && invoiceStore.currentInvoice) {
    // Edit mode: call API
    try {
      await invoiceStore.addLineItem(invoiceStore.currentInvoice.id, { ...newLineItem });
      cancelAddLineItem();
      alert('Line item added successfully!');
    } catch (error) {
      alert('Failed to add line item');
    }
  } else {
    // Create mode: add to local array
    localLineItems.value.push({
      ...newLineItem,
      tempId: nextTempId++,
    });
    cancelAddLineItem();
  }
};

const handleRemoveLineItem = async (itemId: string | number) => {
  if (!confirm('Remove this line item?')) return;

  if (isEditMode.value && invoiceStore.currentInvoice) {
    // Edit mode: call API
    try {
      await invoiceStore.removeLineItem(invoiceStore.currentInvoice.id, itemId as string);
      alert('Line item removed successfully!');
    } catch (error) {
      alert('Failed to remove line item');
    }
  } else {
    // Create mode: remove from local array
    localLineItems.value = localLineItems.value.filter(item => item.tempId !== itemId);
  }
};

const cancelAddLineItem = () => {
  showAddLineItemForm.value = false;
  newLineItem.description = '';
  newLineItem.quantity = 1;
  newLineItem.unitPrice = 0;
};

const handleMarkAsSent = async () => {
  if (!invoiceStore.currentInvoice) return;

  if (!confirm('Generate PDF and mark invoice as sent?')) return;

  try {
    await invoiceStore.markAsSent(invoiceStore.currentInvoice.id);
    alert('Invoice marked as sent successfully!');
  } catch (error) {
    alert('Failed to mark invoice as sent. Please try again.');
  }
};

const handleDownloadPDF = async () => {
  if (!invoiceStore.currentInvoice) return;

  try {
    await invoiceStore.downloadPDF(invoiceStore.currentInvoice.id);
  } catch (error) {
    alert('Failed to download PDF. Please try again.');
  }
};

const handlePaymentSuccess = async () => {
  if (!invoiceStore.currentInvoice) return;

  // Refresh invoice and payments
  await invoiceStore.fetchInvoice(invoiceStore.currentInvoice.id);
  await paymentStore.fetchPayments(invoiceStore.currentInvoice.id);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const formatPaymentMethod = (method: string): string => {
  const map: { [key: string]: string } = {
    'Cash': 'Cash',
    'Check': 'Check',
    'CreditCard': 'Credit Card',
    'BankTransfer': 'Bank Transfer',
  };
  return map[method] || method;
};
</script>

<style scoped>
.invoice-form-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.form-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

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

.form-section-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header .section-title {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #c00;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-error {
  margin-top: 0.5rem;
  color: #c00;
  font-size: 0.875rem;
}

.error-link {
  text-decoration: underline;
  color: #c00;
  font-weight: 600;
}

.error-link:hover {
  opacity: 0.8;
}

/* Line Items Form */
.line-item-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.line-item-form-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.line-item-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-actions-inline {
  display: flex;
  gap: 0.5rem;
}

/* Tables */
.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  color: #333;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.amount-cell {
  font-weight: 600;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  font-size: 1rem;
}

/* Totals Section */
.totals-section {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  border-top: 2px solid #dee2e6;
  padding-top: 1.5rem;
}

.totals-box {
  min-width: 300px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1rem;
}

.total-row-final {
  border-top: 2px solid #333;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.25rem;
  font-weight: bold;
}

/* Payment Section */
.balance-display {
  text-align: right;
}

.balance-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.balance-amount {
  font-size: 1.75rem;
  font-weight: bold;
}

.balance-due {
  color: #dc3545;
}

.balance-paid {
  color: #28a745;
}

.payment-btn {
  margin-bottom: 1.5rem;
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.success-icon {
  font-weight: bold;
  margin-right: 0.5rem;
}

.paid-date {
  margin-left: 0.5rem;
  font-weight: normal;
}

.payment-total {
  text-align: right;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  border-top: 2px solid #dee2e6;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-success,
.btn-delete,
.btn-download,
.btn-small {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6c757d;
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

.btn-primary:hover:not(:disabled),
.btn-secondary:hover:not(:disabled),
.btn-success:hover:not(:disabled),
.btn-delete:hover:not(:disabled),
.btn-download:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row-grid {
    grid-template-columns: 1fr;
  }

  .line-item-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .balance-display {
    text-align: left;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-success,
  .btn-download {
    width: 100%;
  }
}
</style>
