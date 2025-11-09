<template>
  <div class="v-textarea-wrapper">
    <textarea
      :id="id"
      v-model="textareaValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxLength"
      :class="textareaClasses"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="helperTextId"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      @input="handleInput"
    />
    <div v-if="showCount && maxLength" class="v-textarea-counter">
      {{ characterCount }} / {{ maxLength }}
    </div>
    <div v-if="helperText || error || success" :id="helperTextId" class="v-textarea-helper">
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VTextareaProps {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  helperText?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<VTextareaProps>(), {
  placeholder: '',
  disabled: false,
  error: false,
  success: false,
  helperText: '',
  rows: 4,
  showCount: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'blur': [event: FocusEvent];
  'focus': [event: FocusEvent];
}>();

const textareaValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const textareaClasses = computed(() => {
  return [
    'v-textarea',
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

const characterCount = computed(() => {
  return props.modelValue?.length || 0;
});

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}
</script>

<style scoped>
.v-textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.v-textarea {
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  width: 100%;
  resize: vertical;
  transition: border-color var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.v-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.v-textarea:focus {
  outline: none;
  border-color: var(--color-venmo-blue);
  box-shadow: var(--shadow-focus);
}

.v-textarea:hover:not(.is-disabled):not(:focus) {
  border-color: var(--color-text-secondary);
}

/* Error state */
.v-textarea.has-error {
  border-color: var(--color-error);
}

.v-textarea.has-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

/* Success state */
.v-textarea.has-success {
  border-color: var(--color-success);
}

.v-textarea.has-success:focus {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

/* Disabled state */
.v-textarea.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-background);
  resize: none;
}

/* Counter */
.v-textarea-counter {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  text-align: right;
}

/* Helper text */
.v-textarea-helper {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.v-textarea.has-error ~ .v-textarea-helper {
  color: var(--color-error);
}

.v-textarea.has-success ~ .v-textarea-helper {
  color: var(--color-success);
}
</style>

