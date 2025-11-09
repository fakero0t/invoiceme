<template>
  <div class="customer-form-page">
    <div class="form-header">
      <h1>{{ isEditMode ? 'Edit Customer' : 'Create Customer' }}</h1>
      <button @click="goBack" class="btn-secondary">Cancel</button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit" class="customer-form">
      <div class="form-section">
        <h2>Customer Information</h2>

        <div class="form-group">
          <label for="name">Name <span class="required">*</span></label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Enter customer name"
            required
            maxlength="255"
            :disabled="isSubmitting"
          />
          <small v-if="formData.name.length > 0" class="char-count">
            {{ formData.name.length }}/255 characters
          </small>
        </div>

        <div class="form-group">
          <label for="email">Email <span class="required">*</span></label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="customer@example.com"
            required
            maxlength="255"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label for="phoneNumber">Phone Number <span class="required">*</span></label>
          <input
            id="phoneNumber"
            v-model="formData.phoneNumber"
            type="tel"
            placeholder="+1-555-0100"
            required
            maxlength="50"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <div class="form-section">
        <h2>Address</h2>

        <div class="form-group">
          <label for="street">Street <span class="required">*</span></label>
          <input
            id="street"
            v-model="formData.address.street"
            type="text"
            placeholder="123 Main St"
            required
            maxlength="255"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">City <span class="required">*</span></label>
            <input
              id="city"
              v-model="formData.address.city"
              type="text"
              placeholder="San Francisco"
              required
              maxlength="100"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="state">State/Province <span class="required">*</span></label>
            <input
              id="state"
              v-model="formData.address.state"
              type="text"
              placeholder="CA"
              required
              maxlength="100"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="postalCode">Postal Code <span class="required">*</span></label>
            <input
              id="postalCode"
              v-model="formData.address.postalCode"
              type="text"
              placeholder="94102"
              required
              maxlength="20"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="country">Country <span class="required">*</span></label>
            <input
              id="country"
              v-model="formData.address.country"
              type="text"
              placeholder="USA"
              required
              maxlength="100"
              :disabled="isSubmitting"
            />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="btn-secondary" :disabled="isSubmitting">
          Cancel
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Create Customer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCustomerStore } from '../../stores/customers';
import type { CreateCustomerData } from '../../shared/api/customers';

const router = useRouter();
const route = useRoute();
const customerStore = useCustomerStore();

const formData = ref<CreateCustomerData>({
  name: '',
  email: '',
  phoneNumber: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
});

const isSubmitting = ref(false);
const errorMessage = ref('');

const isEditMode = computed(() => !!route.params.id);

onMounted(async () => {
  if (isEditMode.value) {
    try {
      const customer = await customerStore.fetchCustomer(route.params.id as string);
      formData.value = {
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: { ...customer.address },
      };
    } catch (error) {
      errorMessage.value = 'Failed to load customer';
      setTimeout(() => router.push('/customers'), 2000);
    }
  }
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    if (isEditMode.value) {
      await customerStore.updateCustomer(route.params.id as string, formData.value);
    } else {
      await customerStore.createCustomer(formData.value);
    }

    // Navigate back to list on success
    router.push('/customers');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to save customer';
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push('/customers');
};
</script>

<style scoped>
.customer-form-page {
  padding: 2rem;
  max-width: 800px;
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
}

.error-message {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 0.5rem;
  color: #c00;
  margin-bottom: 2rem;
}

.customer-form {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.char-count {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-primary:hover:not(:disabled),
.btn-secondary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

