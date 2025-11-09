<template>
  <MainLayout
    :sidebar-items="sidebarItems"
    :bottom-nav-items="bottomNavItems"
  >
    <div class="customer-form-page">
      <!-- Breadcrumbs -->
      <VBreadcrumbs :items="breadcrumbs" class="breadcrumbs" />

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Edit Customer' : 'Add Customer' }}</h1>
      </div>

      <!-- Error Message -->
      <VCard v-if="errorMessage" class="error-card">
        <div class="error-content">
          <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </VCard>

      <!-- Form -->
      <VCard class="form-card">
        <form @submit.prevent="handleSubmit" class="customer-form">
          <!-- Customer Information Section -->
          <div class="form-section">
            <h2 class="section-title">Customer Information</h2>

            <div class="form-field">
              <label for="name" class="form-label">
                Business Name <span class="required">*</span>
              </label>
              <VInput
                id="name"
                v-model="formData.name"
                placeholder="Acme Corporation"
                :disabled="isSubmitting"
                :error="!!errors.name"
                :helper-text="errors.name"
                maxlength="255"
                @blur="validateField('name')"
              />
            </div>

            <div class="form-field">
              <label for="email" class="form-label">
                Email <span class="required">*</span>
              </label>
              <VInput
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="contact@acme.com"
                :disabled="isSubmitting"
                :error="!!errors.email"
                :success="formData.email && !errors.email && touched.email"
                :helper-text="errors.email"
                @blur="validateField('email')"
              />
            </div>

            <div class="form-field">
              <label for="phoneNumber" class="form-label">
                Phone Number <span class="required">*</span>
              </label>
              <VInput
                id="phoneNumber"
                v-model="formData.phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                :disabled="isSubmitting"
                :error="!!errors.phoneNumber"
                :helper-text="errors.phoneNumber || 'Include country code for international numbers'"
                @blur="validateField('phoneNumber')"
              />
            </div>
          </div>

          <VDivider />

          <!-- Address Section -->
          <div class="form-section">
            <h2 class="section-title">Address</h2>

            <div class="form-field">
              <label for="street" class="form-label">
                Street Address <span class="required">*</span>
              </label>
              <VInput
                id="street"
                v-model="formData.address.street"
                placeholder="123 Main Street"
                :disabled="isSubmitting"
                :error="!!errors.street"
                maxlength="255"
                @blur="validateField('street')"
              />
            </div>

            <div class="form-row">
              <div class="form-field">
                <label for="city" class="form-label">
                  City <span class="required">*</span>
                </label>
                <VInput
                  id="city"
                  v-model="formData.address.city"
                  placeholder="San Francisco"
                  :disabled="isSubmitting"
                  :error="!!errors.city"
                  maxlength="100"
                  @blur="validateField('city')"
                />
              </div>

              <div class="form-field">
                <label for="state" class="form-label">
                  State/Province <span class="required">*</span>
                </label>
                <VInput
                  id="state"
                  v-model="formData.address.state"
                  placeholder="CA"
                  :disabled="isSubmitting"
                  :error="!!errors.state"
                  maxlength="100"
                  @blur="validateField('state')"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label for="postalCode" class="form-label">
                  Postal Code <span class="required">*</span>
                </label>
                <VInput
                  id="postalCode"
                  v-model="formData.address.postalCode"
                  placeholder="94102"
                  :disabled="isSubmitting"
                  :error="!!errors.postalCode"
                  maxlength="20"
                  @blur="validateField('postalCode')"
                />
              </div>

              <div class="form-field">
                <label for="country" class="form-label">
                  Country <span class="required">*</span>
                </label>
                <VInput
                  id="country"
                  v-model="formData.address.country"
                  placeholder="United States"
                  :disabled="isSubmitting"
                  :error="!!errors.country"
                  maxlength="100"
                  @blur="validateField('country')"
                />
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <VButton variant="ghost" @click="goBack" :disabled="isSubmitting">
              Cancel
            </VButton>
            <VButton type="submit" variant="primary" :loading="isSubmitting">
              {{ isEditMode ? 'Update Customer' : 'Create Customer' }}
            </VButton>
          </div>
        </form>
      </VCard>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCustomerStore } from '../../stores/customers';
import { MainLayout } from '../../shared/layouts';
import { VCard, VInput, VButton, VBreadcrumbs, VDivider } from '../../shared/components';
import { useToast } from '../../shared/composables';
import type { CreateCustomerData } from '../../shared/api/customers';

const router = useRouter();
const route = useRoute();
const customerStore = useCustomerStore();
const toast = useToast();

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

const isEditMode = computed(() => !!route.params.id);

const breadcrumbs = computed(() => [
  { label: 'Customers', to: '/customers' },
  { label: isEditMode.value ? 'Edit Customer' : 'Add Customer' },
]);

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

const errors = reactive<Record<string, string>>({});
const touched = reactive<Record<string, boolean>>({});
const isSubmitting = ref(false);
const errorMessage = ref('');

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
      toast.error('Failed to load customer');
      setTimeout(() => router.push('/customers'), 2000);
    }
  }
});

function validateField(field: string) {
  touched[field] = true;
  
  switch (field) {
    case 'name':
      if (!formData.value.name.trim()) {
        errors.name = 'Business name is required';
      } else {
        delete errors.name;
      }
      break;
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.value.email.trim()) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(formData.value.email)) {
        errors.email = 'Please enter a valid email address';
      } else {
        delete errors.email;
      }
      break;
    case 'phoneNumber':
      if (!formData.value.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required';
      } else {
        delete errors.phoneNumber;
      }
      break;
    case 'street':
      if (!formData.value.address.street.trim()) {
        errors.street = 'Street address is required';
      } else {
        delete errors.street;
      }
      break;
    case 'city':
      if (!formData.value.address.city.trim()) {
        errors.city = 'City is required';
      } else {
        delete errors.city;
      }
      break;
    case 'state':
      if (!formData.value.address.state.trim()) {
        errors.state = 'State/Province is required';
      } else {
        delete errors.state;
      }
      break;
    case 'postalCode':
      if (!formData.value.address.postalCode.trim()) {
        errors.postalCode = 'Postal code is required';
      } else {
        delete errors.postalCode;
      }
      break;
    case 'country':
      if (!formData.value.address.country.trim()) {
        errors.country = 'Country is required';
      } else {
        delete errors.country;
      }
      break;
  }
}

function validateAllFields(): boolean {
  const fields = ['name', 'email', 'phoneNumber', 'street', 'city', 'state', 'postalCode', 'country'];
  fields.forEach(field => validateField(field));
  return Object.keys(errors).length === 0;
}

const handleSubmit = async () => {
  if (!validateAllFields()) {
    toast.error('Please fix the errors in the form');
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    if (isEditMode.value) {
      await customerStore.updateCustomer(route.params.id as string, formData.value);
      toast.success('Customer updated successfully');
    } else {
      await customerStore.createCustomer(formData.value);
      toast.success('Customer created successfully');
    }

    router.push('/customers');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to save customer';
    toast.error(errorMessage.value);
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
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: 800px;
  margin: 0 auto;
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

.form-card {
  padding: var(--spacing-6);
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.section-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: var(--spacing-2);
  border-bottom: 2px solid var(--color-venmo-blue);
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-border-gray);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions :deep(.v-button) {
    width: 100%;
  }
}
</style>
