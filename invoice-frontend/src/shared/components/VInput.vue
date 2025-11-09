<template>
  <div class="v-input-wrapper">
    <input
      :id="id"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="helperTextId"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <div v-if="helperText || error || success" :id="helperTextId" class="v-input-helper">
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VInputProps {
  modelValue: string | number;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  helperText?: string;
  id?: string;
}

const props = withDefaults(defineProps<VInputProps>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: false,
  success: false,
  helperText: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'blur': [event: FocusEvent];
  'focus': [event: FocusEvent];
}>();

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => emit('update:modelValue', value),
});

const inputClasses = computed(() => {
  return [
    'v-input',
    {
      'has-error': props.error,
      'has-success': props.success,
      'is-disabled': props.disabled,
    },
  ];
});

const helperTextId = computed(() => {
  return props.id ? `${props.id}-helper` : undefined;
});
</script>

<style scoped>
.v-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.v-input {
  /* Base styles using design tokens */
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  width: 100%;
  transition: border-color var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.v-input::placeholder {
  color: var(--color-text-tertiary);
}

.v-input:focus {
  outline: none;
  border-color: var(--color-venmo-blue);
  box-shadow: var(--shadow-focus);
}

.v-input:hover:not(.is-disabled):not(:focus) {
  border-color: var(--color-text-secondary);
}

/* Error state */
.v-input.has-error {
  border-color: var(--color-error);
}

.v-input.has-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

/* Success state */
.v-input.has-success {
  border-color: var(--color-success);
}

.v-input.has-success:focus {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

/* Disabled state */
.v-input.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-background);
}

/* Helper text */
.v-input-helper {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.v-input.has-error + .v-input-helper {
  color: var(--color-error);
}

.v-input.has-success + .v-input-helper {
  color: var(--color-success);
}
</style>

