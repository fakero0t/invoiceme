<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VCardProps {
  shadow?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<VCardProps>(), {
  shadow: 'md',
  padding: 'md',
});

const cardClasses = computed(() => {
  return [
    'v-card',
    `v-card--shadow-${props.shadow}`,
    `v-card--padding-${props.padding}`,
  ];
});
</script>

<style scoped>
.v-card {
  /* Base card styles using design tokens */
  background-color: var(--color-card-white);
  border-radius: var(--radius-md);
  transition: box-shadow var(--duration-base) var(--ease-out);
}

/* Shadow variants */
.v-card--shadow-sm {
  box-shadow: var(--shadow-sm);
}

.v-card--shadow-md {
  box-shadow: var(--shadow-md);
}

.v-card--shadow-lg {
  box-shadow: var(--shadow-lg);
}

/* Padding variants */
.v-card--padding-sm {
  padding: var(--spacing-4);
}

.v-card--padding-md {
  padding: var(--spacing-6);
}

.v-card--padding-lg {
  padding: var(--spacing-8);
}
</style>

