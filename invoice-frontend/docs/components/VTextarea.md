# VTextarea

A multi-line text input component with character counting and validation states.

## Design Tokens Used

- `--font-family-base`, `--font-size-body`, `--font-size-caption`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-card-white`, `--color-background`, `--color-border-gray`
- `--color-success`, `--color-error`
- `--spacing-1`, `--spacing-3`, `--spacing-4`
- `--radius-md`, `--line-height-normal`
- `--duration-base`, `--ease-out`
- `--shadow-focus`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | - | The textarea value (v-model) |
| `placeholder` | `string` | `''` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the textarea |
| `error` | `boolean` | `false` | Error state styling |
| `success` | `boolean` | `false` | Success state styling |
| `helperText` | `string` | `''` | Helper or error message |
| `rows` | `number` | `4` | Number of visible text lines |
| `maxLength` | `number` | - | Maximum character count |
| `showCount` | `boolean` | `false` | Show character counter |
| `id` | `string` | - | HTML id attribute |

## Events

- `update:modelValue` - Emitted when value changes
- `blur` - Emitted on blur
- `focus` - Emitted on focus

## Usage

```vue
<template>
  <VTextarea
    v-model="description"
    placeholder="Enter description"
    :maxLength="500"
    showCount
    helperText="Describe your item"
  />
</template>
```

## Accessibility

- Uses semantic `<textarea>` element
- Supports `aria-invalid` for error states
- Helper text linked via `aria-describedby`
- Keyboard accessible

## Implementation Notes

- Vertical resize only
- Character counter displays current/max when `showCount` is true
- Focus state shows blue ring using `shadow-focus`

