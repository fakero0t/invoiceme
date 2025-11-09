<template>
  <teleport to="body">
    <div class="v-toast-container">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClasses(toast)"
          @click="removeToast(toast.id)"
        >
          <div class="v-toast-icon">
            <svg v-if="toast.variant === 'success'" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="toast.variant === 'error'" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="toast.variant === 'warning'" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <svg v-else viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="v-toast-message">{{ toast.message }}</div>
          <button
            v-if="toast.closable"
            type="button"
            class="v-toast-close"
            @click.stop="removeToast(toast.id)"
            aria-label="Close notification"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  closable: boolean;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

function addToast(toast: Omit<Toast, 'id'>) {
  const id = toastId++;
  const newToast: Toast = { id, ...toast };
  toasts.value.push(newToast);

  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, toast.duration);
  }

  return id;
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
}

function getToastClasses(toast: Toast) {
  return [
    'v-toast',
    `v-toast--${toast.variant}`,
  ];
}

// Expose methods for parent components
defineExpose({ addToast, removeToast });
</script>

<style scoped>
.v-toast-container {
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: var(--z-index-tooltip);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  pointer-events: none;
}

@media (max-width: 768px) {
  .v-toast-container {
    top: var(--spacing-4);
    right: var(--spacing-4);
    left: var(--spacing-4);
  }
}

.v-toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 320px;
  max-width: 480px;
  padding: var(--spacing-4);
  background-color: var(--color-card-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  cursor: pointer;
}

@media (max-width: 768px) {
  .v-toast {
    min-width: auto;
    width: 100%;
  }
}

.v-toast--success {
  border-left: 4px solid var(--color-success);
}

.v-toast--error {
  border-left: 4px solid var(--color-error);
}

.v-toast--warning {
  border-left: 4px solid var(--color-warning);
}

.v-toast--info {
  border-left: 4px solid var(--color-info);
}

.v-toast-icon {
  flex-shrink: 0;
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.v-toast--success .v-toast-icon {
  color: var(--color-success);
}

.v-toast--error .v-toast-icon {
  color: var(--color-error);
}

.v-toast--warning .v-toast-icon {
  color: var(--color-warning);
}

.v-toast--info .v-toast-icon {
  color: var(--color-info);
}

.v-toast-message {
  flex: 1;
  font-size: var(--font-size-body-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.v-toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out);
}

.v-toast-close:hover {
  background-color: var(--color-background);
}

.v-toast-close svg {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-secondary);
}

/* Toast transitions */
.toast-enter-active {
  animation: toast-slide-in var(--duration-medium) var(--ease-out);
}

.toast-leave-active {
  animation: toast-slide-out var(--duration-medium) var(--ease-in);
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>

