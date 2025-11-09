# VButton

## Description

A versatile button component with multiple variants, sizes, and states. Supports loading states and follows Venmo-inspired design patterns with gradient backgrounds and smooth hover effects.

## Design Tokens Used

### Colors
- `--color-venmo-blue` - Primary variant gradient start
- `--color-venmo-purple` - Primary variant gradient end
- `--color-card-white` - Primary variant text color, secondary variant background
- `--color-border-gray` - Secondary variant border
- `--color-venmo-blue-50` - Secondary hover background
- `--color-venmo-blue-600` - Link hover color
- `--color-text-primary` - Ghost variant text color

### Spacing
- `--spacing-2` - Small button padding (vertical), gap between icon and text
- `--spacing-3` - Medium button padding (vertical)
- `--spacing-4` - Small button padding (horizontal)
- `--spacing-6` - Medium button padding (horizontal)
- `--spacing-8` - Large button padding (horizontal)

### Typography
- `--font-family-base` - Button font family
- `--font-weight-medium` - Button font weight
- `--font-size-body-sm` - Small button font size
- `--font-size-body` - Medium button font size
- `--font-size-body-lg` - Large button font size
- `--line-height-tight` - Button line height

### Borders & Shadows
- `--radius-md` - Button border radius
- `--radius-sm` - Focus ring border radius (link variant)
- `--radius-full` - Loading spinner border radius
- `--shadow-sm` - Default button shadow
- `--shadow-md` - Secondary button hover shadow
- `--shadow-lg` - Primary button hover shadow
- `--shadow-focus` - Focus state outline

### Animation
- `--duration-base` - Hover and color transitions
- `--duration-fast` - Press scale animation
- `--ease-out` - Hover animation easing
- `--ease-in-out` - General transition easing

### Icons
- `--icon-sm` - Loading spinner size

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'link'` | `'primary'` | Visual style variant of the button |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| type | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| disabled | `boolean` | `false` | Whether the button is disabled |
| loading | `boolean` | `false` | Whether the button is in loading state |
| block | `boolean` | `false` | Whether the button should be full width |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| click | `MouseEvent` | Emitted when button is clicked (not emitted when disabled or loading) |

## Slots

| Slot | Description |
|------|-------------|
| default | Button content (text, icons, etc.) |

## Usage Examples

### Basic Usage

```vue
<VButton>Click Me</VButton>
```

### Primary Button (Default)

```vue
<VButton variant="primary">
  Primary Action
</VButton>
```

### Secondary Button

```vue
<VButton variant="secondary">
  Secondary Action
</VButton>
```

### Ghost Button

```vue
<VButton variant="ghost">
  Cancel
</VButton>
```

### Link Button

```vue
<VButton variant="link">
  Learn More
</VButton>
```

### Different Sizes

```vue
<VButton size="sm">Small</VButton>
<VButton size="md">Medium</VButton>
<VButton size="lg">Large</VButton>
```

### Loading State

```vue
<VButton :loading="isLoading" @click="handleSubmit">
  Submit
</VButton>
```

### Disabled State

```vue
<VButton :disabled="true">
  Disabled
</VButton>
```

### Block Button (Full Width)

```vue
<VButton block>
  Full Width Button
</VButton>
```

### Submit Button in Form

```vue
<form @submit.prevent="handleSubmit">
  <VButton type="submit">
    Submit Form
  </VButton>
</form>
```

## Accessibility

- **Keyboard Navigation**: Fully keyboard accessible via Tab key
- **Focus Indicator**: Visible focus ring using `--shadow-focus`
- **Disabled State**: Uses `pointer-events: none` and reduced opacity
- **Loading State**: Content becomes transparent but maintains layout
- **ARIA Attributes**: Inherits standard button ARIA attributes
- **Semantic HTML**: Uses native `<button>` element

## Implementation Notes

### Hover Effects
- Primary buttons lift up 2px and increase shadow on hover
- Secondary buttons change background to light blue on hover
- All interactive variants use smooth transitions

### Press Effects
- All buttons scale down to 97% when pressed (active state)
- Creates tactile feedback for user interactions

### Loading State
- Shows a spinning loader using CSS animations
- Original content is hidden but maintains button size
- Button is automatically disabled during loading

### Design Token Compliance
- **No hardcoded values**: All colors, spacing, and animations use CSS variables
- **Single source of truth**: Changes to design tokens automatically update all buttons
- **Gradient implementation**: Primary variant uses `--gradient-primary` variable

### Browser Compatibility
- CSS gradients work in all modern browsers
- CSS variables supported (IE11+ with polyfill if needed)
- Transform and shadow transitions perform well

### Performance
- Uses CSS transforms for animations (GPU accelerated)
- No JavaScript-based animations
- Minimal repaints and reflows

