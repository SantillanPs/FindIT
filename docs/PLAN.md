# PLAN: Forensic Intake Optimization (Anti-Cry-for-Help)

## Goal Description
Students are currently using the Lost Item Report narrative as a "cry for help" or emotional vent rather than providing physical item details. This plan aims to shift the intake process from a "storytelling" focus to a "forensic" focus by enforcing attribute verification and refining UI prompts.

## Proposed Changes

### `src/components/ReportFlow/NarrativeIntakeStep.jsx`
- **[MODIFY] Copy Refinement**: Change "Tell us your story" to "Describe the Item Forensics".
- **[MODIFY] Subtext Update**: Update the subtext to explicitly ask for physical characteristics (color, brand, material, unique marks) instead of "what happened".
- **[MODIFY] Placeholder Update**: Update the textarea placeholder to show a forensic-style description example.

### `src/pages/Student/ReportLostItem.jsx`
- **[MODIFY] Step Configuration**: Increase `totalSteps` from 5 to 6.
- **[MODIFY] AI Enablement**: Set `showAI={true}` for `NarrativeIntakeStep` to trigger the analysis engine.
- **[MODIFY] Step Injection**: Insert `DetailsStep` as the new Step 2.
- **[MODIFY] Analysis Handling**: Implement `onAnalysisComplete` to map AI-extracted data (category, title, attributes, synthesized description) into the `formData`.
- **[MODIFY] Flow Logic**: Ensure the transition between Step 1 (Narrative), Step 2 (Details Review), and subsequent location/time/image steps is seamless.

### `src/components/ReportFlow/DetailsStep.jsx`
- **[MODIFY] UI Polish**: Ensure the "Parsed Attributes" section is prominent to show the student exactly what data points the system actually cares about for matching.

## User Review Required
> [!IMPORTANT]
> This plan significantly changes the first-step experience for students. Instead of a simple narrative, they will now be presented with an AI-parsed "Details" review page. This forces them to focus on the item's physical data.

## Open Questions
- Should we allow students to skip the AI analysis if they prefer a manual form? (The current `DetailsStep` already allows manual adjustment, so I recommend keeping AI mandatory for better data quality).
- Do we want to add "SOS" keyword detection to gently nudge the user to add more item details if they are too emotional? (Future enhancement).

## Verification Plan
1.  **Manual Test**: Submit a lost report as a student.
2.  **Verify Analysis**: Ensure the "Details" step correctly displays the AI-extracted brand, color, and category.
3.  **Visual Audit**: Check that the new "Forensic" copy in Step 1 feels professional and objective.
4.  **Lint**: Run `lint_runner.py` to ensure no syntax regressions.
