# UI Update Implementation - Pull Request Task List

This document breaks down the Venmo-inspired UI update into 3 sequential pull requests. Each PR builds upon the previous one and must be completed in order.

**Reference Document**: `ui_update.md`

---

## Pull Request 1: Global Design System Foundation

**Branch**: `feature/ui-global-design-system`

**Priority**: CRITICAL - Must be completed first before any other UI work

**Estimated Effort**: 1 week

**Dependencies**: None

### Overview

Establish the complete global design system foundation including CSS variables (design tokens), Tailwind configuration, global styles, and core base components. This PR creates the single source of truth for all styling across the application.

### Objectives

1. Create all design token CSS variables
2. Configure Tailwind to reference design tokens
3. Implement global base styles for HTML elements
4. Create global utility and animation classes
5. Build core base component library (VButton, VInput, VCard, VBadge, VAvatar)
6. Set up TypeScript type definitions for design tokens
7. Configure linting to enforce design token usage
8. Create component documentation structure

### Detailed Implementation Tasks

#### Task 1.1: Create Design Token Files

**File**: `invoice-frontend/src/styles/tokens.css`

Create complete CSS variables file with all design tokens:

**Color Tokens**:
- Primary color scale (venmo-blue-50 through venmo-blue-900)
- Accent color scale (venmo-purple-50 through venmo-purple-900)
- Semantic color names (venmo-blue, venmo-purple, deep-blue)
- Neutral colors (background, card-white, border-gray, text-primary/secondary/tertiary)
- Status colors (success, warning, error, info with light/dark variants)

**Spacing Tokens**:
- Scale: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 20 (80px), 24 (96px)

**Typography Tokens**:
- Font family: Inter with system font fallbacks
- Font sizes: display-lg (36px), display (32px), h1 (28px), h2 (24px), h3 (20px), body-lg (18px), body (16px), body-sm (14px), caption (12px)
- Font weights: normal (400), medium (500), semibold (600), bold (700)
- Line heights: tight (1.25), normal (1.5), relaxed (1.75)
- Letter spacing: tight (-0.5px), normal (0), wide (0.2px)

**Border Radius Tokens**:
- none (0), sm (8px), md (12px), lg (16px), xl (20px), 2xl (24px), full (9999px)

**Shadow Tokens**:
- none, sm, md, lg, xl, focus (blue ring)

**Animation Tokens**:
- Durations: fast (150ms), base (200ms), medium (300ms), slow (400ms), slower (500ms)
- Easing functions: in-out, out, in, bounce

**Additional Tokens**:
- Icon sizes: xs (12px), sm (16px), md (20px), lg (24px), xl (32px), 2xl (40px)
- Z-index: base (0), dropdown (1000), sticky (1020), fixed (1030), modal-backdrop (1040), modal (1050), popover (1060), tooltip (1070)
- Breakpoints: mobile (768px), tablet (1024px), desktop (1440px)
- Layout: navbar-height (64px), sidebar-width (240px), sidebar-width-collapsed (64px), bottom-nav-height (56px)
- Gradients: primary (blue to purple), success, error

**Reference**: See ui_update.md Step 1 for complete implementation

#### Task 1.2: Create Global Base Styles

**File**: `invoice-frontend/src/styles/global.css`

Implement global styles for HTML elements:

- Universal box-sizing, margin, padding reset
- HTML base styles (font-smoothing, text-rendering, scroll-behavior)
- Body styles using font-family, font-size, color, background tokens
- Typography styles (h1-h6, p, small) using typography tokens
- Link styles using venmo-blue with hover transitions
- Button reset styles
- Form element base styles (input, textarea, select) with focus states
- Global focus-visible styles using shadow-focus token
- Scrollbar styling using color tokens
- Selection styling using venmo-blue-200
- Reduced motion media query support

**Reference**: See ui_update.md Step 2 for complete implementation

#### Task 1.3: Create Global Utility Classes

**File**: `invoice-frontend/src/styles/utilities.css`

Create reusable utility classes:

**Card Utilities**:
- .card (base card with shadow and padding)
- .card-sm, .card-lg (padding variants)

**Gradient Utilities**:
- .gradient-primary (blue to purple gradient)
- .gradient-text-primary (gradient text effect)

**State Utilities**:
- .is-loading (opacity, pointer-events, cursor)
- .is-disabled (opacity, cursor, pointer-events)
- .has-error (border-color, color using error token)
- .has-success (border-color, color using success token)
- .has-warning (border-color, color using warning token)

**Layout Utilities**:
- .container (responsive container with max-widths)
- .container-sm, .container-md, .container-lg

**Text Utilities**:
- .text-primary, .text-secondary, .text-tertiary
- .text-success, .text-error, .text-warning

**Truncate Utilities**:
- .truncate (ellipsis)
- .line-clamp-2, .line-clamp-3

**Reference**: See ui_update.md Step 3 for complete implementation

#### Task 1.4: Create Global Animation Classes

**File**: `invoice-frontend/src/styles/animations.css`

Implement animation utilities:

**Transition Utilities**:
- .transition-all, .transition-colors, .transition-transform, .transition-opacity

**Interaction Animations**:
- .hover-lift (translateY + shadow on hover)
- .press-scale (scale down on active)
- .hover-brighten (brightness filter on hover)

**Loading Animations**:
- @keyframes spin, .animate-spin
- @keyframes pulse, .animate-pulse
- @keyframes bounce, .animate-bounce

**Page Transitions** (Vue transition classes):
- .fade-enter-active, .fade-leave-active, .fade-enter-from, .fade-leave-to
- .slide-left-*, .slide-right-*, .slide-up-* (enter/leave active/from/to)

**Modal Transitions**:
- .modal-enter-active, .modal-leave-active (backdrop)
- .modal-content-enter-active, .modal-content-leave-active (content scale + fade)

**Skeleton Loading**:
- @keyframes shimmer, .skeleton

**Reference**: See ui_update.md Step 4 for complete implementation

#### Task 1.5: Create Main Stylesheet

**File**: `invoice-frontend/src/styles/index.css`

Import all stylesheets in correct order:
1. Design tokens (tokens.css)
2. Tailwind base
3. Global base styles (global.css)
4. Global utilities (utilities.css)
5. Global animations (animations.css)
6. Tailwind components and utilities

**Reference**: See ui_update.md Step 5 for complete implementation

#### Task 1.6: Update Tailwind Configuration

