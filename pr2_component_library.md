# Pull Request 2: Complete Component Library & Navigation Infrastructure

**Priority**: HIGH - Requires PR1 to be merged first

**Dependencies**: PR1 (Global Design System Foundation)

**Reference Document**: `ui_update.md`

### Overview

Build the complete component library (remaining 23 components) and implement the new navigation system (navbar, sidebar, bottom nav). All components must use ONLY the design tokens established in PR1.

### Objectives

1. Build remaining 23 base components
2. Create navigation components (VNavbar, VSidebar, VBottomNav)
3. Create layout components (MainLayout, AuthLayout, EmptyLayout)
4. Implement page transition system
5. Add all components to documentation
6. Verify all components use ONLY design tokens

### Detailed Implementation Tasks

#### Task 2.1: Build Form Components

Create in `invoice-frontend/src/shared/components/`:

**VTextarea.vue**:
- Props: modelValue, placeholder, disabled, error, success, helperText, rows, maxLength, showCount
- Base styles using input tokens from global.css
- Character counter using caption font size
- Resize handle styling
- Auto-grow functionality (optional)
- Uses ONLY design tokens

**VSelect.vue**:
- Props: modelValue, options, placeholder, disabled, error, success, helperText, searchable
- Dropdown using z-index-dropdown
- Options list with hover states using venmo-blue-50
- Search input if searchable
- Keyboard navigation (arrow keys, enter, escape)
- Uses ONLY design tokens

**VCheckbox.vue**:
- Props: modelValue, label, disabled, error
- Custom checkbox using border-gray and venmo-blue
- Checkmark icon using icon-sm
- Focus state using shadow-focus
- Hover state using hover effect
- Uses ONLY design tokens

**VRadio.vue**:
- Props: modelValue, value, label, disabled, name
- Custom radio button using radius-full
- Inner dot using venmo-blue
- Focus state using shadow-focus
- Hover state
- Uses ONLY design tokens

**VDatePicker.vue**:
- Props: modelValue, placeholder, disabled, minDate, maxDate, format
- Calendar popup using z-index-popover
- Month/year navigation
- Day selection with hover states
- Today highlight using venmo-blue-50
- Selected state using gradient-primary
- Mobile-friendly touch targets
- Uses ONLY design tokens

#### Task 2.2: Build Layout Components

**VModal.vue**:
- Props: modelValue, size (sm/md/lg/xl), persistent, closeOnEsc, closeOnBackdrop
- Backdrop using z-index-modal-backdrop and modal-backdrop opacity
- Modal content using z-index-modal
- Sizes: sm (400px), md (600px), lg (800px), xl (1200px)
- Close button (X) in top-right using icon-md
- Desktop: centered with backdrop
- Mobile: full-screen slide up from bottom with handle bar
- Transitions using modal-enter/leave classes
- Trap focus inside modal
- Close on Escape key (if closeOnEsc)
- Uses ONLY design tokens

**VDrawer.vue**:
- Props: modelValue, side (left/right), width, persistent
- Overlay using z-index-modal-backdrop
- Drawer using z-index-modal
- Slide transition from side
- Close button
- Focus trap
- Uses ONLY design tokens

**VToast.vue** (notification system):
- Props: message, variant (success/error/warning/info), duration, closable
- Position: top-right on desktop, top on mobile
- Stack multiple toasts
- Auto-dismiss after duration
- Icon for each variant
- Close button (X)
- Slide-down entrance animation
- Swipe to dismiss on mobile
- Uses z-index-tooltip
- Uses ONLY design tokens

Create global composable `useToast.ts` for programmatic toast display

#### Task 2.3: Build Display Components

**VEmptyState.vue**:
- Props: icon, heading, description, actionText, actionClick
- Centered layout
- Icon using icon-2xl (80-120px)
- Heading using font-size-h2
- Description using text-secondary and font-size-body
- Action button using VButton
- Uses ONLY design tokens

**VSkeleton.vue**:
- Props: variant (text/circle/rect), width, height, count
- Uses .skeleton animation class
- Text variant: multiple lines with decreasing widths
- Circle variant: using radius-full
- Rect variant: using radius-sm
- Pulse animation using animation tokens
- Uses ONLY design tokens

**VTimeline.vue**:
- Props: items (array of timeline entries)
- Vertical line using border-gray
- Dots using radius-full with variant colors
- Connecting line between dots
- Item content with timestamp
- Icon support in dots
- Uses ONLY design tokens

