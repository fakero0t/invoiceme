<template>
  <MainLayout
    :sidebar-items="sidebarItems"
    :bottom-nav-items="bottomNavItems"
    :user-name="authStore.user?.name || 'User'"
  >
  <div class="dashboard">
      <!-- Loading State -->
      <template v-if="isLoading">
        <VSkeleton variant="rect" height="200px" class="hero-skeleton" />
        <div class="stats-grid">
          <VSkeleton v-for="i in 4" :key="i" variant="rect" height="120px" />
        </div>
        <VSkeleton variant="rect" height="400px" />
      </template>

      <!-- Content -->
      <template v-else>
        <!-- Hero Section -->
        <VCard class="hero-card">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">{{ formatCurrency(totalOutstanding) }}</h1>
              <p class="hero-subtitle">Total Outstanding</p>
              
              <div class="hero-metrics">
                <div class="metric">
                  <span class="metric-label">Paid this month</span>
                  <span class="metric-value">{{ formatCurrency(paidThisMonth) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Pending invoices</span>
                  <span class="metric-value">{{ pendingCount }}</span>
                </div>
              </div>
      </div>
            
            <VButton 
              variant="secondary" 
              size="lg"
              class="hero-button"
              @click="createInvoice"
            >
              <svg class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              New Invoice
            </VButton>
          </div>
        </VCard>

        <!-- Quick Stats Cards -->
        <div class="stats-grid">
          <VCard class="stat-card">
            <div class="stat-icon stat-icon--success">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(totalPaid) }}</div>
              <div class="stat-label">Total Paid</div>
              <div class="stat-trend stat-trend--up">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                <span>12.5%</span>
              </div>
            </div>
          </VCard>

          <VCard class="stat-card">
            <div class="stat-icon stat-icon--warning">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">Pending</div>
              <div class="stat-trend stat-trend--neutral">
                <span>{{ formatCurrency(totalPending) }}</span>
              </div>
            </div>
          </VCard>

          <VCard class="stat-card">
            <div class="stat-icon stat-icon--primary">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalInvoices }}</div>
              <div class="stat-label">Total Invoices</div>
              <div class="stat-trend stat-trend--neutral">
                <span>{{ formatCurrency(totalRevenue) }}</span>
              </div>
            </div>
          </VCard>

          <VCard class="stat-card">
            <div class="stat-icon stat-icon--error">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overdueCount }}</div>
              <div class="stat-label">Overdue</div>
              <div class="stat-trend stat-trend--down">
                <span>{{ formatCurrency(totalOverdue) }}</span>
              </div>
            </div>
          </VCard>
        </div>

        <!-- Recent Activity -->
        <div class="section-header">
          <h2 class="section-title">Recent Activity</h2>
          <router-link to="/invoices" class="view-all-link">View all</router-link>
        </div>

        <!-- Activity Feed -->
        <div v-if="recentActivity.length > 0" class="activity-feed">
          <VCard
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-card"
            @click="navigateToActivity(activity)"
          >
            <VAvatar
              :name="activity.customerName"
              size="md"
              class="activity-avatar"
            />
            <div class="activity-content">
              <div class="activity-header">
                <span class="activity-customer">{{ activity.customerName }}</span>
                <span :class="['activity-amount', `activity-amount--${activity.status}`]">
                  {{ formatCurrency(activity.amount) }}
                </span>
              </div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-timestamp">{{ formatTimestamp(activity.timestamp) }}</div>
            </div>
            <svg class="activity-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </VCard>
      </div>

        <!-- Empty State -->
        <VEmptyState
          v-else
          heading="No activity yet"
          description="Create your first invoice to get started"
          @action="createInvoice"
        >
          <template #icon>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
          </template>
          <template #default>
            <VButton variant="primary" @click="createInvoice">Create Invoice</VButton>
          </template>
        </VEmptyState>
      </template>

      <!-- Mobile FAB -->
      <button class="fab" @click="createInvoice" aria-label="Create new invoice">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
  </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { MainLayout } from '../shared/layouts';
import { VCard, VButton, VAvatar, VEmptyState, VSkeleton } from '../shared/components';
import { DashboardApiService } from '../Infrastructure/Http/DashboardApiService';
import type { RecentActivityItem as RecentActivityItemDTO } from '../Application/DTOs/DashboardStatisticsDTO';

interface RecentActivityItem {
  id: string;
  customerName: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  timestamp: Date;
  type: 'invoice' | 'payment';
}

const router = useRouter();
const authStore = useAuthStore();

// Navigation items
const sidebarItems = [
  { label: 'Dashboard', to: '/dashboard', icon: null },
  { label: 'Invoices', to: '/invoices', icon: null, badge: 3 },
  { label: 'Customers', to: '/customers', icon: null },
];

