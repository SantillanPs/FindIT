# PLAN: Friendly Narrative Voice Integration

## Objective
Shift the AI synthesis engine from formal forensic extraction to a "Friendly Narrative" persona. This makes the system more approachable for students and guests while maintaining forensic accuracy for matching.

## Phase 1: AI Prompt Refinement (Backend)
- **Agent**: `backend-specialist`
- **File**: `supabase/functions/analyze-lost-description/index.ts`
- **Changes**:
    - Rewrite `system_instruction` to adopt a helpful, friendly persona.
    - Instruct the model to use simple, conversational English.
    - Explicitly forbid jargon like "distinguishing features" or "referenced item."
    - Ensure logical translation from non-English inputs into this "Friendly English" voice.

## Phase 2: User Experience Simplification (Frontend)
- **Agent**: `frontend-specialist`
- **Files**: 
    - `src/components/ReportFlow/DetailsStep.jsx`
    - `src/components/ReportFlow/NarrativeIntakeStep.jsx`
- **Changes**:
    - Update Step 2 headers: "What we understood" -> "How we'll describe it".
    - Update sub-copy: "Parsed your story" -> "We've created a simple summary for you."
    - Change branding from "AI Synthesis" to "Smart Summary" or "Friendly Help."

## Phase 3: Verification & Polish
- **Agent**: `test-engineer`
- **Task**: 
    - Verify multilingual synthesis (e.g., Tagalog narrative results in friendly English).
    - Ensure UI responsiveness with the new, potentially longer narrative text.
