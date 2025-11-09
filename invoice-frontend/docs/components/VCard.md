# VCard

## Description

A container component with white background, rounded corners, and configurable shadow and padding. Used throughout the application for content grouping.

## Design Tokens Used

### Colors
- `--color-card-white` - Card background color

### Spacing
- `--spacing-4` - Small padding variant
- `--spacing-6` - Medium padding variant (default)
- `--spacing-8` - Large padding variant

### Borders & Shadows
- `--radius-md` - Card border radius
- `--shadow-sm` - Small shadow variant
- `--shadow-md` - Medium shadow variant (default)
- `--shadow-lg` - Large shadow variant

### Animation
- `--duration-base` - Shadow transition duration
- `--ease-out` - Shadow transition easing

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| shadow | `'sm' \| 'md' \| 'lg'` | `'md'` | Shadow size variant |
| padding | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding size variant |

## Slots

| Slot | Description |
|------|-------------|
| default | Card content |

## Usage Examples

### Basic Usage

```vue
<VCard>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</VCard>
```

### Different Shadow Sizes

```vue
<VCard shadow="sm">Small shadow</VCard>
<VCard shadow="md">Medium shadow</VCard>
<VCard shadow="lg">Large shadow</VCard>
```

### Different Padding Sizes

```vue
<VCard padding="sm">Compact card</VCard>
<VCard padding="md">Normal card</VCard>
<VCard padding="lg">Spacious card</VCard>
```

### Combined Variants

```vue
<VCard shadow="lg" padding="lg">
  Large shadow with extra padding
</VCard>
```

## Accessibility

- Semantic container element
- No specific accessibility requirements
- Content within card should follow accessibility guidelines

## Implementation Notes

- Simple wrapper component
- All styling uses design tokens
- Can be used with hover effects (add `.hover-lift` class externally)
- Transitions smoothly between shadow states

