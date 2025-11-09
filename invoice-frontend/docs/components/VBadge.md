# VBadge

## Description

A pill-shaped badge component for displaying status indicators, labels, or counts. Supports multiple color variants for different status types.

## Design Tokens Used

### Colors
- `--color-success-light` - Success variant background
- `--color-success-dark` - Success variant text
- `--color-warning-light` - Warning variant background
- `--color-warning-dark` - Warning variant text
- `--color-error-light` - Error variant background
- `--color-error-dark` - Error variant text
- `--color-info-light` - Info variant background (default)
- `--color-info-dark` - Info variant text

### Spacing
- `--spacing-1` - Small badge padding (vertical)
- `--spacing-2` - Medium badge padding (vertical)
- `--spacing-3` - Small badge padding (horizontal)
- `--spacing-4` - Medium badge padding (horizontal)

### Typography
- `--font-family-base` - Badge font family
- `--font-weight-medium` - Badge font weight
- `--font-size-caption` - Small badge font size
- `--font-size-body-sm` - Medium badge font size

### Borders & Shadows
- `--radius-full` - Pill shape border radius

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'success' \| 'warning' \| 'error' \| 'info'` | `'info'` | Color variant based on status |
| size | `'sm' \| 'md'` | `'md'` | Badge size |

## Slots

| Slot | Description |
|------|-------------|
| default | Badge content (text, numbers, etc.) |

## Usage Examples

### Basic Usage

```vue
<VBadge>New</VBadge>
```

### Status Variants

```vue
<VBadge variant="success">Paid</VBadge>
<VBadge variant="warning">Pending</VBadge>
<VBadge variant="error">Overdue</VBadge>
<VBadge variant="info">Draft</VBadge>
```

### Different Sizes

```vue
<VBadge size="sm">Small</VBadge>
<VBadge size="md">Medium</VBadge>
```

### With Numbers

```vue
<VBadge variant="error">5</VBadge>
```

## Accessibility

- High contrast between background and text colors
- Sufficient color contrast meets WCAG AA standards
- Uses semantic color meanings (green=success, red=error, etc.)

## Implementation Notes

- Pill shape using `border-radius: 9999px`
- All colors use light background with dark text for readability
- White space is preserved with `white-space: nowrap`
- Inline-flex display for proper alignment with text

