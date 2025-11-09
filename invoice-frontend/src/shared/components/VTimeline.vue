<template>
  <div class="v-timeline">
    <div 
      v-for="(item, index) in items" 
      :key="index" 
      class="v-timeline-item"
    >
      <div :class="['v-timeline-dot', `v-timeline-dot--${item.variant || 'default'}`]">
        <component v-if="item.icon" :is="item.icon" class="v-timeline-icon" />
      </div>
      <div class="v-timeline-content">
        <div class="v-timeline-header">
          <h4 v-if="item.title" class="v-timeline-title">{{ item.title }}</h4>
          <span v-if="item.timestamp" class="v-timeline-timestamp">{{ item.timestamp }}</span>
        </div>
        <p v-if="item.description" class="v-timeline-description">{{ item.description }}</p>
        <slot :name="`item-${index}`" :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Component } from 'vue';

export interface TimelineItem {
  title?: string;
  description?: string;
  timestamp?: string;
  icon?: Component;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
}

export interface VTimelineProps {
  items: TimelineItem[];
}

defineProps<VTimelineProps>();
</script>

<style scoped>
.v-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding-left: var(--spacing-2);
}

.v-timeline-item {
  position: relative;
  display: flex;
  gap: var(--spacing-4);
}

.v-timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 32px;
  bottom: -24px;
  width: 2px;
  background-color: var(--color-border-gray);
}

.v-timeline-dot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  z-index: 1;
}

.v-timeline-dot--default {
  background-color: var(--color-background);
  border: 2px solid var(--color-border-gray);
}

.v-timeline-dot--success {
  background-color: var(--color-success-light);
  border: 2px solid var(--color-success);
  color: var(--color-success-dark);
}

.v-timeline-dot--error {
  background-color: var(--color-error-light);
  border: 2px solid var(--color-error);
  color: var(--color-error-dark);
}

.v-timeline-dot--warning {
  background-color: var(--color-warning-light);
  border: 2px solid var(--color-warning);
  color: var(--color-warning-dark);
}

.v-timeline-dot--info {
  background-color: var(--color-info-light);
  border: 2px solid var(--color-info);
  color: var(--color-info-dark);
}

.v-timeline-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.v-timeline-content {
  flex: 1;
  padding-top: var(--spacing-1);
}

.v-timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-2);
}

.v-timeline-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.v-timeline-timestamp {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.v-timeline-description {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
}
</style>

