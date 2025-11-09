# UI Update PRD: Venmo-Inspired Design System

## Overview
Transform the InvoiceMe application UI to adopt Venmo's modern, friendly, and intuitive design language while maintaining the professional invoicing functionality. This update encompasses visual design, UX patterns, navigation, interactions, and animations across all application screens.

## Design Principles

### Core Visual Identity
- **Color Palette**: Venmo's signature blue (#3D95CE) as primary, with purple accents (#8C7AE6)
- **Typography**: Clean, modern sans-serif (Inter or similar system fonts)
- **Spacing**: Generous white space with 8px base unit system
- **Tone**: Friendly yet professional, approachable but trustworthy

### Key Characteristics
1. Clean, card-based layouts with subtle shadows
2. Rounded corners (8-12px radius) for all interactive elements
3. Bold, colorful action buttons with gradient effects
4. Minimalist navigation with icon-forward design
5. Smooth micro-interactions and transitions
6. Mobile-first responsive design

---

## Design System Components

### 1. Color System

#### Primary Colors
- **Venmo Blue**: `#3D95CE` - Primary actions, links, active states
- **Venmo Purple**: `#8C7AE6` - Gradient accents, secondary actions
- **Deep Blue**: `#1A4F6E` - Headers, important text

#### Neutral Colors
- **Background**: `#F7F8FA` - Main background
- **Card White**: `#FFFFFF` - Card surfaces
- **Border Gray**: `#E5E7EB` - Borders, dividers
- **Text Primary**: `#1F2937` - Main text
- **Text Secondary**: `#6B7280` - Supporting text
- **Text Tertiary**: `#9CA3AF` - Placeholder text

#### Status Colors
- **Success Green**: `#10B981` - Paid invoices, success states
- **Warning Amber**: `#F59E0B` - Pending, warnings
- **Error Red**: `#EF4444` - Overdue, errors, destructive actions
- **Info Blue**: `#3B82F6` - Informational messages

### 2. Typography Scale

```
Display Large: 36px / 600 weight / -0.5px letter-spacing
Display: 32px / 600 weight / -0.5px letter-spacing
Heading 1: 28px / 600 weight / -0.3px letter-spacing
Heading 2: 24px / 600 weight / -0.2px letter-spacing
Heading 3: 20px / 600 weight / -0.1px letter-spacing
Body Large: 18px / 400 weight / normal letter-spacing
Body: 16px / 400 weight / normal letter-spacing
Body Small: 14px / 400 weight / normal letter-spacing
Caption: 12px / 400 weight / 0.2px letter-spacing
```

### 3. Spacing System
- Base unit: 8px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Card padding: 24px
- Section spacing: 32px
- Component spacing: 16px

### 4. Border Radius
- Small: 8px (inputs, tags)
- Medium: 12px (cards, buttons)
- Large: 16px (modals, large cards)
- Full: 9999px (pills, avatars)

### 5. Shadows
- **Small**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Medium**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **Large**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **Active**: `0 0 0 3px rgba(61, 149, 206, 0.3)` (focus ring)

---

## Global Style Architecture

**CRITICAL**: All design tokens, styles, and patterns defined in this document must be implemented as global, reusable systems to ensure absolute consistency across the entire application. This is not a component-by-component implementation but a comprehensive design system that serves as the single source of truth for all visual and interactive elements.

### Global Implementation Strategy

#### 1. CSS Variables (Design Tokens)
All colors, spacing, typography, shadows, and timing values MUST be defined as CSS custom properties (variables) at the `:root` level. These variables should be the ONLY source for styling values throughout the application.

**Example Structure**:
```css
:root {
  /* Color Tokens */
  --color-venmo-blue: #3D95CE;
  --color-venmo-purple: #8C7AE6;
  --color-deep-blue: #1A4F6E;
  --color-background: #F7F8FA;
  --color-card-white: #FFFFFF;
  --color-border-gray: #E5E7EB;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Spacing Tokens */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-24: 96px;
  
  /* Radius Tokens */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Shadow Tokens */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-focus: 0 0 0 3px rgba(61, 149, 206, 0.3);
  
  /* Typography Tokens */
  --font-display-lg: 36px;
  --font-display: 32px;
  --font-h1: 28px;
  --font-h2: 24px;
  --font-h3: 20px;
  --font-body-lg: 18px;
  --font-body: 16px;
  --font-body-sm: 14px;
  --font-caption: 12px;
  
  /* Animation Tokens */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 400ms;
  --duration-slower: 500ms;
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

#### 2. Tailwind Configuration Extension
Update `tailwind.config.js` to reference the global design tokens, creating a seamless integration between CSS variables and utility classes.

**Required Configuration**:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        venmo: {
          blue: 'var(--color-venmo-blue)',
          purple: 'var(--color-venmo-purple)',
          'deep-blue': 'var(--color-deep-blue)',
        },
        background: 'var(--color-background)',
        // ... all color tokens mapped
      },
      spacing: {
        // Map to CSS variables for consistency
        1: 'var(--spacing-1)',
        2: 'var(--spacing-2)',
        // ... all spacing tokens
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        focus: 'var(--shadow-focus)',
      },
      fontSize: {
        'display-lg': 'var(--font-display-lg)',
        'display': 'var(--font-display)',
        // ... all typography tokens
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        // ... all duration tokens
      },
      transitionTimingFunction: {
        'in-out': 'var(--ease-in-out)',
        // ... all easing tokens
      }
    }
  }
}
```

#### 3. Global Base Styles
Create a comprehensive global stylesheet that applies base styles to HTML elements, ensuring consistent appearance before any component-specific styles are applied.

**File**: `src/styles/global.css` or similar

```css
/* Apply box-sizing globally */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Root and body base styles */
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: var(--font-body);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  line-height: 1.5;
}

/* Global typography styles */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
  color: var(--color-text-primary);
}

h1 { font-size: var(--font-h1); letter-spacing: -0.3px; }
h2 { font-size: var(--font-h2); letter-spacing: -0.2px; }
h3 { font-size: var(--font-h3); letter-spacing: -0.1px; }

p {
  margin: 0;
  font-size: var(--font-body);
  color: var(--color-text-primary);
}

/* Global link styles */
a {
  color: var(--color-venmo-blue);
  text-decoration: none;
  transition: color var(--duration-base) var(--ease-out);
}

a:hover {
  color: var(--color-deep-blue);
}

/* Global button reset */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
}

/* Global input styles */
input, textarea, select {
  font-family: inherit;
  font-size: var(--font-body);
  color: var(--color-text-primary);
}

/* Global focus styles */
*:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Global card base class */
.card {
  background: var(--color-card-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-6);
}

/* Global gradient utility */
.gradient-primary {
  background: linear-gradient(135deg, var(--color-venmo-blue) 0%, var(--color-venmo-purple) 100%);
}
```

#### 4. Component-Level Consistency Rules

**Mandatory Component Structure**:
- Every component MUST use design tokens (CSS variables) instead of hardcoded values
- Every component MUST inherit from base component classes (VButton, VCard, VInput, etc.)
- No component should define its own color, spacing, or typography values
- All animations MUST use global timing functions and durations
- All interactive elements MUST use the global focus state

**Example**:
```vue
<!-- BAD: Hardcoded values -->
<button style="background: #3D95CE; padding: 12px 24px; border-radius: 12px;">
  Click me
</button>

<!-- GOOD: Using global tokens via component class -->
<VButton variant="primary">Click me</VButton>

<!-- GOOD: Using Tailwind utilities that reference tokens -->
<button class="bg-venmo-blue px-6 py-3 rounded-md">
  Click me
</button>
```

#### 5. Single Source of Truth Hierarchy

All styling decisions flow from this hierarchy:

1. **CSS Variables (`:root`)** - The absolute source of truth
2. **Tailwind Configuration** - References CSS variables
3. **Global Base Styles** - Applied to all elements
4. **Base Component Library** - Reusable components using tokens
5. **Feature Components** - Composed from base components
6. **Page-Level Components** - Composed from feature components

NO component at ANY level should bypass this hierarchy by introducing custom values.

#### 6. Global Animation System

All animations and transitions must use the globally defined timing functions and durations.

**Global Animation Classes**:
```css
/* Transition utilities */
.transition-all {
  transition-property: all;
  transition-timing-function: var(--ease-in-out);
  transition-duration: var(--duration-base);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: var(--ease-in-out);
  transition-duration: var(--duration-base);
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: var(--ease-out);
  transition-duration: var(--duration-medium);
}

/* Standard interaction states */
.hover-lift {
  transition: transform var(--duration-base) var(--ease-out), 
              box-shadow var(--duration-base) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.press-scale {
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.press-scale:active {
  transform: scale(0.97);
}
```

#### 7. Responsive Design Tokens

Breakpoints should also be defined as global tokens for consistency.

```css
:root {
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1440px;
}
```

**In Tailwind**:
```javascript
screens: {
  'mobile': {'max': '767px'},
  'tablet': {'min': '768px', 'max': '1023px'},
  'desktop': {'min': '1024px'},
  'lg-desktop': {'min': '1440px'},
}
```

#### 8. Global State Classes

Define global state classes for common UI states that should be consistent everywhere:

```css
/* Loading state */
.is-loading {
  opacity: 0.6;
  pointer-events: none;
  cursor: not-allowed;
}

/* Disabled state */
.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Error state */
.has-error {
  border-color: var(--color-error);
  color: var(--color-error);
}

/* Success state */
.has-success {
  border-color: var(--color-success);
  color: var(--color-success);
}
```

