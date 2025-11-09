# PR2: Frontend Migration to DDD/CQRS

**Scope:** Complete frontend architecture migration with composables, domain models, and API services  
**Dependencies:** PR1 must be merged and deployed

## Success Criteria
✅ Lightweight frontend domain models implemented  
✅ All API services follow consistent pattern  
✅ Command composables for all mutations  
✅ Query composables for all data fetching  
✅ All components refactored to use composables  
✅ 10+ E2E tests passing  
✅ Zero UI regressions  
✅ Pinia only for cross-cutting concerns

---

## Phase 5: Frontend Architecture

### Folder Structure

```
invoice-frontend/src/
├── Domain/                     # Lightweight display models
│   ├── Customers/
│   │   └── CustomerModel.ts
│   ├── Invoices/
│   │   ├── InvoiceModel.ts
│   │   └── LineItemModel.ts
│   └── Payments/
│       └── PaymentModel.ts
├── Application/
│   ├── Commands/
│   │   ├── Customers/
│   │   │   ├── useCreateCustomer.ts
│   │   │   ├── useUpdateCustomer.ts
│   │   │   └── useDeleteCustomer.ts
│   │   ├── Invoices/
│   │   │   ├── useCreateInvoice.ts
│   │   │   ├── useUpdateInvoice.ts
│   │   │   ├── useDeleteInvoice.ts
│   │   │   ├── useMarkInvoiceAsSent.ts
│   │   │   ├── useAddLineItem.ts
│   │   │   ├── useUpdateLineItem.ts
│   │   │   └── useRemoveLineItem.ts
│   │   └── Payments/
│   │       └── useRecordPayment.ts
│   ├── Queries/
│   │   ├── Customers/
│   │   │   ├── useCustomer.ts
│   │   │   └── useCustomerList.ts
│   │   ├── Invoices/
│   │   │   ├── useInvoice.ts
│   │   │   └── useInvoiceList.ts
│   │   └── Payments/
│   │       └── usePaymentList.ts
│   └── DTOs/
│       ├── CustomerDTO.ts
│       ├── InvoiceDTO.ts
│       └── PaymentDTO.ts
├── Infrastructure/
│   └── Http/
│       ├── apiClient.ts
│       ├── CustomerApiService.ts
│       ├── InvoiceApiService.ts
│       └── PaymentApiService.ts
└── Presentation/
    ├── Features/
    │   ├── Customers/
    │   │   ├── CustomerList.vue
    │   │   └── CustomerForm.vue
    │   └── Invoices/
    │       ├── InvoiceList.vue
    │       └── InvoiceForm.vue
    └── Shared/Components/
```

---

## Domain Models (Lightweight Display Logic Only)

### Frontend Domain Model Philosophy

**What They ARE:**
- ✅ Display helpers (formatting, UI state flags)
- ✅ Computed properties for UI
- ✅ Type-safe DTO wrappers
- ✅ Factory methods `fromDTO()`

**What They ARE NOT:**
- ❌ Business rule enforcement
- ❌ Mutations or state changes
- ❌ Data validation
- ❌ Any operations that modify state

**InvoiceModel Example:**
```typescript
// Domain/Invoices/InvoiceModel.ts
export class InvoiceModel {
  constructor(
    public readonly id: string,
    public readonly invoiceNumber: string,
    public readonly status: InvoiceStatus,
    public readonly lineItems: LineItemModel[],
    public readonly total: Money,
    public readonly balance: Money,
    public readonly dueDate: Date,
    // ... other properties
  ) {}
  
  // ✅ Display logic
  get isDraft(): boolean {
    return this.status === 'Draft';
  }
  
  get canAddLineItems(): boolean {
    return this.isDraft && this.lineItems.length < 100;
  }
  
  get canMarkAsSent(): boolean {
    return this.isDraft && this.lineItems.length > 0;
  }
  
  get isOverdue(): boolean {
    return this.balance.value > 0 && new Date() > this.dueDate;
  }
  
  get formattedTotal(): string {
    return `$${this.total.value.toFixed(2)}`;
  }
  
  // ✅ Factory from DTO
  static fromDTO(dto: InvoiceDTO): InvoiceModel {
    return new InvoiceModel(
      dto.id,
      dto.invoiceNumber,
      dto.status as InvoiceStatus,
      dto.lineItems.map(LineItemModel.fromDTO),
      Money.from(dto.total),
      Money.from(dto.balance),
      new Date(dto.dueDate),
      // ... map other fields
    );
  }
  
  // ❌ NO mutations like this:
  // markAsSent() { /* ... */ }  // This should be a command!
}
```

