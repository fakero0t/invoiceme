<template>
  <div class="v-table-wrapper">
    <!-- Desktop table view -->
    <div class="v-table-desktop">
      <table class="v-table">
        <thead class="v-table-head">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :class="getHeaderClasses(column)"
              @click="handleSort(column)"
            >
              <div class="v-table-header-content">
                <span>{{ column.label }}</span>
                <svg 
                  v-if="sortable && column.sortable !== false" 
                  class="v-table-sort-icon"
                  :class="{ 
                    'v-table-sort-icon--active': sortKey === column.key,
                    'v-table-sort-icon--desc': sortKey === column.key && sortDirection === 'desc'
                  }"
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="v-table-body">
          <tr 
            v-for="(row, index) in sortedData" 
            :key="index"
            :class="getRowClasses(index)"
          >
            <td 
              v-for="column in columns" 
              :key="column.key"
              class="v-table-cell"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
          <tr v-if="!sortedData.length">
            <td :colspan="columns.length" class="v-table-empty">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile card view -->
    <div class="v-table-mobile">
      <div 
        v-for="(row, index) in sortedData" 
        :key="index"
        class="v-table-card"
      >
        <div 
          v-for="column in columns" 
          :key="column.key"
          class="v-table-card-row"
        >
          <div class="v-table-card-label">{{ column.label }}</div>
          <div class="v-table-card-value">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </div>
        </div>
      </div>
      <div v-if="!sortedData.length" class="v-table-empty">
        No data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface VTableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  sortable?: boolean;
  hoverable?: boolean;
  striped?: boolean;
}

const props = withDefaults(defineProps<VTableProps>(), {
  data: () => [],
  columns: () => [],
  sortable: false,
  hoverable: true,
  striped: false,
});

const sortKey = ref<string>('');
const sortDirection = ref<'asc' | 'desc'>('asc');

const sortedData = computed(() => {
  if (!sortKey.value || !props.data) {
    return props.data || [];
  }

  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];

    if (aVal === bVal) return 0;

    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
});

function handleSort(column: TableColumn) {
  if (!props.sortable || column.sortable === false) return;

  if (sortKey.value === column.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = column.key;
    sortDirection.value = 'asc';
  }
}

function getHeaderClasses(column: TableColumn) {
  return [
    'v-table-header',
    {
      'v-table-header--sortable': props.sortable && column.sortable !== false,
      'v-table-header--sorted': sortKey.value === column.key,
    },
  ];
}

function getRowClasses(index: number) {
  return [
    'v-table-row',
    {
      'v-table-row--hoverable': props.hoverable,
      'v-table-row--striped': props.striped && index % 2 === 1,
    },
  ];
}
</script>

<style scoped>
.v-table-wrapper {
  width: 100%;
  overflow: hidden;
}

/* Desktop table */
.v-table-desktop {
  display: block;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .v-table-desktop {
    display: none;
  }
}

.v-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-card-white);
  border-radius: var(--radius-md);
}

.v-table-head {
  position: sticky;
  top: 0;
  background-color: var(--color-background);
  z-index: var(--z-index-sticky);
}

.v-table-header {
  padding: var(--spacing-4);
  text-align: left;
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-gray);
}

.v-table-header--sortable {
  cursor: pointer;
  user-select: none;
  transition: color var(--duration-base) var(--ease-out);
}

.v-table-header--sortable:hover {
  color: var(--color-text-primary);
}

.v-table-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.v-table-sort-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-tertiary);
  transition: transform var(--duration-base) var(--ease-out),
              color var(--duration-base) var(--ease-out);
}

.v-table-sort-icon--active {
  color: var(--color-venmo-blue);
}

.v-table-sort-icon--desc {
  transform: rotate(180deg);
}

.v-table-body {
  background-color: var(--color-card-white);
}

.v-table-row {
  border-bottom: 1px solid var(--color-border-gray);
}

.v-table-row:last-child {
  border-bottom: none;
}

.v-table-row--hoverable:hover {
  background-color: var(--color-venmo-blue-50);
}

.v-table-row--striped {
  background-color: var(--color-background);
}

.v-table-cell {
  padding: var(--spacing-4);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-primary);
}

.v-table-empty {
  padding: var(--spacing-8) var(--spacing-4);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-body-sm);
}

/* Mobile cards */
.v-table-mobile {
  display: none;
}

@media (max-width: 768px) {
  .v-table-mobile {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }
}

.v-table-card {
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.v-table-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.v-table-card-label {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.v-table-card-value {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-primary);
  text-align: right;
}
</style>

