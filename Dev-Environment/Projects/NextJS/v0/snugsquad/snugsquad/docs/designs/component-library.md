# Component Library & Design System
**Designer:** Allura Scott - UI/UX Designer  
**Status:** Ready for Troy's implementation  
**Inspiration:** Van Gogh's emotional expressiveness + contemporary digital innovation  

## Design System Overview

Our component library emphasizes **warmth, accessibility, and emotional connection** while maintaining professional functionality. Each component is designed to make clients feel cared for and supported.

---

## 1. Button Components

### Primary Button
```tsx
// Usage: Main actions, CTAs, form submissions
<button className="btn-primary">
  Get Started
</button>
```

**Specifications:**
- **Background:** `bg-brand-primary` (#3B2352)
- **Text:** `text-brand-on` (#FFFFFF)
- **Padding:** `px-6 py-3`
- **Border Radius:** `rounded-lg`
- **Font:** `font-ui font-semibold text-base`
- **Hover:** `hover:shadow-md hover:scale-[1.02] transition-all duration-200`
- **Focus:** `focus:ring-2 focus:ring-semantic-ring focus:outline-none`
- **Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed`

### Secondary Button
```tsx
// Usage: Secondary actions, cancellations, less prominent actions
<button className="btn-secondary">
  Cancel
</button>
```

**Specifications:**
- **Background:** `bg-semantic-muted` (#F1F5F9)
- **Text:** `text-semantic-fg` (#0F172A)
- **Border:** `border border-semantic-border` (#E2E8F0)
- **Padding:** `px-6 py-3`
- **Border Radius:** `rounded-lg`
- **Font:** `font-ui font-semibold text-base`
- **Hover:** `hover:bg-semantic-border hover:shadow-sm transition-all duration-200`
- **Focus:** `focus:ring-2 focus:ring-semantic-ring focus:outline-none`

### Icon Button
```tsx
// Usage: Actions with icons, compact interactions
<button className="btn-icon">
  <Icon className="w-5 h-5" />
</button>
```

**Specifications:**
- **Size:** `w-10 h-10` (40px × 40px)
- **Background:** `bg-semantic-muted` (#F1F5F9)
- **Border Radius:** `rounded-lg`
- **Hover:** `hover:bg-semantic-border hover:shadow-sm`
- **Focus:** `focus:ring-2 focus:ring-semantic-ring focus:outline-none`

---

## 2. Card Components

### Standard Card
```tsx
// Usage: Content containers, information display
<div className="card">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>
```

**Specifications:**
- **Background:** `bg-semantic-bg` (#FFFFFF)
- **Border:** `border border-semantic-border` (#E2E8F0)
- **Border Radius:** `rounded-xl`
- **Shadow:** `shadow-sm`
- **Padding:** `p-6`
- **Hover:** `hover:shadow-md transition-shadow duration-200`

### Status Card
```tsx
// Usage: Status indicators, progress tracking
<div className="card-status status-active">
  <div className="status-indicator"></div>
  <div className="content">Active Status</div>
</div>
```

**Specifications:**
- **Base:** Extends Standard Card
- **Left Border:** `border-l-4` with status-specific colors
- **Status Colors:**
  - Active: `border-l-semantic-success` (#16A34A)
  - Pending: `border-l-semantic-warning` (#D97706)
  - Completed: `border-l-semantic-success` (#16A34A)
  - Error: `border-l-semantic-danger` (#DC2626)

### Interactive Card
```tsx
// Usage: Clickable cards, navigation items
<button className="card-interactive">
  <h3>Interactive Card</h3>
  <p>Click to navigate or perform action</p>
</button>
```

**Specifications:**
- **Base:** Extends Standard Card
- **Cursor:** `cursor-pointer`
- **Hover:** `hover:shadow-md hover:border-semantic-ring transition-all duration-200`
- **Focus:** `focus:ring-2 focus:ring-semantic-ring focus:outline-none`

---

## 3. Form Components

### Input Field
```tsx
// Usage: Text input, form fields
<div className="form-field">
  <label htmlFor="email" className="form-label">Email Address</label>
  <input 
    type="email" 
    id="email" 
    className="form-input"
    placeholder="Enter your email"
  />
</div>
```

**Specifications:**
- **Container:** `form-field` with `mb-4`
- **Label:** `form-label` with `block text-sm font-ui font-semibold text-semantic-fg mb-2`
- **Input:** `form-input` with:
  - **Border:** `border border-semantic-border` (#E2E8F0)
  - **Border Radius:** `rounded-md`
  - **Padding:** `px-3 py-2`
  - **Background:** `bg-semantic-bg` (#FFFFFF)
  - **Focus:** `focus:ring-2 focus:ring-semantic-ring focus:border-semantic-ring focus:outline-none`
  - **Placeholder:** `placeholder:text-semantic-muted`

### Select Dropdown
```tsx
// Usage: Choice selection, dropdown menus
<div className="form-field">
  <label htmlFor="service" className="form-label">Service Type</label>
  <select id="service" className="form-select">
    <option value="">Select a service</option>
    <option value="cleaning">House Cleaning</option>
    <option value="meal-prep">Meal Preparation</option>
  </select>
</div>
```

**Specifications:**
- **Base:** Extends form-input styles
- **Additional:** `appearance-none bg-no-repeat bg-right pr-10`
- **Background Image:** Custom dropdown arrow
- **Focus:** Same as form-input

### Checkbox & Radio
```tsx
// Usage: Boolean selection, single choice
<div className="form-field">
  <label className="form-checkbox">
    <input type="checkbox" className="form-checkbox-input" />
    <span className="form-checkbox-label">I agree to the terms</span>
  </label>
</div>
```

**Specifications:**
- **Container:** `form-checkbox` with `flex items-center`
- **Input:** `form-checkbox-input` with:
  - **Size:** `w-4 h-4`
  - **Color:** `text-brand-primary`
  - **Focus:** `focus:ring-2 focus:ring-semantic-ring`
- **Label:** `form-checkbox-label` with `ml-2 text-sm text-semantic-fg`

---

## 4. Navigation Components

### Header Navigation
```tsx
// Usage: Main site navigation, user menu
<header className="header">
  <div className="header-brand">
    <Logo className="w-8 h-8" />
    <span className="brand-name">Snug & Kisses</span>
  </div>
  <nav className="header-nav">
    <NavLink href="/dashboard">Dashboard</NavLink>
    <NavLink href="/care-plan">Care Plan</NavLink>
    <NavLink href="/service-requests">Service Requests</NavLink>
    <NavLink href="/profile">Profile</NavLink>
  </nav>
  <div className="header-actions">
    <NotificationBell />
    <UserMenu />
  </div>
</header>
```

**Specifications:**
- **Container:** `header` with `bg-semantic-bg border-b border-semantic-border px-6 py-4`
- **Brand:** `header-brand` with `flex items-center space-x-3`
- **Navigation:** `header-nav` with `flex items-center space-x-6`
- **Actions:** `header-actions` with `flex items-center space-x-4`

### Navigation Link
```tsx
// Usage: Navigation items, active states
<NavLink href="/care-plan" active={isActive}>
  Care Plan
</NavLink>
```

**Specifications:**
- **Base:** `nav-link` with `px-3 py-2 rounded-md font-ui font-medium transition-colors duration-200`
- **Default:** `text-semantic-fg hover:text-brand-primary hover:bg-semantic-muted`
- **Active:** `bg-brand-primary text-brand-on`
- **Focus:** `focus:outline-none focus:ring-2 focus:ring-semantic-ring focus:ring-offset-2`

---

## 5. Status & Feedback Components

### Status Badge
```tsx
// Usage: Status indicators, progress states
<span className="status-badge status-active">Active</span>
<span className="status-badge status-pending">Pending</span>
<span className="status-badge status-completed">Completed</span>
```

**Specifications:**
- **Base:** `status-badge` with `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-ui font-medium`
- **Status Variants:**
  - Active: `bg-semantic-success/10 text-semantic-success border border-semantic-success/20`
  - Pending: `bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20`
  - Completed: `bg-semantic-success/10 text-semantic-success border border-semantic-success/20`
  - Error: `bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20`

### Progress Indicator
```tsx
// Usage: Progress bars, completion tracking
<div className="progress-container">
  <div className="progress-bar" style={{width: '75%'}}></div>
  <span className="progress-text">75% Complete</span>
</div>
```

**Specifications:**
- **Container:** `progress-container` with `w-full bg-semantic-muted rounded-full h-2 relative`
- **Bar:** `progress-bar` with `bg-brand-primary h-2 rounded-full transition-all duration-300`
- **Text:** `progress-text` with `absolute -top-8 right-0 text-sm font-ui text-semantic-fg`

### Alert Messages
```tsx
// Usage: Success, error, warning, info messages
<div className="alert alert-success">
  <CheckCircleIcon className="w-5 h-5" />
  <span>Your request has been submitted successfully!</span>
</div>
```

**Specifications:**
- **Base:** `alert` with `flex items-center p-4 rounded-lg border`
- **Variants:**
  - Success: `alert-success` with `bg-semantic-success/10 border-semantic-success/20 text-semantic-success`
  - Error: `alert-error` with `bg-semantic-danger/10 border-semantic-danger/20 text-semantic-danger`
  - Warning: `alert-warning` with `bg-semantic-warning/10 border-semantic-warning/20 text-semantic-warning`
  - Info: `alert-info` with `bg-semantic-ring/10 border-semantic-ring/20 text-semantic-ring`

---

## 6. Layout Components

### Container
```tsx
// Usage: Page content wrapper, responsive layout
<div className="container">
  <div className="content">
    Page content goes here...
  </div>
</div>
```

**Specifications:**
- **Container:** `container` with `mx-auto px-4 sm:px-6 lg:px-8`
- **Max Widths:** Responsive breakpoints from Tailwind config
- **Content:** `content` with `max-w-7xl mx-auto`

### Grid Layout
```tsx
// Usage: Multi-column layouts, responsive grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
  <Card>Column 3</Card>
</div>
```

**Specifications:**
- **Mobile:** `grid-cols-1` (single column)
- **Tablet:** `md:grid-cols-2` (two columns)
- **Desktop:** `lg:grid-cols-3` (three columns)
- **Gap:** `gap-6` (24px spacing between items)

### Section Divider
```tsx
// Usage: Content separation, visual hierarchy
<div className="section-divider">
  <hr className="border-semantic-border" />
</div>
```

**Specifications:**
- **Container:** `section-divider` with `my-8`
- **Line:** `border-semantic-border` (#E2E8F0)

---

## 7. Animation & Interaction Classes

### Transitions
```css
/* Base transition class */
.transition-base {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Focus states */
.focus-ring {
  transition: box-shadow 0.2s ease-out;
}

.focus-ring:focus {
  box-shadow: 0 0 0 3px rgb(59 35 82 / 0.4);
}
```

### Loading States
```tsx
// Usage: Loading spinners, skeleton screens
<div className="loading-spinner">
  <div className="spinner"></div>
</div>
```

**Specifications:**
- **Container:** `loading-spinner` with `flex justify-center items-center p-8`
- **Spinner:** `spinner` with `w-8 h-8 border-2 border-semantic-border border-t-brand-primary rounded-full animate-spin`

---

## 8. Accessibility Features

### Screen Reader Support
- **ARIA Labels:** All interactive elements have descriptive labels
- **Live Regions:** Dynamic content updates are announced
- **Skip Links:** Quick navigation to main content
- **Focus Management:** Logical tab order and focus indicators

### Keyboard Navigation
- **Tab Order:** Logical progression through interactive elements
- **Enter/Space:** Activate buttons and interactive elements
- **Arrow Keys:** Navigate through form controls and lists
- **Escape:** Close modals and dropdowns

### Color & Contrast
- **WCAG AA Compliance:** Minimum 4.5:1 contrast ratio
- **Color Independence:** Information not conveyed by color alone
- **High Contrast Support:** Alternative color schemes available
- **Text Scaling:** Support for up to 200% text scaling

---

## 9. Responsive Design Classes

### Mobile-First Approach
```css
/* Base styles (mobile) */
.component {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

### Breakpoint Utilities
- **sm:** 640px and up
- **md:** 768px and up  
- **lg:** 1024px and up
- **xl:** 1280px and up
- **2xl:** 1536px and up

---

## 10. Implementation Notes for Troy

### CSS Custom Properties
```css
:root {
  /* Brand Colors */
  --brand-primary: #3B2352;
  --brand-surface: #D7C7ED;
  --brand-accent: #D4AF37;
  --brand-on: #FFFFFF;
  
  /* Semantic Colors */
  --semantic-bg: #FFFFFF;
  --semantic-fg: #0F172A;
  --semantic-muted: #F1F5F9;
  --semantic-border: #E2E8F0;
  --semantic-ring: #3B2352;
  --semantic-success: #16A34A;
  --semantic-warning: #D97706;
  --semantic-danger: #DC2626;
}
```

### Tailwind Integration
- **Custom Colors:** Use `bg-brand-primary`, `text-semantic-fg`, etc.
- **Custom Fonts:** Use `font-heading`, `font-body`, `font-ui`, `font-script`
- **Custom Spacing:** Use `rounded-lg`, `shadow-md`, etc.
- **Custom Animations:** Use `animate-fade-in`, `animate-slide-up`

### Component Variants
- **Size Variants:** `sm`, `md`, `lg` for buttons, inputs, cards
- **Color Variants:** `primary`, `secondary`, `success`, `warning`, `danger`
- **State Variants:** `default`, `hover`, `focus`, `active`, `disabled`

---

## Handoff Checklist

**✅ Design System Complete:**
- [x] Color palette and typography
- [x] Component specifications
- [x] Accessibility guidelines
- [x] Responsive design patterns
- [x] Animation and interaction specs

**Next Steps for Troy:**
1. **Implement base components** following these specifications
2. **Create component variants** for different use cases
3. **Add accessibility features** (ARIA labels, focus management)
4. **Test responsive behavior** across all breakpoints
5. **Validate accessibility** with screen readers and keyboard navigation

**Questions for Troy:**
- Do you need any clarification on component specifications?
- Are there any technical constraints I should consider?
- Would you like me to create additional component examples?

---

*"Good design is obvious. Great design is transparent."* - Joe Sparano  
*"Design creates culture. Culture shapes values. Values determine the future."* - Robert L. Peters
