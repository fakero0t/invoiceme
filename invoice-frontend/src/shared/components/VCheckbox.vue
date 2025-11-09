<template>
  <label :class="checkboxClasses">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="v-checkbox-input"
      @change="handleChange"
      :aria-invalid="error ? 'true' : 'false'"
    />
    <span class="v-checkbox-box">
      <svg v-if="modelValue" class="v-checkbox-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </span>
    <span v-if="label" class="v-checkbox-label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VCheckboxProps {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
  error?: boolean;
}

const props = withDefaults(defineProps<VCheckboxProps>(), {
  label: '',
  disabled: false,
  error: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const checkboxClasses = computed(() => {
  return [
    'v-checkbox',
    {
      'v-checkbox--disabled': props.disabled,
      'v-checkbox--error': props.error,
      'v-checkbox--checked': props.modelValue,
    },
  ];
});

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
}
</script>

<style scoped>
.v-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  user-select: none;
}

.v-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.v-checkbox-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
  border: 2px solid var(--color-border-gray);
  border-radius: var(--radius-sm);
  background-color: var(--color-card-white);
  transition: all var(--duration-base) var(--ease-out);
  flex-shrink: 0;
}

.v-checkbox:hover:not(.v-checkbox--disabled) .v-checkbox-box {
  border-color: var(--color-venmo-blue);
}

.v-checkbox--checked .v-checkbox-box {
  background-color: var(--color-venmo-blue);
  border-color: var(--color-venmo-blue);
}

.v-checkbox--error .v-checkbox-box {
  border-color: var(--color-error);
}

.v-checkbox-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-card-white);
}

.v-checkbox-label {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.v-checkbox-input:focus-visible + .v-checkbox-box {
  box-shadow: var(--shadow-focus);
}
</style>

