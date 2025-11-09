<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h2 class="text-2xl font-bold mb-4">Record Payment</h2>

      <!-- Invoice Summary -->
      <div class="bg-gray-50 p-4 rounded mb-4">
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Invoice:</span>
          <span class="font-medium">{{ invoice?.invoiceNumber }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Total:</span>
          <span class="font-medium">${{ invoice?.total?.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-lg font-bold">
          <span>Balance Due:</span>
          <span class="text-blue-600">${{ currentBalance.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="localError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ localError }}
      </div>

      <!-- Payment Form -->
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Amount <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            :max="currentBalance"
            required
            class="w-full border rounded px-3 py-2"
            :class="{ 'border-red-500': form.amount > currentBalance }"
          />
          <p v-if="form.amount > currentBalance" class="text-red-500 text-sm mt-1">
            Amount cannot exceed balance
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Payment Method <span class="text-red-500">*</span>
          </label>
          <select v-model="form.paymentMethod" required class="w-full border rounded px-3 py-2">
            <option value="">Select method</option>
            <option value="Cash">Cash</option>
            <option value="Check">Check</option>
            <option value="CreditCard">Credit Card</option>
            <option value="BankTransfer">Bank Transfer</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
          <input
            v-model="form.paymentDate"
            type="date"
            :max="today"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Reference</label>
          <input
            v-model="form.reference"
            type="text"
            maxlength="255"
            placeholder="Check number, transaction ID, etc."
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            maxlength="1000"
            placeholder="Additional notes..."
            class="w-full border rounded px-3 py-2"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="isSubmitting || form.amount > currentBalance || form.amount <= 0"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Recording...' : 'Record Payment' }}
          </button>
          <button
            type="button"
            @click="handleCancel"
            :disabled="isSubmitting"
            class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { usePaymentStore } from '../stores/payments';
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
const isSubmitting = ref(false);
const localError = ref<string | null>(null);

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

const handleSubmit = async () => {
  if (!props.invoice) return;

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
      alert('Invoice fully paid!');
    }

    emit('success');
    emit('close');
  } catch (error: any) {
    localError.value = error.response?.data?.error || 'Failed to record payment. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  localError.value = null;
  form.amount = 0;
  form.paymentMethod = '';
  form.paymentDate = today.value;
  form.reference = '';
  form.notes = '';
  emit('close');
};
</script>

