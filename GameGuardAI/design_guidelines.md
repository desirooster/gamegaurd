# Design Guidelines: Gamer Proxy & Recommendation Platform

## Design Approach
**Reference-Based: Gaming Platform Aesthetic**
Drawing inspiration from Steam, Discord, and Epic Games Launcher - bold, dark interfaces with high contrast and gaming-centric visual language.

## Core Design Elements

### Typography
- **Primary Font:** Inter or Outfit (Google Fonts) - modern, readable
- **Accent Font:** Rajdhani or Orbitron - headers and gaming-themed elements
- **Hierarchy:**
  - H1: 3xl-4xl, bold, accent font
  - H2: 2xl-3xl, semibold
  - H3: xl-2xl, medium
  - Body: base-lg, regular
  - UI Elements: sm-base, medium

### Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, 8, and 12 (p-2, m-4, gap-6, h-8, py-12)
- Tight spacing (2-4) for compact UI elements
- Medium spacing (6-8) for component separation
- Generous spacing (12) for section padding

### Component Library

**Navigation:**
- Vertical sidebar (left): 64-80 units wide, fixed position
- Logo/brand at top, main nav items, user profile at bottom
- Active state: accent border-left and background treatment
- Collapsible on mobile to hamburger menu

**Proxy Interface:**
- URL input bar: Full-width with rounded corners (rounded-lg), height-12
- Clear action button integrated into input (absolute positioning)
- Recent sites: Horizontal scrollable chips below input
- Status indicator: Small pill showing "Connected" / "Disconnected"

**Content Display:**
- Main iframe container: Fills remaining viewport with border treatment
- Frame controls: Floating toolbar (top-right) with refresh, fullscreen, back/forward
- Loading state: Skeleton screen with gaming-themed spinner

**AI Recommendations:**
- Card grid: 2 columns mobile, 3-4 columns desktop (grid-cols-2 lg:grid-cols-4)
- Game cards: Rounded-xl, includes thumbnail, title, genre tags, "Open" CTA
- Hover state: Slight lift effect (transform scale-105)

**Game Library:**
- List view with thumbnail, title, last accessed timestamp
- Quick actions: Star favorite, delete, open
- Empty state: Illustrated placeholder encouraging first save

**Overlays:**
- Settings modal: Centered, max-width-2xl, rounded corners
- Toast notifications: Top-right, slide-in animation, auto-dismiss

### Visual Treatment
- Primary container backgrounds: Slightly elevated from base
- Borders: Subtle, accent-colored on interactive elements
- Shadows: Deep shadows for elevation (shadow-lg, shadow-2xl)
- Accent elements: Neon-inspired glows on active states using box-shadow

### Layout Structure

**Main Application:**
```
[Sidebar] [Main Content Area]
           [URL Bar & Controls]
           [Iframe Display]
           [AI Recommendations Grid - below fold]
```

**Sidebar sections:**
1. Logo/brand (top)
2. Proxy controls
3. Saved sites (scrollable)
4. AI Recommendations trigger
5. Settings (bottom)

**Responsive Behavior:**
- Desktop: Full sidebar visible
- Tablet: Collapsible sidebar, icon-only mode
- Mobile: Hamburger menu, full-width content

### Images
No hero image needed - this is an application interface focused on functionality. Game recommendation cards will display game thumbnails fetched via AI or placeholder gaming imagery (abstract controller, keyboard, headset icons).

### Animations
Minimal and purposeful:
- Sidebar collapse/expand: 200ms ease
- Card hover: Transform scale on 150ms
- Modal appearance: Fade + scale from 0.95 to 1.0
- Loading spinner: Continuous rotation for proxy status

This creates a professional gaming platform experience that feels native and purpose-built for gamers while maintaining excellent usability.