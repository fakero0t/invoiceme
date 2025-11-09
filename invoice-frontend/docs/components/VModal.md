# VModal

A modal dialog component with responsive behavior and focus trapping.

## Design Tokens Used

- `--color-card-white`, `--color-text-secondary`
- `--spacing-2`, `--spacing-4`
- `--radius-lg`, `--radius-sm`
- `--icon-md`
- `--duration-medium`, `--ease-out`, `--ease-in`
- `--shadow-xl`
- `--z-index-modal-backdrop`, `--z-index-modal`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | - | Modal visibility (v-model) |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal width |
| `persistent` | `boolean` | `false` | Prevent closing on backdrop click or Escape |
| `closeOnEsc` | `boolean` | `true` | Allow closing with Escape key |
| `closeOnBackdrop` | `boolean` | `true` | Allow closing by clicking backdrop |

## Size Variants

- `sm`: 400px
- `md`: 600px
- `lg`: 800px
- `xl`: 1200px

## Events

- `update:modelValue` - Emitted when modal visibility changes
- `close` - Emitted when modal closes

## Usage

```vue
<template>
  <VModal v-model="isOpen" size="md">
    <div style="padding: 24px">
      <h2>Modal Title</h2>
      <p>Modal content goes here</p>
    </div>
  </VModal>
</template>
```

## Responsive Behavior

**Desktop**:
- Centered on screen with backdrop
- Has padding around edges
- Rounded corners on all sides

**Mobile** (< 768px):
- Slides up from bottom
- Full width
- Rounded corners only on top
- Handle bar indicator at top

## Accessibility

- Uses `role="dialog"` and `aria-modal="true"`
- Focus trap keeps tab navigation within modal
- Body scroll locked when open
- Close button has `aria-label`

## Implementation Notes

- Uses Vue's `<teleport>` to body
- Locks body scroll when open
- Escape key closes modal (unless persistent)
- Click backdrop to close (unless persistent)
- Smooth slide-up animation