---

## API Service Layer

### API Client Configuration

```typescript
// Infrastructure/Http/apiClient.ts
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Response interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Service Pattern

**All services follow this exact structure:**
```typescript
// Infrastructure/Http/InvoiceApiService.ts
export class InvoiceApiService {
  private static readonly BASE_URL = '/api/v1/invoices';
  
  // COMMANDS (mutations)
  static async createInvoice(command: CreateInvoiceCommand): Promise<{ id: string }> {
    const response = await apiClient.post(this.BASE_URL, command);
    return response.data.data;
  }
  
  static async updateInvoice(id: string, command: UpdateInvoiceCommand): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${id}`, command);
  }
  
  static async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }
  
  static async markAsSent(id: string): Promise<void> {
    await apiClient.post(`${this.BASE_URL}/${id}/mark-sent`);
  }
  
  // QUERIES (reads)
  static async getInvoice(id: string): Promise<InvoiceDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
  
  static async listInvoices(params: ListInvoicesParams): Promise<InvoiceListDTO> {
    const response = await apiClient.get(this.BASE_URL, { params });
    return response.data.data;
  }
  
  static async downloadPDF(id: string): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
}
```

**API Service Rules:**
1. One service class per aggregate
2. Static methods only (no instance state)
3. Commands return `void` or `{ id: string }`
4. Queries return typed DTOs
5. Always use `apiClient`
6. Group by operation type (Commands first, then Queries)
7. Handle HTTP-specific concerns (response type, params)

**Implement for:** CustomerApiService, InvoiceApiService, PaymentApiService

---

## Command Composables

### Pattern

```typescript
// Application/Commands/Invoices/useCreateInvoice.ts
import { ref } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';

export function useCreateInvoice() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const execute = async (command: CreateInvoiceCommand): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await InvoiceApiService.createInvoice(command);
      return response.id;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to create invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { execute, isLoading, error };
}
```

**Usage in Component:**
```vue
<script setup lang="ts">
const { execute, isLoading, error } = useCreateInvoice();

const handleSubmit = async () => {
  const invoiceId = await execute({
    customerId: selectedCustomerId.value,
    companyInfo: form.companyInfo,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    taxRate: form.taxRate,
  });
  
  router.push(`/invoices/${invoiceId}/edit`);
};
</script>
```

**Implement for all commands:**
- Customer: Create, Update, Delete
- Invoice: Create, Update, Delete, MarkAsSent, AddLineItem, UpdateLineItem, RemoveLineItem
- Payment: RecordPayment

---

## Query Composables

### Pattern with Caching

```typescript
// Application/Queries/Invoices/useInvoice.ts
import { ref, computed, watch } from 'vue';
import { InvoiceApiService } from '@/Infrastructure/Http/InvoiceApiService';
import { InvoiceModel } from '@/Domain/Invoices/InvoiceModel';

export function useInvoice(invoiceId: Ref<string>) {
  const invoice = ref<InvoiceModel | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const fetch = async () => {
    if (!invoiceId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dto = await InvoiceApiService.getInvoice(invoiceId.value);
      invoice.value = InvoiceModel.fromDTO(dto);
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch invoice';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-fetch when invoiceId changes
  watch(invoiceId, fetch, { immediate: true });
  
  return { 
    invoice: computed(() => invoice.value), 
    isLoading: readonly(isLoading), 
    error: readonly(error),
    refetch: fetch
  };
}
```

**List Query with Filters:**
```typescript
// Application/Queries/Invoices/useInvoiceList.ts
export function useInvoiceList(options: {
  status?: Ref<string | undefined>;
  page?: Ref<number>;
  pageSize?: Ref<number>;
}) {
  const invoices = ref<InvoiceModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const totalPages = ref(0);
  
  const fetch = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await InvoiceApiService.listInvoices({
        status: options.status?.value,
        page: options.page?.value || 1,
        pageSize: options.pageSize?.value || 25,
      });
      
      invoices.value = response.items.map(InvoiceModel.fromDTO);
      totalCount.value = response.totalCount;
      totalPages.value = response.totalPages;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to fetch invoices';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Auto-refetch when filters change
  watch([() => options.status?.value, () => options.page?.value, () => options.pageSize?.value], fetch, { immediate: true });
  
  return {
    invoices: computed(() => invoices.value),
    isLoading: readonly(isLoading),
    error: readonly(error),
    totalCount: readonly(totalCount),
    totalPages: readonly(totalPages),
    refetch: fetch,
  };
}
```

**Implement for all queries:**
- Customer: useCustomer, useCustomerList
- Invoice: useInvoice, useInvoiceList
- Payment: usePaymentList

---

## State Management Pattern

### Composables vs Pinia

**Composables (Primary API):**
- ✅ Feature-specific state (invoice list, customer detail)
- ✅ Component-local concerns
- ✅ All CQRS operations
- ✅ Cache in reactive refs
- ✅ Manual cache invalidation

**Pinia Stores (Cross-Cutting Only):**
- ✅ Authentication state (user, tokens)
- ✅ App-level configuration
- ✅ Truly global shared state

```typescript
// stores/auth.ts (Keep this)
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!user.value);
  
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  
  return { user, token, isAuthenticated, login, logout };
});

// Delete or minimize:
// - stores/customers.ts (replaced by useCustomer/useCustomerList composables)
// - stores/invoices.ts (replaced by useInvoice/useInvoiceList composables)
// - stores/payments.ts (replaced by usePaymentList composable)
```

**Cache Invalidation Pattern:**
```typescript
const { execute: createInvoice } = useCreateInvoice();
const { invoices, refetch } = useInvoiceList();

const handleCreate = async () => {
  await createInvoice(command);
  await refetch(); // Manual invalidation after mutation
};
```

---

## Component Refactoring

### CustomerList.vue

```vue
<script setup lang="ts">
import { useCustomerList } from '@/Application/Queries/Customers/useCustomerList';
import { useDeleteCustomer } from '@/Application/Commands/Customers/useDeleteCustomer';

const { customers, isLoading, error, refetch } = useCustomerList();
const { execute: deleteCustomer } = useDeleteCustomer();

const handleDelete = async (customerId: string) => {
  if (confirm('Delete customer?')) {
    await deleteCustomer({ customerId, userId: authStore.user!.id });
    await refetch();
  }
};
</script>

<template>
  <div>
    <h1>Customers</h1>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <table v-else>
      <tr v-for="customer in customers" :key="customer.id">
        <td>{{ customer.name }}</td>
        <td>{{ customer.email }}</td>
        <td>
          <button @click="$router.push(`/customers/${customer.id}/edit`)">Edit</button>
          <button @click="handleDelete(customer.id)">Delete</button>
        </td>
      </tr>
    </table>
  </div>
</template>
```

### InvoiceForm.vue (Complex Example)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvoice } from '@/Application/Queries/Invoices/useInvoice';
import { useCreateInvoice } from '@/Application/Commands/Invoices/useCreateInvoice';
import { useUpdateInvoice } from '@/Application/Commands/Invoices/useUpdateInvoice';
import { useAddLineItem } from '@/Application/Commands/Invoices/useAddLineItem';
import { useUpdateLineItem } from '@/Application/Commands/Invoices/useUpdateLineItem';
import { useRemoveLineItem } from '@/Application/Commands/Invoices/useRemoveLineItem';
import { useMarkInvoiceAsSent } from '@/Application/Commands/Invoices/useMarkInvoiceAsSent';
import { useCustomerList } from '@/Application/Queries/Customers/useCustomerList';

const route = useRoute();
const router = useRouter();
const invoiceId = ref(route.params.id as string);
const isEditMode = computed(() => !!invoiceId.value);

// Data fetching
const { invoice, isLoading, refetch } = isEditMode.value 
  ? useInvoice(invoiceId) 
  : { invoice: ref(null), isLoading: ref(false), refetch: () => {} };
const { customers } = useCustomerList();

// Commands
const { execute: createInvoice } = useCreateInvoice();
const { execute: updateInvoice } = useUpdateInvoice();
const { execute: addLineItem } = useAddLineItem();
const { execute: updateLineItem } = useUpdateLineItem();
const { execute: removeLineItem } = useRemoveLineItem();
const { execute: markAsSent } = useMarkInvoiceAsSent();

// Form state
const form = ref({
  customerId: '',
  companyInfo: '',
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  taxRate: 0,
  notes: '',
  terms: '',
});

// Local line items for create mode
const localLineItems = ref<LineItemModel[]>([]);

// Use local or API line items based on mode
const lineItems = computed(() => 
  isEditMode.value ? invoice.value?.lineItems || [] : localLineItems.value
);

const handleSave = async () => {
  if (isEditMode.value) {
    await updateInvoice({
      invoiceId: invoiceId.value,
      userId: authStore.user!.id,
      ...form.value,
    });
  } else {
    const newId = await createInvoice({
      userId: authStore.user!.id,
      ...form.value,
    });
    router.push(`/invoices/${newId}/edit`);
  }
};

const handleAddLineItem = async () => {
  if (isEditMode.value) {
    await addLineItem({
      invoiceId: invoiceId.value,
      userId: authStore.user!.id,
      description: newLineItem.description,
      quantity: newLineItem.quantity,
      unitPrice: newLineItem.unitPrice,
    });
    await refetch();
  } else {
    localLineItems.value.push(/* create local line item */);
  }
};

const handleMarkAsSent = async () => {
  await markAsSent({ invoiceId: invoiceId.value, userId: authStore.user!.id });
  await refetch();
};
</script>

<template>
  <div>
    <h1>{{ isEditMode ? 'Edit Invoice' : 'Create Invoice' }}</h1>
    <form @submit.prevent="handleSave">
      <select v-model="form.customerId">
        <option v-for="customer in customers" :key="customer.id" :value="customer.id">
          {{ customer.name }}
        </option>
      </select>
      <!-- other form fields -->
      
