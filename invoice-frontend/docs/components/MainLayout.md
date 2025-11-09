# MainLayout

Primary application layout with navbar, sidebar, and bottom navigation.

## Design Tokens Used

- `--navbar-height`, `--sidebar-width`, `--sidebar-width-collapsed`, `--bottom-nav-height`
- `--color-background`
- `--spacing-4`, `--spacing-6`
- `--duration-medium`, `--ease-out`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarItems` | `SidebarItem[]` | `[]` | Sidebar navigation items |
| `bottomNavItems` | `BottomNavItem[]` | `[]` | Bottom nav items (mobile) |
| `userAvatar` | `string` | - | User avatar URL |
| `userName` | `string` | `'User'` | User display name |

## Slots

- Default slot: Main page content
- `navbar-actions`: Custom navbar actions
- `sidebar-footer`: Sidebar footer content

## Usage

```vue
<template>
  <MainLayout
    :sidebar-items="sidebarItems"
    :bottom-nav-items="bottomNavItems"
    :user-name="user.name"
    :user-avatar="user.avatar"
  >
    <h1>Page Content</h1>
    <p>Your page content goes here</p>
  </MainLayout>
</template>
```

## Layout Structure

**Desktop** (≥ 1024px):
- VNavbar at top (64px)
- VSidebar on left (240px or 64px collapsed)
- Main content area with padding (24px)

**Tablet** (768px - 1024px):
- VNavbar at top
- No sidebar
- Main content full width

**Mobile** (< 768px):
- VNavbar at top
- VBottomNav at bottom (56px)
- Main content with reduced padding (16px)
- Content area accounts for bottom nav height

## Accessibility

- Semantic structure with `<nav>` and `<main>`
- Skip to content functionality recommended
- Keyboard navigation works across all navigation components

## Implementation Notes

- Content area automatically adjusts margin for sidebar
- Smooth transitions when sidebar collapses
- Background uses `--color-background`
- Min height ensures full viewport coverage
- All child content should go in default slot