**File**: `invoice-frontend/tailwind.config.js`

Completely rewrite Tailwind config to reference CSS variables:

**Extend Theme**:
- Colors: Map all color tokens (venmo.blue.*, venmo.purple.*, deep-blue, background, card-white, border-gray, text.*, success.*, warning.*, error.*, info.*)
- Spacing: Map all spacing tokens (0-24)
- BorderRadius: Map all radius tokens (none, sm, md, lg, xl, 2xl, full)
- BoxShadow: Map all shadow tokens (none, sm, md, lg, xl, focus)
- FontFamily: Map sans to --font-family-base
- FontSize: Map all font size tokens
- FontWeight: Map all font weight tokens
- LineHeight: Map all line height tokens
- LetterSpacing: Map all letter spacing tokens
- TransitionDuration: Map all duration tokens
- TransitionTimingFunction: Map all easing tokens
- ZIndex: Map all z-index tokens
- BackgroundImage: Map gradient tokens

**Screens**:
- mobile: max 767px
- tablet: 768px to 1023px
- desktop: min 1024px
- lg-desktop: min 1440px

**Critical**: NO hardcoded values anywhere in this config. All values MUST reference CSS variables.

**Reference**: See ui_update.md Step 6 for complete implementation

#### Task 1.7: Update Application Entry Point

**File**: `invoice-frontend/src/main.ts`

Update to import global styles before mounting app:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import global styles - ORDER MATTERS!
import './styles/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

**Reference**: See ui_update.md Step 7 for complete implementation

#### Task 1.8: Create TypeScript Type Definitions

**File**: `invoice-frontend/src/types/design-tokens.ts`

Create type definitions for all design tokens:

- `ColorToken` type (union of all color token names)
- `SpacingToken` type (union of all spacing values)
- `RadiusToken` type (union of all radius values)
- `ShadowToken` type (union of all shadow values)
- `FontSizeToken` type (union of all font sizes)
- `IconSizeToken` type (union of all icon sizes)
- `DurationToken` type (union of all duration values)
- `EasingToken` type (union of all easing values)
- `getCSSVariable(name: string): string` helper function
- `setCSSVariable(name: string, value: string): void` helper function

**Reference**: See ui_update.md Step 8 for complete implementation

#### Task 1.9: Build Core Base Components

Create the following base components in `invoice-frontend/src/shared/components/`:

**VButton.vue**:
- Props: variant (primary/secondary/ghost/link), size (sm/md/lg), type, disabled, loading, block
- Variants using gradient-primary and color tokens
- Sizes using spacing tokens
- Loading spinner using icon-sm token
- Hover effects using hover-lift class pattern
- Focus states using shadow-focus token
- ALL styling uses ONLY design tokens

**VInput.vue**:
- Props: modelValue, type, placeholder, disabled, error, success, helperText
- Base styles using spacing, border, radius tokens
- Focus state using shadow-focus
- Error state using has-error class
- Success state using has-success class
- Helper text using text-secondary and font-size-caption

**VCard.vue**:
- Props: shadow (sm/md/lg), padding (sm/md/lg)
- Base card using card-white, radius-md
- Shadow variants using shadow tokens
- Padding variants using spacing tokens

**VBadge.vue**:
- Props: variant (success/warning/error/info), size (sm/md)
- Pill shape using radius-full
- Colors using status color tokens
- Sizes using spacing and font-size tokens

**VAvatar.vue**:
- Props: src, alt, initials, size (sm/md/lg/xl)
- Circular using radius-full
- Sizes using spacing tokens
- Initials generation with hash-based background colors using venmo-blue/purple scale
- Image handling with fallback to initials

Each component MUST:
- Use ONLY design tokens (no hardcoded values)
- Be fully typed with TypeScript
- Include comprehensive props documentation
- Follow Vue 3 Composition API with `<script setup>`
- Use scoped styles
- Be keyboard accessible
- Include proper ARIA attributes

**Reference**: See ui_update.md Step 9 for VButton example. Apply same pattern to all components.

#### Task 1.10: Configure Linting Rules

**File**: `invoice-frontend/.eslintrc.cjs`

Add rules to prevent hardcoded values:

```javascript
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: "Literal[value=/#[0-9A-Fa-f]{3,6}$/]",
      message: 'Hardcoded color values are not allowed. Use design tokens from CSS variables instead.',
    },
    {
      selector: "CallExpression[callee.name='rgb']",
      message: 'RGB color values are not allowed. Use design tokens from CSS variables instead.',
    },
    {
      selector: "CallExpression[callee.name='rgba']",
      message: 'RGBA color values are not allowed. Use design tokens from CSS variables instead.',
    },
  ],
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'vue/no-deprecated-slot-attribute': 'error',
  'vue/no-multiple-template-root': 'off',
}
```

**Reference**: See ui_update.md Step 10 for complete implementation

#### Task 1.11: Add Validation Scripts

**File**: `invoice-frontend/package.json`

Add validation scripts:

```json
{
  "scripts": {
    "check:tokens": "grep -r '#[0-9A-Fa-f]\\{6\\}' src/ --exclude-dir=node_modules --exclude='*.css' || echo 'No hardcoded colors found!'",
    "validate:design-system": "npm run lint && npm run check:tokens"
  }
}
```

**Reference**: See ui_update.md Step 11 for complete implementation

#### Task 1.12: Create Component Documentation

**Directory**: `invoice-frontend/docs/`

Create documentation files:

**component-template.md**:
- Template showing how to document components
- Sections: Description, Design Tokens Used, Props, Usage Examples, Accessibility, Notes
- Include which specific design tokens each component uses

**design-system-checklist.md**:
- Comprehensive validation checklist
- File creation checks
- Design token validation checks
- Tailwind configuration checks
- Component library checks
- Code quality checks
- Testing checks
- Documentation checks
- Validation commands
- Final validation steps

**Reference**: See ui_update.md Steps 12-13 for complete templates

#### Task 1.13: Create Component Documentation for Each Component

For each component (VButton, VInput, VCard, VBadge, VAvatar), create:

**File**: `invoice-frontend/docs/components/[ComponentName].md`

Document:
- Component description
- All design tokens used (colors, spacing, typography, borders, shadows, animations)
- Props table with types and descriptions
- Usage examples (basic, with variants, with states)
- Accessibility notes
- Implementation notes

### Acceptance Criteria

#### Design System Foundation

