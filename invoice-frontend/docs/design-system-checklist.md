# Design System Validation Checklist

This checklist ensures that the global design system has been properly implemented and is being enforced across the application.

## File Creation

- [ ] `src/styles/tokens.css` exists
- [ ] `src/styles/global.css` exists
- [ ] `src/styles/utilities.css` exists
- [ ] `src/styles/animations.css` exists
- [ ] `src/styles/index.css` exists
- [ ] `tailwind.config.js` updated
- [ ] `src/main.ts` imports global styles
- [ ] `src/types/design-tokens.ts` exists
- [ ] `.eslintrc.cjs` exists with design token rules

## Design Token Validation

### Color Tokens
- [ ] All primary color scales defined (blue 50-900)
- [ ] All accent color scales defined (purple 50-900)
- [ ] Semantic color names defined (venmo-blue, venmo-purple, deep-blue)
- [ ] Neutral colors defined (background, card-white, border-gray, text-*)
- [ ] Status colors defined (success, warning, error, info with variants)

### Spacing Tokens
- [ ] All spacing values defined (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)

### Typography Tokens
- [ ] Font family defined
- [ ] All font sizes defined (display-lg through caption)
- [ ] All font weights defined (normal, medium, semibold, bold)
- [ ] Line heights defined (tight, normal, relaxed)
- [ ] Letter spacing defined (tight, normal, wide)

### Other Tokens
- [ ] Border radius tokens defined (none, sm, md, lg, xl, 2xl, full)
- [ ] Shadow tokens defined (none, sm, md, lg, xl, focus)
- [ ] Animation duration tokens defined (fast, base, medium, slow, slower)
- [ ] Easing function tokens defined (in-out, out, in, bounce)
- [ ] Icon size tokens defined (xs, sm, md, lg, xl, 2xl)
- [ ] Z-index tokens defined (base through tooltip)
- [ ] Layout tokens defined (navbar-height, sidebar-width, etc.)
- [ ] Gradient tokens defined (primary, success, error)

## Tailwind Configuration

- [ ] Colors mapped to CSS variables
- [ ] Spacing mapped to CSS variables
- [ ] Border radius mapped to CSS variables
- [ ] Box shadows mapped to CSS variables
- [ ] Font family mapped to CSS variables
- [ ] Font sizes mapped to CSS variables
- [ ] Font weights mapped to CSS variables
- [ ] Line heights mapped to CSS variables
- [ ] Letter spacing mapped to CSS variables
- [ ] Transition durations mapped to CSS variables
- [ ] Transition timing functions mapped to CSS variables
- [ ] Z-index values mapped to CSS variables
- [ ] Background gradients mapped to CSS variables
- [ ] Custom breakpoints defined (mobile, tablet, desktop, lg-desktop)
- [ ] NO hardcoded values in Tailwind config

## Component Library

### Core Components Created
- [ ] VButton component exists
- [ ] VInput component exists
- [ ] VCard component exists
- [ ] VBadge component exists
- [ ] VAvatar component exists

### Component Quality
- [ ] All components use ONLY design tokens
- [ ] All components are fully typed with TypeScript
- [ ] All components follow Vue 3 Composition API (`<script setup>`)
- [ ] All components use scoped styles
- [ ] All components are keyboard accessible
- [ ] All components include proper ARIA attributes

## Code Quality

### Linting
- [ ] ESLint configured to prevent hardcoded colors
- [ ] ESLint configured with Vue rules
- [ ] `npm run lint` passes with no errors

### Design Token Enforcement
- [ ] `npm run check:tokens` finds no hardcoded colors (except in tokens.css)
- [ ] Search for `#[0-9A-Fa-f]{6}` finds only tokens.css
- [ ] Search for `rgb(` finds none in Vue components
- [ ] Search for `rgba(` finds none in Vue components

## Testing

### Manual Testing
- [ ] Run app in development mode (`npm run dev`)
- [ ] VButton renders with gradient background
- [ ] VButton hover shows lift effect
- [ ] VButton focus shows blue ring
- [ ] VInput focus shows blue ring
- [ ] VCard shows appropriate shadow
- [ ] VBadge shows colored pill shape
- [ ] VAvatar shows initials with colored background
- [ ] All components look visually consistent

### Token Validation Test
Test that changing tokens updates the entire app:
- [ ] Change `--color-venmo-blue` → verify all blue elements update
- [ ] Change `--spacing-6` → verify card padding updates
- [ ] Change `--radius-md` → verify button corners update
- [ ] Change `--shadow-md` → verify card shadows update
- [ ] Change `--duration-base` → verify hover animations update

### Browser Compatibility
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] CSS variables work in all browsers
- [ ] Gradients render correctly in all browsers

## Documentation

- [ ] `docs/component-template.md` created
- [ ] `docs/design-system-checklist.md` created (this file)
- [ ] Each component has documentation in `docs/components/`
- [ ] Documentation lists design tokens used
- [ ] Documentation includes usage examples
- [ ] Documentation notes accessibility features

## Validation Commands

Run these commands to validate the design system:

```bash
# Check for linting errors
npm run lint

# Check for hardcoded colors
npm run check:tokens

# Run full validation
npm run validate:design-system

# Type check
npm run type-check

# Build to ensure no errors
npm run build
```

## Final Validation

- [ ] All files created and configured
- [ ] All design tokens defined
- [ ] Tailwind references CSS variables only
- [ ] Core components built and working
- [ ] Linting enforces design token usage
- [ ] No hardcoded values anywhere
- [ ] Documentation complete
- [ ] All tests pass
- [ ] App builds successfully

## Sign-Off

- **Date**: _____________
- **Developer**: _____________
- **Reviewer**: _____________

## Notes

Any additional notes or observations:

---

**Remember**: The design system is the single source of truth. All styling MUST use design tokens. No hardcoded values are allowed.

