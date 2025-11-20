# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

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

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

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
- Sufficient color contrast
- Respect reduced motion preferences

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


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# AgentForms — Development Blueprint

AgentForms is a conversational AI agent form builder that lets users create public, shareable chat-based agents to collect structured data. Agents define a schema of fields, validation rules, persona/tone, optional knowledge/context, and visual branding. Each agent is published to a unique public URL that creates stateful conversational sessions driven by an LLM to sequence questions, validate answers, extract structured values, and persist full transcripts and session metadata. Admins manage agents, inspect sessions, export data, and configure webhooks and integrations.

## 1. Pages (UI Screens)

- Landing Page (Public marketing)
  - Purpose: Convert visitors to signups and let them try demo agents.
  - Key sections/components: Hero (headline, subheadline, CTAs Try Demo/Sign Up, hero image/video), Feature highlights (cards), Live demo panel (embedded public agent preview), Pricing teaser (tier cards → pricing modal), Testimonials/logos, Footer (About, Docs, Terms, Privacy).

- Signup / Login Page (Unified auth)
  - Purpose: Authenticate users quickly; support social login/SSO.
  - Key sections/components: Auth tabs (Login/Signup), Signup form (name, email, password, company opt, TOS checkbox), Login form (email/password, forgot password), OAuth buttons (Google, Microsoft), SSO/enterprise link, password/security notices.

- Email Verification Page
  - Purpose: Confirm email ownership and block access until verified (with auto-detect support).
  - Key sections/components: Verification message, resend button with rate-limit feedback, change-email modal, continue button.

- Password Reset Page
  - Purpose: Request password reset and set new password via token link.
  - Key sections/components: Request reset form (email), Reset form (new password/confirm), token validation UI, success/error feedback.

- Dashboard (Agent List)
  - Purpose: Primary workspace for managing agents.
  - Key sections/components: Top nav (search, account menu, create agent CTA), agent cards/list (name, status, sessions count, last activity, quick actions Edit/View Link/Sessions/Duplicate/Delete), usage summary (monthly sessions, completion rate), filters/sort, Create Agent button, tags.

- Agent Builder (Create / Edit Agent)
  - Purpose: Multi-step wizard for agent creation and editing with preview.
  - Key sections/components: Progress steps (Schema → Persona → Knowledge → Visuals → Publish), Schema editor (add field types, required toggle, validation rules, placeholder/help text, drag-and-drop ordering), Persona settings (name, persona description, tone presets, sample messages), Knowledge input (paste/upload, RAG settings), Visual settings (primary color picker, avatar/logo upload, welcome message editor, custom CSS toggle for pro), Preview panel (live public chat preview desktop/mobile), Publish settings (public URL slug, link gating OTP, webhook config, retention policy), Save draft & Publish buttons.

- Public Agent Session (Chat UI)
  - Purpose: Public-facing chat to collect structured data; creates session for each visitor.
  - Key sections/components: Header (agent avatar/logo/name), chat transcript (agent & visitor messages, timestamps), typing indicator/streaming, input area (text input, quick replies for select fields, file upload optional), session progress indicator (progress bar / missing required count), privacy notice, rate-limit/error UI, end session CTA (Finish/Get Transcript).

- Session Viewer (Conversation Inspector)
  - Purpose: Inspect single session, view transcript and structured extraction, take actions.
  - Key sections/components: Session header (ID, agent, start/end, status), transcript pane (filter by role/time), structured data panel (field values, validation state, source message links), actions (export JSON/CSV, resend webhook, tag/flag), notes/comments, webhook delivery history/logs.

- Agent Sessions List
  - Purpose: List and filter sessions for an agent.
  - Key sections/components: Filter bar (search by visitor, status, date, tags), session rows (visitor preview, transcript snippet, status badge, timestamp), actions (view/export/webhook retry), bulk actions (export/delete/mark reviewed), pagination/infinite scroll.

- Webhook & Integration Settings
  - Purpose: Configure outbound webhooks and delivery behavior.
  - Key sections/components: webhook list (name, URL, secret, last status, enabled), create/edit modal (URL, secret header, triggers, payload template, retry policy), delivery logs (per-webhook history, responses), test webhook button.