- [ ] `src/styles/tokens.css` exists with ALL design tokens defined as CSS variables
- [ ] All color scales defined (primary, accent, neutral, status)
- [ ] All spacing values defined (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)
- [ ] All typography tokens defined (family, sizes, weights, line heights, letter spacing)
- [ ] All border radius tokens defined
- [ ] All shadow tokens defined
- [ ] All animation tokens defined (durations, easing functions)
- [ ] Icon size, z-index, layout, and gradient tokens defined

#### Global Styles

- [ ] `src/styles/global.css` exists with base HTML element styles
- [ ] All base styles reference design tokens (no hardcoded values)
- [ ] Typography hierarchy established (h1-h6, p, small)
- [ ] Form elements have consistent base styling
- [ ] Focus states use global shadow-focus token
- [ ] Reduced motion support implemented

#### Utility Classes

- [ ] `src/styles/utilities.css` exists with reusable utility classes
- [ ] Card utilities (.card, .card-sm, .card-lg)
- [ ] Gradient utilities (.gradient-primary, .gradient-text-primary)
- [ ] State utilities (.is-loading, .is-disabled, .has-error, .has-success, .has-warning)
- [ ] Layout utilities (.container with variants)
- [ ] Text utilities for colors
- [ ] Truncate utilities

#### Animation Classes

- [ ] `src/styles/animations.css` exists with animation utilities
- [ ] Transition utilities defined
- [ ] Interaction animations (.hover-lift, .press-scale, .hover-brighten)
- [ ] Loading animations (spin, pulse, bounce)
- [ ] Page transition classes for Vue
- [ ] Modal transition classes
- [ ] Skeleton loading animation

#### Stylesheet Integration

- [ ] `src/styles/index.css` imports all styles in correct order
- [ ] Styles imported in main.ts before app mounts
- [ ] No console errors related to CSS imports

#### Tailwind Configuration

- [ ] `tailwind.config.js` extends theme to reference CSS variables
- [ ] All color utilities reference CSS variables
- [ ] All spacing utilities reference CSS variables
- [ ] All typography utilities reference CSS variables
- [ ] All shadow utilities reference CSS variables
- [ ] All animation utilities reference CSS variables
- [ ] Breakpoints configured correctly
- [ ] NO hardcoded values anywhere in config
- [ ] Tailwind builds successfully with new config

#### TypeScript Types

- [ ] `src/types/design-tokens.ts` exists with type definitions
- [ ] All token types exported (Color, Spacing, Radius, Shadow, FontSize, Icon, Duration, Easing)
- [ ] Helper functions exported (getCSSVariable, setCSSVariable)
- [ ] Types compile without errors

#### Base Components

- [ ] VButton component exists and works
  - [ ] All variants render correctly (primary, secondary, ghost, link)
  - [ ] All sizes work (sm, md, lg)
  - [ ] Loading state shows spinner
  - [ ] Disabled state prevents interaction
  - [ ] Block prop makes button full-width
  - [ ] Hover and focus states work
  - [ ] Uses ONLY design tokens (no hardcoded values)
  - [ ] Fully typed with TypeScript
  - [ ] Keyboard accessible
  
- [ ] VInput component exists and works
  - [ ] All input types supported
  - [ ] Error state displays correctly
  - [ ] Success state displays correctly
  - [ ] Helper text renders
  - [ ] Focus state shows blue ring
  - [ ] Disabled state works
  - [ ] Uses ONLY design tokens
  
- [ ] VCard component exists and works
  - [ ] Shadow variants work (sm, md, lg)
  - [ ] Padding variants work (sm, md, lg)
  - [ ] Uses ONLY design tokens
  
- [ ] VBadge component exists and works
  - [ ] All status variants work (success, warning, error, info)
  - [ ] Sizes work (sm, md)
  - [ ] Uses ONLY design tokens
  
- [ ] VAvatar component exists and works
  - [ ] Image display works
  - [ ] Initials fallback works
  - [ ] Hash-based colors for initials
  - [ ] All sizes work (sm, md, lg, xl)
  - [ ] Uses ONLY design tokens

#### Linting & Validation

- [ ] ESLint configured to prevent hardcoded colors
- [ ] ESLint configured with Vue rules
- [ ] `npm run lint` passes with no errors
- [ ] `npm run check:tokens` finds no hardcoded colors (except in tokens.css)
- [ ] `npm run validate:design-system` passes completely

#### Documentation

- [ ] `docs/component-template.md` created
- [ ] `docs/design-system-checklist.md` created
- [ ] Each component has documentation in `docs/components/`
- [ ] Documentation lists all design tokens used by each component

#### Visual Verification

- [ ] Run app in development mode
- [ ] VButton renders with gradient background
- [ ] VButton hover shows lift effect
- [ ] VButton focus shows blue ring
- [ ] VInput focus shows blue ring
- [ ] VCard shows shadow
- [ ] VBadge shows colored pill
- [ ] VAvatar shows initials with colored background
- [ ] All components look visually consistent

#### Token Validation

- [ ] Change `--color-venmo-blue` in tokens.css and verify ALL buttons update color
- [ ] Change `--spacing-6` and verify card padding updates
- [ ] Change `--radius-md` and verify button corners update
- [ ] Change `--shadow-md` and verify card shadow updates
- [ ] Change `--duration-base` and verify hover animations update
- [ ] This proves single source of truth is working

#### Browser Compatibility

- [ ] Test in Chrome - CSS variables work
- [ ] Test in Firefox - CSS variables work
- [ ] Test in Safari - CSS variables work
- [ ] Test in Edge - CSS variables work

#### No Hardcoded Values

- [ ] Search codebase for `#[0-9A-Fa-f]{6}` - only found in tokens.css
- [ ] Search for `rgb(` - none found in Vue components
- [ ] Search for `rgba(` - none found in Vue components
- [ ] All components use var(--*) or Tailwind utilities

### Testing Requirements

1. **Unit Tests** (if applicable):
   - VButton emits click event correctly
   - VButton disabled state prevents clicks
   - VInput emits update:modelValue correctly
   - VAvatar generates correct initials from name

2. **Visual Tests**:
   - Take screenshots of all component variants
   - Document in PR description
   - Verify with design reference

3. **Integration Tests**:
   - Components can be imported and used in test app
   - Tailwind utilities work correctly
   - Global styles apply correctly

4. **Accessibility Tests**:
   - All components keyboard navigable
   - Focus indicators visible
   - ARIA attributes present
   - Screen reader friendly

