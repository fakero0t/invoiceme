# Frontend CQRS Architecture - Setup Guide

## Overview

This guide helps you integrate the new CQRS frontend architecture into your Vue.js application.

## Quick Start

### 1. Verify File Structure

Ensure all files are in place:

```
src/
├── Domain/
│   ├── Shared/Money.ts
│   ├── Customers/CustomerModel.ts
│   ├── Invoices/InvoiceModel.ts, LineItemModel.ts
│   └── Payments/PaymentModel.ts
├── Application/
│   ├── Commands/ (11 composables)
│   ├── Queries/ (5 composables)
│   └── DTOs/ (3 DTOs)
└── Infrastructure/
    └── Http/ (apiClient + 3 services)
```

### 2. Environment Configuration

Update your `.env` file:

```bash
VITE_API_URL=http://localhost:3000
```

For production:
```bash
VITE_API_URL=https://api.yourdomain.com
```

### 3. Update Existing Components

#### Before (Old Pattern)
```vue
<script setup lang="ts">
import { useCustomerStore } from '@/stores/customers';

const customerStore = useCustomerStore();

onMounted(() => {
  customerStore.fetchCustomers();
});

const handleCreate = async (data) => {
  await customerStore.createCustomer(data);
};
</script>
```

#### After (New Pattern)
```vue
<script setup lang="ts">
import { useCustomerList } from '@/Application/Queries/Customers/useCustomerList';
import { useCreateCustomer } from '@/Application/Commands/Customers/useCreateCustomer';

const { customers, isLoading, error, refetch } = useCustomerList();
const { execute: createCustomer } = useCreateCustomer();

const handleCreate = async (data) => {
  await createCustomer(data);
  await refetch(); // Manual cache invalidation
};
</script>
```

## Component Migration Checklist

### CustomerList.vue

- [ ] Replace `useCustomerStore()` with `useCustomerList()`
- [ ] Replace `useDeleteCustomer()` command
- [ ] Add manual `refetch()` after mutations
- [ ] Update template to use `customers`, `isLoading`, `error`

### CustomerForm.vue

- [ ] Add `useCreateCustomer()` or `useUpdateCustomer()`
- [ ] Remove store dependencies
- [ ] Handle loading states
- [ ] Display error messages

### InvoiceList.vue

- [ ] Replace with `useInvoiceList({ status, search })`
- [ ] Add filter reactivity
- [ ] Update template

### InvoiceForm.vue  

- [ ] Use `useInvoice(invoiceId)` for editing
- [ ] Add line item commands:
  - `useAddLineItem()`
  - `useUpdateLineItem()`
  - `useRemoveLineItem()`
- [ ] Add `useMarkInvoiceAsSent()`
- [ ] Call `refetch()` after each mutation

### RecordPaymentModal.vue

- [ ] Use `useRecordPayment()`
- [ ] Use `usePaymentList(invoiceId)` to show history
- [ ] Refetch invoice after payment

## Common Patterns

### Pattern 1: List with Delete

```vue
<script setup lang="ts">
const { customers, isLoading, refetch } = useCustomerList();
const { execute: deleteCustomer } = useDeleteCustomer();

const handleDelete = async (id: string) => {
  if (confirm('Delete?')) {
    await deleteCustomer(id);
    await refetch();
  }
};
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <div v-for="customer in customers" :key="customer.id">
      {{ customer.name }}
      <button @click="handleDelete(customer.id)">Delete</button>
    </div>
  </div>
</template>
```

### Pattern 2: Detail with Auto-Fetch

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const customerId = ref(route.params.id as string);

// Auto-fetches when customerId changes
const { customer, isLoading, error } = useCustomer(customerId);
</script>

<template>
  <div v-if="customer">
    <h1>{{ customer.name }}</h1>
    <p>{{ customer.email }}</p>
  </div>
</template>
```

### Pattern 3: Form with Create/Update

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const route = useRoute();
const router = useRouter();
const customerId = ref(route.params.id as string);

const isEditMode = computed(() => !!customerId.value);

// Only fetch if editing
const { customer } = isEditMode.value 
  ? useCustomer(customerId) 
  : { customer: ref(null) };

const { execute: createCustomer } = useCreateCustomer();
const { execute: updateCustomer } = useUpdateCustomer();

const handleSubmit = async (formData) => {
  if (isEditMode.value) {
    await updateCustomer(customerId.value, formData);
    router.push('/customers');
  } else {
    const newId = await createCustomer(formData);
    router.push(`/customers/${newId}`);
  }
};
</script>
```

### Pattern 4: Filtered List

