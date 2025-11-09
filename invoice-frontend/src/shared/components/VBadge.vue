<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<VBadgeProps>(), {
  variant: 'info',
  size: 'md',
});

const badgeClasses = computed(() => {
  return [
    'v-badge',
    `v-badge--${props.variant}`,
    `v-badge--${props.size}`,
  ];
});
</script>

<style scoped>
.v-badge {
  /* Base badge styles using design tokens */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Size variants */
.v-badge--sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-caption);
}

.v-badge--md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-body-sm);
}

/* Variant styles */
.v-badge--success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.v-badge--warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.v-badge--error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.v-badge--info {
  background-color: var(--color-info-light);
  color: var(--color-info-dark);
}
</style>