- Settings / Preferences
  - Purpose: Account, team, billing, security, notifications.
  - Key sections/components: account info, team management (invite/roles), billing & plan, payment method (Stripe), security (change password, 2FA, SSO), notifications preferences, session logs.

- Admin Dashboard / Analytics
  - Purpose: High-level KPIs and admin controls for org owners.
  - Key sections/components: top KPIs (active agents, sessions, completion rate), charts (sessions over time, completion funnel), per-agent breakdown, user management (roles/invites), system health (LLM usage, failed webhooks).

- About / Help / Docs
  - Purpose: Public help center and developer docs.
  - Key sections/components: getting started guide, searchable FAQ, developer docs (webhook schema, sample API), contact/support form.

- Privacy & Terms
  - Purpose: Legal policies for users and visitors.
  - Key sections/components: privacy policy, terms of service, cookie policy, download PDF.

- 404 / Error Pages
  - Purpose: Friendly fallbacks and troubleshooting.
  - Key sections/components: 404 message with search/navigation, 500 message with retry/contact support.

- Billing / Checkout Page
  - Purpose: Plan selection and subscription checkout.
  - Key sections/components: plan cards (monthly/yearly toggle), checkout form (billing, promo, card via Stripe Elements), invoices & history link, confirmation/error states.

## 2. Features

- User Authentication & Account Management
  - Technical notes: Email/password with bcrypt hashed & salted passwords, JWT access + refresh tokens (secure HTTP-only cookies), email verification tokens with expiry & rate limits, password reset tokens, optional SSO (SAML/OAuth) for enterprise, RBAC (Admin/Member/Viewer) enforced server-side, audit logs for critical actions.
  - Implementation: Auth microservice or monolith auth module, rate-limits via Redis, cookie/session security (SameSite, Secure), CI/CD secret management for SSO.

- Agent Schema Builder & Validation
  - Technical notes: Agent JSON schema stores fields array (id, label, type: text/number/email/select/date/file, required, validation rules, options[], placeholder, helpText, piiFlag). Server-side validation endpoints mirror client rules. Drag-and-drop persisted via order index and versioning. Concurrency: optimistic locking or revisioning.
  - Implementation: Provide preview simulator endpoint that simulates conversation given schema and persona; autosave drafts via debounce; field-level encryption for PII values.

- Persona & Knowledge Configuration (RAG)
  - Technical notes: Persona metadata (tone, personaDescription, samplePrompts) saved with agent. Knowledge storage supports pasted text; chunking and optional embeddings for retrieval (vector DB optional). RAG settings: enable/disable, max context tokens, citation flag. Sanitize uploaded knowledge and enforce size limits.
  - Implementation: Pipeline to chunk knowledge, optionally embed via provider and store in vector DB (Pinecone/RedisVector). Prompt templates include persona + top retrieved knowledge snippets with sources.

- Public Session Lifecycle & Chat Engine
  - Technical notes: Session creation endpoint generates unique sessionId, persisted session record (agentId, createdAt, IP, userAgent, gated?). Messages are append-only with roles (agent, visitor, system), metadata, and validation state. Conversation orchestrator (server-side) determines next question from missing required fields and prior answers; uses LLM to phrase prompts. Field extraction uses deterministic parsing + LLM fallback with confidence score. Support streaming LLM responses for typing UX. Implement rate limiting, bot protection, optional email OTP gating.
  - Implementation: Stateless API servers with session store (DB) and caching; LLM service wrapper to manage prompts, streaming, retries; background worker for long-running extraction tasks; enforce encryption for PII fields.

- Session Storage, Export and Webhooks
  - Technical notes: DB tables: sessions, messages, extracted_fields, webhook_deliveries. Export API: filterable CSV/JSON; bulk export endpoint queues large exports (background job producing S3 file). Webhook dispatcher signs payloads (HMAC SHA256), supports retry with exponential backoff and max attempts, logs HTTP responses and failures.
  - Implementation: Worker queue (Bull/Sidekiq) for webhooks and exports; admin UI to test webhook and view history.