```vue
<script setup lang="ts">
const statusFilter = ref<string | undefined>(undefined);
const searchQuery = ref<string | undefined>(undefined);

// Auto-refetches when filters change
const { invoices, isLoading } = useInvoiceList({
  status: statusFilter,
  search: searchQuery,
});
</script>

<template>
  <input v-model="searchQuery" placeholder="Search..." />
  <select v-model="statusFilter">
    <option :value="undefined">All</option>
    <option value="Draft">Draft</option>
    <option value="Sent">Sent</option>
    <option value="Paid">Paid</option>
  </select>
  
  <div v-for="invoice in invoices" :key="invoice.id">
    {{ invoice.invoiceNumber }} - {{ invoice.status }}
  </div>
</template>
```

## Store Migration

### Before: Multiple Feature Stores

```typescript
// ❌ Delete these
stores/customers.ts
stores/invoices.ts
stores/payments.ts
```

### After: Auth Store Only

```typescript
// ✅ Keep only this
stores/auth.ts

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  
  const login = async (credentials) => { /* ... */ };
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('accessToken');
  };
  
  return { user, token, login, logout };
});
```

## Testing Setup

### Install Playwright

```bash
cd invoice-frontend
npm install -D @playwright/test
npx playwright install
```

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
  },
});
```

### Run Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test
npx playwright test e2e/customers/create-customer.spec.ts

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## Troubleshooting

### Issue: "Cannot find module '@/Application/...'"

**Solution:** Verify TypeScript path alias in `vite.config.ts`:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
```

### Issue: 401 Unauthorized on all requests

**Solution:** Check auth token in localStorage:

```javascript
// In browser console
localStorage.getItem('accessToken')

// If null, login again
// The apiClient interceptor will add the token automatically
```

### Issue: Composable not refetching after mutation

**Solution:** Always call `refetch()` manually:

```typescript
const { execute: createInvoice } = useCreateInvoice();
const { invoices, refetch } = useInvoiceList();

await createInvoice(data);
await refetch(); // ✅ Don't forget this!
```

### Issue: TypeScript errors in domain models

**Solution:** Ensure DTOs are imported correctly:

```typescript
// ✅ Correct
import type { CustomerDTO } from '@/Application/DTOs/CustomerDTO';

// ❌ Wrong
import { CustomerDTO } from '@/Application/DTOs/CustomerDTO';
```

## Performance Tips

### 1. Avoid Unnecessary Refetches

```typescript
// ❌ Bad: Refetches on every keystroke
watch(searchQuery, () => refetch());

// ✅ Good: Debounce
import { useDebounceFn } from '@vueuse/core';

const debouncedRefetch = useDebounceFn(refetch, 300);
watch(searchQuery, debouncedRefetch);
```

### 2. Use Loading Skeletons

```vue
<template>
  <div v-if="isLoading">
    <SkeletonLoader />
  </div>
  <div v-else>
    <!-- Actual content -->
  </div>
</template>
```

### 3. Implement Optimistic Updates (Optional)

```typescript
const { customers, refetch } = useCustomerList();
const { execute: deleteCustomer } = useDeleteCustomer();

const handleDelete = async (id: string) => {
  // Optimistic: Remove from UI immediately
  const index = customers.value.findIndex(c => c.id === id);
  const removed = customers.value.splice(index, 1);
  
  try {
    await deleteCustomer(id);
  } catch (err) {
    // Rollback on error
    customers.value.splice(index, 0, removed[0]);
    throw err;
  }
};
```

## Next Steps

1. **Migrate Components:**
   - Start with CustomerList (simplest)
   - Then CustomerForm
   - Then InvoiceList
   - Finally InvoiceForm (most complex)

2. **Remove Old Code:**
   - Delete feature Pinia stores
   - Remove old API call patterns
   - Update all imports

3. **Add E2E Tests:**
   - Follow examples in `e2e/` directory
   - Test happy paths first
   - Add error scenario tests

4. **Deploy:**
   - Test locally with backend
   - Run E2E test suite
   - Deploy to staging
   - Monitor for issues

## Support

For issues:
1. Check browser console for errors
2. Verify network tab shows correct API calls
3. Check that backend is running with `USE_NEW_ARCHITECTURE=true`
4. Review `FRONTEND_CQRS_IMPLEMENTATION.md` for patterns

## Summary

The new architecture provides:
- ✅ Better separation of concerns
- ✅ Reusable composables
- ✅ Type-safe API calls
- ✅ Consistent error handling
- ✅ Easier testing
- ✅ Matches backend CQRS pattern

Follow the patterns in this guide to maintain consistency across the application!

