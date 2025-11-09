# VSelect

A custom dropdown select component with search functionality and keyboard navigation.

## Design Tokens Used

- `--font-family-base`, `--font-size-body`, `--font-size-body-sm`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-card-white`, `--color-background`, `--color-border-gray`
- `--color-venmo-blue`, `--color-venmo-blue-50`
- `--color-success`, `--color-error`
- `--spacing-1`, `--spacing-2`, `--spacing-3`, `--spacing-4`
- `--radius-md`, `--line-height-normal`
- `--icon-sm`
- `--duration-base`, `--ease-out`
- `--shadow-lg`, `--shadow-focus`
- `--z-index-dropdown`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number \| null` | - | Selected value (v-model) |
| `options` | `(VSelectOption \| string \| number)[]` | - | Array of options |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `error` | `boolean` | `false` | Error state styling |
| `success` | `boolean` | `false` | Success state styling |
| `helperText` | `string` | `''` | Helper or error message |
| `searchable` | `boolean` | `false` | Enable search functionality |

## Types

```typescript
interface VSelectOption {
  label: string;
  value: string | number;
  [key: string]: any;
}
```

## Events

- `update:modelValue` - Emitted when selection changes

## Usage

```vue
<template>
  <VSelect
    v-model="country"
    :options="countries"
    searchable
    placeholder="Select country"
  />
</template>

<script setup>
const countries = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'Mexico', value: 'mx' }
];
</script>
```

## Keyboard Navigation

- **Enter/Space**: Open dropdown
- **Escape**: Close dropdown
- **Arrow Down**: Navigate to next option
- **Arrow Up**: Navigate to previous option

## Accessibility

- Uses `role="combobox"` for select trigger
- Options use `role="option"` with `aria-selected`
- Keyboard accessible with arrow key navigation
- Focus trap when dropdown is open

## Implementation Notes

- Closes on outside click
- Hover state on options uses `venmo-blue-50`
- Search input appears at top when `searchable` is true
- Selected option highlighted with blue text and background