**VTable.vue**:
- Props: columns, data, sortable, hoverable, striped
- Desktop: traditional table layout
- Mobile: card-based layout (responsive)
- Sticky header using z-index-sticky
- Sort indicators (arrows) using icon-sm
- Row hover using venmo-blue-50
- Alternating row backgrounds if striped
- Uses ONLY design tokens

**VPagination.vue**:
- Props: currentPage, totalPages, maxVisible
- Page buttons using VButton ghost variant
- Active page using VButton primary variant
- Previous/next arrows
- Ellipsis for hidden pages
- Mobile: show fewer page numbers
- Uses ONLY design tokens

**VTabs.vue**:
- Props: modelValue, tabs (array of tab objects)
- Tab buttons in horizontal row
- Active indicator bar (slides smoothly)
- Active tab using text-venmo-blue
- Inactive tabs using text-secondary
- Hover states
- Keyboard navigation (arrow keys)
- Smooth indicator animation using duration-medium
- Uses ONLY design tokens

#### Task 2.4: Build Interactive Components

**VDropdown.vue**:
- Props: items, placement (top/bottom/left/right), trigger (click/hover)
- Trigger slot (usually VButton)
- Dropdown menu using z-index-dropdown
- Menu items with hover states
- Divider support between items
- Icon support for menu items
- Close on outside click
- Close on item selection
- Keyboard navigation
- Uses ONLY design tokens

**VTooltip.vue**:
- Props: content, placement (top/bottom/left/right), trigger (hover/focus)
- Tooltip container using z-index-tooltip
- Arrow pointer to target
- Dark background using deep-blue
- White text
- Fade in/out animation
- Position calculation relative to trigger
- Uses ONLY design tokens

**VProgress.vue**:
- Props: value, max, indeterminate, size (sm/md/lg), variant (linear/circular)
- Linear: progress bar with gradient-primary fill
- Circular: SVG circle with stroke progress
- Indeterminate: continuous animation
- Percentage text (optional)
- Uses ONLY design tokens

**VDivider.vue**:
- Props: orientation (horizontal/vertical), spacing
- Horizontal: full-width border using border-gray
- Vertical: full-height border
- Spacing using margin tokens
- Optional text in middle
- Uses ONLY design tokens

**VBreadcrumbs.vue**:
- Props: items (array of crumb objects with label and to)
- Crumbs separated by chevron icon
- Last crumb not linked (current page)
- Links using text-venmo-blue
- Current page using text-primary
- Hover states
- Uses ONLY design tokens

**VMenu.vue**:
- Props: items, placement
- Context menu functionality
- Menu items with icons
- Keyboard shortcuts display
- Dividers between groups
- Nested menu support
- Uses ONLY design tokens

#### Task 2.5: Build Navigation Components

**VNavbar.vue**:
- Fixed top bar using z-index-fixed
- Height using navbar-height token (64px)
- White background using card-white
- Bottom shadow using shadow-sm
- Left: Logo (clickable, navigates home)
- Right: Profile VAvatar (32px), notification bell icon
- Responsive: same on all screen sizes
- Uses ONLY design tokens

**VSidebar.vue**:
- Desktop (≥1024px): Persistent sidebar
- Width using sidebar-width token (240px)
- Collapsible to sidebar-width-collapsed (64px)
- White background using card-white
- Right border using border-gray
- Navigation items: icon + label
- Active state: light blue background (venmo-blue-50), blue text (venmo-blue)
- Hover state: subtle gray background
- Collapse button (hamburger icon)
- Smooth width transition using duration-medium
- Mobile: hidden (use VDrawer instead)
- Uses ONLY design tokens

**VBottomNav.vue**:
- Mobile only (< 768px): Fixed bottom bar
- Height using bottom-nav-height token (56px)
- White background using card-white
- Top shadow using shadow-lg (inverted)
- 4-5 icon-based tabs with labels
- Icons using icon-lg (24px)
- Label using font-size-caption below icon
- Active tab: venmo-blue color with indicator bar on top
- Inactive tabs: text-tertiary
- Smooth transition between tabs using duration-base
- Uses z-index-fixed
- Uses ONLY design tokens

#### Task 2.6: Create Layout Components

Create in `invoice-frontend/src/shared/layouts/`:

**MainLayout.vue**:
- Desktop: VNavbar at top + VSidebar on left + main content area
- Mobile: VNavbar at top + VBottomNav at bottom + main content area
- Main content area: padding using spacing-6
- Background using background token
- Responsive using breakpoint tokens
- Slot for page content
- Uses ONLY design tokens

