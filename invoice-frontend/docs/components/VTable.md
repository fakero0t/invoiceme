# VTable

A responsive table component that transforms into cards on mobile.

## Design Tokens Used

- `--font-size-body-sm`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-card-white`, `--color-background`, `--color-border-gray`
- `--color-venmo-blue`, `--color-venmo-blue-50`
- `--spacing-3`, `--spacing-4`, `--spacing-8`
- `--radius-md`
- `--icon-sm`
- `--duration-base`, `--ease-out`
- `--z-index-sticky`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn[]` | - | Column definitions |
| `data` | `Record<string, any>[]` | - | Table data rows |
| `sortable` | `boolean` | `false` | Enable column sorting |
| `hoverable` | `boolean` | `true` | Highlight rows on hover |
| `striped` | `boolean` | `false` | Alternating row colors |

## Types

```typescript
interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}
```

## Slots

- `cell-{column.key}` - Custom cell rendering per column

## Usage

```vue
<template>
  <VTable 
    :columns="columns" 
    :data="invoices"
    sortable
    hoverable
  >
    <template #cell-status="{ value }">
      <VBadge :variant="getStatusVariant(value)">
        {{ value }}
      </VBadge>
    </template>
  </VTable>
</template>

<script setup>
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status', sortable: false }
];
</script>
```

## Responsive Behavior

**Desktop** (≥ 768px):
- Traditional table layout
- Sticky header
- Sortable columns with arrow indicators

**Mobile** (< 768px):
- Card-based layout
- Each row becomes a card
- Label-value pairs vertically stacked

## Accessibility

- Semantic `<table>` structure on desktop
- Column headers properly associated
- Keyboard accessible sorting

## Implementation Notes

- Hover state uses `venmo-blue-50` background
- Striped rows alternate with `background` color
- Sort indicator rotates 180° when descending
- Empty state shows "No data available" message

