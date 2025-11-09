<template>
  <aside :class="sidebarClasses">
    <!-- Collapse button -->
    <button 
      type="button" 
      class="v-sidebar-toggle"
      @click="toggleCollapse"
      aria-label="Toggle sidebar"
    >
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Navigation items -->
    <nav class="v-sidebar-nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :class="getNavItemClasses(item)"
        @click="handleItemClick"
      >
        <component v-if="item.icon" :is="item.icon" class="v-sidebar-icon" />
        <span v-if="!isCollapsed" class="v-sidebar-label">{{ item.label }}</span>
        <VBadge 
          v-if="item.badge && !isCollapsed" 
          :content="item.badge"
          variant="primary"
          size="sm"
        />
      </router-link>
    </nav>

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="v-sidebar-footer">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import VBadge from './VBadge.vue';

export interface SidebarItem {
  label: string;
  to: string;
  icon?: Component;
  badge?: string | number;
}

export interface VSidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
}

const props = withDefaults(defineProps<VSidebarProps>(), {
  collapsed: false,
});

const emit = defineEmits<{
  'update:collapsed': [value: boolean];
  'item-click': [item: SidebarItem];
}>();

const isCollapsed = ref(props.collapsed);

const sidebarClasses = computed(() => {
  return [
    'v-sidebar',
    {
      'v-sidebar--collapsed': isCollapsed.value,
    },
  ];
});

function getNavItemClasses(item: SidebarItem) {
  return [
    'v-sidebar-item',
  ];
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  emit('update:collapsed', isCollapsed.value);
}

function handleItemClick() {
  // Close sidebar on mobile after navigation
  if (window.innerWidth < 1024) {
    // Mobile behavior can be handled by parent
  }
}
</script>

<script lang="ts">
import { useSlots } from 'vue';
</script>

<style scoped>
.v-sidebar {
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background-color: var(--color-card-white);
  border-right: 1px solid var(--color-border-gray);
  display: flex;
  flex-direction: column;
  transition: width var(--duration-medium) var(--ease-out);
  overflow: hidden;
  z-index: calc(var(--z-index-fixed) - 1);
}

.v-sidebar--collapsed {
  width: var(--sidebar-width-collapsed);
}

@media (max-width: 1024px) {
  .v-sidebar {
    display: none;
  }
}

.v-sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  width: 100%;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out),
              color var(--duration-base) var(--ease-out);
}

.v-sidebar-toggle:hover {
  background-color: var(--color-venmo-blue-50);
  color: var(--color-venmo-blue);
}

.v-sidebar-toggle svg {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.v-sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-4) var(--spacing-2);
  gap: var(--spacing-1);
  overflow-y: auto;
}

.v-sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  transition: background-color var(--duration-base) var(--ease-out),
              color var(--duration-base) var(--ease-out);
  white-space: nowrap;
}

.v-sidebar-item:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.v-sidebar-item.router-link-active {
  background-color: var(--color-venmo-blue-50);
  color: var(--color-venmo-blue);
}

.v-sidebar--collapsed .v-sidebar-item {
  justify-content: center;
  padding: var(--spacing-3);
}

.v-sidebar-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  flex-shrink: 0;
}

.v-sidebar-label {
  flex: 1;
}

.v-sidebar-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border-gray);
}
</style>

