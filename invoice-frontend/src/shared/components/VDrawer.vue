<template>
  <teleport to="body">
    <transition name="drawer">
      <div v-if="modelValue" class="v-drawer-backdrop" @click="handleBackdropClick">
        <div :class="drawerClasses" @click.stop role="dialog" aria-modal="true">
          <button
            v-if="!persistent"
            type="button"
            class="v-drawer-close"
            @click="close"
            aria-label="Close drawer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue';

export interface VDrawerProps {
  modelValue: boolean;
  side?: 'left' | 'right';
  width?: string;
  persistent?: boolean;
}

const props = withDefaults(defineProps<VDrawerProps>(), {
  side: 'right',
  width: '320px',
  persistent: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'close': [];
}>();

const drawerClasses = computed(() => {
  return [
    'v-drawer',
    `v-drawer--${props.side}`,
  ];
});

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function handleBackdropClick() {
  if (!props.persistent) {
    close();
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.persistent) {
    close();
  }
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !props.modelValue) return;

  const drawer = document.querySelector('.v-drawer');
  if (!drawer) return;

  const focusableElements = drawer.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement?.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement?.focus();
      event.preventDefault();
    }
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', trapFocus);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);
    document.removeEventListener('keydown', trapFocus);
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEscape);
  document.removeEventListener('keydown', trapFocus);
});
</script>

<style scoped>
.v-drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-index-modal-backdrop);
}

.v-drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  background-color: var(--color-card-white);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-index-modal);
  overflow-y: auto;
  width: v-bind(width);
  max-width: 90vw;
}

.v-drawer--left {
  left: 0;
}

.v-drawer--right {
  right: 0;
}

.v-drawer-close {
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out);
  z-index: 1;
}

.v-drawer-close:hover {
  background-color: var(--color-background);
}

.v-drawer-close svg {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-text-secondary);
}

/* Drawer transitions */
.drawer-enter-active {
  transition: opacity var(--duration-medium) var(--ease-out);
}

.drawer-leave-active {
  transition: opacity var(--duration-medium) var(--ease-in);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .v-drawer--left {
  animation: drawer-slide-in-left var(--duration-medium) var(--ease-out);
}

.drawer-leave-active .v-drawer--left {
  animation: drawer-slide-out-left var(--duration-medium) var(--ease-in);
}

.drawer-enter-active .v-drawer--right {
  animation: drawer-slide-in-right var(--duration-medium) var(--ease-out);
}

.drawer-leave-active .v-drawer--right {
  animation: drawer-slide-out-right var(--duration-medium) var(--ease-in);
}

@keyframes drawer-slide-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes drawer-slide-out-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes drawer-slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes drawer-slide-out-right {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
</style>

