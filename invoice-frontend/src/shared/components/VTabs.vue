<template>
  <div class="v-tabs">
    <div class="v-tabs-header" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value"
        :ref="el => setTabRef(el, index)"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.value"
        :class="getTabClasses(tab)"
        @click="selectTab(tab.value)"
        @keydown.left="navigateTab(-1)"
        @keydown.right="navigateTab(1)"
      >
        {{ tab.label }}
      </button>
      <div 
        class="v-tabs-indicator" 
        :style="indicatorStyle"
      />
    </div>
    <div class="v-tabs-content" role="tabpanel">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

export interface Tab {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface VTabsProps {
  modelValue: string | number;
  tabs: Tab[];
}

const props = withDefaults(defineProps<VTabsProps>(), {
  tabs: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'change': [value: string | number];
}>();

const tabRefs = ref<(HTMLElement | null)[]>([]);
const indicatorStyle = ref<Record<string, string>>({});

function setTabRef(el: any, index: number) {
  if (el) {
    tabRefs.value[index] = el as HTMLElement;
  }
}

function getTabClasses(tab: Tab) {
  return [
    'v-tabs-tab',
    {
      'v-tabs-tab--active': props.modelValue === tab.value,
      'v-tabs-tab--disabled': tab.disabled,
    },
  ];
}

function selectTab(value: string | number) {
  if (!props.tabs || props.tabs.length === 0) {
    return;
  }
  
  const tab = props.tabs.find(t => t.value === value);
  if (tab?.disabled) return;
  
  emit('update:modelValue', value);
  emit('change', value);
}

function navigateTab(direction: number) {
  if (!props.tabs || props.tabs.length === 0) {
    return;
  }
  
  const currentIndex = props.tabs.findIndex(t => t.value === props.modelValue);
  let newIndex = currentIndex + direction;

  // Wrap around
  if (newIndex < 0) newIndex = props.tabs.length - 1;
  if (newIndex >= props.tabs.length) newIndex = 0;

  // Skip disabled tabs
  while (props.tabs[newIndex].disabled && newIndex !== currentIndex) {
    newIndex += direction;
    if (newIndex < 0) newIndex = props.tabs.length - 1;
    if (newIndex >= props.tabs.length) newIndex = 0;
  }

  selectTab(props.tabs[newIndex].value);
  tabRefs.value[newIndex]?.focus();
}

function updateIndicator() {
  if (!props.tabs || props.tabs.length === 0) {
    return;
  }
  
  const activeIndex = props.tabs.findIndex(t => t.value === props.modelValue);
  const activeTab = tabRefs.value[activeIndex];

  if (activeTab) {
    indicatorStyle.value = {
      left: `${activeTab.offsetLeft}px`,
      width: `${activeTab.offsetWidth}px`,
    };
  }
}

watch(() => props.modelValue, () => {
  nextTick(() => {
    updateIndicator();
  });
});

watch(() => tabRefs.value.length, () => {
  nextTick(() => {
    updateIndicator();
  });
}, { immediate: true });
</script>

<style scoped>
.v-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.v-tabs-header {
  position: relative;
  display: flex;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--color-border-gray);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.v-tabs-header::-webkit-scrollbar {
  display: none;
}

.v-tabs-tab {
  position: relative;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--duration-base) var(--ease-out);
}

.v-tabs-tab:hover:not(.v-tabs-tab--disabled) {
  color: var(--color-text-primary);
}

.v-tabs-tab:focus-visible {
  outline: none;
  color: var(--color-venmo-blue);
}

.v-tabs-tab--active {
  color: var(--color-venmo-blue);
}

.v-tabs-tab--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-tabs-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: var(--color-venmo-blue);
  transition: left var(--duration-medium) var(--ease-out),
              width var(--duration-medium) var(--ease-out);
}

.v-tabs-content {
  padding: var(--spacing-4) 0;
}
</style>