- Dashboard & Analytics
  - Technical notes: Aggregations for KPIs via periodic ETL jobs that populate time-series tables or use a metrics DB. Per-agent endpoints return sampled or aggregated data for charts. Cache frequent queries with Redis.
  - Implementation: Use scheduled jobs (cron) for daily aggregates; near-real-time counters via event stream.

- Team Management & Roles
  - Technical notes: Organization model, invites with tokenized email invites, seat accounting. Permission middleware applied to APIs and UI.
  - Implementation: Invitations stored with expiry, role assignment enforced at API level.

- Billing & Subscriptions
  - Technical notes: Stripe integration for subscription lifecycle, webhooks handling invoice/payment events, metered billing for session overages. Store subscription IDs and sync statuses.
  - Implementation: Server webhook endpoint secured, reconcile failures and notify admins.

- Security, Privacy & Compliance
  - Technical notes: TLS in transit, field-level encryption for PII at rest, data retention policies with scheduled deletion jobs, audit logs, DSR endpoints for export/deletion (GDPR), Sentry for error reporting, configurable retention windows per agent.
  - Implementation: Key management (KMS), encrypted columns or separate encrypted store, DSR workflows with verification, logging of data export/delete.

- Error Handling, Validation & Monitoring
  - Technical notes: Centralized error handler, client/server validation parity, Sentry integration, health checks. Graceful UX errors with retry affordances, exponential backoff for external APIs.
  - Implementation: Observability dashboards for LLM latencies, webhook failure rates, queue depth.

- Integrations: LLM Provider, Embeddings Store, Email, Storage, Monitoring, Bot Protection
  - Technical notes: Abstract LLM provider with adapter for OpenAI or other. Optional embeddings stored in vector DB. Email via SendGrid/Postmark/SES. Assets in S3 + CDN. Monitoring via Sentry, metrics pushed to Prometheus/Grafana. ReCAPTCHA or rate-limits for public endpoints.

- Assets & Scope Deliverables
  - UI icon set (edit, delete, publish, webhook, download, chat, settings) as SVGs and React icon components.
  - Marketing illustrations / hero images (landing page).
  - Transactional email templates (verification, password reset, OTP, session notification).
  - Sample agent templates (Lead Qualifier, Demo Scheduler, Support Intake, Feedback Collector).
  - App logo (primary + icon) variants.
  - Default agent avatars & placeholder images.

## 3. User Journeys

- New User (Product Marketer)
  1. Visit landing page → click Sign Up.
  2. Signup form submit → receive verification email.
  3. Verify email → land in Dashboard (Agent List).
  4. Click Create Agent → Agent Builder opens (Schema step).
  5. Define fields (name, email, company size, budget, preferred date), set required flags.
  6. Persona step: choose tone "friendly", write short persona blurb, sample message.
  7. Paste product FAQ into Knowledge step, enable RAG with low citation threshold.
  8. Visuals: set primary color, upload logo/avatar, write welcome message.
  9. Publish step: choose slug, enable public link, optional email OTP disabled, configure webhook (URL + secret) if on paid tier.
  10. Save & Publish → obtain public URL.
  11. Share URL → monitor incoming sessions in Agent Sessions List and Session Viewer.
  12. For completed sessions, view structured data, export CSV or confirm webhook deliveries.

- Anonymous Respondent / Visitor
  1. Click agent public URL (no login).
  2. New session created, welcome message shown per agent persona.
  3. Agent asks questions adaptively; visitor replies.
  4. System validates answers, asks follow-ups if needed.
  5. On completion visitor clicks Finish → optional transcript email if enabled (OTP gated).
  6. Session stored and visible to agent owner.

- Admin / App Owner
  1. Login → go to Admin Dashboard.
  2. View KPIs (active agents, sessions, completion rates).
  3. Click Agent List → select agent → view sessions list and analytics.
  4. Inspect session → open Session Viewer; review transcript and structured fields.
  5. If webhook failed, retry from Session Viewer; view delivery logs.
  6. Manage team invites and billing settings.

- Team Member (Editor)
  1. Receive invite → accept → land in shared org Dashboard.
  2. Create/edit agents as per role; autosave drafts; publish when ready.
  3. Access sessions per agent; add internal notes; export session lists.