5. **Performance Tests**:
   - CSS bundle size is reasonable
   - No performance regression from CSS variables
   - Animations run at 60fps

### Migration Notes

- This PR does NOT modify existing UI components
- It establishes the foundation that future PRs will use
- Existing components continue to work unchanged
- No user-facing changes in this PR
- Can be merged without affecting production functionality

### References

- Full design token specifications: `ui_update.md` Sections "Design System Components" and "Global Style Architecture"
- Implementation steps: `ui_update.md` "Detailed Implementation Guide" Steps 1-13
- Color palette: `ui_update.md` Appendix "Color Palette (Full Specification)"
- Component inventory: `ui_update.md` Appendix "Component Inventory"
- Animation specifications: `ui_update.md` Appendix "Animation Specifications"

---

## Pull Request 2: Complete Component Library & Navigation Infrastructure

**Branch**: `feature/ui-component-library-navigation`

**Priority**: HIGH - Requires PR1 to be merged first

**Estimated Effort**: 1.5 weeks

**Dependencies**: PR1 (Global Design System Foundation)

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

---

## Pull Request 3: Feature Implementation & UI Transformation

**Branch**: `feature/ui-venmo-transformation`

**Priority**: MEDIUM - Requires PR1 and PR2 to be merged first

**Estimated Effort**: 3 weeks

**Dependencies**: PR1 (Global Design System), PR2 (Component Library & Navigation)

### Overview

Transform all feature screens to use the new Venmo-inspired design system. Replace existing UI components with new base components. Implement all screen designs from the PRD. Add polish, animations, loading states, and perform final optimization.

### Objectives

1. Redesign authentication screens (login, signup)
2. Redesign dashboard/home screen
3. Redesign customer management (list, form, detail)
4. Redesign invoice management (list, form, detail)
5. Redesign payment management (recording, history)
6. Add loading states and skeleton screens
7. Implement micro-interactions and animations
8. Add empty states throughout
9. Perform accessibility audit
10. Optimize performance
11. Final validation and polish

### Detailed Implementation Tasks

#### Phase 3.1: Authentication Screens (Week 1, Days 1-2)

**Reference**: `ui_update.md` "Screen-by-Screen Design Specifications" → Authentication Screens

**LoginPage.vue** (`invoice-frontend/src/features/auth/LoginPage.vue`):

Update to use AuthLayout and new components:

**Layout**:
- Use AuthLayout wrapper
- Centered card design (provided by layout)
- Logo at top (60-80px height)
- Gradient background (handled by layout)

**Elements**:
- Welcome heading: "Welcome back" using font-size-display, text-primary
- Subtext: "Log in to manage your invoices" using font-size-body-sm, text-secondary
- Email VInput with envelope icon (left-aligned) using icon-md
- Password VInput with show/hide toggle icon
- "Forgot password?" link (right-aligned) using text-venmo-blue
- VButton primary: "Log in" (full width) with gradient-primary
- Divider with "or" text using VDivider
- "Sign up" link (centered) using text-venmo-blue

**Interactions**:
- VInput focus: shows blue ring (automatic from component)
- VButton hover: uses hover-lift (automatic from component)
- VButton press: uses press-scale (automatic from component)
- Error shake animation for invalid credentials (add custom)
- Success checkmark animation before redirect using VToast

**SignupPage.vue** (`invoice-frontend/src/features/auth/SignupPage.vue`):

Update to use AuthLayout:

**Layout**: Similar to login, expanded height

**Additional Elements**:
- Business name VInput
- Email VInput
- Email confirmation VInput
- Password VInput with VProgress password strength indicator (color-coded)
- Password confirmation VInput
- VCheckbox for terms acceptance (styled)
- "Already have an account?" link at bottom

**Password Strength Indicator**:
- Use VProgress linear variant
- Color: red (weak) → amber (medium) → green (strong)
- Show strength text below: "Weak", "Medium", "Strong"

**Validation**:
- Real-time validation on blur using has-error class
- Success checkmark icon using has-success
- Error messages using text-error and font-size-caption

#### Phase 3.2: Dashboard/Home Screen (Week 1, Days 3-5)

**Reference**: `ui_update.md` "Screen-by-Screen Design Specifications" → Dashboard/Home Screen

**Dashboard.vue** (`invoice-frontend/src/views/Dashboard.vue`):

Update to use MainLayout and new components:

**Hero Section**:
- Gradient VCard using gradient-primary utility
- White text overlay using text-card-white
- Large display of total outstanding amount using font-size-display-lg
- Secondary metrics: "Paid this month", "Pending invoices" using font-size-body
- VButton "New Invoice" (white button on gradient, variant="secondary" with white styling)

**Quick Stats Cards** (Grid: 2x2 on desktop, 1x4 on mobile):
- 4 VCards with shadow-md
- Icon in colored circle (icon-xl, radius-full)
  - Icon colors: success for paid, warning for pending, venmo-blue for total, info for overdue
- Metric value using font-size-h2
- Metric label using font-size-caption, text-secondary
- Small trend indicator (arrow icon + percentage) using text-success/text-error

**Recent Activity Feed**:
- List of VCards (card per activity)
- Each card:
  - VAvatar on left (40px) with customer initials
  - Customer name using font-size-body, text-primary
  - Action description using font-size-body-sm, text-secondary
  - Amount using font-size-h3, right-aligned, color-coded by status (success/warning/error)
  - Timestamp using font-size-caption, text-secondary
  - Chevron right icon for navigation using icon-sm
- Hover: uses hover-lift class
- Swipe actions on mobile (optional): swipe right for quick actions

**Action Buttons**:
- Mobile: Floating action button (FAB) fixed bottom-right using gradient-primary, icon-lg "+" icon
- Desktop: Primary action button "Create Invoice" prominently displayed using VButton

**Empty State** (if no activity):
- Use VEmptyState component
- Icon: invoice icon using icon-2xl
- Heading: "No activity yet"
- Description: "Create your first invoice to get started"
- Action: VButton "Create Invoice"

#### Phase 3.3: Customer Management (Week 2, Days 1-3)

**Reference**: `ui_update.md` "Screen-by-Screen Design Specifications" → Customer Management

**CustomerList.vue** (`invoice-frontend/src/views/customers/CustomerList.vue`):

Update to use MainLayout and new components:

