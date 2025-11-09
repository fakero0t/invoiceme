# VSidebar

Collapsible sidebar navigation for desktop layouts.

## Design Tokens Used

- `--navbar-height`, `--sidebar-width` (240px), `--sidebar-width-collapsed` (64px)
- `--font-size-body-sm`, `--font-weight-medium`
- `--color-card-white`, `--color-background`, `--color-border-gray`
- `--color-text-primary`, `--color-text-secondary`
- `--color-venmo-blue`, `--color-venmo-blue-50`
- `--spacing-1`, `--spacing-2`, `--spacing-3`, `--spacing-4`
- `--radius-md`
- `--icon-lg`
- `--duration-medium`, `--ease-out`
- `--z-index-fixed`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `SidebarItem[]` | `[]` | Navigation items |
| `collapsed` | `boolean` | `false` | Collapsed state |

## Types

```typescript
interface SidebarItem {
  label: string;
  to: string;
  icon?: Component;
  badge?: string | number;
}
```

## Events

- `update:collapsed` - Emitted when collapse state changes
- `item-click` - Emitted when item is clicked

## Slots

- `footer` - Footer content at bottom of sidebar

## Usage

```vue
<template>
  <VSidebar 
    :items="navItems"
    v-model:collapsed="isCollapsed"
  />
</template>

<script setup>
import { HomeIcon, InvoiceIcon, CustomerIcon } from '@/icons';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { label: 'Invoices', to: '/invoices', icon: InvoiceIcon, badge: 3 },
  { label: 'Customers', to: '/customers', icon: CustomerIcon }
];
</script>
```

## States

**Expanded** (240px):
- Shows icons and labels
- Badge indicators visible

**Collapsed** (64px):
- Shows only icons
- Labels and badges hidden
- Centered icon layout

## Responsive Behavior

- **Desktop** (≥ 1024px): Visible and persistent
- **Tablet/Mobile** (< 1024px): Hidden (use VBottomNav instead)

## Accessibility

- Uses semantic navigation
- Active route highlighted with `router-link-active` class
- Keyboard navigable links

## Implementation Notes

- Fixed position below navbar
- Smooth width transition on collapse
- Active state: blue background (venmo-blue-50) and blue text
- Hover state: gray background
- Toggle button at top
- Border on right side