      <h3>Line Items</h3>
      <table>
        <tr v-for="item in lineItems" :key="item.id">
          <td>{{ item.description }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.unitPrice }}</td>
          <td>{{ item.amount }}</td>
          <td><button @click="handleRemoveLineItem(item.id)">Remove</button></td>
        </tr>
      </table>
      
      <button @click="handleAddLineItem">Add Line Item</button>
      <button type="submit">Save</button>
      <button v-if="invoice?.canMarkAsSent" @click="handleMarkAsSent">Mark as Sent</button>
    </form>
  </div>
</template>
```

**Refactor all components:**
- CustomerList.vue, CustomerForm.vue
- InvoiceList.vue, InvoiceForm.vue
- RecordPaymentModal.vue

---

## E2E Testing

### Setup Playwright/Cypress

```typescript
// e2e/customers/create-customer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create Customer', () => {
  test('creates customer with valid data', async ({ page }) => {
    await page.goto('/customers/new');
    
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="address.street"]', '123 Main St');
    // ... fill other fields
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/customers$/);
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
  
  test('shows validation error for duplicate email', async ({ page }) => {
    // Create first customer
    await createCustomerViaAPI({ email: 'john@example.com' });
    
    // Try to create duplicate
    await page.goto('/customers/new');
    await page.fill('[name="email"]', 'john@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=EMAIL_ALREADY_EXISTS')).toBeVisible();
  });
});
```

**E2E Test Coverage Required:**
- Customers: Create, Update, Delete
- Invoices: Create, Update, Delete, Add/Update/Remove line items, Mark as sent
- Payments: Record payment, verify balance updates
- Complete flow: Customer → Invoice → Line Items → Send → Payments → Paid

**Target:** 10+ E2E tests

---

## PR2 Acceptance Criteria

### Frontend Architecture
- ✅ Complete folder structure
- ✅ Lightweight domain models (display logic only)
- ✅ No business rules or mutations in models
- ✅ Factory methods `fromDTO()` for all models

### API Services
- ✅ 3 API service classes (Customer, Invoice, Payment)
- ✅ All follow consistent pattern
- ✅ apiClient configured with interceptors
- ✅ 401 handling redirects to login

### Command Composables
- ✅ 11 command composables implemented
- ✅ All return `{ execute, isLoading, error }`
- ✅ Error messages extracted from API responses

### Query Composables
- ✅ 5 query composables implemented
- ✅ All return `{ data, isLoading, error, refetch }`
- ✅ Cache in reactive refs
- ✅ Auto-refetch on parameter changes
- ✅ Manual `refetch()` for invalidation

### State Management
- ✅ Composables are primary API
- ✅ Pinia only for auth and global concerns
- ✅ Old stores removed/minimized

### Component Refactoring
- ✅ All components use composables
- ✅ No direct API calls in components
- ✅ Domain models used for display
- ✅ Manual cache invalidation after mutations

### E2E Testing
- ✅ Playwright/Cypress configured
- ✅ 10+ E2E tests
- ✅ All major workflows covered
- ✅ Error scenarios tested

### Feature Parity
- ✅ All UI functionality preserved
- ✅ Zero visual regressions
- ✅ All forms work identically
- ✅ All navigation preserved

---