const bottomNavItems = [
  { label: 'Home', to: '/dashboard', icon: null },
  { label: 'Invoices', to: '/invoices', icon: null, badge: 3 },
  { label: 'Customers', to: '/customers', icon: null },
  { label: 'More', to: '/settings', icon: null },
];

// Data
const isLoading = ref(true);
const totalOutstanding = ref(0);
const paidThisMonth = ref(0);
const pendingCount = ref(0);
const totalPaid = ref(0);
const totalPending = ref(0);
const totalInvoices = ref(0);
const totalRevenue = ref(0);
const overdueCount = ref(0);
const totalOverdue = ref(0);

const recentActivity = ref<RecentActivityItem[]>([]);

// Methods
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function createInvoice() {
  router.push('/invoices/new');
}

function navigateToActivity(activity: any) {
  if (activity.type === 'invoice') {
    router.push(`/invoices/${activity.id}`);
  } else if (activity.type === 'payment') {
    router.push(`/payments/${activity.id}`);
  }
}

// Load dashboard data
onMounted(async () => {
  isLoading.value = true;
  try {
    const stats = await DashboardApiService.getStatistics();
    
    // Map API response to component state
    totalOutstanding.value = stats.totalOutstanding;
    paidThisMonth.value = stats.paidThisMonth;
    pendingCount.value = stats.pendingCount;
    totalPaid.value = stats.totalPaid;
    totalPending.value = stats.totalPending;
    totalInvoices.value = stats.totalInvoices;
    totalRevenue.value = stats.totalRevenue;
    overdueCount.value = stats.overdueCount;
    totalOverdue.value = stats.totalOverdue;
    
    // Transform recentActivity timestamps from ISO strings to Date objects
    recentActivity.value = stats.recentActivity.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load dashboard statistics:', error);
    // Optionally show error message to user
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.hero-skeleton {
  margin-bottom: var(--spacing-6);
}

/* Hero Section */
.hero-card {
  background: var(--gradient-primary);
  padding: var(--spacing-8);
  border: none;
  overflow: hidden;
  position: relative;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.hero-text {
  flex: 1;
  color: var(--color-card-white);
}

.hero-title {
  font-size: var(--font-size-display-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-2) 0;
  color: var(--color-card-white);
}

.hero-subtitle {
  font-size: var(--font-size-body);
  margin: 0 0 var(--spacing-6) 0;
  opacity: 0.9;
}

.hero-metrics {
  display: flex;
  gap: var(--spacing-8);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.metric-label {
  font-size: var(--font-size-body-sm);
  opacity: 0.9;
}

.metric-value {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
}

.hero-button {
  background-color: var(--color-card-white);
  color: var(--color-venmo-blue);
  border: none;
  flex-shrink: 0;
}

.button-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  margin-right: var(--spacing-2);
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-metrics {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .hero-button {
    width: 100%;
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  padding: var(--spacing-6);
  display: flex;
  gap: var(--spacing-4);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: var(--icon-xl);
  height: var(--icon-xl);
}

.stat-icon--success {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.stat-icon--warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.stat-icon--primary {
  background-color: var(--color-venmo-blue-50);
  color: var(--color-venmo-blue);
}

.stat-icon--error {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.stat-value {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
}

.stat-trend svg {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.stat-trend--up {
  color: var(--color-success);
}

.stat-trend--down {
  color: var(--color-error);
}

.stat-trend--neutral {
  color: var(--color-text-secondary);
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.view-all-link {
  font-size: var(--font-size-body-sm);
  color: var(--color-venmo-blue);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-base) var(--ease-out);
}

.view-all-link:hover {
  color: var(--color-venmo-blue-600);
  text-decoration: underline;
}

/* Activity Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.activity-card {
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  cursor: pointer;
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.activity-avatar {
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.activity-customer {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.activity-amount {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.activity-amount--paid {
  color: var(--color-success);
}

.activity-amount--pending {
  color: var(--color-warning);
}

.activity-amount--overdue {
  color: var(--color-error);
}

.activity-description {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}

.activity-timestamp {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
}

.activity-chevron {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

/* Mobile FAB */
.fab {
  position: fixed;
  bottom: calc(var(--bottom-nav-height) + var(--spacing-4));
  right: var(--spacing-4);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: var(--color-card-white);
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
  z-index: var(--z-index-sticky);
}

.fab:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.fab:active {
  transform: scale(0.95);
}

.fab svg {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

@media (max-width: 768px) {
  .fab {
    display: flex;
  }

  .hero-button {
    display: none;
  }
}
</style>
