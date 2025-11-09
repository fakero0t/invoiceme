<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="v-modal-backdrop" @click="handleBackdropClick">
        <div :class="modalClasses" @click.stop role="dialog" aria-modal="true">
          <button
            v-if="!persistent"
            type="button"
            class="v-modal-close"
            @click="close"
            aria-label="Close modal"
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
import { computed, watch, onMounted, onBeforeUnmount } from 'vue';

export interface VModalProps {
  modelValue: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  persistent?: boolean;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<VModalProps>(), {
  size: 'md',
  persistent: false,
  closeOnEsc: true,
  closeOnBackdrop: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'close': [];
}>();

const modalClasses = computed(() => {
  return [
    'v-modal',
    `v-modal--${props.size}`,
  ];
});

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function handleBackdropClick() {
  if (!props.persistent && props.closeOnBackdrop) {
    close();
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEsc && !props.persistent) {
    close();
  }
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !props.modelValue) return;

  const modal = document.querySelector('.v-modal');
  if (!modal) return;

  const focusableElements = modal.querySelectorAll(
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
.v-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-index-modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}

.v-modal {
  position: relative;
  background-color: var(--color-card-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-index-modal);
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

/* Size variants */
.v-modal--sm {
  max-width: 400px;
}

.v-modal--md {
  max-width: 600px;
}

.v-modal--lg {
  max-width: 800px;
}

.v-modal--xl {
  max-width: 1200px;
}

.v-modal-close {
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

.v-modal-close:hover {
  background-color: var(--color-background);
}

.v-modal-close svg {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-text-secondary);
}

/* Mobile adaptations */
@media (max-width: 768px) {
  .v-modal-backdrop {
    padding: 0;
    align-items: flex-end;
  }

  .v-modal {
    max-width: 100%;
    max-height: 95vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .v-modal::before {
    content: '';
    position: absolute;
    top: var(--spacing-2);
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background-color: var(--color-border-gray);
    border-radius: var(--radius-full);
  }
}

/* Modal transitions */
.modal-enter-active {
  transition: opacity var(--duration-medium) var(--ease-out);
}

.modal-leave-active {
  transition: opacity var(--duration-medium) var(--ease-in);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .v-modal {
  animation: modal-slide-up var(--duration-medium) var(--ease-out);
}

.modal-leave-active .v-modal {
  animation: modal-slide-down var(--duration-medium) var(--ease-in);
}

@keyframes modal-slide-up {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes modal-slide-down {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(40px);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  @keyframes modal-slide-up {
    from {
      transform: translateY(100%);
      opacity: 1;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes modal-slide-down {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 1;
    }
  }
}
</style>