**Header**:
- Page title: "Customers" using font-size-display
- VInput search bar (full width on mobile, 400px on desktop)
  - Magnifying glass icon using icon-md
  - Placeholder: "Search customers..."
  - Clear button when active
- Filter/sort VButton with filter icon
- VButton "+ Add Customer" using gradient-primary

**Customer Cards** (mobile < 768px):
- VCard per customer with hover-lift
- Top section:
  - VAvatar with initials (48px) with colored background
  - Customer name using font-size-h3
  - Email using font-size-caption, text-secondary
- Bottom section:
  - Stats row: "X invoices | Total: $XX,XXX" using font-size-body-sm
  - Action buttons row: VButton "View" | VButton "Edit" | VDropdown "..." (more menu)
- Card spacing: spacing-4 gap between cards

**Desktop Table View** (≥ 768px):
- Use VTable component
- Columns: Avatar, Name, Email, Phone, Invoices, Total, Actions
- Sortable columns
- Row hover: light blue background (automatic from VTable)
- Actions column: Icon buttons (eye, pencil, trash) using icon-sm

**Empty State**:
- Use VEmptyState
- Icon: user icon
- Heading: "No customers yet"
- Description: "Add your first customer to get started"
- Action: VButton "Add Customer"

**CustomerForm.vue** (`invoice-frontend/src/views/customers/CustomerForm.vue`):

Update to use MainLayout and new components:

**Layout**:
- Centered form (max-width: 600px) using container-md
- VBreadcrumbs at top for navigation
- Form title in VCard header using font-size-h2
- Form sections in VCard with spacing-6 padding

**Form Design**:
- Labeled VInputs (label above input) using font-size-body-sm, text-primary
- VInput for: Business Name, Contact Name, Email, Phone
- VTextarea for: Address (multiline)
- Focus states: show blue ring (automatic from VInput)
- Helper text below inputs using font-size-caption, text-secondary
- Error states: use has-error class and show error icon + message
- Section VDividers with subtle lines between sections

**Form Actions** (sticky bottom on mobile):
- VButton "Cancel" (ghost variant) using text-secondary
- VButton "Save Customer" (primary variant) using gradient-primary
- Desktop: buttons side-by-side
- Mobile: buttons stacked full-width

**Validation**:
- Real-time validation on blur
- Required field indicators (asterisk)
- Email format validation
- Phone format validation

#### Phase 3.4: Invoice Management (Week 2, Days 4-5 + Week 3, Days 1-2)

**Reference**: `ui_update.md` "Screen-by-Screen Design Specifications" → Invoice Management

**InvoiceList.vue** (`invoice-frontend/src/views/invoices/InvoiceList.vue`):

Update to use MainLayout and new components:

**Filter Bar**:
- Horizontal scroll container on mobile
- Pill-style VButtons for filters
- Options: "All", "Draft", "Sent", "Paid", "Overdue"
- Active state: gradient-primary background, white text
- Inactive: light gray background (background), dark text (text-primary)
- Count badges in pills using VBadge

**Invoice Cards**:
- VCard per invoice with hover-lift
- Color-coded left border (4px) using border-l-4:
  - Green (success): Paid
  - Blue (venmo-blue): Sent
  - Amber (warning): Draft
  - Red (error): Overdue
- Header section:
  - Invoice number using font-size-h3 with "#" prefix
  - VBadge status (pill shape, color-coded)
- Customer info:
  - Customer name using font-size-body, text-primary
  - Date using font-size-caption, text-secondary
- Amount section:
  - Total amount using font-size-h2, right-aligned
  - Payment status using font-size-caption
- Action footer:
  - Icon buttons: View, Edit, Send, Record Payment, Download using icon-sm
  - VDropdown "..." (more menu)
- Swipe actions (mobile): Swipe right for quick payment, left for delete

**Empty State**:
- Use VEmptyState
- Icon: invoice icon
- Heading: "No invoices yet"
- Description: "Create an invoice in seconds"
- Action: VButton "+ Create your first invoice" using gradient-primary

**InvoiceForm.vue** (`invoice-frontend/src/views/invoices/InvoiceForm.vue`):

Update to use MainLayout and new components:

**Layout**:
- Full-width form on mobile, max-width 800px on desktop using container-lg
- Multi-step progress indicator at top (optional) using VProgress or custom stepper
- Sticky header with save/send buttons

**Form Sections**:

1. **Customer Selection**:
   - VSelect with search for customer
   - Shows VAvatar + name in dropdown
   - "+ Add new customer" inline action at bottom of dropdown

2. **Invoice Details**:
   - VInput for invoice number (auto-generated, editable)
   - VDatePicker for invoice date
   - VDatePicker for due date with preset quick options (7, 14, 30 days) as VButtons

3. **Line Items**:
   - VCard per line item with spacing-4 padding
   - VInputs: Description, Quantity, Rate
   - Calculated amount (read-only) using text-primary, font-weight-semibold
   - Drag handle icon for reordering (six dots) using icon-md
   - VButton delete (trash icon) with hover state using text-error
   - VButton "+ Add item" (dashed border VCard)

4. **Totals Section**:
   - Right-aligned on desktop, full-width on mobile
   - Subtotal using font-size-body
   - VInput for Tax (optional, percentage)
   - VInput for Discount (optional, percentage or fixed)
   - Total (prominent) using font-size-h2, gradient-text-primary

5. **Notes** (collapsible section):
   - VTextarea with character count
   - Formatting options: VButtons for bold, italic, list (optional)

**Action Bar** (sticky bottom):
- VButton "Save as draft" (secondary variant)
- VButton "Send invoice" (primary variant with gradient-primary)
- Split on mobile (two buttons), side-by-side on desktop

**InvoiceDetail.vue** (view/edit existing invoice):

**Layout**:
- VCard-based design with clean layout
- Print/PDF optimized styling
- Share VButton with VDropdown (opens native share or modal)

**Header**:
- Company logo area (if available)
- Invoice title and number (prominent) using font-size-display
- VBadge status (large, colored)

**Sections**:
- From/To information (two-column on desktop using grid)
- Invoice details VTable (clean, minimal borders)
- Line items VTable (alternating rows)
- Total section (prominent, right-aligned) using gradient-text-primary
- Payment history VTimeline (if applicable)

**Actions Bar**:
- Floating actions: VButton Edit, VButton Send, VButton Record Payment, VButton Download PDF
- Animation: Slide up from bottom on scroll

