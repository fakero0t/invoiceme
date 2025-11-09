<template>
  <VModal
    :show="show"
    :title="modalTitle"
    size="md"
    @close="handleCancel"
  >
    <!-- Invoice Summary -->
    <VCard class="summary-card">
      <div class="summary-header">
        <svg class="summary-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
        </svg>
        <div class="summary-invoice">
          <span class="summary-label">Invoice</span>
          <span class="summary-value">{{ invoice?.invoiceNumber }}</span>
        </div>
      </div>

      <VDivider />

      <div class="summary-amounts">
        <div class="summary-row">
          <span class="summary-label">Invoice Total:</span>
          <span class="summary-value">${{ invoice?.total?.toFixed(2) }}</span>
        </div>
        <div class="summary-row balance-row">
          <span class="balance-label">Balance Due:</span>
          <span class="balance-amount">${{ currentBalance.toFixed(2) }}</span>
        </div>
      </div>
    </VCard>

    <!-- Error Display -->
    <VCard v-if="localError" class="error-card">
      <div class="error-content">
        <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ localError }}</span>
      </div>
    </VCard>

    <!-- Payment Form -->
    <form @submit.prevent="handleSubmit" class="payment-form">
      <!-- Amount Input - Prominent -->
      <div class="form-field amount-field">
        <label for="amount" class="form-label">
          Payment Amount <span class="required">*</span>
        </label>
        <div class="amount-input-wrapper">
          <span class="currency-symbol">$</span>
          <input
            id="amount"
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            :max="currentBalance"
            required
            class="amount-input"
            :class="{ 'amount-input-error': form.amount > currentBalance }"
            placeholder="0.00"
            autofocus
          />
        </div>
        <div v-if="form.amount > currentBalance" class="field-error">
          Amount cannot exceed balance due
        </div>
        <div v-if="form.amount > 0 && form.amount <= currentBalance" class="field-success">
          Remaining balance: ${{ (currentBalance - form.amount).toFixed(2) }}
        </div>
      </div>

      <!-- Quick Amount Buttons -->
      <div class="quick-amounts">
        <button
          type="button"
          v-for="percentage in [25, 50, 75, 100]"
          :key="percentage"
          @click="setAmount(percentage)"
          class="quick-amount-btn"
          :class="{ 'active': isQuickAmount(percentage) }"
        >
          {{ percentage === 100 ? 'Full' : `${percentage}%` }}
        </button>
      </div>

      <VDivider />

      <!-- Payment Method -->
      <div class="form-field">
        <label for="paymentMethod" class="form-label">
          Payment Method <span class="required">*</span>
        </label>
        <div class="payment-methods">
          <button
            type="button"
            v-for="method in paymentMethods"
            :key="method.value"
            @click="form.paymentMethod = method.value"
            class="payment-method-btn"
            :class="{ 'active': form.paymentMethod === method.value }"
          >
            <component :is="method.icon" class="method-icon" />
            <span class="method-label">{{ method.label }}</span>
          </button>
        </div>
      </div>

      <!-- Payment Date -->
      <div class="form-field">
        <label for="paymentDate" class="form-label">
          Payment Date
        </label>
        <VInput
          id="paymentDate"
          v-model="form.paymentDate"
          type="date"
          :max="today"
        />
      </div>

      <!-- Reference -->
      <div class="form-field">
        <label for="reference" class="form-label">
          Reference Number
        </label>
        <VInput
          id="reference"
          v-model="form.reference"
          type="text"
          maxlength="255"
          placeholder="Check #, Transaction ID, etc."
        />
      </div>

      <!-- Notes -->
      <div class="form-field">
        <label for="notes" class="form-label">
          Notes
        </label>
        <VTextarea
          id="notes"
          v-model="form.notes"
          :rows="3"
          maxlength="1000"
          placeholder="Additional notes..."
        />
      </div>
    </form>

    <!-- Modal Actions -->
    <template #footer>
      <div class="modal-actions">
        <VButton
          variant="ghost"
          @click="handleCancel"
          :disabled="isSubmitting"
        >
          Cancel
        </VButton>
        <VButton
          variant="primary"
          :loading="isSubmitting"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          Record Payment
        </VButton>
      </div>
    </template>
  </VModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { usePaymentStore } from '../stores/payments';
import { VModal, VCard, VButton, VInput, VTextarea, VDivider } from '../shared/components';
import { useToast } from '../shared/composables';
import type { Invoice } from '../shared/api/invoices';