#### 9. Enforcement and Validation

**Implementation Requirements**:
- Linting rules to prevent hardcoded color/spacing values
- ESLint plugin to enforce component usage (e.g., require VButton instead of raw <button>)
- Pre-commit hooks to validate CSS variable usage
- Code review checklist item: "Uses design tokens exclusively"
- Storybook or component documentation showing proper token usage

**Example ESLint Rule**:
```javascript
// Disallow hardcoded colors in style attributes
'no-inline-styles': ['error', {
  allowedProperties: []
}]
```

### Benefits of Global Style Architecture

1. **Absolute Consistency**: One change to a CSS variable updates the entire application
2. **Maintainability**: Centralized style management, easy to update
3. **Theming Support**: Easy to implement dark mode or custom themes
4. **Performance**: Reduced CSS bundle size through reusable utilities
5. **Developer Experience**: Predictable, documented design system
6. **Quality Assurance**: Automated validation ensures compliance
7. **Scalability**: New features automatically inherit correct styling

### Implementation Verification Checklist

- [ ] All colors defined as CSS variables in `:root`
- [ ] All spacing values defined as CSS variables
- [ ] All typography scales defined as CSS variables
- [ ] All animation timings defined as CSS variables
- [ ] Tailwind config extends and references CSS variables
- [ ] Global base styles applied to HTML elements
- [ ] All components use design tokens (no hardcoded values)
- [ ] Global animation classes defined and documented
- [ ] Global state classes defined and documented
- [ ] Linting rules enforce token usage
- [ ] Component library documented with token usage examples
- [ ] All existing components refactored to use global tokens
- [ ] Browser compatibility tested for CSS variable support
- [ ] Design token documentation available to all developers

---

## Screen-by-Screen Design Specifications

### Authentication Screens

#### Login Page (`/login`)
**Layout**:
- Centered card design (max-width: 400px)
- Logo at top (60-80px height)
- Gradient background (blue to purple, subtle)
- Card with white background, medium shadow
- Rounded corners (16px)

**Elements**:
- Welcome heading: "Welcome back" (Display font)
- Subtext: "Log in to manage your invoices" (Body Small, secondary text)
- Email input with icon (envelope icon, left-aligned)
- Password input with show/hide toggle
- "Forgot password?" link (right-aligned, Venmo blue)
- Primary button: "Log in" (full width, gradient blue to purple)
- Divider with "or" text
- "Sign up" link (centered, Venmo blue)

**Interactions**:
- Input focus: Blue ring animation
- Button hover: Slight scale up (1.02), deeper shadow
- Button press: Scale down (0.98)
- Error shake animation for invalid credentials
- Success checkmark animation before redirect

#### Signup Page (`/signup`)
**Layout**: Similar to login, expanded height
**Additional Elements**:
- Business name input
- Email confirmation field
- Password strength indicator (progress bar, color-coded)
- Terms acceptance checkbox with styled checkbox
- "Already have an account?" link at bottom

---

### Dashboard/Home Screen (`/dashboard`)

#### Navigation Bar
**Structure**:
- Fixed top bar, white background, subtle bottom shadow
- Height: 64px
- Logo left (clickable, navigates home)
- Right side: Profile avatar (32px, circular), notification bell icon

**Mobile Navigation** (< 768px):
- Bottom tab bar (fixed position)
- 4-5 icon-based tabs: Home, Customers, Invoices, Payments, More
- Active tab: Venmo blue with indicator bar on top
- Icons: 24px, with 8px label below
- Smooth slide transition between tabs

**Desktop Navigation** (≥ 768px):
- Left sidebar (240px width, collapsible)
- Navigation items with icon + label
- Active state: Light blue background, blue text
- Hover: Subtle gray background
- Collapse button (hamburger icon)

#### Dashboard Content
**Hero Section**:
- Gradient card (blue to purple, 16px radius)
- White text overlay
- Large display of total outstanding amount
- Secondary metrics: "Paid this month", "Pending invoices"
- Quick action button: "+ New Invoice" (white button on gradient)

**Quick Stats Cards** (Grid: 2x2 on desktop, 1x4 on mobile):
- Individual metric cards (white background, medium shadow)
- Icon in colored circle (32px)
- Metric value (Heading 2)
- Metric label (Caption, secondary text)
- Small trend indicator (arrow + percentage)

**Recent Activity Feed**:
- Card-based list design
- Each item:
  - Avatar/icon on left (40px circular)
  - Customer name (Body, primary text)
  - Action description (Body Small, secondary text)
  - Amount (Heading 3, right-aligned, color-coded by status)
  - Timestamp (Caption, secondary text)
  - Chevron right icon for detail navigation
- Smooth hover: Slight scale, cursor pointer
- Swipe actions on mobile (swipe right for quick actions)

**Action Buttons**:
- Floating action button (mobile): "+" icon, fixed bottom-right, gradient
- Primary actions (desktop): Prominently displayed with gradient styling

---

### Customer Management

#### Customer List (`/customers`)
**Header**:
- Page title: "Customers" (Display)
- Search bar (full width on mobile, 400px on desktop)
  - Magnifying glass icon
  - Placeholder: "Search customers..."
  - Clear button when active
- Filter/sort button (filter icon)
- "+ Add Customer" button (gradient, prominent)

**Customer Cards** (replaces table on mobile):
- White card per customer (16px radius, medium shadow)
- Top section:
  - Avatar with initials (48px, colored background based on name hash)
  - Customer name (Heading 3)
  - Email (Caption, secondary text)
- Bottom section:
  - Stats row: "X invoices" | "Total: $XX,XXX"
  - Action buttons row: "View" | "Edit" | "..." (more menu)
- Card spacing: 16px between cards
- Hover: Slight lift (shadow increase)

**Desktop Table View**:
- Clean table design with minimal borders
- Header row: sticky, light gray background
- Row hover: Light blue background
- Alternating row backgrounds (white/very light gray)
- Actions column: Icon buttons (eye, pencil, trash)

#### Customer Form (`/customers/new`, `/customers/:id/edit`)
**Layout**:
- Centered form (max-width: 600px)
- Breadcrumb navigation at top
- Form title in card header
- Form sections in white card with generous padding

**Form Design**:
- Labeled inputs (label above input)
- Input styling: Border (2px), rounded (8px), generous padding (12px)
- Focus state: Blue border, blue ring
- Helper text below inputs (Caption, secondary text)
- Error states: Red border, red text, error icon
- Section dividers with subtle lines
- Form actions (sticky bottom on mobile):
  - "Cancel" button (ghost style, gray text)
  - "Save Customer" button (gradient, primary)

---

### Invoice Management

#### Invoice List (`/invoices`)
**Filter Bar**:
- Pill-style filter buttons (horizontal scroll on mobile)
- Options: "All", "Draft", "Sent", "Paid", "Overdue"
- Active state: Gradient background, white text
- Inactive: Light gray background, dark text
- Count badges in pills

**Invoice Cards**:
- White card per invoice (12px radius, medium shadow)
- Color-coded left border (4px):
  - Green: Paid
  - Blue: Sent
  - Amber: Draft
  - Red: Overdue
- Header section:
  - Invoice number (Heading 3, with "#" prefix)
  - Status badge (pill shape, color-coded)
- Customer info:
  - Customer name (Body, primary text)
  - Date (Caption, secondary text)
- Amount section:
  - Total amount (Heading 2, right-aligned)
  - Payment status (Caption)
- Action footer:
  - Icon buttons: View, Edit, Send, Record Payment, Download
  - More menu (three dots)
- Swipe actions (mobile): Swipe right for quick payment, left for delete

**Empty State**:
- Centered illustration (invoice icon, stylized)
- "No invoices yet" heading
- Descriptive text
- "+ Create your first invoice" button (gradient)

#### Invoice Form (`/invoices/new`, `/invoices/:id/edit`)
**Layout**:
- Full-width form on mobile, max-width 800px on desktop
- Multi-step progress indicator at top (optional for creation flow)
- Sticky header with save/send buttons

**Form Sections**:
1. **Customer Selection**:
   - Dropdown with search
   - Avatar + name display
   - Quick "+ Add new customer" inline action

2. **Invoice Details**:
   - Invoice number (auto-generated, editable)
   - Date pickers (calendar popup, touch-friendly)
   - Due date with preset options (7, 14, 30 days)

3. **Line Items**:
   - Card per line item
   - Fields: Description, Quantity, Rate, Amount
   - Inline edit mode
   - Drag handle for reordering (six dots icon)
   - Delete button (trash icon, red hover)
   - "+ Add item" button (dashed border card)

4. **Totals Section**:
   - Right-aligned on desktop, full-width on mobile
   - Subtotal, Tax (optional), Discount (optional)
   - Total (prominent, Heading 2, gradient text)

5. **Notes** (collapsible section):
   - Textarea with character count
   - Formatting options (bold, italic, list)

**Action Bar** (sticky bottom):
- "Save as draft" (secondary button)
- "Send invoice" (primary gradient button)
- Split on mobile, side-by-side on desktop

#### Invoice Detail View (`/invoices/:id`)
**Layout**:
- Card-based design
- Print/PDF optimized layout
- Share button (share icon, opens native share or modal)

**Header**:
- Company logo area
- Invoice title and number (prominent)
- Status badge (large, colored)

