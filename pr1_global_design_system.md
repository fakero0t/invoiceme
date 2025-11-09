# Pull Request 1: Global Design System Foundation

**Priority**: CRITICAL - Must be completed first before any other UI work

**Dependencies**: None

**Reference Document**: `ui_update.md`

## Overview

Establish the complete global design system foundation including CSS variables (design tokens), Tailwind configuration, global styles, and core base components. This PR creates the single source of truth for all styling across the application.

## Objectives

1. Create all design token CSS variables
2. Configure Tailwind to reference design tokens
3. Implement global base styles for HTML elements
4. Create global utility and animation classes
5. Build core base component library (VButton, VInput, VCard, VBadge, VAvatar)
6. Set up TypeScript type definitions for design tokens
7. Configure linting to enforce design token usage
8. Create component documentation structure

## Detailed Implementation Tasks

### Task 1.1: Create Design Token Files

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

### Task 1.2: Create Global Base Styles

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

### Task 1.3: Create Global Utility Classes

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

### Task 1.4: Create Global Animation Classes

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

### Task 1.5: Create Main Stylesheet

**File**: `invoice-frontend/src/styles/index.css`

Import all stylesheets in correct order:
1. Design tokens (tokens.css)
2. Tailwind base
3. Global base styles (global.css)
4. Global utilities (utilities.css)
5. Global animations (animations.css)
6. Tailwind components and utilities

**Reference**: See ui_update.md Step 5 for complete implementation

### Task 1.6: Update Tailwind Configuration

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

### Task 1.7: Update Application Entry Point

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

### Task 1.8: Create TypeScript Type Definitions

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

### Task 1.9: Build Core Base Components

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

### Task 1.10: Configure Linting Rules

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

### Task 1.11: Add Validation Scripts

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

### Task 1.12: Create Component Documentation

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

### Task 1.13: Create Component Documentation for Each Component

For each component (VButton, VInput, VCard, VBadge, VAvatar), create:

**File**: `invoice-frontend/docs/components/[ComponentName].md`

Document:
- Component description
- All design tokens used (colors, spacing, typography, borders, shadows, animations)
- Props table with types and descriptions
- Usage examples (basic, with variants, with states)
- Accessibility notes
- Implementation notes

## Acceptance Criteria

### Design System Foundation

- [ ] `src/styles/tokens.css` exists with ALL design tokens defined as CSS variables
- [ ] All color scales defined (primary, accent, neutral, status)
- [ ] All spacing values defined (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)
- [ ] All typography tokens defined (family, sizes, weights, line heights, letter spacing)
- [ ] All border radius tokens defined
- [ ] All shadow tokens defined
- [ ] All animation tokens defined (durations, easing functions)
- [ ] Icon size, z-index, layout, and gradient tokens defined

### Global Styles

- [ ] `src/styles/global.css` exists with base HTML element styles
- [ ] All base styles reference design tokens (no hardcoded values)
- [ ] Typography hierarchy established (h1-h6, p, small)
- [ ] Form elements have consistent base styling
- [ ] Focus states use global shadow-focus token
- [ ] Reduced motion support implemented

### Utility Classes

- [ ] `src/styles/utilities.css` exists with reusable utility classes
- [ ] Card utilities (.card, .card-sm, .card-lg)
- [ ] Gradient utilities (.gradient-primary, .gradient-text-primary)
- [ ] State utilities (.is-loading, .is-disabled, .has-error, .has-success, .has-warning)
- [ ] Layout utilities (.container with variants)
- [ ] Text utilities for colors
- [ ] Truncate utilities

### Animation Classes

- [ ] `src/styles/animations.css` exists with animation utilities
- [ ] Transition utilities defined
- [ ] Interaction animations (.hover-lift, .press-scale, .hover-brighten)
- [ ] Loading animations (spin, pulse, bounce)
- [ ] Page transition classes for Vue
- [ ] Modal transition classes
- [ ] Skeleton loading animation

### Stylesheet Integration

- [ ] `src/styles/index.css` imports all styles in correct order
- [ ] Styles imported in main.ts before app mounts
- [ ] No console errors related to CSS imports

### Tailwind Configuration

- [ ] `tailwind.config.js` extends theme to reference CSS variables
- [ ] All color utilities reference CSS variables
- [ ] All spacing utilities reference CSS variables
- [ ] All typography utilities reference CSS variables
- [ ] All shadow utilities reference CSS variables
- [ ] All animation utilities reference CSS variables
- [ ] Breakpoints configured correctly
- [ ] NO hardcoded values anywhere in config
- [ ] Tailwind builds successfully with new config

### TypeScript Types

- [ ] `src/types/design-tokens.ts` exists with type definitions
- [ ] All token types exported (Color, Spacing, Radius, Shadow, FontSize, Icon, Duration, Easing)
- [ ] Helper functions exported (getCSSVariable, setCSSVariable)
- [ ] Types compile without errors

### Base Components

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

### Linting & Validation

- [ ] ESLint configured to prevent hardcoded colors
- [ ] ESLint configured with Vue rules
- [ ] `npm run lint` passes with no errors
- [ ] `npm run check:tokens` finds no hardcoded colors (except in tokens.css)
- [ ] `npm run validate:design-system` passes completely

### Documentation

- [ ] `docs/component-template.md` created
- [ ] `docs/design-system-checklist.md` created
- [ ] Each component has documentation in `docs/components/`
- [ ] Documentation lists all design tokens used by each component

### Visual Verification

- [ ] Run app in development mode
- [ ] VButton renders with gradient background
- [ ] VButton hover shows lift effect
- [ ] VButton focus shows blue ring
- [ ] VInput focus shows blue ring
- [ ] VCard shows shadow
- [ ] VBadge shows colored pill
- [ ] VAvatar shows initials with colored background
- [ ] All components look visually consistent

### Token Validation

- [ ] Change `--color-venmo-blue` in tokens.css and verify ALL buttons update color
- [ ] Change `--spacing-6` and verify card padding updates
- [ ] Change `--radius-md` and verify button corners update
- [ ] Change `--shadow-md` and verify card shadow updates
- [ ] Change `--duration-base` and verify hover animations update
- [ ] This proves single source of truth is working

### Browser Compatibility

- [ ] Test in Chrome - CSS variables work
- [ ] Test in Firefox - CSS variables work
- [ ] Test in Safari - CSS variables work
- [ ] Test in Edge - CSS variables work

### No Hardcoded Values

- [ ] Search codebase for `#[0-9A-Fa-f]{6}` - only found in tokens.css
- [ ] Search for `rgb(` - none found in Vue components
- [ ] Search for `rgba(` - none found in Vue components
- [ ] All components use var(--*) or Tailwind utilities

## Testing Requirements

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

## Migration Notes

- This PR does NOT modify existing UI components
- It establishes the foundation that future PRs will use
- Existing components continue to work unchanged
- No user-facing changes in this PR
- Can be merged without affecting production functionality

## References

- Full design token specifications: `ui_update.md` Sections "Design System Components" and "Global Style Architecture"
- Implementation steps: `ui_update.md` "Detailed Implementation Guide" Steps 1-13
- Color palette: `ui_update.md` Appendix "Color Palette (Full Specification)"
- Component inventory: `ui_update.md` Appendix "Component Inventory"
- Animation specifications: `ui_update.md` Appendix "Animation Specifications"

