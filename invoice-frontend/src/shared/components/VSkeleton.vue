<template>
  <div :class="skeletonClasses" :style="skeletonStyles">
    <div v-if="variant === 'text' && count > 1" class="v-skeleton-lines">
      <div 
        v-for="i in count" 
        :key="i" 
        class="v-skeleton-line"
        :style="getLineStyle(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VSkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
  count?: number;
}

const props = withDefaults(defineProps<VSkeletonProps>(), {
  variant: 'text',
  width: '100%',
  height: 'auto',
  count: 1,
});

const skeletonClasses = computed(() => {
  return [
    'v-skeleton',
    `v-skeleton--${props.variant}`,
  ];
});

const skeletonStyles = computed(() => {
  const styles: Record<string, string> = {};
  
  if (props.variant === 'text') {
    styles.height = props.height === 'auto' ? '16px' : props.height;
    styles.width = props.width;
  } else if (props.variant === 'circle') {
    const size = props.width || props.height || '40px';
    styles.width = size;
    styles.height = size;
  } else {
    styles.width = props.width;
    styles.height = props.height === 'auto' ? '100px' : props.height;
  }
  
  return styles;
});

function getLineStyle(index: number) {
  // Last line is shorter
  if (index === props.count && props.count > 1) {
    return { width: '70%' };
  }
  return {};
}
</script>

<style scoped>
.v-skeleton {
  background: linear-gradient(
    90deg,
    var(--color-background) 0%,
    var(--color-border-gray) 50%,
    var(--color-background) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.v-skeleton--text {
  border-radius: var(--radius-sm);
}

.v-skeleton--circle {
  border-radius: var(--radius-full);
}

.v-skeleton--rect {
  border-radius: var(--radius-sm);
}

.v-skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
}

.v-skeleton-line {
  height: 16px;
  background: linear-gradient(
    90deg,
    var(--color-background) 0%,
    var(--color-border-gray) 50%,
    var(--color-background) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

