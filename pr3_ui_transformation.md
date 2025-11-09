# Pull Request 3: Feature Implementation & UI Transformation

**Priority**: MEDIUM - Requires PR1 and PR2 to be merged first

**Dependencies**: PR1 (Global Design System), PR2 (Component Library & Navigation)

**Reference Document**: `ui_update.md`

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

#### Phase 3.1: Authentication Screens

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

#### Phase 3.2: Dashboard/Home Screen

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

#### Phase 3.3: Customer Management

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

#### Phase 3.4: Invoice Management

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

#### Phase 3.5: Payment Management

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

#### Phase 3.6: Loading States & Skeletons

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


**Critical Success Factors**:
- PR1 MUST be 100% complete before starting PR2
- All components MUST use ONLY design tokens
- No hardcoded values anywhere
- Comprehensive testing at each stage
- Design system validation at each PR

