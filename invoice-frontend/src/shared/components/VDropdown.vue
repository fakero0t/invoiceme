<template>
  <div class="v-dropdown" ref="dropdownRef">
    <div 
      class="v-dropdown-trigger" 
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      @keydown.escape="close"
      @keydown.down.prevent="focusFirstItem"
      tabindex="0"
    >
      <slot name="trigger" />
    </div>

    <transition name="dropdown">
      <div 
        v-if="isOpen" 
        :class="dropdownClasses"
        ref="menuRef"
      >
        <template v-for="(item, index) in items" :key="index">
          <div 
            v-if="item.divider"
            class="v-dropdown-divider"
          />
          <button
            v-else
            type="button"
            :class="getItemClasses(item, index)"
            @click="handleItemClick(item)"
            @mouseenter="focusedIndex = index"
            @keydown.down.prevent="focusNextItem"
            @keydown.up.prevent="focusPreviousItem"
            @keydown.escape="close"
            :disabled="item.disabled"
            :ref="el => setItemRef(el, index)"
          >
            <component v-if="item.icon" :is="item.icon" class="v-dropdown-icon" />
            <span class="v-dropdown-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="v-dropdown-shortcut">{{ item.shortcut }}</span>
          </button>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, type Component } from 'vue';

export interface DropdownItem {
  label?: string;
  icon?: Component;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface VDropdownProps {
  items: DropdownItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'click' | 'hover';
}

const props = withDefaults(defineProps<VDropdownProps>(), {
  items: () => [],
  placement: 'bottom',
  trigger: 'click',
});

const isOpen = ref(false);
const focusedIndex = ref(-1);
const dropdownRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const itemRefs = ref<(HTMLElement | null)[]>([]);

const dropdownClasses = computed(() => {
  return [
    'v-dropdown-menu',
    `v-dropdown-menu--${props.placement}`,
  ];
});

function setItemRef(el: any, index: number) {
  if (el && !props.items[index].divider) {
    itemRefs.value[index] = el as HTMLElement;
  }
}

function getItemClasses(item: DropdownItem, index: number) {
  return [
    'v-dropdown-item',
    {
      'v-dropdown-item--disabled': item.disabled,
      'v-dropdown-item--focused': index === focusedIndex.value,
    },
  ];
}

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
  focusedIndex.value = -1;
}

function handleItemClick(item: DropdownItem) {
  if (item.disabled) return;
  item.onClick?.();
  close();
}

function focusFirstItem() {
  if (!isOpen.value) {
    isOpen.value = true;
  }
  if (!props.items || props.items.length === 0) {
    return;
  }
  const firstEnabledIndex = props.items.findIndex(item => !item.disabled && !item.divider);
  if (firstEnabledIndex !== -1) {
    focusedIndex.value = firstEnabledIndex;
    itemRefs.value[firstEnabledIndex]?.focus();
  }
}

function focusNextItem() {
  let nextIndex = focusedIndex.value + 1;
  while (nextIndex < props.items.length) {
    const item = props.items[nextIndex];
    if (!item.disabled && !item.divider) {
      focusedIndex.value = nextIndex;
      itemRefs.value[nextIndex]?.focus();
      return;
    }
    nextIndex++;
  }
}

function focusPreviousItem() {
  let prevIndex = focusedIndex.value - 1;
  while (prevIndex >= 0) {
    const item = props.items[prevIndex];
    if (!item.disabled && !item.divider) {
      focusedIndex.value = prevIndex;
      itemRefs.value[prevIndex]?.focus();
      return;
    }
    prevIndex--;
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
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
.v-dropdown {
  position: relative;
  display: inline-block;
}

.v-dropdown-trigger {
  display: inline-flex;
  cursor: pointer;
}

.v-dropdown-menu {
  position: absolute;
  min-width: 200px;
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-index-dropdown);
  padding: var(--spacing-2);
  overflow: hidden;
}

.v-dropdown-menu--bottom {
  top: calc(100% + var(--spacing-2));
  left: 0;
}

.v-dropdown-menu--top {
  bottom: calc(100% + var(--spacing-2));
  left: 0;
}

.v-dropdown-menu--left {
  right: calc(100% + var(--spacing-2));
  top: 0;
}

.v-dropdown-menu--right {
  left: calc(100% + var(--spacing-2));
  top: 0;
}

.v-dropdown-item {
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

.v-dropdown-item:hover:not(.v-dropdown-item--disabled),
.v-dropdown-item--focused {
  background-color: var(--color-venmo-blue-50);
}

.v-dropdown-item:focus {
  outline: none;
  background-color: var(--color-venmo-blue-50);
}

.v-dropdown-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-dropdown-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-secondary);
}

.v-dropdown-label {
  flex: 1;
}

.v-dropdown-shortcut {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  font-family: monospace;
}

.v-dropdown-divider {
  height: 1px;
  background-color: var(--color-border-gray);
  margin: var(--spacing-2) 0;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