**Sections**:
- From/To information (two-column on desktop)
- Invoice details table (clean, minimal borders)
- Line items table (alternating rows)
- Total section (prominent, right-aligned)
- Payment history timeline (if applicable)

**Actions Bar**:
- Floating actions: Edit, Send, Record Payment, Download PDF
- Animation: Slide up from bottom

---

### Payment Management

#### Payment Recording Modal/Screen
**Modal Design** (overlay on desktop, full screen on mobile):
- White background with rounded top corners (24px on mobile)
- Handle bar at top (mobile, for drag-to-close)
- Header: "Record Payment" (Heading 2)
- Close button (X icon, top-right)

**Form Content**:
- Invoice summary at top (card within modal):
  - Invoice number
  - Customer name
  - Total amount
  - Amount remaining (if partial)
- Payment amount input (large, prominent):
  - Currency symbol
  - Large number input
  - Quick amount buttons (25%, 50%, 75%, 100%)
- Payment method selector:
  - Icon buttons (credit card, bank, cash, check, other)
  - Selected state: Blue border, blue background
- Payment date picker
- Reference number input (optional, collapsible)
- Notes textarea (optional, collapsible)

**Actions** (sticky bottom):
- "Cancel" (ghost button)
- "Record Payment" (gradient button, full-width on mobile)
- Success animation: Checkmark burst, confetti effect

#### Payment History/List
**Timeline View**:
- Vertical timeline with dots and connecting lines
- Each payment:
  - Circle indicator (color-coded by method)
  - Payment amount (Heading 3)
  - Date and time (Caption)
  - Method icon and label
  - Associated invoice link
  - Receipt/details button
- Grouped by date (Today, Yesterday, This Week, etc.)

---

## UX Patterns & Interactions

### Navigation Patterns

1. **Hierarchical Navigation**:
   - Clear breadcrumbs on secondary screens
   - Back button (< icon + "Back" label) on mobile
   - Page transitions: Slide from right (forward), slide from left (back)

2. **Tab Navigation**:
   - Smooth indicator animation between tabs
   - Swipe gestures for tab switching (mobile)

3. **Deep Linking**:
   - Shareable URLs for all resources
   - Maintain scroll position on back navigation

### Loading States

1. **Skeleton Screens**:
   - Gray placeholder cards with pulse animation
   - Match shape of actual content
   - Smooth fade-in when content loads

2. **Pull-to-Refresh** (mobile):
   - Venmo-style refresh indicator (circular spinner)
   - Haptic feedback on trigger

3. **Infinite Scroll**:
   - Loading spinner at bottom
   - "Load more" button as fallback

### Empty States

**Components**:
- Illustration or icon (80-120px)
- Heading (Heading 2)
- Descriptive text (Body, secondary text)
- Primary action button
- Optional: Tutorial or help link

**Examples**:
- No customers: "Add your first customer to get started"
- No invoices: "Create an invoice in seconds"
- No payments: "Payment history will appear here"

### Success/Error Feedback

1. **Toast Notifications**:
   - Slide down from top (mobile) or top-right (desktop)
   - Auto-dismiss after 4 seconds
   - Icon + message + close button
   - Color-coded background (success: green, error: red, info: blue)
   - Swipe to dismiss (mobile)

2. **Inline Validation**:
   - Real-time validation on blur
   - Success checkmark icon
   - Error icon with message
   - Field-level feedback

3. **Confirmation Dialogs**:
   - Modal overlay (center-aligned)
   - Clear heading and description
   - Destructive action in red
   - Cancel action prominent
   - Keyboard shortcuts (Enter to confirm, Esc to cancel)

### Micro-interactions

1. **Button Press**:
   - Scale down to 0.97
   - Slight shadow reduction
   - Haptic feedback (mobile)

2. **Card Hover** (desktop):
   - Lift effect (translateY: -4px)
   - Shadow increase
   - Transition: 200ms ease-out

3. **Swipe Actions** (mobile):
   - Background color reveal
   - Icon scales in
   - Haptic feedback at threshold
   - Snap animation

4. **Number Counting**:
   - Animate numbers on dashboard when updating
   - Smooth count-up animation (1 second duration)

5. **Form Focus Flow**:
   - Auto-advance to next field on valid entry
   - Return key submits form from last field
   - Tab order optimized

### Animations

**Page Transitions**:
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
- Fade + slide combination

**Modal Entry/Exit**:
- Backdrop: Fade in/out (200ms)
- Modal: Scale + fade (250ms)
- Mobile: Slide up from bottom (300ms)

**List Reordering**:
- Smooth position transitions
- Ghost element while dragging
- Drop zone highlighting

**Success Celebrations**:
- Confetti burst (payment recorded)
- Checkmark animation with bounce
- Color burst effect

---

## Responsive Breakpoints

```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
Large Desktop: > 1440px
```

### Mobile-First Adaptations

**Mobile** (< 768px):
- Single column layouts
- Bottom navigation bar
- Full-screen modals
- Stacked form inputs
- Larger touch targets (44x44px minimum)
- Swipe gestures enabled
- Hamburger menu for secondary actions

**Tablet** (768px - 1024px):
- Two-column layouts where appropriate
- Side drawer navigation (overlay or persistent)
- Larger modals (not full-screen)
- Grid layouts for cards (2 columns)

**Desktop** (> 1024px):
- Multi-column layouts
- Persistent sidebar navigation
- Hover states enabled
- Larger form fields side-by-side
- Table views preferred over cards for lists
- Grid layouts for cards (3-4 columns)

---

## Accessibility Requirements

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements meet 3:1 contrast ratio
- Avoid color-only communication (use icons + text)

### Keyboard Navigation
- All interactive elements keyboard accessible
- Visible focus indicators (blue ring)
- Logical tab order
- Keyboard shortcuts for common actions
- Skip links for navigation

### Screen Readers
- Semantic HTML throughout
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- Alt text for images and illustrations
- Form labels properly associated

### Motion
- Respect prefers-reduced-motion
- Disable animations for users who prefer reduced motion
- Provide static alternatives

---

## Technical Implementation Notes

### Global Architecture Requirements

**PRIORITY 1: Establish Global Foundation First**

Before any component or screen implementation, the global architecture MUST be established:

1. **Global CSS Variables File** (`src/styles/tokens.css`)
   - Define ALL design tokens as CSS variables
   - Include complete color scales (primary, accent, neutral, status)
   - Include complete spacing scale
   - Include typography scale
   - Include shadow definitions
   - Include animation timing definitions
   - This file is imported FIRST in the application entry point

2. **Global Base Styles File** (`src/styles/global.css`)
   - Apply base styles to HTML elements
   - Define global utility classes (.card, .gradient-primary, etc.)
   - Define global state classes (.is-loading, .has-error, etc.)
   - Define global animation classes (.hover-lift, .press-scale, etc.)
   - This file is imported SECOND in the application entry point

3. **Tailwind Configuration** (`tailwind.config.js`)
   - Extend theme to reference CSS variables
   - Define custom utilities that use tokens
   - Configure screens/breakpoints
   - Ensure all utilities map to global tokens
   - NO hardcoded values in config

### CSS Framework Updates (Global Implementation)

**Required File Structure**:
```
src/styles/
  ├── tokens.css           # CSS variables (design tokens)
  ├── global.css          # Global base styles
  ├── animations.css      # Global animation definitions
  ├── utilities.css       # Custom utility classes
  └── index.css          # Main stylesheet that imports all
```

**Implementation Order**:
1. Create `tokens.css` with ALL design tokens
2. Create `global.css` with base HTML element styles
3. Update `tailwind.config.js` to reference tokens
4. Create `animations.css` with animation utilities
5. Create `utilities.css` with custom global utilities
6. Import all in correct order in `index.css` or `main.ts`

**Tailwind Config Structure**:
```javascript
// tailwind.config.js - MUST reference global CSS variables
module.exports = {
  theme: {
    extend: {
      // All values MUST reference CSS variables
      colors: {
        // Reference tokens, not hardcoded values
        venmo: {
          blue: 'var(--color-venmo-blue)',
          purple: 'var(--color-venmo-purple)',
        },
        // ... all colors from tokens
      },
      spacing: {
        // Reference spacing tokens
        1: 'var(--spacing-1)',
        2: 'var(--spacing-2)',
        // ... all spacing from tokens
      },
      // ... all other theme properties reference tokens
    }
  },
  plugins: [
    // Add custom plugins if needed for global patterns
  ]
}
```

### Component Library (Global Base Components)

**Component Architecture**:
- ALL components MUST be built as a reusable library FIRST
- NO feature-specific styling in base components
- Components MUST use ONLY design tokens
- Components MUST be thoroughly documented with examples

**Required Base Components** (in order of creation):
1. **VButton** - Primary, secondary, ghost, link variants
2. **VInput** - Text, number, email, password variants with validation states
3. **VCard** - Shadow levels, padding variants
4. **VBadge** - Status colors, sizes
5. **VAvatar** - Sizes, initials generation, image support
6. **VModal** - Desktop/mobile variants, sizes
7. **VToast** - Success, error, info, warning variants
8. **VSkeleton** - Various shapes for loading states
9. **VEmptyState** - Icon, heading, description, action
10. **VTimeline** - Vertical timeline for payment history
11. **VTextarea** - With character count, validation states
12. **VSelect** - Dropdown with search capability
13. **VCheckbox** - Styled checkbox
14. **VRadio** - Styled radio button
15. **VDrawer** - Side drawer for mobile navigation
16. **VTable** - Responsive table with sorting/filtering
17. **VPagination** - Page navigation
18. **VTabs** - Tab navigation
19. **VDatePicker** - Date selection
20. **VDropdown** - Dropdown menu
21. **VTooltip** - Tooltip overlay
22. **VProgress** - Progress bars/spinners
23. **VDivider** - Horizontal/vertical dividers
24. **VBreadcrumbs** - Navigation breadcrumbs
25. **VMenu** - Context menu
26. **VNavbar** - Top navigation bar
27. **VSidebar** - Side navigation
28. **VBottomNav** - Bottom navigation (mobile)

