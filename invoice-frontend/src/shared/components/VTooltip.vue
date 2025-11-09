<template>
  <div 
    class="v-tooltip-wrapper" 
    ref="tooltipRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot />
    <transition name="tooltip">
      <div 
        v-if="isVisible" 
        :class="tooltipClasses"
        :style="tooltipStyle"
        role="tooltip"
      >
        <div class="v-tooltip-arrow" :style="arrowStyle" />
        <div class="v-tooltip-content">
          {{ content }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

export interface VTooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'focus' | 'both';
}

const props = withDefaults(defineProps<VTooltipProps>(), {
  placement: 'top',
  trigger: 'hover',
});

const isVisible = ref(false);
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipPosition = ref({ top: 0, left: 0 });

const tooltipClasses = computed(() => {
  return [
    'v-tooltip',
    `v-tooltip--${props.placement}`,
  ];
});

const tooltipStyle = computed(() => {
  return {
    top: `${tooltipPosition.value.top}px`,
    left: `${tooltipPosition.value.left}px`,
  };
});

const arrowStyle = computed(() => {
  const styles: Record<string, string> = {};
  
  switch (props.placement) {
    case 'top':
      styles.bottom = '-4px';
      styles.left = '50%';
      styles.transform = 'translateX(-50%) rotate(45deg)';
      break;
    case 'bottom':
      styles.top = '-4px';
      styles.left = '50%';
      styles.transform = 'translateX(-50%) rotate(45deg)';
      break;
    case 'left':
      styles.right = '-4px';
      styles.top = '50%';
      styles.transform = 'translateY(-50%) rotate(45deg)';
      break;
    case 'right':
      styles.left = '-4px';
      styles.top = '50%';
      styles.transform = 'translateY(-50%) rotate(45deg)';
      break;
  }
  
  return styles;
});

function show() {
  isVisible.value = true;
  nextTick(() => {
    updatePosition();
  });
}

function hide() {
  isVisible.value = false;
}

function handleMouseEnter() {
  if (props.trigger === 'hover' || props.trigger === 'both') {
    show();
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover' || props.trigger === 'both') {
    hide();
  }
}

function handleFocus() {
  if (props.trigger === 'focus' || props.trigger === 'both') {
    show();
  }
}

function handleBlur() {
  if (props.trigger === 'focus' || props.trigger === 'both') {
    hide();
  }
}

function updatePosition() {
  if (!tooltipRef.value) return;

  const trigger = tooltipRef.value;
  const triggerRect = trigger.getBoundingClientRect();
  const spacing = 8;

  let top = 0;
  let left = 0;

  switch (props.placement) {
    case 'top':
      top = triggerRect.top - spacing;
      left = triggerRect.left + triggerRect.width / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + spacing;
      left = triggerRect.left + triggerRect.width / 2;
      break;
    case 'left':
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.left - spacing;
      break;
    case 'right':
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.right + spacing;
      break;
  }

  tooltipPosition.value = { top, left };
}
</script>

<style scoped>
.v-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.v-tooltip {
  position: fixed;
  z-index: var(--z-index-tooltip);
  background-color: var(--color-deep-blue);
  color: var(--color-card-white);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-normal);
  white-space: nowrap;
  pointer-events: none;
}

.v-tooltip--top {
  transform: translate(-50%, -100%);
}

.v-tooltip--bottom {
  transform: translate(-50%, 0);
}

.v-tooltip--left {
  transform: translate(-100%, -50%);
}

.v-tooltip--right {
  transform: translate(0, -50%);
}

.v-tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--color-deep-blue);
}

.v-tooltip-content {
  position: relative;
  z-index: 1;
}

/* Tooltip transition */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>

