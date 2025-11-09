<template>
  <div class="v-menu" ref="menuRef">
    <div 
      class="v-menu-trigger" 
      @click="toggle"
      @contextmenu.prevent="show"
    >
      <slot name="trigger" />
    </div>

    <transition name="menu">
      <div 
        v-if="isOpen" 
        :class="menuClasses"
        :style="menuStyle"
      >
        <template v-for="(item, index) in items" :key="index">
          <div 
            v-if="item.divider"
            class="v-menu-divider"
          />
          <div 
            v-else-if="item.items"
            class="v-menu-group"
          >
            <div class="v-menu-group-label">{{ item.label }}</div>
            <button
              v-for="(subItem, subIndex) in item.items"
              :key="subIndex"
              type="button"
              :class="getItemClasses(subItem)"
              @click="handleItemClick(subItem)"
              :disabled="subItem.disabled"
            >
              <component v-if="subItem.icon" :is="subItem.icon" class="v-menu-icon" />
              <span class="v-menu-label">{{ subItem.label }}</span>
              <span v-if="subItem.shortcut" class="v-menu-shortcut">{{ subItem.shortcut }}</span>
            </button>
          </div>
          <button
            v-else
            type="button"
            :class="getItemClasses(item)"
            @click="handleItemClick(item)"
            :disabled="item.disabled"
          >
            <component v-if="item.icon" :is="item.icon" class="v-menu-icon" />
            <span class="v-menu-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="v-menu-shortcut">{{ item.shortcut }}</span>
          </button>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, type Component } from 'vue';

export interface MenuItem {
  label?: string;
  icon?: Component;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  items?: MenuItem[];
  onClick?: () => void;
}

export interface VMenuProps {
  items: MenuItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const props = withDefaults(defineProps<VMenuProps>(), {
  placement: 'bottom',
});

const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const menuPosition = ref({ top: 0, left: 0 });

const menuClasses = computed(() => {
  return [
    'v-menu-content',
    `v-menu-content--${props.placement}`,
  ];
});

const menuStyle = computed(() => {
  return {
    top: `${menuPosition.value.top}px`,
    left: `${menuPosition.value.left}px`,
  };
});

function getItemClasses(item: MenuItem) {
  return [
    'v-menu-item',
    {
      'v-menu-item--disabled': item.disabled,
    },
  ];
}

function toggle() {
  isOpen.value = !isOpen.value;
}

function show() {
  isOpen.value = true;
  updatePosition();
}

function close() {
  isOpen.value = false;
}

function handleItemClick(item: MenuItem) {
  if (item.disabled) return;
  item.onClick?.();
  close();
}

function updatePosition() {
  if (!menuRef.value) return;

  const trigger = menuRef.value;
  const triggerRect = trigger.getBoundingClientRect();
  const spacing = 8;

  let top = 0;
  let left = 0;

  switch (props.placement) {
    case 'top':
      top = triggerRect.top - spacing;
      left = triggerRect.left;
      break;
    case 'bottom':
      top = triggerRect.bottom + spacing;
      left = triggerRect.left;
      break;
    case 'left':
      top = triggerRect.top;
      left = triggerRect.left - spacing;
      break;
    case 'right':
      top = triggerRect.top;
      left = triggerRect.right + spacing;
      break;
  }

  menuPosition.value = { top, left };
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    close();
  }
}

watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.v-menu {
  position: relative;
  display: inline-block;
}

.v-menu-trigger {
  display: inline-flex;
  cursor: pointer;
}

.v-menu-content {
  position: fixed;
  min-width: 200px;
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-index-dropdown);
  padding: var(--spacing-2);
  overflow: hidden;
}

.v-menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out);
}

.v-menu-item:hover:not(.v-menu-item--disabled) {
  background-color: var(--color-venmo-blue-50);
}

.v-menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-menu-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-secondary);
}

.v-menu-label {
  flex: 1;
}

.v-menu-shortcut {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  font-family: monospace;
}

.v-menu-divider {
  height: 1px;
  background-color: var(--color-border-gray);
  margin: var(--spacing-2) 0;
}

.v-menu-group {
  display: flex;
  flex-direction: column;
}

.v-menu-group-label {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

/* Menu transition */
.menu-enter-active,
.menu-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

