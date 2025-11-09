<template>
  <div class="v-empty-state">
    <div v-if="icon" class="v-empty-state-icon">
      <component :is="icon" />
    </div>
    <h2 v-if="heading" class="v-empty-state-heading">{{ heading }}</h2>
    <p v-if="description" class="v-empty-state-description">{{ description }}</p>
    <VButton 
      v-if="actionText" 
      class="v-empty-state-action"
      @click="handleAction"
    >
      {{ actionText }}
    </VButton>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { type Component } from 'vue';
import VButton from './VButton.vue';

export interface VEmptyStateProps {
  icon?: Component;
  heading?: string;
  description?: string;
  actionText?: string;
}

const props = defineProps<VEmptyStateProps>();

const emit = defineEmits<{
  'action': [];
}>();

function handleAction() {
  emit('action');
}
</script>

<style scoped>
.v-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
  gap: var(--spacing-4);
}

.v-empty-state-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
}

.v-empty-state-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.v-empty-state-heading {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.v-empty-state-description {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  max-width: 480px;
  margin: 0;
}

.v-empty-state-action {
  margin-top: var(--spacing-2);
}
</style>

