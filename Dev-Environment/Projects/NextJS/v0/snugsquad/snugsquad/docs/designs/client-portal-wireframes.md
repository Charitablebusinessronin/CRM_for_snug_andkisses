# Client Portal Wireframes & High-Fidelity Designs
**Designer:** Allura - Creative UX Designer  
**Inspiration:** Van Gogh's emotional expressiveness + contemporary digital innovation  
**Goal:** Create intuitive, emotionally resonant interfaces for client care management  
**Status:** Ready for Troy's UI development  

## Design Philosophy
Drawing from Van Gogh's bold use of color and emotional depth, these designs emphasize:
- **Warm, approachable interfaces** that feel human and caring
- **Intuitive navigation** that reduces cognitive load for clients
- **Emotional connection** through thoughtful micro-interactions
- **Accessibility first** with clear visual hierarchy and contrast

---

## 1. Care Plan Overview Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo + Navigation + User Menu                      │
├─────────────────────────────────────────────────────────────┤
│ Page Title: "Your Care Plan"                               │
│ Subtitle: "Personalized support for your journey"          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────┐ │
│ │ Progress    │ │ Main Content Area                        │ │
│ │ Overview    │ │ ┌─────────────────────────────────────┐ │ │
│ │ ┌─────────┐ │ │ │ Care Plan Title                      │ │
│ │ │ 75%     │ │ │ │ "Comprehensive Home Care Support"   │ │
│ │ │ Complete│ │ │ └─────────────────────────────────────┘ │ │
│ │ └─────────┘ │ │ ┌─────────────────────────────────────┐ │ │
│ │ ┌─────────┐ │ │ │ Current Status                       │ │
│ │ │ Active  │ │ │ │ 🟢 Active - 3 months remaining      │ │
│ │ │ Status  │ │ │ └─────────────────────────────────────┘ │ │
│ │ └─────────┘ │ │ ┌─────────────────────────────────────┐ │ │
│ └─────────────┘ │ │ Care Plan Description                │ │
│                 │ │ "Personalized care plan designed to │ │
│                 │ │ support your daily needs with..."   │ │
│                 │ └─────────────────────────────────────┘ │ │
│                 │ ┌─────────────────────────────────────┐ │ │
│                 │ │ Next Steps                           │ │
│                 │ │ • Schedule next review (2 weeks)    │ │
│                 │ │ • Update preferences                │ │
│                 │ │ • Contact care team                 │ │
│                 │ └─────────────────────────────────────┘ │ │
│                 └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Elements
- **Progress Circle:** Large, prominent progress indicator with brand colors
- **Status Badge:** Green "Active" status with clear visual hierarchy
- **Action Cards:** Interactive elements for next steps
- **Typography:** Merriweather for headings, Lato for body text
- **Color Palette:** Brand primary (#3B2352) for emphasis, semantic colors for status

---

## 2. Service Requests Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo + Navigation + User Menu                      │
├─────────────────────────────────────────────────────────────┤
│ Page Title: "Service Requests"                             │
│ Subtitle: "Get the help you need, when you need it"       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Quick Actions Bar                                       │ │
│ │ [🆕 New Request] [📅 View Schedule] [📋 My Requests]   │ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Active Requests                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🟡 In Progress: House Cleaning                      │ │
│ │ │ Scheduled: Today, 2:00 PM                          │ │
│ │ │ Caregiver: Sarah M.                                 │ │
│ │ │ [View Details] [Contact] [Reschedule]              │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🟢 Confirmed: Meal Preparation                     │ │
│ │ │ Scheduled: Tomorrow, 12:00 PM                     │ │
│ │ │ Caregiver: Michael R.                              │ │
│ │ │ [View Details] [Contact] [Reschedule]              │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Request History                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ✅ Completed: Grocery Shopping                      │ │
│ │ │ Completed: Yesterday                                │ │
│ │ │ Caregiver: Sarah M.                                 │ │
│ │ │ [View Details] [Rate Service] [Request Again]      │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Elements
- **Status Indicators:** Color-coded status badges (🟡 In Progress, 🟢 Confirmed, ✅ Completed)
- **Action Buttons:** Clear, accessible buttons for each action
- **Card Layout:** Consistent card design with proper spacing
- **Quick Actions:** Prominent bar for common actions
- **Visual Hierarchy:** Clear separation between active and completed requests

---

## 3. Profile & Preferences Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo + Navigation + User Menu                      │
├─────────────────────────────────────────────────────────────┤
│ Page Title: "Profile & Preferences"                        │
│ Subtitle: "Personalize your care experience"              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Profile Information                                    │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Personal Details                                    │ │
│ │ │ [Edit]                                             │ │
│ │ │ Name: Jane Smith                                   │ │
│ │ │ Email: jane.smith@email.com                        │ │
│ │ │ Phone: (555) 123-4567                              │ │
│ │ │ Address: 123 Care Lane, Charlotte, NC              │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Emergency Contacts                                  │ │
│ │ │ [Add New]                                          │ │
│ │ │ • John Smith (Spouse) - (555) 987-6543             │ │
│ │ │ • Mary Johnson (Daughter) - (555) 456-7890         │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Care Preferences                                       │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Communication Preferences                            │ │
│ │ │ [Edit]                                             │ │
│ │ │ Preferred Contact: Email                            │ │
│ │ │ Frequency: Weekly updates                           │ │
│ │ │ Language: English                                   │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Care Requirements                                   │ │
│ │ │ [Edit]                                             │ │
│ │ │ Mobility: Some assistance needed                    │ │
│ │ │ Dietary: No restrictions                            │ │
│ │ │ Medical: Diabetes management                        │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Account Settings                                       │ │
│ │ [Change Password] [Two-Factor Auth] [Privacy Settings] │ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Elements
- **Sectioned Layout:** Clear separation of different information types
- **Edit Actions:** Inline edit buttons for each section
- **Form Elements:** Consistent input styling with brand colors
- **Accessibility:** Clear labels and proper contrast ratios
- **Visual Grouping:** Logical grouping of related information

---

## 4. Navigation & Header Design

### Header Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Logo + Brand Name                    [🔔] [👤] [Settings] │
├─────────────────────────────────────────────────────────────┤
│ Navigation Tabs                                          │ │
│ [Dashboard] [Care Plan] [Service Requests] [Profile]     │ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Elements
- **Brand Identity:** Prominent logo and brand name
- **Notification Bell:** Clear indicator for new messages/alerts
- **User Menu:** Accessible dropdown for user actions
- **Navigation Tabs:** Clear, active state indicators
- **Responsive Design:** Collapsible navigation for mobile

---

## 5. Component Library Specifications

### Button Styles
```
Primary Button:
- Background: brand.primary (#3B2352)
- Text: brand.on (#FFFFFF)
- Hover: shadow-md + slight scale transform
- Focus: ring-2 ring-semantic.ring

Secondary Button:
- Background: semantic.muted (#F1F5F9)
- Text: semantic.fg (#0F172A)
- Border: semantic.border (#E2E8F0)
- Hover: shadow-sm + background change
```

### Card Components
```
Standard Card:
- Background: semantic.bg (#FFFFFF)
- Border: semantic.border (#E2E8F0)
- Shadow: shadow-sm
- Hover: shadow-md
- Border Radius: lg (0.75rem)
- Padding: 1.5rem

Status Card:
- Background: semantic.bg (#FFFFFF)
- Border: Left border with status color
- Shadow: shadow-sm
- Hover: shadow-md
```

### Form Elements
```
Input Fields:
- Border: semantic.border (#E2E8F0)
- Focus: ring-2 ring-semantic.ring
- Border Radius: md (0.5rem)
- Padding: 0.75rem 1rem

Labels:
- Font: font-ui (Nunito Sans)
- Weight: 600
- Color: semantic.fg (#0F172A)
```

---

## 6. Responsive Design Considerations

### Mobile-First Approach
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation:** Collapsible hamburger menu on mobile
- **Cards:** Stack vertically on small screens
- **Forms:** Full-width inputs on mobile
- **Touch Targets:** Minimum 44px for all interactive elements

### Tablet & Desktop Enhancements
- **Sidebar Navigation:** Collapsible sidebar on larger screens
- **Grid Layouts:** Multi-column layouts for better space utilization
- **Hover States:** Enhanced hover effects on desktop
- **Keyboard Navigation:** Full keyboard accessibility

---

## 7. Accessibility Features

### Visual Accessibility
- **Color Contrast:** WCAG AA compliance for all text
- **Focus Indicators:** Clear focus rings on all interactive elements
- **Text Scaling:** Support for up to 200% text scaling
- **High Contrast Mode:** Alternative color schemes

### Screen Reader Support
- **Semantic HTML:** Proper heading hierarchy and landmarks
- **ARIA Labels:** Descriptive labels for complex interactions
- **Live Regions:** Dynamic content updates announced to screen readers
- **Skip Links:** Quick navigation to main content

---

## 8. Micro-Interactions & Animations

### Subtle Animations
- **Page Transitions:** Fade-in effects (0.3s ease-out)
- **Button Hover:** Scale transform (1.02x) with shadow
- **Card Hover:** Smooth shadow transition
- **Loading States:** Skeleton screens with pulse animations

### Feedback Mechanisms
- **Success States:** Green checkmarks with success messages
- **Error States:** Clear error messages with helpful suggestions
- **Loading Indicators:** Spinner or skeleton screens
- **Confirmation Dialogs:** Clear confirmations for destructive actions

---

## Handoff Notes for Troy

**Design Files Ready:**
- ✅ Wireframes for all Client Portal pages
- ✅ Component library specifications
- ✅ Color palette and typography system
- ✅ Responsive design guidelines
- ✅ Accessibility requirements

**Next Steps:**
1. **Troy can now begin UI development** using these designs
2. **Component library implementation** should follow the specifications
3. **Accessibility testing** should be performed during development
4. **User testing** should be conducted after initial implementation

**Design Philosophy Reminder:**
Remember to maintain the warm, approachable feel that makes clients feel cared for. The interface should feel human and intuitive, not clinical or corporate.

**Questions for Troy:**
- Do you need any clarification on specific design elements?
- Are there any technical constraints I should consider?
- Would you like me to create additional mockups for specific interactions?

---

*"Design is not just what it looks like and feels like. Design is how it works."* - Steve Jobs  
*"Great things are done by a series of small things brought together."* - Vincent van Gogh
