# VAvatar

## Description

A circular avatar component that can display either an image or initials. Generates consistent colors for initials based on a hash function.

## Design Tokens Used

### Colors
- `--color-venmo-blue-50` through `--color-venmo-blue-900` - Background/text color variations
- `--color-venmo-purple-50` through `--color-venmo-purple-900` - Background/text color variations
- `--color-success-light` / `--color-success-dark` - Possible color combination
- `--color-info-light` / `--color-info-dark` - Possible color combination
- `--color-warning-light` / `--color-warning-dark` - Possible color combination

### Spacing
- `--spacing-8` - Small avatar size (32px)
- `--spacing-10` - Medium avatar size (40px)
- `--spacing-12` - Large avatar size (48px)
- `--spacing-16` - Extra large avatar size (64px)

### Typography
- `--font-family-base` - Initials font family
- `--font-weight-semibold` - Initials font weight
- `--font-size-caption` - Small avatar font size
- `--font-size-body-sm` - Medium avatar font size
- `--font-size-body` - Large avatar font size
- `--font-size-h3` - Extra large avatar font size

### Borders & Shadows
- `--radius-full` - Circular shape

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string` | `''` | Image URL for avatar |
| alt | `string` | `''` | Alt text for image |
| initials | `string` | `''` | Initials to display (max 2 characters) |
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |

## Usage Examples

### With Image

```vue
<VAvatar
  src="/path/to/image.jpg"
  alt="John Doe"
/>
```

### With Initials

```vue
<VAvatar initials="JD" />
```

### Different Sizes

```vue
<VAvatar initials="AB" size="sm" />
<VAvatar initials="CD" size="md" />
<VAvatar initials="EF" size="lg" />
<VAvatar initials="GH" size="xl" />
```

### With Customer Name (Generate Initials)

```vue
<VAvatar :initials="customerName" />
```

## Accessibility

- **Alt Text**: Required for images via `alt` prop
- **Meaningful Content**: Initials provide context when image unavailable
- **Color Contrast**: Generated colors meet WCAG AA standards
- **Non-text Content**: Initials are user-selectable text, not images

## Implementation Notes

### Color Generation
- Uses a hash function based on initials
- Generates consistent colors for same initials
- 10 different color combinations available
- Uses only design token color combinations

### Initials Handling
- Automatically truncates to 2 characters
- Converts to uppercase
- Shows "?" if no initials provided and no image

### Image Fallback
- Displays image when `src` prop provided
- Falls back to initials if image fails to load
- Uses `object-fit: cover` for proper image scaling

### Circular Shape
- Uses `border-radius: 9999px` for perfect circle
- `overflow: hidden` ensures image stays circular
- `flex-shrink: 0` prevents squashing in flex containers

