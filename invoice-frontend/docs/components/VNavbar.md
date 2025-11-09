# VNavbar

Fixed top navigation bar for application-wide navigation.

## Design Tokens Used

- `--navbar-height` (64px)
- `--font-size-h3`, `--font-weight-bold`
- `--color-text-primary`, `--color-text-secondary`
- `--color-card-white`, `--color-venmo-blue`, `--color-venmo-blue-50`
- `--spacing-4`, `--spacing-6`
- `--radius-full`
- `--icon-lg`
- `--duration-base`, `--ease-out`
- `--shadow-sm`
- `--z-index-fixed`
- `--gradient-primary`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userAvatar` | `string` | - | User avatar image URL |
| `userName` | `string` | `'User'` | User display name |

## Slots

- `logo` - Custom logo content
- `center` - Center content area
- `actions` - Right action buttons (overrides default)

## Usage

```vue
<template>
  <VNavbar 
    :user-avatar="user.avatar"
    :user-name="user.name"
  >
    <template #center>
      <VInput placeholder="Search..." />
    </template>
  </VNavbar>
</template>
```

## Features

- Fixed to top of viewport
- Default logo with gradient text
- Notification bell icon
- User avatar (32px, clickable)
- Responsive padding

## Accessibility

- Logo is a clickable link to home
- Action buttons have `aria-label`
- Semantic `<nav>` element

## Implementation Notes

- Height is exactly 64px (navbar-height token)
- White background with subtle bottom shadow
- Logo uses gradient-primary for text
- Action buttons have hover states with blue background
- All navigation components account for navbar height offset

