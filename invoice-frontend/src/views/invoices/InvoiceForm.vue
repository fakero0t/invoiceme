<template>
  <MainLayout
    :sidebar-items="sidebarItems"
    :bottom-nav-items="bottomNavItems"
  >
  <div class="invoice-form-page">
      <!-- Breadcrumbs -->
      <VBreadcrumbs :items="breadcrumbs" class="breadcrumbs" />

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Edit Invoice' : 'Create Invoice' }}</h1>
        <VButton variant="ghost" @click="goBack" v-if="!isMobile">
          Cancel
        </VButton>
    </div>

      <!-- Loading State -->
      <div v-if="isLoading && isEditMode" class="loading-container">
        <VSkeleton type="card" :count="3" />
      </div>

      <!-- Invoice Content -->
      <div v-else>
      <!-- Invoice Details -->
      <VCard class="form-section-card">
      <h2 class="section-title">Invoice Details</h2>
      
      <div class="form-row-grid">
        <!-- Customer Selection -->
          <div class="form-field">
            <label for="customer" class="form-label">
            Customer <span class="required">*</span>
          </label>
            
            <!-- Empty State: No Customers -->
            <div v-if="customers.length === 0 && !isLoadingCustomers" class="empty-customer-state">
              <div class="empty-customer-content">
                <svg class="empty-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <div class="empty-text">
                  <p class="empty-title">No customers yet</p>
                  <p class="empty-description">Create your first customer to start invoicing</p>
                </div>
              </div>
              <VButton 
                variant="primary" 
                size="md" 
                @click="goToCreateCustomer"
              >
                <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Create Customer
              </VButton>
            </div>

            <!-- Normal Customer Select -->
            <div v-else class="customer-select-wrapper">
              <VSelect
                id="customer"
              v-model="form.customerId"
                :options="customerOptions"
              :disabled="isEditMode || isLoadingCustomers"
                :error="!!errors.customerId"
                :helper-text="errors.customerId"
              />
              <VButton 
                v-if="!isEditMode"
                variant="ghost" 
                size="sm" 
                @click="goToCreateCustomer"
                class="quick-add-btn"
              >
                <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add New
              </VButton>
            </div>
        </div>

        <!-- Company Info -->
          <div class="form-field">
            <label for="companyInfo" class="form-label">
              Company Info
            </label>
            <VInput
              id="companyInfo"
            v-model="form.companyInfo"
              placeholder="Your company name"
              :disabled="isLoading"
          />
        </div>

        <!-- Issue Date -->
          <div class="form-field">
            <label for="issueDate" class="form-label">
              Issue Date
            </label>
            <VInput
              id="issueDate"
            v-model="form.issueDate"
            type="date"
              :disabled="isEditMode || isLoading"
          />
        </div>

        <!-- Due Date -->
          <div class="form-field">
            <label for="dueDate" class="form-label">
              Due Date
            </label>
            <VInput
              id="dueDate"
            v-model="form.dueDate"
            type="date"
              :disabled="isLoading"
          />
        </div>

        <!-- Tax Rate -->
          <div class="form-field">
            <label for="taxRate" class="form-label">
              Tax Rate (%)
            </label>
            <VInput
              id="taxRate"
            v-model.number="form.taxRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
              :disabled="isEditMode || isLoading"
              placeholder="0.00"
          />
        </div>
      </div>

        <VDivider />

      <!-- Notes -->
        <div class="form-field">
          <label for="notes" class="form-label">
            Notes
          </label>
          <VTextarea
            id="notes"
          v-model="form.notes"
            :rows="3"
            placeholder="Additional notes or instructions..."
            :disabled="isLoading"
          />
      </div>

      <!-- Terms -->
        <div class="form-field">
          <label for="terms" class="form-label">
            Payment Terms
          </label>
          <VTextarea
            id="terms"
          v-model="form.terms"
            :rows="2"
            placeholder="Payment terms and conditions..."
            :disabled="isLoading"
          />
      </div>
      </VCard>

      <!-- Line Items -->
      <VCard class="form-section-card">
      <div class="section-header">
        <h2 class="section-title">Line Items</h2>
          <VButton
          v-if="!isEditMode || invoiceStore.currentInvoice?.status === 'Draft'"
            variant="primary"
            size="sm"
          @click="showAddLineItemForm = true"
            :disabled="showAddLineItemForm"
          >
            <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Item
          </VButton>
      </div>

      <!-- Add Line Item Form -->
        <VCard v-if="showAddLineItemForm" class="line-item-form">
        <h3 class="line-item-form-title">New Line Item</h3>
        <div class="line-item-grid">
            <div class="form-field">
              <label for="description" class="form-label">Description</label>
              <VInput
                id="description"
              v-model="newLineItem.description"
                placeholder="Service or product description"
            />
          </div>
            <div class="form-field">
              <label for="quantity" class="form-label">Quantity</label>
              <VInput
                id="quantity"
              v-model.number="newLineItem.quantity"
              type="number"
                step="0.01"
              min="0"
            />
          </div>
            <div class="form-field">
              <label for="unitPrice" class="form-label">Unit Price</label>
              <VInput
                id="unitPrice"
              v-model.number="newLineItem.unitPrice"
              type="number"
                step="0.01"
              min="0"
                placeholder="0.00"
            />
          </div>
        </div>
        <div class="form-actions-inline">
            <VButton variant="primary" size="sm" @click="handleAddLineItem">
              Save Item
            </VButton>
            <VButton variant="ghost" size="sm" @click="cancelAddLineItem">
              Cancel
            </VButton>
          </div>
        </VCard>

        <!-- Line Items List -->
        <div v-if="displayLineItems.length > 0" class="line-items-list">
          <!-- Mobile Cards -->
          <div v-if="isMobile" class="line-items-mobile">
            <VCard
              v-for="(item, index) in displayLineItems"
              :key="item.id || item.tempId"
              class="line-item-card"
            >
              <div class="line-item-header">
                <span class="item-number">#{{ index + 1 }}</span>
                <VButton
                  v-if="!isEditMode || invoiceStore.currentInvoice?.status === 'Draft'"
                  variant="ghost"
                  size="sm"
                  @click="handleRemoveLineItem(item.id || item.tempId)"
                >
                  <svg class="icon-md" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </VButton>
        </div>
              <div class="line-item-description">{{ item.description }}</div>
              <div class="line-item-details">
                <div class="detail-item">
                  <span class="detail-label">Qty:</span>
                  <span class="detail-value">{{ item.quantity }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Price:</span>
                  <span class="detail-value">${{ item.unitPrice.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total:</span>
                  <span class="detail-value amount">${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
                </div>
              </div>
            </VCard>
      </div>

          <!-- Desktop Table -->
          <VTable
            v-else
            :columns="lineItemColumns"
            :data="displayLineItems"
          >
            <template #cell-description="{ row }">
              <span class="description-cell">{{ row.description }}</span>
            </template>
            <template #cell-quantity="{ row }">
              <span>{{ row.quantity }}</span>
            </template>
            <template #cell-unitPrice="{ row }">
              <span>${{ row.unitPrice.toFixed(2) }}</span>
            </template>
            <template #cell-amount="{ row }">
              <span class="amount-cell">${{ (row.quantity * row.unitPrice).toFixed(2) }}</span>
            </template>
            <template #cell-actions="{ row }">
              <VButton
                  v-if="!isEditMode || invoiceStore.currentInvoice?.status === 'Draft'"
                variant="ghost"
                size="sm"
                @click="handleRemoveLineItem(row.id || row.tempId)"
                >
                  Remove
              </VButton>
            </template>
          </VTable>
      </div>

        <!-- Empty State -->
        <VEmptyState
          v-else
          title="No line items yet"
          description="Add items to this invoice"
          icon="document"
        >
          <template #action>
            <VButton variant="primary" @click="showAddLineItemForm = true">
              Add Your First Item
            </VButton>
          </template>
        </VEmptyState>

        <!-- Totals Section -->
      <div v-if="displayLineItems.length > 0" class="totals-section">
        <div class="totals-box">
          <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${{ calculatedSubtotal.toFixed(2) }}</span>
          </div>
          <div class="total-row">
              <span class="total-label">Tax ({{ form.taxRate }}%):</span>
              <span class="total-value">${{ calculatedTax.toFixed(2) }}</span>
          </div>
            <VDivider />
          <div class="total-row total-row-final">
              <span class="total-label">Total:</span>
              <span class="total-value">${{ calculatedTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      </VCard>

    <!-- Payment History (Edit Mode, Sent/Paid only) -->
      <VCard
        v-if="isEditMode && invoiceStore.currentInvoice && (invoiceStore.currentInvoice.status === 'Sent' || invoiceStore.currentInvoice.status === 'Paid')"
        class="form-section-card"
      >
      <div class="section-header">
          <div>
        <h2 class="section-title">Payment History</h2>
            <div class="balance-info">
              <span class="balance-label">Balance:</span>
              <span class="balance-amount" :class="paymentStore.balance > 0 ? 'balance-due' : 'balance-paid'">
            ${{ paymentStore.balance.toFixed(2) }}
              </span>
          </div>
        </div>
          <VButton
        v-if="paymentStore.balance > 0"
            variant="success"
        @click="showPaymentModal = true"
      >
        Record Payment
          </VButton>
        </div>

      <!-- Fully Paid Badge -->
        <VCard v-if="paymentStore.balance === 0" class="success-banner">
          <div class="success-content">
            <svg class="success-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <div class="success-title">Invoice Fully Paid</div>
              <div v-if="invoiceStore.currentInvoice.paidDate" class="success-date">
                Paid on {{ formatDate(invoiceStore.currentInvoice.paidDate) }}
      </div>
        </div>
      </div>
        </VCard>

        <!-- Payments List -->
        <div v-if="paymentStore.payments.length > 0" class="payments-list">
          <VTimeline :items="paymentTimelineItems" />
        </div>
        <VEmptyState
          v-else
          title="No payments yet"
          description="Record payments as they are received"
          icon="document"
        />
      </VCard>

    <!-- Form Actions -->
    <div class="form-actions">
        <VButton variant="ghost" @click="goBack">
        Cancel
        </VButton>
        <div class="actions-right">
          <VButton
        v-if="!isEditMode"
            variant="primary"
            :loading="isLoading"
        @click="handleSubmit"
          >
            Create Invoice
          </VButton>
          <VButton
        v-if="isEditMode"
            variant="primary"
            :loading="isLoading"
        @click="handleUpdate"
          >
            Update Invoice
          </VButton>
          <VButton
        v-if="isEditMode && invoiceStore.currentInvoice?.status === 'Draft'"
            variant="success"
            :loading="isLoading"
            :disabled="!invoiceStore.currentInvoice?.lineItems.length"
        @click="handleMarkAsSent"
          >
            Mark as Sent
          </VButton>
          <VButton
        v-if="isEditMode && (invoiceStore.currentInvoice?.status === 'Sent' || invoiceStore.currentInvoice?.status === 'Paid')"
            variant="secondary"
        @click="handleDownloadPDF"
      >
            <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        Download PDF
          </VButton>
    </div>
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
      </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useInvoiceStore } from '../../stores/invoices';
import { usePaymentStore } from '../../stores/payments';
import { useCustomerStore } from '../../stores/customers';
import { MainLayout } from '../../shared/layouts';
import {
  VButton,
  VCard,
  VInput,
  VSelect,
  VTextarea,
  VTable,
  VBreadcrumbs,
  VDivider,
  VEmptyState,
  VTimeline,
  VSkeleton,
} from '../../shared/components';
import { useToast, useBreakpoint } from '../../shared/composables';
import RecordPaymentModal from '../../components/RecordPaymentModal.vue';
import type { CreateInvoiceData, CreateLineItemData } from '../../shared/api/invoices';

const router = useRouter();
const route = useRoute();
const invoiceStore = useInvoiceStore();
const paymentStore = usePaymentStore();
const customerStore = useCustomerStore();
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

const isEditMode = ref(false);
const showAddLineItemForm = ref(false);
const showPaymentModal = ref(false);
const isLoadingCustomers = ref(false);
const isLoading = computed(() => invoiceStore.isLoading);
const customers = ref<any[]>([]);
const errors = reactive<Record<string, string>>({});

const breadcrumbs = computed(() => [
  { label: 'Invoices', to: '/invoices' },
  { label: isEditMode.value ? 'Edit Invoice' : 'Create Invoice' },
]);

const customerOptions = computed(() => {
  console.log('Computing customerOptions:', {
    isLoading: isLoadingCustomers.value,
    customersCount: customers.value.length,
    storeLoading: customerStore.isLoading,
    storeCustomersCount: customerStore.customers.length
  });
  
  if (isLoadingCustomers.value) {
    return [{ value: '', label: 'Loading customers...' }];
  }
  
  if (customers.value.length === 0) {
    return [{ value: '', label: 'No customers available' }];
  }
  
  return [
    { value: '', label: 'Select a customer' },
    ...customers.value.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))
  ];
});

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

const localLineItems = ref<Array<CreateLineItemData & { tempId: number }>>([]);
let nextTempId = 1;

const lineItemColumns = [
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'unitPrice', label: 'Unit Price' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: '' },
];

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

const paymentTimelineItems = computed(() => {
  return paymentStore.payments.map(payment => ({
    title: formatPaymentMethod(payment.paymentMethod),
    description: payment.notes || payment.reference || 'Payment received',
    date: formatDate(payment.paymentDate),
    amount: `$${payment.amount.toFixed(2)}`,
  }));
});

// Debug watch to see when customer data changes
watch([customers, isLoadingCustomers], ([newCustomers, newLoading]) => {
  console.log('Customers changed:', {
    count: newCustomers.length,
    isLoading: newLoading,
    customers: newCustomers
  });
}, { immediate: true });

// Debug watch for line items
watch([localLineItems, displayLineItems], ([local, display]) => {
  console.log('Line items changed:', {
    localCount: local.length,
    displayCount: display.length,
    localItems: local,
    displayItems: display
  });
}, { immediate: true, deep: true });

onMounted(async () => {
  // Fetch customers list
  console.log('InvoiceForm onMounted - starting customer fetch');
  isLoadingCustomers.value = true;
  
  // Use setTimeout to ensure the loading state is set before async operation
  await new Promise(resolve => setTimeout(resolve, 0));
  
  try {
    console.log('Fetching customers for invoice form...');
    const result = await customerStore.fetchCustomers();
    console.log('Customers fetched successfully:', result);
    
    if (result && result.items) {
      customers.value = result.items;
      console.log('Customers assigned:', customers.value.length, 'customers');
    } else {
      console.error('Invalid result structure:', result);
      customers.value = [];
    }
  } catch (error: any) {
    console.error('Failed to load customers:', {
      error,
      message: error?.message,
      response: error?.response?.data
    });
    customers.value = [];
  } finally {
    isLoadingCustomers.value = false;
    console.log('isLoadingCustomers set to false. Final state:', {
      isLoading: isLoadingCustomers.value,
      customersCount: customers.value.length
    });
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
      console.error('Failed to load invoice:', error);
      toast.error('Failed to load invoice');
      router.push('/invoices');
    }
  }
});

const handleSubmit = async () => {
  if (!form.customerId) {
    errors.customerId = 'Customer is required';
    toast.error('Please select a customer');
    return;
  }

  if (localLineItems.value.length === 0) {
    toast.error('Please add at least one line item');
    return;
  }

  try {
    const invoice = await invoiceStore.createInvoice(form);
    
    for (const item of localLineItems.value) {
      await invoiceStore.addLineItem(invoice.id, {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }
    
    toast.success('Invoice created successfully!');
    router.push(`/invoices/${invoice.id}/edit`);
  } catch (error) {
    toast.error('Failed to create invoice');
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
    toast.success('Invoice updated successfully!');
  } catch (error) {
    toast.error('Failed to update invoice');
  }
};

const handleAddLineItem = async () => {
  if (!newLineItem.description || newLineItem.quantity <= 0 || newLineItem.unitPrice < 0) {
    toast.error('Please fill in all line item fields with valid values');
    return;
  }

  if (isEditMode.value && invoiceStore.currentInvoice) {
    try {
      await invoiceStore.addLineItem(invoiceStore.currentInvoice.id, {
        description: newLineItem.description,
        quantity: newLineItem.quantity,
        unitPrice: newLineItem.unitPrice,
      });
      cancelAddLineItem();
      toast.success('Line item added successfully!');
    } catch (error) {
      toast.error('Failed to add line item');
    }
  } else {
    // Create a proper copy of values (not reactive references)
    const itemToAdd = {
      description: newLineItem.description,
      quantity: newLineItem.quantity,
      unitPrice: newLineItem.unitPrice,
      tempId: nextTempId++,
    };
    
    console.log('Adding line item:', itemToAdd);
    localLineItems.value.push(itemToAdd);
    console.log('Local line items after add:', localLineItems.value);
    console.log('Display line items length:', displayLineItems.value.length);
    
    cancelAddLineItem();
  }
};

const handleRemoveLineItem = async (itemId: string | number) => {
  if (isEditMode.value && invoiceStore.currentInvoice) {
    try {
      await invoiceStore.removeLineItem(invoiceStore.currentInvoice.id, itemId as string);
      toast.success('Line item removed successfully!');
    } catch (error) {
      toast.error('Failed to remove line item');
    }
  } else {
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

  try {
    await invoiceStore.markAsSent(invoiceStore.currentInvoice.id);
    toast.success('Invoice marked as sent successfully!');
  } catch (error) {
    toast.error('Failed to mark invoice as sent');
  }
};

const handleDownloadPDF = async () => {
  if (!invoiceStore.currentInvoice) return;

  try {
    await invoiceStore.downloadPDF(invoiceStore.currentInvoice.id);
    toast.success('PDF downloaded successfully');
  } catch (error) {
    toast.error('Failed to download PDF');
  }
};

const handlePaymentSuccess = async () => {
  if (!invoiceStore.currentInvoice) return;

  await invoiceStore.fetchInvoice(invoiceStore.currentInvoice.id);
  await paymentStore.fetchPayments(invoiceStore.currentInvoice.id);
  toast.success('Payment recorded successfully!');
};

const goBack = () => {
  router.push('/invoices');
};

const goToCreateCustomer = () => {
  router.push('/customers/new');
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.breadcrumbs {
  margin-bottom: var(--spacing-4);
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

.form-section-card {
  padding: var(--spacing-6);
}

.section-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-6) 0;
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-venmo-blue);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
}

.section-header .section-title {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.required {
  color: var(--color-error);
}

.helper-text {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

.error-helper {
  color: var(--color-error);
}

.helper-link {
  color: var(--color-venmo-blue);
  text-decoration: underline;
  font-weight: var(--font-weight-semibold);
}

.helper-link:hover {
  opacity: 0.8;
}

/* Empty Customer State */
.empty-customer-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%);
  border: 2px dashed var(--color-border-gray);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-customer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-venmo-blue);
  opacity: 0.5;
}

.empty-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.empty-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-description {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Customer Select with Quick Add */
.customer-select-wrapper {
  display: flex;
  gap: var(--spacing-2);
  align-items: flex-start;
}

.customer-select-wrapper :deep(.v-select) {
  flex: 1;
}

.quick-add-btn {
  flex-shrink: 0;
  margin-top: 0;
}

.quick-add-btn .btn-icon {
  margin-right: var(--spacing-1);
}

.btn-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.icon-md {
  width: var(--icon-md);
  height: var(--icon-md);
}

/* Line Items */
.line-item-form {
  padding: var(--spacing-4);
  background-color: var(--color-background-secondary);
  margin-bottom: var(--spacing-4);
}

.line-item-form-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-4) 0;
}

.line-item-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.form-actions-inline {
  display: flex;
  gap: var(--spacing-2);
}

.line-items-list {
  margin: var(--spacing-4) 0;
}

.line-items-mobile {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.line-item-card {
  padding: var(--spacing-4);
}

.line-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.item-number {
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
}

.line-item-description {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.line-item-details {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-2);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.detail-label {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.detail-value.amount {
  font-weight: var(--font-weight-semibold);
  color: var(--color-venmo-blue);
}

.description-cell {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.amount-cell {
  font-weight: var(--font-weight-semibold);
  color: var(--color-venmo-blue);
}

/* Totals */
.totals-section {
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-border-gray);
  display: flex;
  justify-content: flex-end;
}

.totals-box {
  min-width: 300px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-2) 0;
  font-size: var(--font-size-body);
}

.total-label {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.total-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.total-row-final {
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-4);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
}

.total-row-final .total-value {
  color: var(--color-venmo-blue);
}

/* Payment History */
.balance-info {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.balance-label {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}

.balance-amount {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
}

.balance-due {
  color: var(--color-error);
}

.balance-paid {
  color: var(--color-success);
}

.success-banner {
  padding: var(--spacing-4);
  background-color: var(--color-success-light);
  border: 1px solid var(--color-success);
  margin-bottom: var(--spacing-4);
}

.success-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.success-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  color: var(--color-success);
  flex-shrink: 0;
}

.success-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success-dark);
}

.success-date {
  font-size: var(--font-size-body-sm);
  color: var(--color-success-dark);
  margin-top: var(--spacing-1);
}

.payments-list {
  margin-top: var(--spacing-4);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-border-gray);
}

.actions-right {
  display: flex;
  gap: var(--spacing-2);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .page-title {
    font-size: var(--font-size-h2);
  }

  .form-row-grid {
    grid-template-columns: 1fr;
  }

  .customer-select-wrapper {
    flex-direction: column;
  }

  .quick-add-btn {
    width: 100%;
  }

  .line-item-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .totals-section {
    justify-content: stretch;
  }

  .totals-box {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .actions-right {
    flex-direction: column;
  }

  .actions-right :deep(.v-button) {
    width: 100%;
  }
}
</style>
