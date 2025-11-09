# ADR-005: Composables Over Pinia for Feature State Management

## Status
Accepted

## Context
The frontend application needs to manage:
- API calls to backend
- Local component state
- Shared state across components
- Caching and optimistic updates

Vue 3 provides two main approaches:
1. **Pinia** (centralized state management)
2. **Composables** (local, reusable composition functions)

For a CQRS backend, the frontend mainly:
- Sends commands (POST, PUT, DELETE)
- Fetches queries (GET)
- Displays results

## Decision
We will use **Vue 3 Composables** for feature-level state management, reserving Pinia for true global state (auth, user preferences).

### Composable Pattern

```typescript
// useCustomers.ts
export function useCustomers() {
  const customers = ref<Customer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCustomers() {
    loading.value = true;
    try {
      customers.value = await customerApi.list();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createCustomer(data: CreateCustomerDto) {
    const customer = await customerApi.create(data);
    customers.value.push(customer);
    return customer;
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
  };
}
```

### Usage

```vue
<script setup lang="ts">
const { customers, loading, fetchCustomers, createCustomer } = useCustomers();

onMounted(() => {
  fetchCustomers();
});
</script>
```

## Consequences

### Positive
- **Simplicity**: Less boilerplate than Pinia stores
- **Co-location**: Logic close to where it's used
- **Type Safety**: Full TypeScript support
- **Tree-Shaking**: Unused composables not bundled
- **Testability**: Easy to test composables in isolation
- **Vue 3 Native**: Leverages Composition API

### Negative
- **No Global Reactivity**: State not automatically shared across components
- **Manual Cache Invalidation**: Need to refetch after mutations
- **No DevTools**: Pinia has better Vue DevTools integration
- **Potential Duplication**: Similar patterns across composables

### Mitigation
- Document composable patterns
- Create shared utility functions
- Use query keys for cache management
- Consider React Query-like library if caching becomes complex

## When to Use Pinia

### Global State (Use Pinia)
- **Auth Store**: User authentication state, tokens
- **User Store**: Current user profile, preferences
- **Theme Store**: Dark mode, locale settings
- **Navigation Store**: Sidebar state, breadcrumbs

### Feature State (Use Composables)
- **Customer Management**: List, CRUD operations
- **Invoice Management**: List, CRUD operations
- **Payment Tracking**: List, record payments

## Implementation Examples

### Composable for List + CRUD

```typescript
// useInvoices.ts
export function useInvoices() {
  const invoices = ref<Invoice[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchInvoices = async (filters?: InvoiceFilters) => {
    loading.value = true;
    error.value = null;
    try {
      invoices.value = await invoiceApi.list(filters);
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const createInvoice = async (data: CreateInvoiceDto) => {
    const invoice = await invoiceApi.create(data);
    invoices.value.unshift(invoice);
    return invoice;
  };

  const updateInvoice = async (id: string, data: UpdateInvoiceDto) => {
    const updated = await invoiceApi.update(id, data);
    const index = invoices.value.findIndex(i => i.id === id);
    if (index !== -1) {
      invoices.value[index] = updated;
    }
    return updated;
  };

  const deleteInvoice = async (id: string) => {
    await invoiceApi.delete(id);
    invoices.value = invoices.value.filter(i => i.id !== id);
  };

  return {
    invoices: readonly(invoices),
    loading: readonly(loading),
    error: readonly(error),
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
```

### Pinia for Global Auth

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    user.value = response.user;
    token.value = response.token;
    localStorage.setItem('token', token.value);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  function restoreSession() {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
      // Verify token and fetch user
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    restoreSession,
  };
});
```

## Caching Strategy

### Optimistic Updates

```typescript
async function updateInvoice(id: string, data: UpdateInvoiceDto) {
  // Optimistic update
  const index = invoices.value.findIndex(i => i.id === id);
  const original = invoices.value[index];
  invoices.value[index] = { ...original, ...data };

  try {
    const updated = await invoiceApi.update(id, data);
    invoices.value[index] = updated;
  } catch (error) {
    // Rollback on error
    invoices.value[index] = original;
    throw error;
  }
}
```

### Cache Invalidation

```typescript
// After creating invoice, refetch list
await createInvoice(data);
await fetchInvoices(); // Refresh list
```

### Query Keys (Future Enhancement)

```typescript
// Similar to React Query
const queryKey = computed(() => ['invoices', filters.value]);
// Auto-refetch on key change
```

## Future Enhancements

### Option 1: Add Vue Query (TanStack Query)
- Automatic caching
- Background refetching
- Optimistic updates
- Devtools

### Option 2: Custom Cache Layer
- Implement query key system
- LRU cache for API responses
- Automatic invalidation

### Option 3: Hybrid Approach
- Composables for API calls
- Pinia for caching layer
- Best of both worlds

## References
- [Vue 3 Composition API](https://vuejs.org/guide/reusability/composables.html)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [React Query (inspiration)](https://tanstack.com/query/latest)

## Related ADRs
- ADR-002: CQRS Pattern (backend influences frontend patterns)

## Date
2025-01-XX

## Authors
Frontend Team

