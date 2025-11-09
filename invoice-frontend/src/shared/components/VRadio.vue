<template>
  <label :class="radioClasses">
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      class="v-radio-input"
      @change="handleChange"
    />
    <span class="v-radio-button">
      <span v-if="isChecked" class="v-radio-dot"></span>
    </span>
    <span v-if="label" class="v-radio-label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface VRadioProps {
  modelValue: string | number | boolean;
  value: string | number | boolean;
  label?: string;
  disabled?: boolean;
  name?: string;
}

const props = withDefaults(defineProps<VRadioProps>(), {
  label: '',
  disabled: false,
  name: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean];
}>();

const isChecked = computed(() => {
  return props.modelValue === props.value;
});

const radioClasses = computed(() => {
  return [
    'v-radio',
    {
      'v-radio--disabled': props.disabled,
      'v-radio--checked': isChecked.value,
    },
  ];
});

function handleChange() {
  if (!props.disabled) {
    emit('update:modelValue', props.value);
  }
}
</script>

<style scoped>
.v-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  user-select: none;
}

.v-radio--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.v-radio-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
  border: 2px solid var(--color-border-gray);
  border-radius: var(--radius-full);
  background-color: var(--color-card-white);
  transition: all var(--duration-base) var(--ease-out);
  flex-shrink: 0;
}

.v-radio:hover:not(.v-radio--disabled) .v-radio-button {
  border-color: var(--color-venmo-blue);
}

.v-radio--checked .v-radio-button {
  border-color: var(--color-venmo-blue);
}

.v-radio-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background-color: var(--color-venmo-blue);
  transition: transform var(--duration-base) var(--ease-out);
  animation: radio-pop var(--duration-base) var(--ease-bounce);
}

@keyframes radio-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.v-radio-label {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.v-radio-input:focus-visible + .v-radio-button {
  box-shadow: var(--shadow-focus);
}
</style>

