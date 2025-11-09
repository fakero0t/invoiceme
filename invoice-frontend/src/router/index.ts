import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import LoginPage from '../features/auth/LoginPage.vue';
import SignupPage from '../features/auth/SignupPage.vue';
import CustomerList from '../views/customers/CustomerList.vue';
import CustomerForm from '../views/customers/CustomerForm.vue';
import InvoiceList from '../views/invoices/InvoiceList.vue';
import InvoiceForm from '../views/invoices/InvoiceForm.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false, requiresGuest: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage,
    meta: { requiresAuth: false, requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/customers',
    name: 'CustomerList',
    component: CustomerList,
    meta: { requiresAuth: true },
  },
  {
    path: '/customers/new',
    name: 'CustomerCreate',
    component: CustomerForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/customers/:id/edit',
    name: 'CustomerEdit',
    component: CustomerForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: InvoiceList,
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices/new',
    name: 'InvoiceCreate',
    component: InvoiceForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices/:id/edit',
    name: 'InvoiceEdit',
    component: InvoiceForm,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards - TEMPORARILY DISABLED FOR DEVELOPMENT
router.beforeEach(async (to, _from, next) => {
  console.log('🔓 Auth bypassed for development - navigating to:', to.path);
  
  // Skip all auth checks for now
  next();
  
  /* ORIGINAL CODE - RE-ENABLE LATER
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (!authStore.user && localStorage.getItem('accessToken')) {
    try {
      await authStore.fetchUser();
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

  next();
  */
});

export default router;
