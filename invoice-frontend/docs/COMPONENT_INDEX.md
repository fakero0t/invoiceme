# Component Library Index

Complete component library for InvoiceMe application, following Venmo-inspired design system.

## Base Components (5)

- **VButton** - Primary button component with variants
- **VInput** - Text input with validation states
- **VCard** - Container card with elevation
- **VBadge** - Small status indicator badge
- **VAvatar** - User avatar with fallback initials

## Form Components (5)

- **VTextarea** - Multi-line text input with character counter
- **VSelect** - Dropdown select with search and keyboard navigation
- **VCheckbox** - Custom styled checkbox
- **VRadio** - Custom styled radio button
- **VDatePicker** - Calendar date picker with mobile support

## Layout Components (3)

- **VModal** - Dialog modal with backdrop and focus trap
- **VDrawer** - Side drawer panel
- **VToast** - Toast notification system

## Display Components (6)

- **VEmptyState** - Empty state placeholder
- **VSkeleton** - Loading skeleton with shimmer animation
- **VTimeline** - Vertical timeline with status dots
- **VTable** - Responsive table (desktop) / cards (mobile)
- **VPagination** - Page navigation component
- **VTabs** - Tabbed navigation with sliding indicator

## Interactive Components (6)

- **VDropdown** - Dropdown menu with keyboard navigation
- **VTooltip** - Hover/focus tooltip
- **VProgress** - Linear and circular progress indicators
- **VDivider** - Horizontal/vertical divider
- **VBreadcrumbs** - Breadcrumb navigation
- **VMenu** - Context menu

## Navigation Components (3)

- **VNavbar** - Fixed top navigation bar
- **VSidebar** - Collapsible sidebar (desktop)
- **VBottomNav** - Bottom navigation bar (mobile)

## Layout Templates (3)

- **MainLayout** - Primary app layout with navbar + sidebar/bottom nav
- **AuthLayout** - Centered card layout for login/signup
- **EmptyLayout** - Minimal layout for errors/404

## Composables (4)

- **useToast** - Programmatic toast notifications
- **useAnimation** - Animation utilities with reduced motion support
- **useBreakpoint** - Responsive breakpoint detection
- **useModal** - Modal state management and utilities

## Design Token Compliance

All components use **ONLY** design tokens from:
- `src/styles/tokens.css`
- No hardcoded colors, sizes, or spacing
- Consistent animations using timing tokens
- Z-index managed through layering tokens

## Import Examples

```typescript
// Import components
import { VButton, VInput, VModal } from '@/shared/components';

// Import layouts
import { MainLayout, AuthLayout } from '@/shared/layouts';

// Import composables
import { useToast, useBreakpoint } from '@/shared/composables';
```

## Responsive Behavior

All components follow mobile-first responsive design:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: ≥ 1024px

Navigation automatically switches:
- Desktop: VSidebar
- Mobile: VBottomNav

## Accessibility

- Semantic HTML throughout
- ARIA attributes where needed
- Keyboard navigation support
- Focus management in modals/drawers
- Color contrast meets WCAG AA standards

## Total Component Count

**29 Components** + **4 Composables** = **33 Total Exports**

