<template>
  <div class="v-pagination">
    <VButton
      size="sm"
      variant="ghost"
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
      aria-label="Previous page"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="v-pagination-icon">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </VButton>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === 'ellipsis'" class="v-pagination-ellipsis">...</span>
      <VButton
        v-else
        size="sm"
        :variant="page === currentPage ? 'primary' : 'ghost'"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </VButton>
    </template>

    <VButton
      size="sm"
      variant="ghost"
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
      aria-label="Next page"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="v-pagination-icon">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </VButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VButton from './VButton.vue';

export interface VPaginationProps {
  currentPage: number;
  totalPages: number;
  maxVisible?: number;
}

const props = withDefaults(defineProps<VPaginationProps>(), {
  maxVisible: 7,
});

const emit = defineEmits<{
  'update:currentPage': [value: number];
  'change': [value: number];
}>();

const visiblePages = computed(() => {
  const pages: (number | 'ellipsis')[] = [];
  const halfVisible = Math.floor(props.maxVisible / 2);

  if (props.totalPages <= props.maxVisible) {
    // Show all pages
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    let start = Math.max(2, props.currentPage - halfVisible);
    let end = Math.min(props.totalPages - 1, props.currentPage + halfVisible);

    // Adjust if we're near the start or end
    if (props.currentPage <= halfVisible + 1) {
      end = props.maxVisible - 1;
    } else if (props.currentPage >= props.totalPages - halfVisible) {
      start = props.totalPages - props.maxVisible + 2;
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < props.totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (props.totalPages > 1) {
      pages.push(props.totalPages);
    }
  }

  return pages;
});

function goToPage(page: number) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) {
    return;
  }
  emit('update:currentPage', page);
  emit('change', page);
}
</script>

<style scoped>
.v-pagination {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  justify-content: center;
}

.v-pagination-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.v-pagination-ellipsis {
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-body-sm);
}

@media (max-width: 768px) {
  .v-pagination {
    gap: var(--spacing-1);
  }
}
</style>