#### Phase 3.5: Payment Management (Week 3, Days 3-4)

**Reference**: `ui_update.md` "Screen-by-Screen Design Specifications" → Payment Management

**RecordPaymentModal.vue** (`invoice-frontend/src/components/RecordPaymentModal.vue`):

Update to use VModal and new components:

**Modal Design**:
- VModal (overlay on desktop, full screen on mobile)
- Header: "Record Payment" using font-size-h2
- Close VButton (X icon) top-right

**Form Content**:
- Invoice summary at top (VCard within modal):
  - Invoice number
  - Customer name
  - Total amount using font-size-h2
  - Amount remaining (if partial) using text-warning
  
- Payment amount VInput (large, prominent):
  - Currency symbol
  - Large number input using font-size-display
  - Quick amount VButtons (25%, 50%, 75%, 100%) below input

- Payment method selector:
  - Grid of icon VButtons (credit card, bank, cash, check, other)
  - Selected state: venmo-blue border and background-venmo-blue-50
  - Icons using icon-lg

- VDatePicker for payment date

- VInput for reference number (optional, collapsible)

- VTextarea for notes (optional, collapsible)

**Actions** (sticky bottom):
- VButton "Cancel" (ghost variant)
- VButton "Record Payment" (primary variant with gradient-primary, full-width on mobile)
- Success animation: Checkmark burst + confetti effect (use animation library)
- Show VToast success message after recording

**PaymentHistory.vue** (payment list/timeline):

**Timeline View**:
- Use VTimeline component
- Each payment:
  - Circle indicator (color-coded by method) using radius-full
    - Credit card: venmo-blue
    - Bank: success
    - Cash: warning
    - Check: info
  - Payment amount using font-size-h3
  - Date and time using font-size-caption, text-secondary
  - Method icon using icon-sm and label
  - Associated invoice link using text-venmo-blue
  - VButton "Details" (ghost variant, small)
- Grouped by date: VDivider with text ("Today", "Yesterday", "This Week", etc.)

**Empty State**:
- Use VEmptyState
- Icon: payment icon
- Heading: "No payments recorded"
- Description: "Payment history will appear here"

#### Phase 3.6: Loading States & Skeletons (Week 3, Day 5)

**Reference**: `ui_update.md` "Implementation Phases" → Phase 8: Polish & Optimization → Loading & Skeleton States

Add loading states to all data-fetching screens:

**Dashboard**:
- VSkeleton for hero section (rect variant)
- VSkeleton for stat cards (4 rect skeletons in grid)
- VSkeleton for activity feed (list of card skeletons)

**Customer List**:
- VSkeleton for search bar (rect variant)
- VSkeleton for customer cards/table rows (multiple rect/text skeletons)

**Invoice List**:
- VSkeleton for filter bar (rect variant)
- VSkeleton for invoice cards (card skeleton with left border)

**Forms**:
- VSkeleton for input fields while loading initial data
- Show .is-loading class on form during submission

**General Pattern**:
- Show VSkeleton while data is loading
- Fade in actual content when loaded using fade transition
- Use pulse animation (automatic from VSkeleton)

**Pull-to-Refresh** (mobile):
- Implement pull-to-refresh on list views
- Show VProgress circular variant at top while refreshing
- Use haptic feedback on trigger (if available)

#### Phase 3.7: Empty States Throughout

**Reference**: `ui_update.md` "UX Patterns & Interactions" → Empty States

Add VEmptyState to all list views when no data:

**Customers**: "No customers yet" → "Add your first customer to get started" → "+ Add Customer" button

**Invoices**: "No invoices yet" → "Create an invoice in seconds" → "+ Create your first invoice" button

**Payments**: "No payments recorded" → "Payment history will appear here"

**Search Results**: "No results found" → "Try adjusting your search" → "Clear search" button

**Filtered Results**: "No [status] invoices" → "Adjust your filters to see more results" → "Clear filters" button

Each empty state should:
- Use appropriate icon (icon-2xl, 80-120px)
- Have clear heading (font-size-h2)
- Have descriptive text (font-size-body, text-secondary)
- Have primary action button (if applicable)
- Be centered in container

#### Phase 3.8: Micro-interactions Audit

**Reference**: `ui_update.md` "UX Patterns & Interactions" → Micro-interactions

Verify all interactive elements have proper animations:

**Buttons**:
- [ ] All VButtons use hover-lift and press-scale
- [ ] Hover shows translateY(-2px) and shadow-lg
- [ ] Active/press shows scale(0.97)
- [ ] Focus shows shadow-focus ring

**Cards**:
- [ ] All clickable VCards use hover-lift on desktop
- [ ] Hover shows translateY(-4px) and shadow-lg
- [ ] Transition uses duration-base and ease-out

**Inputs**:
- [ ] All VInputs show shadow-focus on focus
- [ ] Border color transitions to venmo-blue
- [ ] Transition uses duration-base

**Swipe Actions** (mobile):
- [ ] Invoice cards support swipe right for quick payment
- [ ] Invoice cards support swipe left for delete
- [ ] Background color reveal animation
- [ ] Icon scales in
- [ ] Snap animation at threshold
- [ ] Haptic feedback (if available)

**Number Counting** (dashboard):
- [ ] Animate total amounts when they change
- [ ] Use smooth count-up animation (1 second duration using duration-slower)
- [ ] Easing using ease-out

**Form Interactions**:
- [ ] Tab key navigates through form fields in logical order
- [ ] Return key submits form from last field
- [ ] Autofocus on first field when form opens

**Toast Notifications**:
- [ ] Slide down from top (mobile) or top-right (desktop)
- [ ] Auto-dismiss after 4 seconds
- [ ] Swipe to dismiss (mobile)
- [ ] Stack multiple toasts correctly

#### Phase 3.9: Accessibility Audit

**Reference**: `ui_update.md` "Accessibility Requirements"

Perform comprehensive accessibility audit:

**Color Contrast**:
- [ ] All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Interactive elements meet 3:1 contrast
- [ ] Status colors (success/warning/error) have sufficient contrast
- [ ] Gradient text has fallback color
- [ ] Don't rely on color alone (use icons + text)

**Keyboard Navigation**:
- [ ] All interactive elements keyboard accessible (tab navigation)
- [ ] Focus indicators visible on all elements (shadow-focus)
- [ ] Logical tab order throughout app
- [ ] Modal/drawer focus trap works
- [ ] Escape key closes modals/dropdowns
- [ ] Arrow keys navigate dropdowns/selects/tabs
- [ ] Skip links for main navigation