- Enterprise User (SSO)
  1. Request SSO onboarding via SSO link.
  2. Admin configures SAML/OAuth in Settings.
  3. Team logs in via SSO, role provisioning applied.

## 4. UI Guide

- Color palette
  - Primary: #4F46E5 (Indigo 600) — actionable CTAs, primary accents.
  - Primary Variant: #6366F1 (Indigo 500) — hover/secondary states.
  - Neutral/Background: #0F172A (Dark navy for header), #F8FAFC (page background).
  - Surface: #FFFFFF (cards/panels), #F1F5F9 (muted surfaces).
  - Success: #10B981 (green).
  - Warning: #F59E0B (amber).
  - Danger: #EF4444 (red).
  - Text primary: #0F172A (dark).
  - Text secondary: #475569 (muted).
  - Muted/disabled: #94A3B8.

- Typography
  - System stack: Inter / ui-sans-serif, system fonts fallback.
  - Heading scale: H1 36px 700, H2 28px 600, H3 20px 600, H4 16px 600.
  - Body: 16px 400, Line height 1.5.
  - UI small: 12px 500 for metadata/badges.
  - Form inputs: 14px 400.
  - Emphasis: use weight/size instead of color alone to convey hierarchy.

- Component specs
  - Buttons:
    - Primary: background Primary, text white, padding 10px 16px, border-radius 8px, shadow subtle, hover Primary Variant.
    - Secondary: border 1px solid #E6E9F2, text Primary Variant.
    - Danger: red background for destructive actions; require confirm modal.
  - Inputs:
    - Height 44px, border 1px solid #E6E9F2, border-radius 8px, placeholder muted #94A3B8.
    - Validation states: error border Danger + error text 12px; success border Success.
  - Cards/Panels:
    - Surface white, radius 12px, padding 16px/24px, drop shadow soft.
  - Modals:
    - Panel modal centered, max-width 720px, overlay 40% black.
  - Toasts/Alerts:
    - Top-right stack, success/warning/error color-coded with icon.
  - Iconography:
    - Line icons, 20–24px; set includes edit, delete, publish, webhook, download, chat, settings.
  - Avatars:
    - 40px round default; placeholder neutral illustration if none uploaded.
  - Tables/Lists:
    - Rows 56px height, hover surface slightly tinted, selectable for bulk actions.

- Layout principles
  - Responsive grid with 12 cols desktop; collapse to single column under 768px.
  - Max content width 1200px center aligned for dashboard and docs.
  - Left nav for authenticated apps (collapsed to icons on narrow screens), top nav for account actions.
  - Use whitespace generously; preferred spacing scale 8px increments.

- Visual style & mood
  - Tone: professional, friendly, modern — convey trust and conversational warmth.
  - Imagery: use flat-friendly illustrations for landing; avoid photo-heavy hero. Marketing illustrations should depict chat flows, data capture, and integrations.
  - Motion: subtle micro-interactions (typing indicator, streaming agent response) and gentle transitions for modal/step changes.

- Component patterns for conversational UI
  - Message bubbles: agent aligned left with avatar, visitor right; use contrast backgrounds; small metadata timestamp below.
  - Typing indicator: animated three dots left; support partial streaming.
  - Quick reply chips: compact rounded buttons under message for select options.
  - Progress indicator: horizontal segmented bar showing required fields completed vs total.
  - Validation feedback: inline under messages when user-provided values fail validation; agent should reprompt with corrective tone based on persona.

- Accessibility
  - Contrast ratios ≥ 4.5:1 for text; focus rings on keyboard navigation; ARIA labels for chat input, message list, quick replies; images use alt text; modals trap focus.

- Component patterns (reuse)
  - Reusable Field Editor (label, type selector, required toggle, validation controls).
  - Persona preview card (shows sample messages).
  - Knowledge uploader component (paste/upload, size indicator, chunk preview).
  - Preview frame (embeds same chat UI component with agent overrides for visuals).

Instructions to AI Development Tool
After every development step, refer back to this blueprint to ensure correct implementation. Verify all features and pages are built according to specifications before completing the project. Pay special attention to the UI Guide section and ensure all visual elements follow the design system exactly.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