interface Props {
  show: boolean;
  invoice: Invoice | null;
  currentBalance: number;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const paymentStore = usePaymentStore();
const toast = useToast();
const isSubmitting = ref(false);
const localError = ref<string | null>(null);

const modalTitle = computed(() => {
  return `Record Payment - ${props.invoice?.invoiceNumber || ''}`;
});

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const form = reactive({
  amount: 0,
  paymentMethod: '' as 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer' | '',
  paymentDate: today.value,
  reference: '',
  notes: '',
});

const paymentMethods = [
  { value: 'Cash', label: 'Cash', icon: 'CashIcon' },
  { value: 'Check', label: 'Check', icon: 'CheckIcon' },
  { value: 'CreditCard', label: 'Card', icon: 'CreditCardIcon' },
  { value: 'BankTransfer', label: 'Transfer', icon: 'BankIcon' },
];

// Simple icon components
const CashIcon = () => `
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
  </svg>
`;

const CheckIcon = () => `
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z" />
    <path fill-rule="evenodd" d="M8 10a4 4 0 00-3.446 6.032l-1.261 1.26a1 1 0 101.414 1.415l1.261-1.261A4 4 0 108 10zm-2 4a2 2 0 114 0 2 2 0 01-4 0z" clip-rule="evenodd" />
  </svg>
`;

const CreditCardIcon = () => `
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
    <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
  </svg>
`;

const BankIcon = () => `
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd" />
  </svg>
`;

const isFormValid = computed(() => {
  return (
    form.amount > 0 &&
    form.amount <= props.currentBalance &&
    form.paymentMethod !== ''
  );
});

const setAmount = (percentage: number) => {
  form.amount = Number(((props.currentBalance * percentage) / 100).toFixed(2));
};

const isQuickAmount = (percentage: number): boolean => {
  const targetAmount = Number(((props.currentBalance * percentage) / 100).toFixed(2));
  return Math.abs(form.amount - targetAmount) < 0.01;
};

const handleSubmit = async () => {
  if (!props.invoice || !isFormValid.value) return;

  localError.value = null;
  isSubmitting.value = true;

  try {
    const result = await paymentStore.recordPayment(props.invoice.id, {
      amount: form.amount,
      paymentMethod: form.paymentMethod as 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer',
      paymentDate: form.paymentDate,
      reference: form.reference,
      notes: form.notes,
    });

    // Check if invoice is fully paid
    if (result.balance === 0) {
      toast.success('🎉 Invoice fully paid!');
    } else {
      toast.success('Payment recorded successfully');
    }

    resetForm();
    emit('success');
    emit('close');
  } catch (error: any) {
    localError.value = error.response?.data?.error || 'Failed to record payment';
    toast.error(localError.value);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  resetForm();
  localError.value = null;
  emit('close');
};

const resetForm = () => {
  form.amount = 0;
  form.paymentMethod = '';
  form.paymentDate = today.value;
  form.reference = '';
  form.notes = '';
};
</script>

<style scoped>
.summary-card {
  padding: var(--spacing-4);
  background: linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%);
  margin-bottom: var(--spacing-4);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.summary-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  color: var(--color-venmo-blue);
  flex-shrink: 0;
}

.summary-invoice {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.summary-label {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.summary-amounts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-row {
  padding: var(--spacing-3);
  background-color: var(--color-background-primary);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-2);
}

.balance-label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.balance-amount {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-venmo-blue);
}

.error-card {
  padding: var(--spacing-4);
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
  margin-bottom: var(--spacing-4);
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--color-error-dark);
}

.error-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  flex-shrink: 0;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
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

/* Amount Input - Prominent Design */
.amount-field {
  margin-bottom: var(--spacing-2);
}

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: var(--spacing-4);
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.amount-input {
  width: 100%;
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-4) calc(var(--spacing-4) + 24px);
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border-gray);
  border-radius: var(--radius-lg);
  background-color: var(--color-background-primary);
  transition: all var(--duration-fast) var(--ease-out);
}

.amount-input:focus {
  outline: none;
  border-color: var(--color-venmo-blue);
  box-shadow: 0 0 0 3px var(--color-venmo-blue-alpha);
}

.amount-input-error {
  border-color: var(--color-error);
}

.amount-input-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px var(--color-error-alpha);
}

.field-error {
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
  margin-top: var(--spacing-1);
}

.field-success {
  font-size: var(--font-size-body-sm);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-1);
}

/* Quick Amount Buttons */
.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-2);
}

.quick-amount-btn {
  padding: var(--spacing-2) var(--spacing-3);
  border: 2px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  background-color: var(--color-background-primary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.quick-amount-btn:hover {
  border-color: var(--color-venmo-blue);
  color: var(--color-venmo-blue);
  background-color: var(--color-venmo-blue-alpha);
}

.quick-amount-btn.active {
  border-color: var(--color-venmo-blue);
  background-color: var(--color-venmo-blue);
  color: white;
}

.quick-amount-btn:active {
  transform: scale(0.98);
}

/* Payment Methods */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);
}

.payment-method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border: 2px solid var(--color-border-gray);
  border-radius: var(--radius-lg);
  background-color: var(--color-background-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.payment-method-btn:hover {
  border-color: var(--color-venmo-blue);
  background-color: var(--color-venmo-blue-alpha);
}

.payment-method-btn.active {
  border-color: var(--color-venmo-blue);
  background-color: var(--color-venmo-blue);
  color: white;
}

.payment-method-btn:active {
  transform: scale(0.98);
}

.method-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.method-label {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
}

@media (max-width: 768px) {
  .quick-amounts {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-methods {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions :deep(.v-button) {
    width: 100%;
  }
}
</style>
