<template>
  <div :class="dividerClasses" role="separator" :aria-orientation="orientation">
    <span v-if="$slots.default" class="v-divider-text">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VDividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<VDividerProps>(), {
  orientation: 'horizontal',
  spacing: 'md',
});

const dividerClasses = computed(() => {
  return [
    'v-divider',
    `v-divider--${props.orientation}`,
    `v-divider--spacing-${props.spacing}`,
    {
      'v-divider--with-text': !!useSlots().default,
    },
  ];
});
</script>

<script lang="ts">
import { useSlots } from 'vue';
</script>

<style scoped>
.v-divider {
  position: relative;
  border: none;
  background-color: var(--color-border-gray);
}

/* Horizontal */
.v-divider--horizontal {
  width: 100%;
  height: 1px;
}

.v-divider--horizontal.v-divider--spacing-sm {
  margin: var(--spacing-2) 0;
}

.v-divider--horizontal.v-divider--spacing-md {
  margin: var(--spacing-4) 0;
}

.v-divider--horizontal.v-divider--spacing-lg {
  margin: var(--spacing-6) 0;
}

/* Vertical */
.v-divider--vertical {
  width: 1px;
  height: 100%;
  display: inline-block;
}

.v-divider--vertical.v-divider--spacing-sm {
  margin: 0 var(--spacing-2);
}

.v-divider--vertical.v-divider--spacing-md {
  margin: 0 var(--spacing-4);
}

.v-divider--vertical.v-divider--spacing-lg {
  margin: 0 var(--spacing-6);
}

/* With text */
.v-divider--with-text {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
}

.v-divider--horizontal.v-divider--with-text::before,
.v-divider--horizontal.v-divider--with-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border-gray);
}

.v-divider-text {
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
</style>

