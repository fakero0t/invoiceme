<template>
  <div class="main-layout">
    <VNavbar :user-avatar="userAvatar" :user-name="displayUserName">
      <template #actions>
        <slot name="navbar-actions" />
      </template>
    </VNavbar>

    <!-- Desktop: Sidebar -->
    <VSidebar 
      :items="sidebarItems" 
      :collapsed="sidebarCollapsed"
      @update:collapsed="sidebarCollapsed = $event"
      class="main-layout-sidebar"
    >
      <template #footer>
        <slot name="sidebar-footer" />
      </template>
    </VSidebar>

    <!-- Mobile: Bottom Navigation -->
    <VBottomNav 
      :items="bottomNavItems"
      class="main-layout-bottom-nav"
    />

    <!-- Main content area -->
    <main :class="mainContentClasses">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import VNavbar from '../components/VNavbar.vue';
import VSidebar from '../components/VSidebar.vue';
import VBottomNav from '../components/VBottomNav.vue';
import type { SidebarItem } from '../components/VSidebar.vue';
import type { BottomNavItem } from '../components/VBottomNav.vue';

export interface MainLayoutProps {
  sidebarItems?: SidebarItem[];
  bottomNavItems?: BottomNavItem[];
  userAvatar?: string;
  userName?: string;
}

const props = withDefaults(defineProps<MainLayoutProps>(), {
  sidebarItems: () => [],
  bottomNavItems: () => [],
});

const authStore = useAuthStore();
const sidebarCollapsed = ref(false);

const displayUserName = computed(() => {
  return props.userName || authStore.user?.name || authStore.user?.email || 'User';
});

const mainContentClasses = computed(() => {
  return [
    'main-layout-content',
    {
      'main-layout-content--sidebar-collapsed': sidebarCollapsed.value,
    },
  ];
});
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background-color: var(--color-background);
}

.main-layout-content {
  margin-top: var(--navbar-height);
  margin-left: var(--sidebar-width);
  padding: var(--spacing-6);
  min-height: calc(100vh - var(--navbar-height));
  transition: margin-left var(--duration-medium) var(--ease-out);
}

.main-layout-content--sidebar-collapsed {
  margin-left: var(--sidebar-width-collapsed);
}

/* Tablet */
@media (max-width: 1024px) {
  .main-layout-content {
    margin-left: 0;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .main-layout-content {
    padding: var(--spacing-4);
    margin-bottom: var(--bottom-nav-height);
  }
}
</style>