**Component Documentation Requirements**:
- Each component must have Storybook story or equivalent
- Each component must document which design tokens it uses
- Each component must show all variants and states
- Each component must include usage examples

### Global Animation Library

**Animation Implementation**:
- Create reusable Vue transitions/animations using global timing tokens
- Define standard animation patterns (page transitions, modal entry/exit, etc.)
- Use Vue's `<Transition>` and `<TransitionGroup>` with global classes
- Implement `prefers-reduced-motion` support globally

**Required Animation Composables**:
```javascript
// useAnimation.ts - Global animation utilities
export const useAnimation = () => {
  const prefersReducedMotion = ref(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  
  const animate = (element, animation) => {
    if (prefersReducedMotion.value) return
    // Apply animation using global timing tokens
  }
  
  return { animate, prefersReducedMotion }
}
```

### Global Icon System

**Icon Implementation**:
- Use Heroicons or similar consistent icon set
- Create global icon component that enforces sizing
- Define icon size tokens: `--icon-sm: 16px`, `--icon-md: 20px`, `--icon-lg: 24px`, `--icon-xl: 32px`
- Ensure all icons use `currentColor` for consistency

**Icon Component**:
```vue
<template>
  <svg 
    :style="{ width: iconSize, height: iconSize }"
    :class="['icon', `icon-${size}`]"
  >
    <use :href="`#${name}`" />
  </svg>
</template>

<script setup>
const props = defineProps({
  name: String,
  size: { type: String, default: 'md' } // sm, md, lg, xl
})

const iconSize = computed(() => {
  const sizes = {
    sm: 'var(--icon-sm)',
    md: 'var(--icon-md)',
    lg: 'var(--icon-lg)',
    xl: 'var(--icon-xl)'
  }
  return sizes[props.size]
})
</script>
```

### Global State Management

**State Architecture**:
- Loading states use global `.is-loading` class
- Error boundaries use global error styling
- Success states use global `.has-success` class
- All async operations follow same loading/error/success pattern

**Global Loading Composable**:
```javascript
// useLoading.ts - Consistent loading states
export const useLoading = () => {
  const isLoading = ref(false)
  
  const withLoading = async (fn) => {
    isLoading.value = true
    try {
      return await fn()
    } finally {
      isLoading.value = false
    }
  }
  
  return { isLoading, withLoading }
}
```

### Global Form Validation

**Validation Architecture**:
- All form validation uses consistent error display
- Error states use global design tokens
- Success states use global design tokens
- Helper text uses global typography

### Global Type Definitions

Create global TypeScript types for design tokens:

```typescript
// types/design-tokens.ts
export type ColorToken = 
  | 'venmo-blue'
  | 'venmo-purple'
  | 'deep-blue'
  | 'background'
  | 'card-white'
  | 'border-gray'
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

export type SpacingToken = '1' | '2' | '3' | '4' | '6' | '8' | '12' | '16' | '24'

export type RadiusToken = 'sm' | 'md' | 'lg' | 'full'

export type ShadowToken = 'sm' | 'md' | 'lg' | 'focus'

export type FontSizeToken = 
  | 'display-lg'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption'
```

### Enforcement Mechanisms

**Linting Configuration**:
```javascript
// .eslintrc.js additions
module.exports = {
  rules: {
    // Prevent hardcoded colors
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/#[0-9A-Fa-f]{3,6}/]",
        message: 'Use design tokens instead of hardcoded colors'
      }
    ],
    // Enforce component usage
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-bare-strings-in-template': 'warn'
  }
}
```

**Pre-commit Hook**:
```bash
# .husky/pre-commit
# Check for hardcoded values
if git diff --cached | grep -E '#[0-9A-Fa-f]{6}|rgb\(|rgba\('; then
  echo "ERROR: Found hardcoded color values. Use design tokens."
  exit 1
