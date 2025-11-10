<template>
  <nav class="v-navbar">
    <div class="v-navbar-content">
      <!-- Logo -->
      <router-link to="/" class="v-navbar-logo">
        <slot name="logo">
          <span class="v-navbar-logo-text">InvoiceMe</span>
        </slot>
      </router-link>

      <!-- Center content -->
      <div class="v-navbar-center">
        <slot name="center" />
      </div>

      <!-- Right actions -->
      <div class="v-navbar-actions">
        <slot name="actions">
          <!-- Notification bell -->
          <button type="button" class="v-navbar-action" aria-label="Notifications">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <!-- User dropdown menu -->
          <VDropdown :items="userMenuItems" placement="bottom">
            <template #trigger>
              <button type="button" class="v-navbar-user-trigger" aria-label="User menu">
                <VAvatar 
                  :src="userAvatar" 
                  :name="userName"
                  size="sm"
                />
                <svg class="v-navbar-chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </template>
          </VDropdown>
        </slot>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import VAvatar from './VAvatar.vue';
import VDropdown from './VDropdown.vue';

export interface VNavbarProps {
  userAvatar?: string;
  userName?: string;
}

const props = withDefaults(defineProps<VNavbarProps>(), {
  userName: 'User',
});

const router = useRouter();
const authStore = useAuthStore();

const userMenuItems = computed(() => [
  {
    label: props.userName || 'User',
    disabled: true,
  },
  {
    divider: true,
  },
  {
    label: 'Profile',
    onClick: () => {
      // Navigate to profile page when implemented
      console.log('Profile clicked');
    },
  },
  {
    label: 'Settings',
    onClick: () => {
      // Navigate to settings page when implemented
      console.log('Settings clicked');
    },
  },
  {
    divider: true,
  },
  {
    label: 'Logout',
    onClick: async () => {
      await authStore.logout();
      router.push('/login');
    },
  },
]);
</script>

<style scoped>
.v-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background-color: var(--color-card-white);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-index-fixed);
}

.v-navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 var(--spacing-6);
  max-width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .v-navbar-content {
    padding: 0 var(--spacing-4);
  }
}

.v-navbar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-h3);
  transition: color var(--duration-base) var(--ease-out);
}

.v-navbar-logo:hover {
  color: var(--color-venmo-blue);
}

.v-navbar-logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.v-navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-4);
}

.v-navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.v-navbar-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out),
              color var(--duration-base) var(--ease-out);
}

.v-navbar-action:hover {
  background-color: var(--color-venmo-blue-50);
  color: var(--color-venmo-blue);
}

.v-navbar-action svg {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.v-navbar-avatar {
  cursor: pointer;
}

.v-navbar-user-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  border: none;
  background: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out);
}

.v-navbar-user-trigger:hover {
  background-color: var(--color-venmo-blue-50);
}

.v-navbar-chevron {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-secondary);
  transition: transform var(--duration-base) var(--ease-out);
}

.v-navbar-user-trigger:hover .v-navbar-chevron {
  color: var(--color-venmo-blue);
}
</style>

