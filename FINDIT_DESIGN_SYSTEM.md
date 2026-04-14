# FindIT Design & UI System (Admin Dashboard)

## 0. The "Thin Device" Mandate (#1 PRIORITY)
Every design choice in FindIT must revolve around the fact that **every user will be on a thin mobile phone.** 
- **Density Over White-Space**: High information density is a requirement, not a suggestion. Wasted empty space is a failure.
- **The "Thumb-Reach" Rule**: High-frequency actions MUST be reachable with one thumb on a vertical device.
- **Zero-Latency Persistence**: Eliminate "Save" buttons. Status changes must automatically persist notes/data.
- **Micro-Typography**: Optimization for 320px - 360px widths (iPhone SE / Mini). Use text-sm and text-xs extensively.


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
