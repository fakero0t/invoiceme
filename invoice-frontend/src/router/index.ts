import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false, title: 'invoiceme' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../features/auth/LoginPage.vue'),
    meta: { requiresAuth: false, requiresGuest: true, title: 'Login - invoiceme' },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../features/auth/SignupPage.vue'),
    meta: { requiresAuth: false, requiresGuest: true, title: 'Sign Up - invoiceme' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, title: 'Dashboard - invoiceme' },
  },
  {
    path: '/customers',
    name: 'CustomerList',
    component: () => import('../views/customers/CustomerList.vue'),
    meta: { requiresAuth: true, title: 'Customers - invoiceme' },
  },
  {
    path: '/customers/new',
    name: 'CustomerCreate',
    component: () => import('../views/customers/CustomerForm.vue'),
    meta: { requiresAuth: true, title: 'New Customer - invoiceme' },
  },
  {
    path: '/customers/:id/edit',
    name: 'CustomerEdit',
    component: () => import('../views/customers/CustomerForm.vue'),
    meta: { requiresAuth: true, title: 'Edit Customer - invoiceme' },
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: () => import('../views/invoices/InvoiceList.vue'),
    meta: { requiresAuth: true, title: 'Invoices - invoiceme' },
  },
  {
    path: '/invoices/new',
    name: 'InvoiceCreate',
    component: () => import('../views/invoices/InvoiceForm.vue'),
    meta: { requiresAuth: true, title: 'New Invoice - invoiceme' },
  },
  {
    path: '/invoices/:id/edit',
    name: 'InvoiceEdit',
    component: () => import('../views/invoices/InvoiceForm.vue'),
    meta: { requiresAuth: true, title: 'Edit Invoice - invoiceme' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (!authStore.user && localStorage.getItem('accessToken')) {
    try {
      await authStore.initializeAuth();
    } catch (error) {
      // Failed to fetch user, continue to route
      console.error('Failed to initialize auth:', error);
    }
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires guest (only for non-authenticated users)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next({ name: 'Dashboard' });
    return;
  }

  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title as string;
  } else {
    document.title = 'invoiceme';
  }

  next();
});

export default router;
