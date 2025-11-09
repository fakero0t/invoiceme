<template>
  <nav class="v-bottom-nav">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="v-bottom-nav-item"
    >
      <component v-if="item.icon" :is="item.icon" class="v-bottom-nav-icon" />
      <span class="v-bottom-nav-label">{{ item.label }}</span>
      <VBadge 
        v-if="item.badge" 
        :content="item.badge"
        variant="primary"
        size="sm"
        class="v-bottom-nav-badge"
      />
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { type Component } from 'vue';
import VBadge from './VBadge.vue';

export interface BottomNavItem {
  label: string;
  to: string;
  icon?: Component;
  badge?: string | number;
}

export interface VBottomNavProps {
  items: BottomNavItem[];
}

defineProps<VBottomNavProps>();
</script>

<style scoped>
.v-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  background-color: var(--color-card-white);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  display: none;
  align-items: center;
  justify-content: space-around;
  padding: 0 var(--spacing-2);
  z-index: var(--z-index-fixed);
}

@media (max-width: 768px) {
  .v-bottom-nav {
    display: flex;
  }
}

.v-bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  flex: 1;
  height: 100%;
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color var(--duration-base) var(--ease-out);
  padding: var(--spacing-2);
}

.v-bottom-nav-item:hover {
  color: var(--color-text-secondary);
}

.v-bottom-nav-item.router-link-active {
  color: var(--color-venmo-blue);
}

.v-bottom-nav-item.router-link-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--spacing-3);
  right: var(--spacing-3);
  height: 3px;
  background-color: var(--color-venmo-blue);
  border-radius: 0 0 var(--radius-full) var(--radius-full);
  animation: slide-down var(--duration-base) var(--ease-out);
}

@keyframes slide-down {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.v-bottom-nav-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.v-bottom-nav-label {
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  line-height: 1;
}

.v-bottom-nav-badge {
  position: absolute;
  top: var(--spacing-2);
  right: calc(50% - 18px);
}
</style>

