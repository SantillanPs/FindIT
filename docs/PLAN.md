# docs/PLAN.md: UI Compaction Orchestration

## Strategy
Redesign the `ManualIntakeModal` footer to ensure compatibility with thin mobile devices (320px+) while maintaining "Pro Max" aesthetics.

## Proposed Actions
1. **Frontend Specialist**:
   - Shorten labels: "Dismiss" -> "X" (Icon) or "Back", "Store & Add Next" -> "Next", "Store Record" -> "Store".
   - Reduce height: `h-[60px]` -> `h-14`.
   - Responsive Flex: Use `flex-row items-center justify-between` for standard screens, `flex-col` or `compact-horizontal` for mobile.
2. **Mobile Developer**:
   - Tweak touch targets (min 44px).
   - Ensure `gap-4` is reduced to `gap-2` for horizontal fit.
   - Implement "High-Density" mode for the loop footer.
3. **Test Engineer**:
   - Verify linting and logic.
   - Audit mobile touch surfaces.

## Verification
- Lint check.
- Manual verification of modal closing/loop logic.

---
*Orchestrated by Antigravity.*
