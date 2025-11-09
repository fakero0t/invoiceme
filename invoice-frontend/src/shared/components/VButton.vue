<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}

const props = withDefaults(defineProps<VButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  return [
    'v-button',
    `v-button--${props.variant}`,
    `v-button--${props.size}`,
    {
      'v-button--block': props.block,
      'v-button--disabled': props.disabled || props.loading,
      'v-button--loading': props.loading,
    },
  ];
});

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style scoped>
.v-button {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out),
              background-color var(--duration-base) var(--ease-out),
              color var(--duration-base) var(--ease-out);
  white-space: nowrap;
  text-decoration: none;
}

/* Size variants */
.v-button--sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-body-sm);
}

.v-button--md {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-body);
}

.v-button--lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-body-lg);
}

/* Variant styles */
.v-button--primary {
  background: var(--gradient-primary);
  color: var(--color-card-white);
  box-shadow: var(--shadow-sm);
}

.v-button--primary:hover:not(.v-button--disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.v-button--primary:active:not(.v-button--disabled) {
  transform: scale(0.97);
}

.v-button--primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.v-button--secondary {
  background-color: var(--color-card-white);
  color: var(--color-venmo-blue);
  border: 1px solid var(--color-border-gray);
  box-shadow: var(--shadow-sm);
}

.v-button--secondary:hover:not(.v-button--disabled) {
  background-color: var(--color-venmo-blue-50);
  border-color: var(--color-venmo-blue);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.v-button--secondary:active:not(.v-button--disabled) {
  transform: scale(0.97);
}

.v-button--secondary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.v-button--ghost {
  background-color: transparent;
  color: var(--color-text-primary);
}

.v-button--ghost:hover:not(.v-button--disabled) {
  background-color: var(--color-venmo-blue-50);
}

.v-button--ghost:active:not(.v-button--disabled) {
  transform: scale(0.97);
}

.v-button--ghost:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.v-button--link {
  background-color: transparent;
  color: var(--color-venmo-blue);
  padding: 0;
}

.v-button--link:hover:not(.v-button--disabled) {
  color: var(--color-venmo-blue-600);
  text-decoration: underline;
}

.v-button--link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
  border-radius: var(--radius-sm);
}

/* Block button */
.v-button--block {
  width: 100%;
}

/* Disabled state */
.v-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading state */
.v-button--loading {
  position: relative;
  color: transparent;
}

.spinner {
  position: absolute;
  width: var(--icon-sm);
  height: var(--icon-sm);
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

.v-button--primary .spinner,
.v-button--secondary .spinner {
  border-color: var(--color-venmo-blue);
  border-top-color: transparent;
}

.v-button--primary .spinner {
  border-color: var(--color-card-white);
  border-top-color: transparent;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