**Screen Readers**:
- [ ] Semantic HTML used throughout
- [ ] ARIA labels on icon-only buttons
- [ ] ARIA live regions for dynamic content (toasts, alerts)
- [ ] Alt text on images and illustrations
- [ ] Form labels properly associated with inputs
- [ ] Form errors announced to screen readers
- [ ] Loading states announced

**Motion**:
- [ ] Respect prefers-reduced-motion in global.css
- [ ] All animations disabled when user prefers reduced motion
- [ ] Static alternatives provided for animations

**Run Lighthouse Audit**:
- [ ] Accessibility score > 90
- [ ] Zero critical violations
- [ ] Fix any issues found

**Test with Screen Reader**:
- [ ] Test login flow with screen reader
- [ ] Test creating invoice with screen reader
- [ ] Test navigation with screen reader
- [ ] Verify all actions are announced

#### Phase 3.10: Performance Optimization

**Reference**: `ui_update.md` "Implementation Phases" → Phase 8: Polish & Optimization → Performance & Animation Optimization

**Animation Performance**:
- [ ] All animations run at 60fps
- [ ] Use CSS transforms (not position) for animations
- [ ] Use will-change for complex animations
- [ ] Verify no layout thrashing
- [ ] Test on lower-end devices

**Bundle Optimization**:
- [ ] Check CSS bundle size (should be reasonable)
- [ ] Verify no duplicate CSS variables
- [ ] Remove unused Tailwind utilities
- [ ] Tree-shake unused components

**Image Optimization**:
- [ ] Optimize logo images
- [ ] Optimize empty state illustrations
- [ ] Use appropriate image formats (WebP with fallback)
- [ ] Lazy load off-screen images

**Component Lazy Loading**:
- [ ] Lazy load route components
- [ ] Lazy load VModal content
- [ ] Lazy load heavy components (VTable, VDatePicker)
- [ ] Use dynamic imports

**Virtual Scrolling** (if needed):
- [ ] Implement for long customer lists (if 100+ customers)
- [ ] Implement for long invoice lists (if 100+ invoices)

**CSS Variables Performance**:
- [ ] Verify no performance issues with CSS variables
- [ ] Check paint times in Chrome DevTools
- [ ] Verify no excessive repaints on interactions

**Run Lighthouse Audit**:
- [ ] Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Fix any performance issues

#### Phase 3.11: Cross-browser & Responsive Testing

**Reference**: `ui_update.md` "Implementation Phases" → Phase 8 → Cross-browser & Responsive Testing

**Desktop Browsers**:
- [ ] Chrome (latest): All features work
- [ ] Firefox (latest): All features work
- [ ] Safari (latest): All features work
- [ ] Edge (latest): All features work
- [ ] CSS variables supported in all browsers
- [ ] Gradients render correctly in all browsers
- [ ] Animations smooth in all browsers

**Mobile Browsers**:
- [ ] iOS Safari: All features work
- [ ] Chrome Mobile (Android): All features work
- [ ] Samsung Internet: All features work
- [ ] Touch interactions work on all mobile browsers
- [ ] Bottom navigation shows correctly on mobile
- [ ] Swipe gestures work on mobile