**AuthLayout.vue**:
- Centered card design
- Max-width: 400px
- Gradient background (blue to purple, subtle) using gradient-primary with low opacity
- VCard for content (white background, medium shadow, 16px radius)
- Logo at top (60-80px height)
- Slot for auth form content
- Uses ONLY design tokens

**EmptyLayout.vue**:
- No navigation
- Full-screen content
- Background using background token
- Slot for page content
- Used for 404, errors, etc.
- Uses ONLY design tokens

#### Task 2.7: Implement Page Transitions

**File**: `invoice-frontend/src/router/index.ts`

Update router configuration:

- Add global page transition wrapper
- Use fade transition by default
- Use slide-left for forward navigation
- Use slide-right for back navigation
- Use slide-up for modals
- Track navigation direction
- Apply correct transition classes
- Use duration-medium for all page transitions

**File**: `invoice-frontend/src/App.vue`

Update to use transitions:

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

#### Task 2.8: Update Router with New Layouts

Update all route definitions to use appropriate layouts:

- Auth routes (login, signup): Use AuthLayout
- Dashboard routes: Use MainLayout
- Customer routes: Use MainLayout
- Invoice routes: Use MainLayout
- Payment routes: Use MainLayout
- Error routes (404, 500): Use EmptyLayout

#### Task 2.9: Create Component Documentation

For each new component, create documentation in `invoice-frontend/docs/components/`:

Document following the component-template.md structure:
- Description
- All design tokens used
- Props with types and descriptions
- Usage examples
- Accessibility notes
- Implementation notes

Components to document:
VTextarea, VSelect, VCheckbox, VRadio, VDatePicker, VModal, VDrawer, VToast, VEmptyState, VSkeleton, VTimeline, VTable, VPagination, VTabs, VDropdown, VTooltip, VProgress, VDivider, VBreadcrumbs, VMenu, VNavbar, VSidebar, VBottomNav, MainLayout, AuthLayout, EmptyLayout

#### Task 2.10: Create Component Index

**File**: `invoice-frontend/src/shared/components/index.ts`

Export all components for easy importing:

```typescript
export { default as VButton } from './VButton.vue'
export { default as VInput } from './VInput.vue'
// ... all components
```

#### Task 2.11: Create Composables

Create reusable composables in `invoice-frontend/src/shared/composables/`:

**useToast.ts**:
- Global toast state management
- Methods: showSuccess, showError, showWarning, showInfo
- Toast queue management
- Auto-dismiss handling

**useAnimation.ts**:
- Respect prefers-reduced-motion
- Animate helper function
- Check animation support

**useBreakpoint.ts**:
- Reactive breakpoint detection
- isMobile, isTablet, isDesktop computed refs
- Uses breakpoint tokens

**useModal.ts**:
- Modal state management
- Focus trap helper
- Body scroll lock

### Acceptance Criteria

#### Form Components

- [ ] VTextarea works with character counter
- [ ] VSelect works with keyboard navigation
- [ ] VSelect search works if searchable
- [ ] VCheckbox custom styling works
- [ ] VRadio custom styling works
- [ ] VDatePicker calendar popup works
- [ ] VDatePicker mobile-friendly
- [ ] All form components use ONLY design tokens

#### Layout Components

- [ ] VModal works on desktop (centered, backdrop)
- [ ] VModal works on mobile (full-screen, slide up)
- [ ] VModal focus trap works
- [ ] VModal close on Escape works
- [ ] VDrawer slides from correct side
- [ ] VToast displays and auto-dismisses
- [ ] VToast stacks multiple toasts
- [ ] VToast swipe to dismiss works on mobile
- [ ] useToast composable works programmatically

#### Display Components

- [ ] VEmptyState centers content correctly
- [ ] VSkeleton animates with shimmer
- [ ] VSkeleton variants (text/circle/rect) work
- [ ] VTimeline displays vertically with dots
- [ ] VTable responsive (table on desktop, cards on mobile)
- [ ] VTable sorting works
- [ ] VTable row hover works
- [ ] VPagination navigates pages
- [ ] VPagination responsive on mobile
- [ ] VTabs indicator bar slides smoothly
- [ ] VTabs keyboard navigation works

#### Interactive Components

