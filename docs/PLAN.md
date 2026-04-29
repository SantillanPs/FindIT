# Redesign LostReportCard for Mobile-First Minimalism

## 🎼 Orchestration Mode: Planning Phase
**Agent Invoked:** `project-planner`

### Goal
Redesign the `LostReportCard` to be minimalistic, functional, and perfectly fitted for thin phone screens while retaining all necessary forensic and AI data.

### Analysis of Current Issues
- The current card uses dense grids and large paddings (`p-4 sm:p-5 lg:p-8`), taking up too much vertical space.
- The narrative block has heavy borders and backgrounds.
- The action buttons are bulky (`h-14`) and stacked in a way that requires scrolling.
- Information like "Owner" and "Reported On" take up two columns which feels disconnected on thin screens.

### Proposed Implementation Plan

#### 1. Condensed Layout & Spacing
- Reduce overall padding (e.g., `p-3` or `p-4`).
- Remove heavy glassmorphism borders inside the card (e.g., around the narrative).
- Stack essential information tighter to prevent vertical sprawl.

#### 2. Header & Title Adjustments
- Make the image aspect ratio slightly wider on mobile to save vertical space.
- Move badges (Category, Matches) closer to the title to form a compact header cluster.

#### 3. Narrative & Forensic Info
- Strip the background box from the narrative to make it feel like inline text.
- Condense the "AI Synthesized" label into a small inline badge next to the text.
- Render the forensic attributes as a tight flex wrap of small tags (`h-4`, `text-[9px]`).

#### 4. Metadata (Owner & Date)
- Combine "Owner" and "Reported On" into a single horizontal flex row with dots `•` separating them, rather than a bulky grid.

#### 5. Admin Notes
- Transform the "Internal Admin Notes" into a single-line input with an edit icon, expanding only when focused.

#### 6. Action Buttons
- Reduce button heights from `h-14` to `h-10` or `h-11`.
- For primary actions (Review/Find Matches), keep full width.
- For secondary actions (Resolve/Dismiss), use equal width side-by-side buttons with concise icons.