**Responsive Breakpoints**:
- [ ] Test at 375px width (mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1024px width (desktop)
- [ ] Test at 1440px+ width (large desktop)
- [ ] Navigation switches correctly at breakpoints
- [ ] Layouts adapt correctly at breakpoints
- [ ] Forms stack correctly on mobile
- [ ] Tables become cards on mobile

**Device Testing**:
- [ ] Test on iPhone (physical or simulator)
- [ ] Test on Android phone (physical or simulator)
- [ ] Test on iPad (physical or simulator)
- [ ] Test on desktop/laptop
- [ ] Verify safe areas handled (notches, etc.)

#### Phase 3.12: Final Validation & Polish

**Reference**: `ui_update.md` "Implementation Phases" → Phase Completion Checklist

**Design Token Validation**:
- [ ] Run `npm run check:tokens` - no hardcoded colors
- [ ] Search for `#[0-9A-Fa-f]{6}` - only in tokens.css
- [ ] Search for `rgb(` - none in components
- [ ] Search for `rgba(` - none in components
- [ ] All styles use var(--*) or Tailwind utilities

**Visual Consistency**:
- [ ] All screens match Venmo-inspired design language
- [ ] Colors consistent across all screens
- [ ] Spacing consistent across all screens
- [ ] Typography consistent across all screens
- [ ] Shadows consistent across all components
- [ ] Animations consistent across all interactions

**Change CSS Variable Test**:
- [ ] Change `--color-venmo-blue` - verify entire app updates
- [ ] Change `--spacing-6` - verify card padding updates everywhere
- [ ] Change `--radius-md` - verify all components update
- [ ] Change `--shadow-md` - verify all cards update
- [ ] Change `--duration-base` - verify all transitions update
- [ ] This proves single source of truth works

**Component Usage**:
- [ ] All buttons use VButton (no raw <button>)
- [ ] All inputs use VInput (no raw <input>)
- [ ] All cards use VCard
- [ ] All avatars use VAvatar
- [ ] All badges use VBadge
- [ ] All modals use VModal
- [ ] All toasts use VToast via useToast
- [ ] All layouts use MainLayout/AuthLayout/EmptyLayout

**User Experience**:
- [ ] App feels responsive and smooth
- [ ] Loading states provide feedback
- [ ] Error states are clear
- [ ] Success states are celebratory
- [ ] Empty states are helpful
- [ ] Forms are easy to fill out
- [ ] Navigation is intuitive
- [ ] Mobile experience is great
- [ ] Desktop experience is great

**Final Lighthouse Audit**:
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

### Acceptance Criteria

#### Authentication Screens

- [ ] Login page uses AuthLayout
- [ ] Login page uses gradient background
- [ ] Login form uses VInput and VButton
- [ ] Login error shows shake animation
- [ ] Login success shows checkmark and redirects
- [ ] Signup page uses AuthLayout
- [ ] Signup form has password strength indicator
- [ ] Signup form validates all fields
- [ ] Signup success shows toast and redirects

#### Dashboard

- [ ] Dashboard uses MainLayout
- [ ] Hero section shows gradient card with totals
- [ ] Quick stats cards show metrics with icons
- [ ] Activity feed shows recent activities
- [ ] Hovering activity items shows lift effect
- [ ] Clicking activity navigates to detail
- [ ] Empty state shows if no activity
- [ ] Loading state shows skeletons
- [ ] Mobile shows FAB for new invoice
- [ ] Desktop shows prominent action button

#### Customer Management

- [ ] Customer list uses MainLayout
- [ ] Search bar filters customers
- [ ] Mobile shows customer cards
- [ ] Desktop shows customer table
- [ ] Clicking customer navigates to detail
- [ ] Add customer button opens form
- [ ] Customer form validates all fields
- [ ] Customer form saves successfully
- [ ] Empty state shows if no customers
- [ ] Loading state shows skeletons

#### Invoice Management

- [ ] Invoice list uses MainLayout
- [ ] Filter pills work (All, Draft, Sent, Paid, Overdue)
- [ ] Invoice cards show color-coded border
- [ ] Invoice cards show status badge
- [ ] Mobile swipe actions work
- [ ] Clicking invoice opens detail
- [ ] Invoice form has customer selection
- [ ] Invoice form has line items (add/remove/reorder)
- [ ] Invoice form calculates totals correctly
- [ ] Invoice form saves as draft
- [ ] Invoice form sends invoice
- [ ] Invoice detail shows all information
- [ ] Invoice detail has action buttons
- [ ] Empty state shows if no invoices
- [ ] Loading state shows skeletons

#### Payment Management

- [ ] Record payment modal opens
- [ ] Payment amount input is prominent
- [ ] Quick amount buttons work (25%, 50%, 75%, 100%)
- [ ] Payment method selector works
- [ ] Payment date picker works
- [ ] Recording payment shows success animation
- [ ] Payment history shows timeline
- [ ] Payments grouped by date
- [ ] Empty state shows if no payments

#### Loading States

- [ ] All list views show skeleton while loading
- [ ] Skeleton matches shape of actual content
- [ ] Skeleton has pulse animation
- [ ] Content fades in when loaded
- [ ] Forms show loading state during submission
- [ ] Mobile pull-to-refresh works

#### Empty States

- [ ] All list views show empty state when no data
- [ ] Empty states have appropriate icons
- [ ] Empty states have helpful descriptions
- [ ] Empty states have action buttons
- [ ] Empty states centered in container

#### Micro-interactions

- [ ] All buttons show hover lift
- [ ] All buttons show press scale
- [ ] All cards show hover lift (desktop)
- [ ] All inputs show focus ring
- [ ] Numbers animate on dashboard
- [ ] Toasts slide in and auto-dismiss
- [ ] Toasts swipe to dismiss (mobile)
- [ ] Modal transitions smooth
- [ ] Page transitions smooth

#### Accessibility

- [ ] Lighthouse accessibility score > 90
- [ ] All text meets WCAG AA contrast
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible everywhere
- [ ] Screen reader friendly
- [ ] ARIA attributes present
- [ ] Reduced motion respected

#### Performance

- [ ] Lighthouse performance score > 90
- [ ] Animations run at 60fps
- [ ] No layout thrashing
- [ ] Bundle size reasonable
- [ ] Images optimized
- [ ] Lazy loading implemented

#### Responsive Design

- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Navigation adapts correctly
- [ ] Forms adapt correctly
- [ ] Tables become cards on mobile

#### Cross-browser

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome

#### Design System Compliance

- [ ] No hardcoded colors (except tokens.css)
- [ ] All components use design tokens
- [ ] All screens use base components
- [ ] All layouts use layout components
- [ ] Consistent styling throughout
- [ ] Changing CSS variable updates entire app

### Testing Requirements

1. **Unit Tests**:
   - Form validation logic
   - Data fetching and state management
   - User interactions (clicks, inputs)
   - Toast notifications
   - Modal open/close

2. **Integration Tests**:
   - Login flow end-to-end
   - Create customer end-to-end
   - Create invoice end-to-end
   - Record payment end-to-end
   - Navigation between screens

3. **E2E Tests**:
   - Complete user journey (login → create customer → create invoice → record payment)
   - Test on multiple browsers
   - Test on mobile and desktop

4. **Visual Regression Tests**:
   - Screenshot key screens
   - Compare with design reference
   - Verify no unintended visual changes

5. **Accessibility Tests**:
   - Automated audit (Lighthouse, axe)
   - Manual keyboard navigation test
   - Screen reader test
   - Color contrast verification

6. **Performance Tests**:
   - Lighthouse audit
   - WebPageTest analysis
   - Check animation frame rates
   - Monitor bundle sizes

### Migration Strategy

This PR transforms existing screens to use the new design system:

**Before Merging**:
- Comprehensive testing in staging environment
- User acceptance testing (UAT) with stakeholders
- Performance benchmarks documented
- Accessibility audit passed
- All acceptance criteria met

**After Merging**:
- Monitor user feedback
- Monitor performance metrics
- Monitor error rates
- Be prepared for quick fixes if issues arise

**Rollback Plan**:
- Keep previous UI version in git history
- Document steps to revert if critical issues found
- Have hotfix process ready

### References

- All screen designs: `ui_update.md` "Screen-by-Screen Design Specifications"
- UX patterns: `ui_update.md` "UX Patterns & Interactions"
- Accessibility requirements: `ui_update.md` "Accessibility Requirements"
- Performance guidelines: `ui_update.md` "Notes & Considerations" → Performance
- Implementation phases: `ui_update.md` "Implementation Phases"
- Success metrics: `ui_update.md` "Success Metrics"

---

## Summary

These 3 pull requests must be implemented **sequentially**:

1. **PR1: Global Design System Foundation** - Creates the single source of truth (CSS variables, Tailwind config, base components). MUST be completed first.

2. **PR2: Complete Component Library & Navigation** - Builds all remaining components and navigation system using the foundation from PR1.

3. **PR3: Feature Implementation & UI Transformation** - Transforms all screens to use the new design system from PR1 and PR2. Final polish and optimization.

Each PR is independently testable and can be merged without breaking existing functionality (until PR3, which is the actual transformation).

**Total Estimated Effort**: 5.5 weeks (1 week + 1.5 weeks + 3 weeks)

**Critical Success Factors**:
- PR1 MUST be 100% complete before starting PR2
- All components MUST use ONLY design tokens
- No hardcoded values anywhere
- Comprehensive testing at each stage
- Design system validation at each PR