fi
```

---

## Implementation Phases

**CRITICAL**: All phases depend on Phase 1 being 100% complete. Phase 1 establishes the global design system that ALL subsequent phases will use. No feature work should begin until the global foundation is established.

### Phase 1: Global Design System Foundation (Week 1)

**MUST BE COMPLETED FIRST - THIS IS THE FOUNDATION FOR EVERYTHING**

**Day 1-2: Global Design Tokens**
- [ ] Create `src/styles/tokens.css` with ALL CSS variables
  - Complete color palette (primary, accent, neutral, status scales)
  - Complete spacing scale (1, 2, 3, 4, 6, 8, 12, 16, 24)
  - Complete typography scale (display-lg through caption)
  - Complete shadow definitions (sm, md, lg, focus)
  - Complete animation timing (fast, base, medium, slow, slower)
  - Complete easing functions (in-out, out, in, bounce)
  - Icon size tokens (sm, md, lg, xl)
  - Breakpoint tokens (mobile, tablet, desktop)
- [ ] Create `src/types/design-tokens.ts` with TypeScript type definitions
- [ ] Document all tokens with usage examples

**Day 3-4: Tailwind Configuration & Global Styles**
- [ ] Update `tailwind.config.js` to reference CSS variables
  - Extend colors to use token variables
  - Extend spacing to use token variables
  - Extend borderRadius to use token variables
  - Extend boxShadow to use token variables
  - Extend fontSize to use token variables
  - Extend transitionDuration to use token variables
  - Extend transitionTimingFunction to use token variables
  - Configure screens/breakpoints
- [ ] Create `src/styles/global.css` with base HTML styles
  - Box-sizing, font-smoothing
  - Body, html base styles
  - Typography base styles (h1-h6, p, a)
  - Form element resets (button, input, textarea, select)
  - Global focus styles
  - Reduced motion media query
- [ ] Create `src/styles/utilities.css` with global utility classes
  - .card base class
  - .gradient-primary utility
  - Global state classes (.is-loading, .is-disabled, .has-error, .has-success)
- [ ] Create `src/styles/animations.css` with global animation classes
  - .transition-all, .transition-colors, .transition-transform
  - .hover-lift, .press-scale
  - Page transition classes
  - Modal transition classes
- [ ] Create `src/styles/index.css` that imports all stylesheets in correct order
- [ ] Import global styles in application entry point (main.ts)

**Day 5: Core Component Library (Part 1)**
- [ ] Build VButton component (primary, secondary, ghost variants)
  - Uses ONLY design tokens
  - All sizes use spacing tokens
  - All colors use color tokens
  - All animations use timing tokens
  - Document in Storybook/equivalent
- [ ] Build VInput component (with validation states)
  - Uses ONLY design tokens
  - Focus states use global focus ring
  - Error/success states use global state classes
- [ ] Build VCard component (with shadow levels)
  - Uses ONLY design tokens
  - Shadow variants reference shadow tokens
- [ ] Build VBadge component (status indicators)
  - Uses color tokens for all status colors
- [ ] Build VAvatar component (with initials generation)
  - Sizes use spacing tokens

**Day 6-7: Core Component Library (Part 2)**
- [ ] Build VModal component (desktop/mobile variants)
- [ ] Build VToast component (notification system)
- [ ] Build VSkeleton component (loading states)
- [ ] Build VEmptyState component
- [ ] Build VTextarea component
- [ ] Build VSelect component
- [ ] Build VCheckbox component
- [ ] Build VRadio component
- [ ] Set up component documentation (Storybook or equivalent)
- [ ] Verify ALL components use ONLY design tokens

**End of Week 1: Validation Checkpoint**
- [ ] Run linter to verify no hardcoded values exist
- [ ] Verify all components documented
- [ ] Verify all design tokens defined and accessible
- [ ] Verify Tailwind config references all tokens
- [ ] Verify global styles applied to all HTML elements
- [ ] Manual test: Change a CSS variable and verify it updates throughout app

**DO NOT PROCEED TO PHASE 2 UNTIL ALL PHASE 1 ITEMS ARE COMPLETE**

---

### Phase 2: Navigation & Layout Infrastructure (Week 1-2)

**Uses: Global tokens, VButton, VAvatar, base components from Phase 1**

**Day 1-2: Navigation Components**
- [ ] Build VNavbar component (top navigation bar)
  - Uses global design tokens exclusively
  - Height uses spacing tokens
  - Shadow uses shadow tokens
  - Responsive behavior uses breakpoint tokens
- [ ] Build VSidebar component (desktop side navigation)
  - Uses VButton for navigation items
  - Active/hover states use global state patterns
  - Transition uses global animation timing
- [ ] Build VBottomNav component (mobile navigation)
  - Uses icon component with global icon sizing
  - Active states use color tokens
  - Tab indicator uses color tokens

**Day 3-4: Page Layout System**
- [ ] Create global layout components
  - MainLayout (with sidebar/navbar)
  - AuthLayout (centered card layout)
  - EmptyLayout (full-screen)
- [ ] Implement responsive breakpoints using global breakpoint tokens
- [ ] Add page transition animations using global animation classes
- [ ] Update router to use new layouts

**Day 5-7: Component Library Completion**
- [ ] Build remaining components from Phase 1 list
  - VTimeline (for payment history)
  - VDrawer (side drawer)
  - VTable (responsive table)
  - VPagination
  - VTabs
  - VDatePicker
  - VDropdown
  - VTooltip
  - VProgress
  - VDivider
  - VBreadcrumbs
  - VMenu
- [ ] Verify all use ONLY design tokens
- [ ] Complete component documentation

---

### Phase 3: Authentication Screens (Week 2)

**Uses: All global components, AuthLayout, VButton, VInput**

- [ ] Redesign login page using AuthLayout
  - All spacing uses global tokens
  - All colors use global tokens
  - Form uses VInput and VButton components
  - Gradient background uses .gradient-primary utility
- [ ] Redesign signup page using AuthLayout
  - Password strength indicator uses color tokens
  - All form elements use base components
- [ ] Add micro-interactions using global animation classes
  - Button hover uses .hover-lift
  - Button press uses .press-scale
  - Input focus uses global focus ring
- [ ] Implement form validation UI using global state classes
  - Error states use .has-error
  - Success states use .has-success
- [ ] Add success/error feedback using VToast
- [ ] Verify NO hardcoded values exist

---

### Phase 4: Dashboard (Week 2-3)

**Uses: All global components, MainLayout, VCard, VBadge**

- [ ] Redesign hero section
  - Uses .gradient-primary utility
  - Typography uses global font size tokens
  - Spacing uses global spacing tokens
  - VButton for quick actions
- [ ] Build stats cards using VCard
  - Shadow uses shadow tokens
  - Spacing uses spacing tokens
  - Icons use global icon sizing
  - Colors use color tokens
- [ ] Create activity feed
  - Uses VCard for list items
  - VAvatar for customer icons
  - VBadge for status indicators
  - Hover effects use .hover-lift
  - All animations use global timing
- [ ] Implement quick actions
  - Floating action button uses VButton
  - Gradient uses .gradient-primary
- [ ] Verify all components use global design system

---

### Phase 5: Customer Management (Week 3-4)

**Uses: All global components, MainLayout, VCard, VTable, VInput, VButton**

- [ ] Redesign customer list view
  - Desktop: VTable with global styling
  - Mobile: VCard list
  - Search uses VInput
  - Filters use VButton with pill styling
  - Empty state uses VEmptyState
- [ ] Build customer cards (mobile view)
  - Uses VCard component
  - VAvatar for customer initials
  - Action buttons use VButton
  - Hover effects use global animation classes
- [ ] Update customer form
  - All inputs use VInput, VTextarea, VSelect
  - Form layout uses global spacing tokens
  - Validation uses global state classes
  - Actions use VButton
  - VBreadcrumbs for navigation
- [ ] Implement search and filters
  - Search input uses VInput
  - Filter buttons use VButton
  - Dropdown uses VDropdown
- [ ] Add empty states using VEmptyState
- [ ] Verify NO hardcoded values exist

---

### Phase 6: Invoice Management (Week 4-5)

**Uses: All global components, MainLayout, VCard, VTable, VBadge, VModal**

- [ ] Redesign invoice list with filters
  - Pill filters use VButton
  - Invoice cards use VCard
  - Status badges use VBadge with color tokens
  - Table view uses VTable
  - Empty state uses VEmptyState
- [ ] Build invoice cards with status indicators
  - Color-coded borders use color tokens
  - Status badges use VBadge
  - Action buttons use VButton
  - Hover effects use .hover-lift
  - Swipe actions (mobile) use global animation timing
- [ ] Update invoice form
  - Multi-section layout uses global spacing
  - All inputs use base components (VInput, VSelect, VDatePicker)
  - Line items use VCard
  - Drag handles use global icon sizing
  - Totals use typography tokens
  - Actions use VButton
- [ ] Redesign invoice detail view
  - Layout uses VCard
  - Status badge uses VBadge
  - Payment timeline uses VTimeline
  - Actions use VButton
  - Share uses VDropdown
- [ ] Add mobile swipe actions with global animations
- [ ] Verify all styling uses design tokens

---

### Phase 7: Payment Management (Week 5-6)

**Uses: All global components, VModal, VTimeline, VButton, VInput**

- [ ] Redesign payment recording modal/screen
  - Uses VModal component
  - Form uses VInput for amount
  - Payment method selector uses VButton grid
  - Date picker uses VDatePicker
  - Actions use VButton
  - Success animation uses global animation timing with VToast
- [ ] Build payment history timeline
  - Uses VTimeline component
  - Each entry uses color tokens for status
  - Icons use global icon sizing
  - Dates use typography tokens
  - Grouped sections use VDivider
- [ ] Add payment method icons using global icon system
- [ ] Implement success animations
  - Checkmark animation uses global timing
  - Confetti uses global animation system
  - Toast notification uses VToast
- [ ] Create payment confirmation screens using VModal
- [ ] Verify all components use global design system

---

### Phase 8: Polish, Validation & Optimization (Week 6)

**Focus: Ensure global design system is consistently applied everywhere**

**Day 1-2: Loading & Skeleton States**
- [ ] Add VSkeleton to all loading states
  - Lists show skeleton cards
  - Forms show skeleton inputs
  - Dashboard shows skeleton stats
  - All use .is-loading global class
- [ ] Implement pull-to-refresh (mobile)
  - Uses global animation timing
  - Spinner uses VProgress

**Day 3: Micro-interactions Audit**
- [ ] Verify all buttons use .hover-lift and .press-scale
- [ ] Verify all cards use .hover-lift on desktop
- [ ] Verify all inputs use global focus ring
- [ ] Verify all transitions use global timing tokens
- [ ] Add haptic feedback hooks (mobile)

**Day 4: Design Token Validation**
- [ ] Run comprehensive linting check
- [ ] Search codebase for hardcoded colors (should find none)
- [ ] Search codebase for hardcoded spacing (should find none)
- [ ] Verify all components use base component library
- [ ] Verify Tailwind utilities reference CSS variables
- [ ] Manual audit: Review 10 random components for token usage

**Day 5: Performance & Animation Optimization**
- [ ] Optimize animations for 60fps
- [ ] Verify prefers-reduced-motion works globally
- [ ] Lazy load off-screen components
- [ ] Optimize bundle size
- [ ] Check CSS variable performance

**Day 6: Cross-browser & Responsive Testing**
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify CSS variables work in all browsers
- [ ] Test responsive breakpoints
- [ ] Test all animations

**Day 7: Accessibility & Final Validation**
- [ ] Run Lighthouse audit (target: > 90)
- [ ] Run accessibility audit (target: zero critical violations)
- [ ] Verify keyboard navigation works everywhere
- [ ] Verify focus indicators visible everywhere
- [ ] Verify color contrast meets WCAG AA
- [ ] Test with screen reader
- [ ] Final design system documentation review
- [ ] Create design token usage guide for developers

---

**Phase Completion Checklist**

After Phase 8, verify:
- [ ] ALL colors defined as CSS variables (no hardcoded hex values)
- [ ] ALL spacing uses design tokens
- [ ] ALL typography uses design tokens
- [ ] ALL animations use global timing and easing
- [ ] ALL components built from base component library
- [ ] Tailwind config references ONLY CSS variables
- [ ] Linter enforces token usage
- [ ] Design system documented and accessible to team
- [ ] Performance metrics met (Lighthouse > 90)
- [ ] Accessibility metrics met (zero critical violations)
- [ ] Cross-browser compatibility verified
- [ ] Responsive design works on all breakpoints
- [ ] All screens match Venmo-inspired design language

---

## Success Metrics

### User Experience
- Reduced time-to-action for common tasks
- Increased mobile engagement
- Positive user feedback on new design
- Reduced support tickets related to UI confusion

### Technical
- Lighthouse score > 90 (Performance, Accessibility)
- Zero critical accessibility violations
- Animation performance (60fps)
- Page load times < 2 seconds

### Business
- Increased user retention
- Higher invoice creation rate
- More payment recordings
- Improved mobile usage percentage

---

## Design References

### Venmo App Patterns to Emulate
1. **Home Feed**: Clean activity feed with avatar icons
2. **Payment Flow**: Simple, step-by-step payment creation
3. **Profile/Settings**: Card-based settings organization
4. **Color Usage**: Bold gradients for primary actions
5. **Typography**: Clear hierarchy with generous spacing
6. **Navigation**: Icon-focused bottom navigation (mobile)

### Additional Inspiration
- **Cash App**: Clean transaction history
- **Stripe Dashboard**: Professional data presentation
- **Modern Banking Apps**: Balance displays, quick actions

---

## Assets Needed

### Icons
- Navigation icons (home, customers, invoices, payments, more)
- Action icons (plus, edit, delete, share, download, send)
- Status icons (paid, pending, overdue, draft)
- Payment method icons (credit card, bank, cash, check)
- UI icons (search, filter, sort, chevron, close)

### Illustrations
- Empty state illustrations (no customers, no invoices, no payments)
- Error state illustrations (404, 500, network error)
- Success animations (payment recorded, invoice sent)

### Brand Assets
- Updated logo (if needed to match new style)
- Favicon
- Social media preview images

---

## Notes & Considerations

### Brand Consistency
- Maintain professional tone despite friendly design
- Invoicing is still a business tool
- Balance Venmo's social features aesthetic with B2B needs

### Performance
- Optimize images and illustrations
- Lazy load off-screen content
- Use CSS animations over JavaScript when possible
- Implement virtual scrolling for long lists

### Browser Support
- Modern browsers (last 2 versions)
- Progressive enhancement for older browsers
- Graceful degradation of animations

### Mobile Considerations
- Touch targets minimum 44x44px
- Avoid hover-dependent interactions
- Support landscape and portrait orientations
- Handle safe areas (notches, home indicators)

### Dark Mode (Future Consideration)
- Design system should accommodate dark mode
- Prepare color variables for theme switching
- Consider user preference detection

---

## Appendix

### Color Palette (Full Specification)

#### Primary Scale
```
venmo-blue-50: #EBF5FB
venmo-blue-100: #D6EBF7
venmo-blue-200: #AED7EF
venmo-blue-300: #85C3E7
venmo-blue-400: #5DAFDF
venmo-blue-500: #3D95CE (Primary)
venmo-blue-600: #317AA5
venmo-blue-700: #255C7C
venmo-blue-800: #193D52
venmo-blue-900: #0C1F29
```

#### Accent Scale
```
venmo-purple-50: #F4F2FB
venmo-purple-100: #E9E5F7
venmo-purple-200: #D3CBEF
venmo-purple-300: #BDB1E7
venmo-purple-400: #A797DF
venmo-purple-500: #8C7AE6 (Accent)
venmo-purple-600: #7062B8
venmo-purple-700: #54498A
venmo-purple-800: #38315C
venmo-purple-900: #1C182E
```

### Component Inventory
- [ ] VButton
- [ ] VInput
- [ ] VTextarea
- [ ] VSelect
- [ ] VCheckbox
- [ ] VRadio
- [ ] VCard
- [ ] VModal
- [ ] VDrawer
- [ ] VToast
- [ ] VBadge
- [ ] VAvatar
- [ ] VEmptyState
- [ ] VSkeleton
- [ ] VTimeline
- [ ] VTable
- [ ] VPagination
- [ ] VTabs
- [ ] VDatePicker
- [ ] VDropdown
- [ ] VTooltip
- [ ] VProgress
- [ ] VDivider
- [ ] VBreadcrumbs
- [ ] VMenu
- [ ] VNavbar
- [ ] VSidebar
- [ ] VBottomNav

### Animation Specifications

#### Transition Durations
```
fast: 150ms
base: 200ms
medium: 300ms
slow: 400ms
slower: 500ms
```

#### Easing Functions
```
ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1)
ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)
ease-in: cubic-bezier(0.4, 0.0, 1, 1)
bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## Detailed Implementation Guide

