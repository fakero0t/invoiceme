<template>
  <div class="v-select-wrapper" ref="selectRef">
    <div 
      :class="selectClasses" 
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      role="combobox"
      tabindex="0"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      @keydown.escape="closeDropdown"
      @keydown.down.prevent="navigateOptions(1)"
      @keydown.up.prevent="navigateOptions(-1)"
    >
      <span v-if="selectedLabel" class="v-select-value">{{ selectedLabel }}</span>
      <span v-else class="v-select-placeholder">{{ placeholder }}</span>
      <svg class="v-select-icon" :class="{ 'v-select-icon--open': isOpen }" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="v-select-dropdown">
        <input
          v-if="searchable"
          v-model="searchQuery"
          type="text"
          class="v-select-search"
          placeholder="Search..."
          @click.stop
          @keydown.escape="closeDropdown"
          ref="searchInputRef"
        />
        <div class="v-select-options" ref="optionsRef">
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionValue(option)"
            :class="[
              'v-select-option',
              {
                'v-select-option--selected': isSelected(option),
                'v-select-option--focused': index === focusedIndex,
              }
            ]"
            @click="selectOption(option)"
            @mouseenter="focusedIndex = index"
            role="option"
            :aria-selected="isSelected(option)"
          >
            {{ getOptionLabel(option) }}
          </div>
          <div v-if="filteredOptions.length === 0" class="v-select-empty">
            No options found
          </div>
        </div>
      </div>
    </transition>
    
    <div v-if="helperText || error || success" class="v-select-helper">
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

export interface VSelectOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface VSelectProps {
  modelValue: string | number | null;
  options: (VSelectOption | string | number)[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  helperText?: string;
  searchable?: boolean;
}

const props = withDefaults(defineProps<VSelectProps>(), {
  options: () => [],
  placeholder: 'Select an option',
  disabled: false,
  error: false,
  success: false,
  helperText: '',
  searchable: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const focusedIndex = ref(0);
const selectRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const optionsRef = ref<HTMLElement | null>(null);

const selectClasses = computed(() => {
  return [
    'v-select',
    {
      'has-error': props.error,
      'has-success': props.success,
      'is-disabled': props.disabled,
      'is-open': isOpen.value,
    },
  ];
});

const normalizedOptions = computed(() => {
  if (!props.options || props.options.length === 0) {
    return [];
  }
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { label: String(option), value: option };
    }
    return option;
  });
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return normalizedOptions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return normalizedOptions.value.filter(option =>
    option.label.toLowerCase().includes(query)
  );
});

const selectedOption = computed(() => {
  return normalizedOptions.value.find(option => option.value === props.modelValue);
});

const selectedLabel = computed(() => {
  return selectedOption.value?.label || '';
});

function getOptionValue(option: VSelectOption) {
  return option.value;
}

function getOptionLabel(option: VSelectOption) {
  return option.label;
}

function isSelected(option: VSelectOption) {
  return option.value === props.modelValue;
}

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      if (props.searchable && searchInputRef.value) {
        searchInputRef.value.focus();
      }
    });
  }
}

function closeDropdown() {
  isOpen.value = false;
  searchQuery.value = '';
  focusedIndex.value = 0;
}

function selectOption(option: VSelectOption) {
  emit('update:modelValue', option.value);
  closeDropdown();
}

function navigateOptions(direction: number) {
  if (!isOpen.value) {
    toggleDropdown();
    return;
  }
  const newIndex = focusedIndex.value + direction;
  if (newIndex >= 0 && newIndex < filteredOptions.value.length) {
    focusedIndex.value = newIndex;
    // Scroll into view
    nextTick(() => {
      const option = optionsRef.value?.children[newIndex] as HTMLElement;
      option?.scrollIntoView({ block: 'nearest' });
    });
  }
  if (direction === 1 && newIndex === filteredOptions.value.length) {
    focusedIndex.value = 0;
  } else if (direction === -1 && newIndex < 0) {
    focusedIndex.value = filteredOptions.value.length - 1;
  }
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.v-select-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.v-select {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: border-color var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.v-select:hover:not(.is-disabled) {
  border-color: var(--color-text-secondary);
}

.v-select:focus {
  outline: none;
  border-color: var(--color-venmo-blue);
  box-shadow: var(--shadow-focus);
}

.v-select.is-open {
  border-color: var(--color-venmo-blue);
  box-shadow: var(--shadow-focus);
}

.v-select-placeholder {
  color: var(--color-text-tertiary);
}

.v-select-value {
  flex: 1;
}

.v-select-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-tertiary);
  transition: transform var(--duration-base) var(--ease-out);
}

.v-select-icon--open {
  transform: rotate(180deg);
}

/* Error state */
.v-select.has-error {
  border-color: var(--color-error);
}

/* Success state */
.v-select.has-success {
  border-color: var(--color-success);
}

/* Disabled state */
.v-select.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-background);
}

/* Dropdown */
.v-select-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-1));
  left: 0;
  right: 0;
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-index-dropdown);
  overflow: hidden;
}

.v-select-search {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-bottom: 1px solid var(--color-border-gray);
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
}

.v-select-search:focus {
  outline: none;
}

.v-select-options {
  max-height: 240px;
  overflow-y: auto;
}

.v-select-option {
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out);
}

.v-select-option:hover,
.v-select-option--focused {
  background-color: var(--color-venmo-blue-50);
}

.v-select-option--selected {
  background-color: var(--color-venmo-blue-50);
  color: var(--color-venmo-blue);
  font-weight: var(--font-weight-medium);
}

.v-select-empty {
  padding: var(--spacing-4);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-body-sm);
}

/* Helper text */
.v-select-helper {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.v-select.has-error ~ .v-select-helper {
  color: var(--color-error);
}

.v-select.has-success ~ .v-select-helper {
  color: var(--color-success);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

