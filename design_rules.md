# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Primary background: #F8FAFC (off-white), with #EAF6FB (light blue) as the outer background
- Secondary card backgrounds: #FFFFFF (pure white), #F2F9F3 (mint green), #F8F6FF (pastel lavender), #FFFBE5 (light yellow)
- Accent colors: #A8E6CF (mint green), #B6B1FA (soft purple), #FEF6D2 (pale yellow), #FCD2E2 (muted pink), #E0F7FA (aqua blue)
- Text primary: #18181B (very dark gray)
- Text secondary: #71717A (muted gray)
- UI icons and dividers: #E5E7EB (light gray), #D1D5DB (medium gray)
- Status/label colors: #34D399 (green for “Completed”), #FBBF24 (yellow for “Upcoming”), #60A5FA (blue for “Watching”)
- Highlights and badges: Soft pastels and gentle gradients, always with subtle contrast against card backgrounds

### Typography & Layout:
- Fonts: Sans-serif family, geometric and modern, likely Inter or similar; clean and highly readable
- Font weights: Regular (400) for body, Semi-bold (600) for headings, Bold (700) for numbers/counters
- Hierarchy: Large headings (24–28px), medium subheadings (18–20px), body text (14–16px), small metadata (12px)
- Layout: Three-column grid (main content, stats, side panel); generous padding (24–32px); clear vertical rhythm
- Alignment: Left-aligned for main content, centered for counters, right-aligned metadata in events
- Typography treatments: Occasional emoji for warmth, numbers and key stats in bold/large font, consistent line heights

### Key Design Elements
#### Card Design:
- Cards: Rounded corners (16–20px radius), subtle drop shadows (soft, low opacity), gentle separation from background
- Shadows: Very soft, almost imperceptible, for elevation; no harsh outlines
- Borders: Minimal or absent; separation mostly by spacing and color
- Hover states: Slight shadow increase or gentle scale up, possible color tint on card surface
- Visual hierarchy: Title bold at top, smaller metadata/subtext below, status badges/buttons to the side or bottom

#### Navigation:
- Top navigation bar: Solid black (#18181B) with rounded top corners; white or pastel icons; profile at right
- Sidebar/tabs: Rounded segment at bottom with pastel circular icons for categories, clear active state via highlight/badge
- Collapsible/expandable: Main navigation static, cards within grid may expand to show more detail

#### Data Visualization:
- Counters: Large, circular pills with bold numbers; pastel backgrounds and emoji icons for context
- Charts: Not present, but if used, would employ soft pastel fills, rounded edges, minimalist axis/labels

#### Interactive Elements:
- Buttons: Rounded, pill-shaped, filled with accent pastels or outlined; bold, clear labels
- Form elements: Minimal, high-contrast, rounded; focus and hover states use pastel outlines or subtle shadows
- Badges/labels: Rounded rectangles or pills, pastel backgrounds with clear contrasting text
- Micro-interactions: Smooth, gentle transitions (fade/scale); hover reveals, status changes with color shifts

### Design Philosophy
This interface embodies:
- A modern, playful-minimalist aesthetic that balances professionalism with warmth and approachability
- Strong emphasis on clarity, accessibility, and reduced cognitive load via generous whitespace and gentle color contrasts
- Rounded, soft UI elements to create a friendly, welcoming feel without sacrificing structure or legibility
- Visual hierarchy driven by bold text, color-coded accents, and clear iconography for rapid scanning
- User experience goals: keep interactions light, enjoyable, and intuitive; make data visually digestible; encourage engagement through visual cues and low-friction interactions

---

This project follows the "---

## Visual Style

### Color Palette:
- Primary background: #F8FAFC (off-white), with #EAF6FB (light blue) as the outer background
- Secondary card backgrounds: #FFFFFF (pure white), #F2F9F3 (mint green), #F8F6FF (pastel lavender), #FFFBE5 (light yellow)
- Accent colors: #A8E6CF (mint green), #B6B1FA (soft purple), #FEF6D2 (pale yellow), #FCD2E2 (muted pink), #E0F7FA (aqua blue)
- Text primary: #18181B (very dark gray)
- Text secondary: #71717A (muted gray)
- UI icons and dividers: #E5E7EB (light gray), #D1D5DB (medium gray)
- Status/label colors: #34D399 (green for “Completed”), #FBBF24 (yellow for “Upcoming”), #60A5FA (blue for “Watching”)
- Highlights and badges: Soft pastels and gentle gradients, always with subtle contrast against card backgrounds

### Typography & Layout:
- Fonts: Sans-serif family, geometric and modern, likely Inter or similar; clean and highly readable
- Font weights: Regular (400) for body, Semi-bold (600) for headings, Bold (700) for numbers/counters
- Hierarchy: Large headings (24–28px), medium subheadings (18–20px), body text (14–16px), small metadata (12px)
- Layout: Three-column grid (main content, stats, side panel); generous padding (24–32px); clear vertical rhythm
- Alignment: Left-aligned for main content, centered for counters, right-aligned metadata in events
- Typography treatments: Occasional emoji for warmth, numbers and key stats in bold/large font, consistent line heights

### Key Design Elements
#### Card Design:
- Cards: Rounded corners (16–20px radius), subtle drop shadows (soft, low opacity), gentle separation from background
- Shadows: Very soft, almost imperceptible, for elevation; no harsh outlines
- Borders: Minimal or absent; separation mostly by spacing and color
- Hover states: Slight shadow increase or gentle scale up, possible color tint on card surface
- Visual hierarchy: Title bold at top, smaller metadata/subtext below, status badges/buttons to the side or bottom

#### Navigation:
- Top navigation bar: Solid black (#18181B) with rounded top corners; white or pastel icons; profile at right
- Sidebar/tabs: Rounded segment at bottom with pastel circular icons for categories, clear active state via highlight/badge
- Collapsible/expandable: Main navigation static, cards within grid may expand to show more detail

#### Data Visualization:
- Counters: Large, circular pills with bold numbers; pastel backgrounds and emoji icons for context
- Charts: Not present, but if used, would employ soft pastel fills, rounded edges, minimalist axis/labels

#### Interactive Elements:
- Buttons: Rounded, pill-shaped, filled with accent pastels or outlined; bold, clear labels
- Form elements: Minimal, high-contrast, rounded; focus and hover states use pastel outlines or subtle shadows
- Badges/labels: Rounded rectangles or pills, pastel backgrounds with clear contrasting text
- Micro-interactions: Smooth, gentle transitions (fade/scale); hover reveals, status changes with color shifts

### Design Philosophy
This interface embodies:
- A modern, playful-minimalist aesthetic that balances professionalism with warmth and approachability
- Strong emphasis on clarity, accessibility, and reduced cognitive load via generous whitespace and gentle color contrasts
- Rounded, soft UI elements to create a friendly, welcoming feel without sacrificing structure or legibility
- Visual hierarchy driven by bold text, color-coded accents, and clear iconography for rapid scanning
- User experience goals: keep interactions light, enjoyable, and intuitive; make data visually digestible; encourage engagement through visual cues and low-friction interactions

---" design pattern.
All design decisions should align with this pattern's best practices.

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)
- Adjust shadow intensity based on theme (lighter in dark mode)

---

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions
9. **Be Themeable** - Support both dark and light modes seamlessly

---