This section provides concrete, step-by-step implementation details for establishing the global design system.

### Step 1: Create Global Design Token File

**File**: `invoice-frontend/src/styles/tokens.css`

```css
/**
 * Design Tokens - Single Source of Truth
 * All styling values MUST reference these CSS variables
 * DO NOT use hardcoded values anywhere in the application
 */

:root {
  /* ==================== COLOR TOKENS ==================== */
  
  /* Primary Color Scale */
  --color-venmo-blue-50: #EBF5FB;
  --color-venmo-blue-100: #D6EBF7;
  --color-venmo-blue-200: #AED7EF;
  --color-venmo-blue-300: #85C3E7;
  --color-venmo-blue-400: #5DAFDF;
  --color-venmo-blue-500: #3D95CE;
  --color-venmo-blue-600: #317AA5;
  --color-venmo-blue-700: #255C7C;
  --color-venmo-blue-800: #193D52;
  --color-venmo-blue-900: #0C1F29;
  
  /* Accent Color Scale */
  --color-venmo-purple-50: #F4F2FB;
  --color-venmo-purple-100: #E9E5F7;
  --color-venmo-purple-200: #D3CBEF;
  --color-venmo-purple-300: #BDB1E7;
  --color-venmo-purple-400: #A797DF;
  --color-venmo-purple-500: #8C7AE6;
  --color-venmo-purple-600: #7062B8;
  --color-venmo-purple-700: #54498A;
  --color-venmo-purple-800: #38315C;
  --color-venmo-purple-900: #1C182E;
  
  /* Primary Colors (Semantic Names) */
  --color-venmo-blue: var(--color-venmo-blue-500);
  --color-venmo-purple: var(--color-venmo-purple-500);
  --color-deep-blue: #1A4F6E;
  
  /* Neutral Colors */
  --color-background: #F7F8FA;
  --color-card-white: #FFFFFF;
  --color-border-gray: #E5E7EB;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  
  /* Status Colors */
  --color-success: #10B981;
  --color-success-light: #D1FAE5;
  --color-success-dark: #065F46;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-warning-dark: #92400E;
  --color-error: #EF4444;
  --color-error-light: #FEE2E2;
  --color-error-dark: #991B1B;
  --color-info: #3B82F6;
  --color-info-light: #DBEAFE;
  --color-info-dark: #1E40AF;
  
  /* ==================== SPACING TOKENS ==================== */
  
  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  
  /* ==================== TYPOGRAPHY TOKENS ==================== */
  
  /* Font Family */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  /* Font Sizes */
  --font-size-display-lg: 36px;
  --font-size-display: 32px;
  --font-size-h1: 28px;
  --font-size-h2: 24px;
  --font-size-h3: 20px;
  --font-size-body-lg: 18px;
  --font-size-body: 16px;
  --font-size-body-sm: 14px;
  --font-size-caption: 12px;
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.5px;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.2px;
  
  /* ==================== BORDER RADIUS TOKENS ==================== */
  
  --radius-none: 0;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* ==================== SHADOW TOKENS ==================== */
  
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-focus: 0 0 0 3px rgba(61, 149, 206, 0.3);
  
  /* ==================== ANIMATION TOKENS ==================== */
  
  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 400ms;
  --duration-slower: 500ms;
  
  /* Easing Functions */
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* ==================== ICON SIZE TOKENS ==================== */
  
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;
  --icon-2xl: 40px;
  
  /* ==================== Z-INDEX TOKENS ==================== */
  
  --z-index-base: 0;
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
  
  /* ==================== BREAKPOINT TOKENS ==================== */
  
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1440px;
  
  /* ==================== LAYOUT TOKENS ==================== */
  
  --navbar-height: 64px;
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 64px;
  --bottom-nav-height: 56px;
  
  /* ==================== GRADIENT TOKENS ==================== */
  
  --gradient-primary: linear-gradient(135deg, var(--color-venmo-blue) 0%, var(--color-venmo-purple) 100%);
  --gradient-success: linear-gradient(135deg, var(--color-success) 0%, #34D399 100%);
  --gradient-error: linear-gradient(135deg, var(--color-error) 0%, #F87171 100%);
}
```

### Step 2: Create Global Base Styles

**File**: `invoice-frontend/src/styles/global.css`

```css
/**
 * Global Base Styles
 * These styles are applied to all HTML elements globally
 */

/* ==================== RESET & BASE ==================== */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  min-height: 100vh;
}

/* ==================== TYPOGRAPHY ==================== */

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

h1 {
  font-size: var(--font-size-h1);
  letter-spacing: var(--letter-spacing-tight);
}

h2 {
  font-size: var(--font-size-h2);
  letter-spacing: var(--letter-spacing-tight);
}

h3 {
  font-size: var(--font-size-h3);
  letter-spacing: var(--letter-spacing-tight);
}

p {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

small {
  font-size: var(--font-size-body-sm);
}

/* ==================== LINKS ==================== */

a {
  color: var(--color-venmo-blue);
  text-decoration: none;
  transition: color var(--duration-base) var(--ease-out);
}

a:hover {
  color: var(--color-deep-blue);
}

a:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
  border-radius: var(--radius-sm);
}

/* ==================== BUTTONS ==================== */

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  color: inherit;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* ==================== FORM ELEMENTS ==================== */

input,
textarea,
select {
  font-family: inherit;
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  background-color: var(--color-card-white);
  border: 2px solid var(--color-border-gray);
  border-radius: var(--radius-sm);
  padding: var(--spacing-3);
  transition: border-color var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

input::placeholder,
textarea::placeholder {
  color: var(--color-text-tertiary);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-venmo-blue);
  box-shadow: var(--shadow-focus);
}

input:disabled,
textarea:disabled,
select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: var(--color-background);
}

/* ==================== GLOBAL FOCUS STYLES ==================== */

*:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* ==================== SCROLLBAR STYLING ==================== */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-gray);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

/* ==================== SELECTION ==================== */

::selection {
  background-color: var(--color-venmo-blue-200);
  color: var(--color-deep-blue);
}

/* ==================== REDUCED MOTION ==================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Step 3: Create Global Utility Classes

**File**: `invoice-frontend/src/styles/utilities.css`

```css
/**
 * Global Utility Classes
 * Reusable utility classes based on design tokens
 */

/* ==================== CARD UTILITIES ==================== */

.card {
  background: var(--color-card-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-6);
}

.card-sm {
  padding: var(--spacing-4);
}

.card-lg {
  padding: var(--spacing-8);
}

/* ==================== GRADIENT UTILITIES ==================== */

.gradient-primary {
  background: var(--gradient-primary);
  color: var(--color-card-white);
}

