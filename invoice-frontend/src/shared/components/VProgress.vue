<template>
  <div :class="progressClasses">
    <!-- Linear variant -->
    <div v-if="variant === 'linear'" class="v-progress-linear">
      <div 
        :class="barClasses"
        :style="barStyle"
      />
    </div>

    <!-- Circular variant -->
    <svg 
      v-else 
      class="v-progress-circular" 
      :width="circularSize" 
      :height="circularSize"
      viewBox="0 0 100 100"
    >
      <circle
        class="v-progress-circular-track"
        cx="50"
        cy="50"
        :r="circularRadius"
        fill="none"
        :stroke-width="circularStroke"
      />
      <circle
        :class="circleClasses"
        cx="50"
        cy="50"
        :r="circularRadius"
        fill="none"
        :stroke-width="circularStroke"
        :stroke-dasharray="circularCircumference"
        :stroke-dashoffset="circularOffset"
        stroke-linecap="round"
      />
      <text
        v-if="!indeterminate && showPercentage"
        x="50"
        y="50"
        text-anchor="middle"
        dy=".3em"
        class="v-progress-percentage"
      >
        {{ Math.round(percentage) }}%
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VProgressProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  showPercentage?: boolean;
}

const props = withDefaults(defineProps<VProgressProps>(), {
  value: 0,
  max: 100,
  indeterminate: false,
  size: 'md',
  variant: 'linear',
  showPercentage: false,
});

const progressClasses = computed(() => {
  return [
    'v-progress',
    `v-progress--${props.size}`,
    `v-progress--${props.variant}`,
  ];
});

const barClasses = computed(() => {
  return [
    'v-progress-bar',
    {
      'v-progress-bar--indeterminate': props.indeterminate,
    },
  ];
});

const circleClasses = computed(() => {
  return [
    'v-progress-circular-bar',
    {
      'v-progress-circular-bar--indeterminate': props.indeterminate,
    },
  ];
});

const percentage = computed(() => {
  return Math.min((props.value / props.max) * 100, 100);
});

const barStyle = computed(() => {
  if (props.indeterminate) {
    return {};
  }
  return {
    width: `${percentage.value}%`,
  };
});

const circularSize = computed(() => {
  const sizes = {
    sm: 40,
    md: 60,
    lg: 80,
  };
  return sizes[props.size];
});

const circularStroke = computed(() => {
  const strokes = {
    sm: 4,
    md: 6,
    lg: 8,
  };
  return strokes[props.size];
});

const circularRadius = computed(() => {
  return (100 - circularStroke.value) / 2;
});

const circularCircumference = computed(() => {
  return 2 * Math.PI * circularRadius.value;
});

const circularOffset = computed(() => {
  if (props.indeterminate) {
    return 0;
  }
  return circularCircumference.value * (1 - percentage.value / 100);
});
</script>

<style scoped>
.v-progress {
  display: inline-block;
}

/* Linear variant */
.v-progress-linear {
  width: 100%;
  background-color: var(--color-background);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.v-progress--sm .v-progress-linear {
  height: 4px;
}

.v-progress--md .v-progress-linear {
  height: 8px;
}

.v-progress--lg .v-progress-linear {
  height: 12px;
}

.v-progress-bar {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-medium) var(--ease-out);
}

.v-progress-bar--indeterminate {
  width: 30%;
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

/* Circular variant */
.v-progress-circular {
  transform: rotate(-90deg);
}

.v-progress-circular-track {
  stroke: var(--color-background);
}

.v-progress-circular-bar {
  stroke: url(#progress-gradient);
  transition: stroke-dashoffset var(--duration-medium) var(--ease-out);
}

.v-progress-circular-bar--indeterminate {
  animation: progress-circular-indeterminate 1.5s linear infinite;
}

@keyframes progress-circular-indeterminate {
  0% {
    stroke-dashoffset: 0;
    transform: rotate(0deg);
  }
  100% {
    stroke-dashoffset: -280;
    transform: rotate(360deg);
  }
}

.v-progress-percentage {
  fill: var(--color-text-primary);
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
  transform: rotate(90deg);
  transform-origin: center;
}
</style>