- [ ] VDropdown opens/closes correctly
- [ ] VDropdown closes on outside click
- [ ] VDropdown keyboard navigation works
- [ ] VTooltip shows on hover
- [ ] VTooltip positions correctly (all placements)
- [ ] VProgress linear variant works
- [ ] VProgress circular variant works
- [ ] VProgress indeterminate animation works
- [ ] VDivider horizontal/vertical both work
- [ ] VBreadcrumbs displays crumbs with separators
- [ ] VMenu context menu functionality works

#### Navigation Components

- [ ] VNavbar fixed at top
- [ ] VNavbar height is 64px
- [ ] VNavbar logo and profile visible
- [ ] VSidebar persistent on desktop
- [ ] VSidebar collapses/expands smoothly
- [ ] VSidebar active state highlights current route
- [ ] VSidebar hover states work
- [ ] VBottomNav shows only on mobile
- [ ] VBottomNav fixed at bottom
- [ ] VBottomNav active indicator shows
- [ ] VBottomNav tab transitions smooth

#### Layout Components

- [ ] MainLayout shows navbar + sidebar on desktop
- [ ] MainLayout shows navbar + bottom nav on mobile
- [ ] MainLayout content area has proper padding
- [ ] AuthLayout centers card with gradient background
- [ ] AuthLayout card max-width is 400px
- [ ] EmptyLayout shows full-screen content

#### Page Transitions

- [ ] Router configured with transitions
- [ ] Default fade transition works
- [ ] Slide transitions work for navigation
- [ ] Transition duration uses design token
- [ ] No flicker during transitions

#### Router Integration

- [ ] All routes use appropriate layouts
- [ ] Auth routes use AuthLayout
- [ ] Dashboard/main routes use MainLayout
- [ ] Error routes use EmptyLayout
- [ ] Layouts render correctly for each route

#### Component Documentation

- [ ] All 26+ components documented
- [ ] Each doc lists design tokens used
- [ ] Each doc has usage examples
- [ ] Each doc notes accessibility features
- [ ] Component index file exports all components

#### Composables

- [ ] useToast works for showing toasts
- [ ] useAnimation respects reduced motion
- [ ] useBreakpoint detects screen size
- [ ] useModal manages modal state

#### Design Token Compliance

- [ ] Run `npm run check:tokens` - no hardcoded colors found
- [ ] All components use var(--*) or Tailwind utilities
- [ ] No inline styles with hardcoded values
- [ ] All animations use timing tokens

#### Visual Verification

- [ ] All components render correctly
- [ ] Navigation matches Venmo-inspired design
- [ ] Hover states work on all interactive elements
- [ ] Focus states show blue ring consistently
- [ ] Mobile navigation (bottom nav) works
- [ ] Desktop navigation (sidebar) works
- [ ] Page transitions smooth and professional

#### Accessibility

- [ ] All components keyboard accessible
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA attributes present where needed
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG AA

#### Browser Compatibility

- [ ] Test all components in Chrome
- [ ] Test all components in Firefox
- [ ] Test all components in Safari
- [ ] Test all components in Edge
- [ ] Test responsive behavior in each browser

#### Responsive Design

- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Navigation adapts correctly at each breakpoint
- [ ] Components adapt correctly at each breakpoint

### Testing Requirements

1. **Unit Tests**:
   - Each component emits correct events
   - Form components update modelValue
   - Navigation components highlight active route
   - Modal/Drawer open/close state management

2. **Integration Tests**:
   - MainLayout integrates navbar + sidebar correctly
   - VToast displays through useToast composable
   - Router transitions work with layouts
   - Form components work in forms

3. **Visual Tests**:
   - Screenshot all components in all states
   - Compare with Venmo design reference
   - Verify consistent styling

4. **Accessibility Tests**:
   - Keyboard navigation works for all components
   - Focus trap works in modals
   - ARIA labels present
   - Color contrast sufficient

5. **Responsive Tests**:
   - Test each component at mobile/tablet/desktop widths
   - Verify navigation switches correctly
   - Verify table becomes cards on mobile

### Migration Notes

- Existing pages will need to be wrapped in layouts (done in PR3)
- This PR still doesn't change existing UI - it adds new components
- New components can be imported and tested individually
- Can be merged without breaking existing functionality

### References

- Component specifications: `ui_update.md` "Technical Implementation Notes" Component Library section
- Navigation specifications: `ui_update.md` "Screen-by-Screen Design Specifications" Dashboard/Navigation sections
- Layout patterns: `ui_update.md` "Responsive Breakpoints" and "Mobile-First Adaptations"
- Component inventory: `ui_update.md` Appendix "Component Inventory"