.gradient-text-primary {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ==================== STATE UTILITIES ==================== */

.is-loading {
  opacity: 0.6;
  pointer-events: none;
  cursor: not-allowed;
  position: relative;
}

.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.has-error {
  border-color: var(--color-error) !important;
  color: var(--color-error);
}

.has-success {
  border-color: var(--color-success) !important;
  color: var(--color-success);
}

.has-warning {
  border-color: var(--color-warning) !important;
  color: var(--color-warning);
}

/* ==================== LAYOUT UTILITIES ==================== */

.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

.container-sm {
  max-width: 640px;
}

.container-md {
  max-width: 768px;
}

.container-lg {
  max-width: 1024px;
}

/* ==================== TEXT UTILITIES ==================== */

.text-primary {
  color: var(--color-text-primary);
}

.text-secondary {
  color: var(--color-text-secondary);
}

.text-tertiary {
  color: var(--color-text-tertiary);
}

.text-success {
  color: var(--color-success);
}

.text-error {
  color: var(--color-error);
}

.text-warning {
  color: var(--color-warning);
}

/* ==================== TRUNCATE UTILITIES ==================== */

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Step 4: Create Global Animation Classes

**File**: `invoice-frontend/src/styles/animations.css`

```css
/**
 * Global Animation Classes
 * All animations use design tokens for consistency
 */

/* ==================== TRANSITION UTILITIES ==================== */

.transition-all {
  transition-property: all;
  transition-timing-function: var(--ease-in-out);
  transition-duration: var(--duration-base);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: var(--ease-in-out);
  transition-duration: var(--duration-base);
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: var(--ease-out);
  transition-duration: var(--duration-medium);
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: var(--ease-in-out);
  transition-duration: var(--duration-base);
}

/* ==================== INTERACTION ANIMATIONS ==================== */

.hover-lift {
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.press-scale {
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.press-scale:active {
  transform: scale(0.97);
}

.hover-brighten {
  transition: filter var(--duration-base) var(--ease-out);
}

.hover-brighten:hover {
  filter: brightness(1.1);
}

/* ==================== LOADING ANIMATIONS ==================== */

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin var(--duration-slower) linear infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse var(--duration-slow) var(--ease-in-out) infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce var(--duration-medium) var(--ease-bounce) infinite;
}

/* ==================== PAGE TRANSITIONS ==================== */

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-medium) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform var(--duration-medium) var(--ease-in-out),
              opacity var(--duration-medium) var(--ease-in-out);
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform var(--duration-medium) var(--ease-in-out),
              opacity var(--duration-medium) var(--ease-in-out);
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform var(--duration-medium) var(--ease-in-out),
              opacity var(--duration-medium) var(--ease-in-out);
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* ==================== MODAL TRANSITIONS ==================== */

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-base) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: transform var(--duration-medium) var(--ease-out),
              opacity var(--duration-medium) var(--ease-out);
}

.modal-content-enter-from {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.modal-content-leave-to {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

/* ==================== SKELETON LOADING ==================== */

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-background) 0%,
    var(--color-border-gray) 50%,
    var(--color-background) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer var(--duration-slower) linear infinite;
  border-radius: var(--radius-sm);
}
```

### Step 5: Create Main Stylesheet

**File**: `invoice-frontend/src/styles/index.css`

```css
/**
 * Main Stylesheet
 * Imports all global styles in the correct order
 */

/* 1. Design Tokens - MUST be first */
@import './tokens.css';

/* 2. Tailwind Base - Uses tokens */
@tailwind base;

/* 3. Global Base Styles */
@import './global.css';

/* 4. Global Utilities */
@import './utilities.css';

/* 5. Global Animations */
@import './animations.css';

/* 6. Tailwind Components and Utilities */
@tailwind components;
@tailwind utilities;
```

### Step 6: Update Tailwind Configuration

**File**: `invoice-frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colors - ALL reference CSS variables
      colors: {
        venmo: {
          blue: {
            50: 'var(--color-venmo-blue-50)',
            100: 'var(--color-venmo-blue-100)',
            200: 'var(--color-venmo-blue-200)',
            300: 'var(--color-venmo-blue-300)',
            400: 'var(--color-venmo-blue-400)',
            500: 'var(--color-venmo-blue-500)',
            600: 'var(--color-venmo-blue-600)',
            700: 'var(--color-venmo-blue-700)',
            800: 'var(--color-venmo-blue-800)',
            900: 'var(--color-venmo-blue-900)',
            DEFAULT: 'var(--color-venmo-blue)',
          },
          purple: {
            50: 'var(--color-venmo-purple-50)',
            100: 'var(--color-venmo-purple-100)',
            200: 'var(--color-venmo-purple-200)',
            300: 'var(--color-venmo-purple-300)',
            400: 'var(--color-venmo-purple-400)',
            500: 'var(--color-venmo-purple-500)',
            600: 'var(--color-venmo-purple-600)',
            700: 'var(--color-venmo-purple-700)',
            800: 'var(--color-venmo-purple-800)',
            900: 'var(--color-venmo-purple-900)',
            DEFAULT: 'var(--color-venmo-purple)',
          },
        },
        'deep-blue': 'var(--color-deep-blue)',
        background: 'var(--color-background)',
        'card-white': 'var(--color-card-white)',
        'border-gray': 'var(--color-border-gray)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
          dark: 'var(--color-success-dark)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
          dark: 'var(--color-warning-dark)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-light)',
          dark: 'var(--color-error-dark)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          light: 'var(--color-info-light)',
          dark: 'var(--color-info-dark)',
        },
      },
      
      // Spacing - Reference CSS variables
      spacing: {
        '0': 'var(--spacing-0)',
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
      },
      
      // Border Radius
      borderRadius: {
        'none': 'var(--radius-none)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      
      // Box Shadow
      boxShadow: {
        'none': 'var(--shadow-none)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'focus': 'var(--shadow-focus)',
      },
      
      // Font Family
      fontFamily: {
        sans: 'var(--font-family-base)',
      },
      
      // Font Size
      fontSize: {
        'display-lg': 'var(--font-size-display-lg)',
        'display': 'var(--font-size-display)',
        'h1': 'var(--font-size-h1)',
        'h2': 'var(--font-size-h2)',
        'h3': 'var(--font-size-h3)',
        'body-lg': 'var(--font-size-body-lg)',
        'body': 'var(--font-size-body)',
        'body-sm': 'var(--font-size-body-sm)',
        'caption': 'var(--font-size-caption)',
      },
      
      // Font Weight
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      
      // Line Height
      lineHeight: {
        tight: 'var(--line-height-tight)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
      },
      
      // Letter Spacing
      letterSpacing: {
        tight: 'var(--letter-spacing-tight)',
        normal: 'var(--letter-spacing-normal)',
        wide: 'var(--letter-spacing-wide)',
      },
      
      // Transition Duration
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        medium: 'var(--duration-medium)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      
      // Transition Timing Function
      transitionTimingFunction: {
        'in-out': 'var(--ease-in-out)',
        'out': 'var(--ease-out)',
        'in': 'var(--ease-in)',
        'bounce': 'var(--ease-bounce)',
      },
      
      // Z-Index
      zIndex: {
        'base': 'var(--z-index-base)',
        'dropdown': 'var(--z-index-dropdown)',
        'sticky': 'var(--z-index-sticky)',
        'fixed': 'var(--z-index-fixed)',
        'modal-backdrop': 'var(--z-index-modal-backdrop)',
        'modal': 'var(--z-index-modal)',
        'popover': 'var(--z-index-popover)',
        'tooltip': 'var(--z-index-tooltip)',
      },
      
      // Background Image (for gradients)
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-error': 'var(--gradient-error)',
      },
    },
    
    // Screens/Breakpoints
    screens: {
      'mobile': { 'max': '767px' },
      'tablet': { 'min': '768px', 'max': '1023px' },
      'desktop': { 'min': '1024px' },
      'lg-desktop': { 'min': '1440px' },
    },
  },
  plugins: [],
}
```

### Step 7: Update Application Entry Point

**File**: `invoice-frontend/src/main.ts`

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

### Step 8: Create TypeScript Type Definitions

**File**: `invoice-frontend/src/types/design-tokens.ts`

```typescript
/**
 * Design Token Type Definitions
 * Provides type safety for design token usage
 */

export type ColorToken =
  | 'venmo-blue-50'
  | 'venmo-blue-100'
  | 'venmo-blue-200'
  | 'venmo-blue-300'
  | 'venmo-blue-400'
  | 'venmo-blue-500'
  | 'venmo-blue-600'
  | 'venmo-blue-700'
  | 'venmo-blue-800'
  | 'venmo-blue-900'
  | 'venmo-purple-50'
  | 'venmo-purple-100'
  | 'venmo-purple-200'
  | 'venmo-purple-300'
  | 'venmo-purple-400'
  | 'venmo-purple-500'
  | 'venmo-purple-600'
  | 'venmo-purple-700'
  | 'venmo-purple-800'
  | 'venmo-purple-900'
  | 'venmo-blue'
  | 'venmo-purple'
  | 'deep-blue'
  | 'background'
  | 'card-white'
  | 'border-gray'
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'success'
  | 'success-light'
  | 'success-dark'
  | 'warning'
  | 'warning-light'
  | 'warning-dark'
  | 'error'
  | 'error-light'
  | 'error-dark'
  | 'info'
  | 'info-light'
  | 'info-dark';

export type SpacingToken = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24';

export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export type ShadowToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'focus';

export type FontSizeToken =
  | 'display-lg'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption';

export type IconSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type DurationToken = 'fast' | 'base' | 'medium' | 'slow' | 'slower';

export type EasingToken = 'in-out' | 'out' | 'in' | 'bounce';

/**
 * Helper function to get CSS variable value
 */
export function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

/**
 * Helper function to set CSS variable value
 */
export function setCSSVariable(name: string, value: string): void {
  document.documentElement.style.setProperty(`--${name}`, value);
}
```

### Step 9: Create Base Button Component Example

**File**: `invoice-frontend/src/shared/components/VButton.vue`

```vue
<template>
  <button
    :class="[
      'v-button',
      `v-button--${variant}`,
      `v-button--${size}`,
      {
        'v-button--disabled': disabled,
        'v-button--loading': loading,
        'v-button--block': block,
      }
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="v-button__spinner">
      <svg class="animate-spin" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </span>
    <span class="v-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Base button styles using ONLY design tokens */
.v-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-in-out),
              box-shadow var(--duration-base) var(--ease-out),
              background-color var(--duration-base) var(--ease-out);
  border: none;
  outline: none;
}

.v-button:focus-visible {
  box-shadow: var(--shadow-focus);
}

.v-button:active:not(.v-button--disabled) {
  transform: scale(0.97);
}

.v-button:hover:not(.v-button--disabled):not(.v-button--loading) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Sizes using spacing tokens */
.v-button--sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-body-sm);
}

.v-button--md {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-body);
}

.v-button--lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-body-lg);
}

/* Variants using color tokens */
.v-button--primary {
  background: var(--gradient-primary);
  color: var(--color-card-white);
}

.v-button--secondary {
  background: var(--color-card-white);
  color: var(--color-venmo-blue);
  border: 2px solid var(--color-venmo-blue);
}

.v-button--secondary:hover:not(.v-button--disabled) {
  background: var(--color-venmo-blue-50);
}

.v-button--ghost {
  background: transparent;
  color: var(--color-venmo-blue);
}

.v-button--ghost:hover:not(.v-button--disabled) {
  background: var(--color-venmo-blue-50);
}

.v-button--link {
  background: transparent;
  color: var(--color-venmo-blue);
  padding: 0;
}

.v-button--link:hover:not(.v-button--disabled) {
  color: var(--color-deep-blue);
  text-decoration: underline;
  transform: none;
  box-shadow: none;
}

/* States */
.v-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.v-button--loading {
  cursor: wait;
}

.v-button--block {
  width: 100%;
}

/* Spinner */
.v-button__spinner {
  display: inline-flex;
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.v-button__content {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}
</style>
```

### Step 10: Create ESLint Configuration

**File**: `invoice-frontend/.eslintrc.cjs` (add to existing config)

```javascript
module.exports = {
  // ... existing config
  rules: {
    // ... existing rules
    
    // Prevent hardcoded colors
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
    
    // Vue specific rules
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-deprecated-slot-attribute': 'error',
    'vue/no-multiple-template-root': 'off', // Vue 3 allows multiple roots
  },
}
```

### Step 11: Create Package.json Scripts

**File**: `invoice-frontend/package.json` (add scripts)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "lint:css": "stylelint '**/*.{css,vue}' --fix",
    "check:tokens": "grep -r '#[0-9A-Fa-f]\\{6\\}' src/ --exclude-dir=node_modules --exclude='*.css' || echo 'No hardcoded colors found!'",
    "validate:design-system": "npm run lint && npm run check:tokens"
  }
}
```

### Step 12: Create Component Documentation Template

**File**: `invoice-frontend/docs/component-template.md`

```markdown
# Component Name

