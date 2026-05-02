# ItemDetailsPeek Redesign Plan (Orchestration Phase 1)

## 🎼 Orchestration Report (Phase 1)

### Task
Redesign `ItemDetailsPeek.jsx` to be minimalistic, functional, compact, and optimized for thin phone screens.

### Mode
plan

### Agents Involved in Planning
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | `project-planner` | Task breakdown & layout strategy | ✅ |
| 2 | `frontend-specialist` | UI/UX component analysis | ✅ |
| 3 | `mobile-developer` | Mobile-first viewport optimization | ✅ |

### Key Findings
1. **[project-planner]**: The current modal (`w-full max-w-4xl h-fit max-h-[90vh]`) with a 50/50 split works for desktop but takes up too much vertical space on mobile due to the `aspect-square` image and large paddings.
2. **[frontend-specialist]**: The text sizing (`text-2xl`) and paddings (`p-5`, `py-4` for buttons) are too bulky for thin phones. The design needs tighter spacing, smaller typography, and a "bottom sheet" aesthetic for mobile.
3. **[mobile-developer]**: For thin screens, the image should act as a header banner rather than a full square, and the action buttons should be pinned to the bottom or made more compact to ensure critical information is visible without scrolling.

## Proposed Changes

### [MODIFY] `src/components/ItemDetailsPeek.jsx`

#### 1. Layout & Sizing Optimizations (Mobile-First)
- Adjust the modal positioning on mobile to sit flush with the bottom (`bottom-0`, `rounded-t-3xl`, `rounded-b-none`) to act as a bottom sheet.
- Change the image aspect ratio from `aspect-square` to `aspect-video` (16:9) or a fixed height (e.g., `h-48`) on mobile to save vertical space.
- Reduce inner paddings from `p-5` to `p-4` or `p-3` on mobile.

#### 2. Typography Adjustments
- Scale down the title from `text-2xl` to `text-xl` or `text-lg` on mobile.
- Adjust line heights to be tighter (`leading-tight`).

#### 3. Action Button Refinement
- Reduce the button padding (`py-4` to `py-3`).
- Make the "Initiate Process" text more concise (e.g., "Claim Item") to save horizontal space.

## Verification Plan
- Run standard UI verification.
- Manually review on mobile viewports.

---

**Do you approve this plan? (Y/N)**
- **Y**: I will orchestrate the implementation using `frontend-specialist`, `mobile-developer`, and `test-engineer`.
- **N**: Let me know what to change in the design approach.
