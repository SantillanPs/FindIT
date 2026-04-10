# FindIT Design & UI System (Admin Dashboard)

## 0. User Context & Personas
- **Mobile-First Philosophy**: This is a **Mobile-First** system. The primary development target is the **360px - 400px viewport**.
- **The Thumb Zone**: Primary actions must live in the "Green Zone" (Bottom 1/3 and middle-center of the screen). Avoid top-corner buttons for high-frequency actions.
- **Campus Staff (Primary User)**: Often "on-the-move." Interface must be **one-hand usable**.
- **Hardware Profile**: Target **horizontally thin devices** (360px - 390px width). No horizontal scrolling.

## 1. Terminology & Tone
- **Human Centric**: Use "Found At," "Reported By," "Location," "Status."
- **Clear Actions**: Use "Secure," "Release," "View Matches."
- **Status Mapping**:
  - `reported` -> "Newly Reported"
  - `in_custody` -> "In Inventory"
  - `claimed` -> "Returned"

## 2. Typography Guidelines
- **Font**: Sans-serif (Inter/Outfit).
- **Weights**: Use `font-medium` for body, `font-bold` for titles.
- **Styling**: ABSOLUTELY NO aggressive italics or black-weight (italic font-black) for labels.
- **Casing**: Use `uppercase` for small meta-tags (e.g., "CATEGORY"), but keep primary content `capitalize` or `normal-case`.
- **Contrast & Sizing (Accessibility)**:
  - **Minimum Size**: Secondary text must be at least `text-[11px]`. Primary body must be at least `text-[13px]`.
  - **High Contrast**: Use `slate-300` or brighter for metadata on dark backgrounds.
  - **Hierarchy**: Use weight and color contrast (e.g., White vs Slate-300) rather than just size.
- **Density**: **High information density** is required. Use conservative padding (`p-6` to `p-8` for desktop, `p-4` to `p-5` for mobile) to maximize data visibility.

## 3. Visual Language (Sleek Pro)
- **Glassmorphism**: `backdrop-blur-xl`, `bg-slate-900/40`, `border-white/5`.
- **Gradients**: Subtle, ultra-smooth gradients using `uni-500` (Sky) and `amber-500` accents.
- **Shadows**: Large, soft shadows (`shadow-2xl`).
- **Animations**: Use `framer-motion` for smooth entry (~0.3s). No bouncy motion.

## 4. Mobile Execution & Ergonomics
- **The Squint Test**: Close your eyes halfway. The biggest, brightest elements must be the most critical actions (Status & Primary CTA). Lower-priority data (Internal Notes) must be visually muted or moved to the bottom.
- **Progressive Disclosure**: "Less is more." Show critical info first. Hide low-frequency details behind tap-to-expand toggles (e.g., student narratives, long descriptions).
- **Vertical Hierarchy**: Information must flow logically in a single column. Prioritize current status and primary actions last for thumb ease.
- **Touch Targets**: Min size of **48px x 48px**. Minimum **8px** breathable space between clickable elements to avoid "fat finger" errors.
- **Thumb-Friendly**: Primary actions must span the full container width on mobile.
- **Input Optimization**: Use native mobile behaviors (Date Pickers, Select Menus) instead of manual text input where possible.

## 5. Color Signaling System (Glanceability)
To facilitate "instant recognition" for staff-on-the-move, specific colors are mapped to data types:
- **Amber (`amber-400/500`)**: **Physical Origin**. Used for locations, map pins, and physical descriptions. Signals "Where to look."
- **Sky (`uni-400/500`)**: **Human Identity**. Used for reporters, owners, and contact info. Signals "Who it belongs to."
- **Emerald (`emerald-400/500`)**: **Temporal Freshness**. Used for timestamps and report age. Signals "How recent."
- **Violet (`violet-400/500`)**: **System Logic**. Used for IDs, categories, and background audit logs.

## 6. Mistakes to Avoid (Anti-Patterns)
To maintain the efficiency of the **FindIT** administrative interface, future designs MUST avoid the following pitfalls:

- **The "Box" Problem (Excessive Padding)**: Avoid wrapping single lines of text in large, individual cards or containers with heavy padding. Card height should be spent on data, not negative space.
- **Vertical Exhaustion (Stacking Everything)**: Don't stack every piece of metadata vertically. Use **Horizontal Grouping** for related items (e.g., Owner/Date) to reduce scrolling.
- **Label Dominance (Visual Noise)**: Avoid styling labels (e.g., "DATE REPORTED") with bold, all-caps, or high-contrast colors. **Data is the Hero**. Mute the labels so the information pops.
- **Buried "Primary" Information**: Never place the **Status Badge** or **ID** in the middle or bottom content areas. They MUST be in the top-right header area for instant scanning.
- **Thumb Zone Violations**: Avoid variable card heights by not displaying full narratives or notes by default. Use **Progressive Disclosure** (line-clamping) to keep the primary "Find Matches" button in a predictable thumb position.
- **Interactive FAB Collision**: Ensure floating elements (like chat icons) have an **80px bottom-clearance buffer** on list views to prevent "fat-finger" errors with card-level action buttons.