## Description
Brief description of what this component does.

## Design Tokens Used

### Colors
- `--color-venmo-blue` - Primary button background
- `--color-card-white` - Button text color
- `--color-text-primary` - Default text color

### Spacing
- `--spacing-3` - Vertical padding
- `--spacing-6` - Horizontal padding
- `--spacing-2` - Gap between elements

### Typography
- `--font-size-body` - Default font size
- `--font-weight-semibold` - Button text weight

### Border & Shadow
- `--radius-md` - Border radius
- `--shadow-md` - Default shadow
- `--shadow-lg` - Hover shadow
- `--shadow-focus` - Focus ring

### Animation
- `--duration-fast` - Press animation
- `--duration-base` - Hover transition
- `--ease-in-out` - Animation easing

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' \| 'link' | 'primary' | Button style variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| disabled | boolean | false | Disable button |
| loading | boolean | false | Show loading state |

## Usage Examples

### Basic Usage
\`\`\`vue
<VButton>Click me</VButton>
\`\`\`

### With Variant
\`\`\`vue
<VButton variant="secondary">Secondary Button</VButton>
\`\`\`

### Loading State
\`\`\`vue
<VButton :loading="isLoading" @click="handleSubmit">
  Submit
</VButton>
\`\`\`

## Accessibility
- Fully keyboard accessible
- Uses semantic HTML `<button>` element
- Includes focus ring using `--shadow-focus` token
- Disabled state properly communicated to screen readers

## Notes
- All styling uses design tokens exclusively
- No hardcoded values in component
- Follows global animation patterns
```

### Step 13: Create Validation Checklist

**File**: `invoice-frontend/docs/design-system-checklist.md`

```markdown
# Design System Implementation Checklist

Use this checklist to validate that components follow the global design system.

## File Creation

- [ ] `src/styles/tokens.css` created with ALL design tokens
- [ ] `src/styles/global.css` created with base HTML styles
- [ ] `src/styles/utilities.css` created with utility classes
- [ ] `src/styles/animations.css` created with animation classes
- [ ] `src/styles/index.css` created and imports all styles
- [ ] `tailwind.config.js` updated to reference CSS variables
- [ ] `src/types/design-tokens.ts` created with type definitions

## Design Token Validation

- [ ] All colors defined as CSS variables
- [ ] All spacing values defined as CSS variables
- [ ] All typography scales defined as CSS variables
- [ ] All shadow definitions defined as CSS variables
- [ ] All animation timings defined as CSS variables
- [ ] All easing functions defined as CSS variables
- [ ] Icon size tokens defined
- [ ] Z-index tokens defined
- [ ] Gradient tokens defined

## Tailwind Configuration

- [ ] Colors extend references CSS variables
- [ ] Spacing extend references CSS variables
- [ ] BorderRadius extend references CSS variables
- [ ] BoxShadow extend references CSS variables
- [ ] FontSize extend references CSS variables
- [ ] TransitionDuration extend references CSS variables
- [ ] TransitionTimingFunction extend references CSS variables
- [ ] Screens/breakpoints configured
- [ ] NO hardcoded values in config

## Component Library

For each component, verify:

- [ ] Uses ONLY design tokens (no hardcoded values)
- [ ] All colors reference CSS variables
- [ ] All spacing uses spacing tokens
- [ ] All typography uses typography tokens
- [ ] All shadows use shadow tokens
- [ ] All animations use timing tokens
- [ ] Focus states use `--shadow-focus`
- [ ] Hover effects use global animation classes
- [ ] Documented with design tokens used
- [ ] TypeScript types defined
- [ ] Accessibility requirements met

## Code Quality

- [ ] ESLint rules prevent hardcoded colors
- [ ] Pre-commit hooks validate design token usage
- [ ] Linter passes with no errors
- [ ] No hardcoded hex colors in codebase
- [ ] No hardcoded RGB/RGBA colors in codebase
- [ ] No hardcoded spacing pixel values (except in tokens.css)

## Testing

- [ ] Visual regression tests pass
- [ ] Components render correctly on all breakpoints
- [ ] Animations work smoothly (60fps)
- [ ] Reduced motion preference respected
- [ ] Focus indicators visible everywhere
- [ ] Keyboard navigation works

## Documentation

- [ ] Design system documented
- [ ] Component library documented
- [ ] Each component has usage examples
- [ ] Design token usage guide created
- [ ] Developer onboarding guide updated

## Validation Commands

Run these commands to validate:

\`\`\`bash
# Check for hardcoded colors
npm run check:tokens

# Run linter
npm run lint

# Validate entire design system
npm run validate:design-system
\`\`\`

## Final Validation

- [ ] Change a CSS variable and verify it updates throughout app
- [ ] All team members trained on design system
- [ ] Design system accessible to all developers
- [ ] Component library published/available
```

---

## Conclusion

This comprehensive UI update will transform InvoiceMe into a modern, user-friendly application that combines Venmo's approachable design language with professional invoicing functionality.

**Key Success Factor: Global-First Architecture**

The success of this implementation depends entirely on establishing a robust global design system FIRST. By implementing all styles as CSS variables, creating a comprehensive component library that uses ONLY design tokens, and enforcing consistency through linting and validation, we ensure:

1. **Absolute Visual Consistency**: Every color, spacing, shadow, and animation follows the same global standards
2. **Single Source of Truth**: CSS variables at `:root` level control all styling throughout the application
3. **Maintainability**: One change to a design token updates the entire application instantly
4. **Scalability**: New features automatically inherit the correct Venmo-inspired styling
5. **Developer Experience**: Clear, documented patterns make implementation predictable and reliable

The phased implementation approach ensures systematic progress while maintaining application stability. By completing Phase 1 (Global Design System Foundation) BEFORE any feature work begins, we establish the foundation that makes all subsequent phases consistent, efficient, and maintainable.

The focus on responsive design, accessibility, and smooth interactions—all powered by global design tokens—will significantly enhance user experience across all devices while maintaining professional functionality.

