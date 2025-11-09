import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../features/auth/LoginPage.vue'),
    meta: { requiresAuth: false, requiresGuest: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../features/auth/SignupPage.vue'),
    meta: { requiresAuth: false, requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customers',
    name: 'CustomerList',
    component: () => import('../views/customers/CustomerList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customers/new',
    name: 'CustomerCreate',
    component: () => import('../views/customers/CustomerForm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customers/:id/edit',
    name: 'CustomerEdit',
    component: () => import('../views/customers/CustomerForm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: () => import('../views/invoices/InvoiceList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices/new',
    name: 'InvoiceCreate',
    component: () => import('../views/invoices/InvoiceForm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices/:id/edit',
    name: 'InvoiceEdit',
    component: () => import('../views/invoices/InvoiceForm.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards - TEMPORARILY DISABLED FOR DEVELOPMENT
router.beforeEach((to, _from, next) => {
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
