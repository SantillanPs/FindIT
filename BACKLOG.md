# FindIT — Feature Backlog & Deferred Decisions

> This file captures ideas, UX decisions, and planned improvements that were deliberately put on hold.
> Each item includes enough context to pick it back up without re-researching.
> Last updated: 2026-04-13

---

## 🔴 Priority: Fix First (Known Bugs)

### [BUG] `verification_note` and `challenge_question` not persisted
- **Problem:** Both columns are missing from the `found_items` table. The admin intake modal writes to them, PostgREST silently ignores the unknown columns, and the data is discarded on every intake submission.
- **Impact:** The challenge question feature is completely broken end-to-end. Admins fill it in, it never saves, claimants never see it.
- **Fix:** Run this migration:
  ```sql
  ALTER TABLE found_items
    ADD COLUMN IF NOT EXISTS verification_note TEXT,
    ADD COLUMN IF NOT EXISTS challenge_question TEXT;
  ```
- **Downstream files that depend on these columns:**
  - `AdminDashboard.jsx` — writes both on intake submit
  - `ReleaseItemModal.jsx` — reads `verification_note` and `challenge_question`
  - `ClaimReviewModal.jsx` — reads both for claimant verification

---

## 🟡 Report Flow UX Redesign

> **Context:** Discussed during session on 2026-04-13. Full brainstorm preserved in:
> `C:\Users\admin\.gemini\antigravity\brain\d3fce82b-b927-4ba9-9b9b-c4e099f94089\artifacts\brainstorm_report_flow_ux.md`

### The Core Problem

Step 5 (Details/Attributes) uses **typed text input boxes** for Brand, Color, Condition, etc. while every other step uses **tap-to-pick** (categories, zones, datetime). This breaks the design language and creates friction.

Two failure modes:
- **Too rigid** — students who don't know the brand/model leave fields blank → bad data for matching
- **Too flexible** — uncontrolled vocabulary in free text ("navy" vs "dark blue") breaks the vector-based auto-match RPC

### Decided Direction: Chip Selectors for Structured Fields

Replace typed text inputs in `DetailsStep` with tap-selectable chips, following the same pattern as `CategorySelection`. Key decisions already made:

| Decision | Verdict | Reasoning |
|----------|---------|-----------|
| Brand chips per category? | ❌ No | Too many categories, too much ongoing maintenance |
| Color chips? | ✅ Yes | `COLOR_OPTIONS` already exists, everyone can identify a color |
| Condition chips? | ✅ Yes | `CONDITION_OPTIONS` already exists, currently just a dropdown |
| Type/subtype chips? | ✅ Yes | e.g. "Sunglasses / Graded / Reading" for Eyewear |
| Free text for Model/Size? | ✅ Keep | Genuinely open-ended, can't standardize |
| Brand field? | → "Unknown" chip + manual text fallback | Removes blank submissions without removing the option |

### Found vs. Lost: Different Philosophy

These two flows have fundamentally different user psychology and should be treated differently:

#### Found Item Report — Optimize for Speed
- The student who found the item **doesn't care about the item**. They just want to report and move on.
- Friction = drop-off = item never gets reported = system fails.
- Goal: **Get it done in under 90 seconds.**
- What matters most: Photo (already required ✅), Color chip, Location (already great ✅).
- Everything else should default to "Unknown" with one tap.

#### Lost Item Report — Optimize for Accuracy  
- The student who lost the item **cares deeply** and will put real effort in.
- They know their own item better than anyone. Use that.
- Goal: **Capture enough detail that a match is unambiguous.**
- Can push for more: multiple colors, model number, condition, specific distinguishing details.
- The "unique detail" field (see below) is the most important field here.

### The "Unique Detail" Field — Private, Admin-Only

- **Current state:** Labeled "Unique Nuance / Extra Notes (Optional)" — buried, optional, rarely filled.
- **Decided purpose:** This field feeds directly into the **admin's Challenge Question** at intake, not the public listing.
- **Visibility:** Private. Never shown to other students. Admin-only, used to verify ownership claims.
- **Redesigned prompt for found item:** *"Describe something about this item that only the owner would notice — a sticker, a crack, something attached, anything unusual."*
- **Redesigned prompt for lost item:** *"What's one thing about this item that only you would know? A scratch, an engraving, something inside or attached that isn't obvious."*
- **Relabeled as:** "Ownership Clue" or "Private Detail"
- **Required?** Soft-required for lost items (can't submit without at least 10 chars). Encouraged but skippable for found items (reporter may not know).

### Implementation Plan (When Ready)

**Files to change:**
- `src/components/ReportFlow/DetailsStep.jsx` — refactor attribute inputs to chips
- `src/constants/attributes.js` — annotate each attribute field with its input type (`color`, `condition`, `type-chip`, `text`)
- `src/pages/Student/ReportFoundItem.jsx` — tweak step labels and copy
- `src/pages/Student/ReportLostItem.jsx` — tweak step labels, add soft-validation on unique detail
- `src/pages/GuestReportFound.jsx` — same changes as student found flow

**New component to create:**
- `src/components/ReportFlow/AttributeChipSelector.jsx` — reusable chip picker, takes `options[]`, `value`, `onChange`, `allowOther` props

**No schema changes needed** — `attributes` JSONB already handles any shape of data.

---

## 🟢 Process Intake Modal — Admin Corrections

> **Context:** Discussed during same session. Full brainstorm preserved in:
> `C:\Users\admin\.gemini\antigravity\brain\d3fce82b-b927-4ba9-9b9b-c4e099f94089\artifacts\brainstorm_intake_process.md`

### The Problem

The admin's Process Intake modal currently:
- Shows the Verification Grid (pre-filled from student's `attributes`)
- Has Internal Notes and Challenge Question fields
- But **doesn't show the student's photo, category, or description inside the modal** — admin works from memory of the card they just clicked

### Decided Direction: Context Strip (after schema bug is fixed)

Add a compact **read-only context strip** at the top of the intake modal showing:
- Photo thumbnail
- Category pill
- Description excerpt
- Location and date

This gives the admin the full picture without redesigning the flow. Low effort, high value.

**The full "editable modal with audit trail" (Option B from brainstorm) is deferred** until there's evidence that admins frequently need to correct student data at intake. If the upstream chip improvements (above) result in better-quality submissions, the correction step may never be necessary.

### Implementation Plan (When Ready, After Schema Fix)

**Files to change:**
- `src/pages/Admin/AdminDashboard.jsx` — add context strip section to intake modal UI

**No schema changes** beyond the migration listed in the bug section above.

---

## 📌 Other Deferred Ideas

| Idea | Status | Notes |
|------|--------|-------|
| Soft-required attributes in DetailsStep | Deferred | Will be addressed in chip redesign |
| Attribute completion progress indicator ("3/3 filled") | Deferred | Nice-to-have with chip redesign |
| Admin ability to reject spam/duplicate reports | Not started | Would require new status (`rejected`) and UI |
| Photo replacement at admin intake | Deferred | Only needed if Option B is ever built |
