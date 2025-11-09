# VInput

## Description

A text input component with support for various input types, error/success states, and helper text. Includes focus states with blue ring and full keyboard accessibility.

## Design Tokens Used

### Colors
- `--color-text-primary` - Input text color
- `--color-text-secondary` - Helper text color, hover border color
- `--color-text-tertiary` - Placeholder color
- `--color-card-white` - Input background
- `--color-background` - Disabled input background
- `--color-border-gray` - Default border color
- `--color-venmo-blue` - Focus border color
- `--color-error` - Error state color
- `--color-success` - Success state color

### Spacing
- `--spacing-1` - Gap between input and helper text
- `--spacing-3` - Input padding (vertical)
- `--spacing-4` - Input padding (horizontal)

### Typography
- `--font-family-base` - Input font family
- `--font-size-body` - Input font size
- `--font-size-caption` - Helper text font size
- `--line-height-normal` - Input line height

### Borders & Shadows
- `--radius-md` - Input border radius
- `--shadow-focus` - Blue focus ring

### Animation
- `--duration-base` - Border color and shadow transitions
- `--ease-out` - Transition easing

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `string \| number` | (required) | The input value (v-model) |
| type | `string` | `'text'` | HTML input type (text, email, password, etc.) |
| placeholder | `string` | `''` | Placeholder text |
| disabled | `boolean` | `false` | Whether the input is disabled |
| error | `boolean` | `false` | Whether the input is in error state |
| success | `boolean` | `false` | Whether the input is in success state |
| helperText | `string` | `''` | Helper or error message below input |
| id | `string` | `undefined` | HTML id attribute (used for aria-describedby) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| update:modelValue | `string \| number` | Emitted when input value changes |
| blur | `FocusEvent` | Emitted when input loses focus |
| focus | `FocusEvent` | Emitted when input gains focus |

## Usage Examples

### Basic Usage

```vue
<VInput v-model="email" placeholder="Enter email" />
```

### With Helper Text

```vue
<VInput
  v-model="password"
  type="password"
  placeholder="Enter password"
  helper-text="Must be at least 8 characters"
/>
```

### Error State

```vue
<VInput
  v-model="email"
  type="email"
  :error="true"
  helper-text="Please enter a valid email address"
/>
```

### Success State

```vue
<VInput
  v-model="username"
  :success="true"
  helper-text="Username is available"
/>
```

### Disabled State

```vue
<VInput v-model="value" :disabled="true" />
```

## Accessibility

- **ARIA Attributes**: Uses `aria-invalid` and `aria-describedby` for error states
- **Focus Indicator**: Visible blue ring on focus
- **Helper Text Association**: Helper text linked via aria-describedby
- **Keyboard Navigation**: Standard input keyboard support
- **Screen Reader**: Error states announced to screen readers

## Implementation Notes

- Uses v-model for two-way binding
- Automatically applies focus ring on keyboard focus
- Error and success states are mutually exclusive
- Helper text color changes based on state
- All styling uses design tokens only

