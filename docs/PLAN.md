# Feature: Stale Item Indicators (Orchestration Phase 1)

## 🎼 Orchestration Report (Phase 1)

### Task
Implement a visual indicator for items that have remained unclaimed for a long duration, signaling they are candidates for archiving or disposal.

### Mode
plan

### Agents Involved in Planning
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | `project-planner` | Business logic & Stale thresholds | ✅ |
| 2 | `database-architect` | Query optimization for age-based detection | ✅ |
| 3 | `frontend-specialist` | UI/UX indicator design | ✅ |

### Key Perspectives Analysis

#### 1. [project-planner] Business Logic
- **Threshold**: 30 days is the standard industry threshold for "stale" found items.
- **Criteria**: 
    - `status` is 'available' or 'in_custody'.
    - `identified_name` is NULL (Unknown owner).
    - `date_found` is > 30 days old.
- **Goal**: Encourage admins to process these items (donate/dispose) and inform public users that the item is nearing its holding limit.

#### 2. [database-architect] Data Detection
- **Implementation**: We can calculate the "Age" in the frontend or update the view. Since we want real-time accuracy, we'll calculate it in the frontend component using the `date_found` field.
- **Calculation**: `(CurrentDate - DateFound) / (1000 * 60 * 60 * 24) >= 30`.

#### 3. [frontend-specialist] UI/UX Design
- **Admin Dashboard**: Add a "Stale" badge on `InventoryCard` with a distinct color (Amber/Slate) and a tooltip.
- **Landing Page**: Add a subtle "Holding Period: 30+ Days" badge on `ItemCard`. 
- **Design Aesthetic**: Use a "Vintage" or "Faded" aesthetic for the badge to imply age without being alarmist.

## Proposed Changes

### [MODIFY] `src/components/ItemCard.jsx` (Landing)
- Add logic to calculate `isStale`.
- Render an "Unclaimed for 30+ days" badge in the top-right or bottom-left.

### [MODIFY] `src/pages/Admin/components/InventoryCard.jsx` (Admin)
- Add logic to calculate `isStale`.
- Render a "Stale / Archive Candidate" badge with a clock icon.

### [MODIFY] `src/pages/Admin/AdminDashboard.jsx`
- (Optional) Add a quick-filter for "Stale Items" to help admins clear the backlog.

## Verification Plan
1. Test with items found 31 days ago → Verify badge appears.
2. Test with items found 5 days ago → Verify no badge.
3. Verify mobile responsiveness on thin screens.

---

**Do you approve this plan? (Y/N)**
- **Y**: I will orchestrate the implementation.
- **N**: Let me know if you want a different threshold or visual style.
