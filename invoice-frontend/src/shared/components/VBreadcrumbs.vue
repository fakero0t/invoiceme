<template>
  <nav class="v-breadcrumbs" aria-label="Breadcrumb">
    <ol class="v-breadcrumbs-list">
      <li 
        v-for="(item, index) in items" 
        :key="index"
        class="v-breadcrumbs-item"
      >
        <router-link
          v-if="item.to && index !== items.length - 1"
          :to="item.to"
          class="v-breadcrumbs-link"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="v-breadcrumbs-current">
          {{ item.label }}
        </span>
        <svg 
          v-if="index !== items.length - 1"
          class="v-breadcrumbs-separator"
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';

export interface BreadcrumbItem {
  label: string;
  to?: RouteLocationRaw;
}

export interface VBreadcrumbsProps {
  items: BreadcrumbItem[];
}

defineProps<VBreadcrumbsProps>();
</script>

<style scoped>
.v-breadcrumbs {
  display: flex;
  align-items: center;
}

.v-breadcrumbs-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.v-breadcrumbs-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.v-breadcrumbs-link {
  font-size: var(--font-size-body-sm);
  color: var(--color-venmo-blue);
  text-decoration: none;
  transition: color var(--duration-base) var(--ease-out);
}

.v-breadcrumbs-link:hover {
  color: var(--color-venmo-blue-600);
  text-decoration: underline;
}

.v-breadcrumbs-current {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.v-breadcrumbs-separator {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .v-breadcrumbs-list {
    gap: var(--spacing-1);
  }

  .v-breadcrumbs-item {
    gap: var(--spacing-1);
  }

  .v-breadcrumbs-link,
  .v-breadcrumbs-current {
    font-size: var(--font-size-caption);
  }
}
</style>

