# FindIT Design & UI System (Admin Dashboard)

## Core Philosophy
FindIT is a **High-End Campus Utility**. It should feel premium, trustworthy, and extremely fast. Avoid "fantasy" or "military" metaphors. Focus on **Apple-tier professionalism**.

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
  - **Minimum Size**: Secondary text must be at least `text-[11px]` (0.6875rem). Primary body must be at least `text-[13px]` or `text-sm`.
  - **High Contrast**: Avoid `slate-500` for text on dark backgrounds. Use `slate-400` as the absolute minimum for visibility, preferring `slate-300` for readable metadata.
  - **Hierarchy**: Use weight and color contrast (e.g., White vs Slate-300) rather than just size to distinguish information layers.
- **Density**: High information density but with generous whitespace (no overcrowding).

## 3. Visual Language (Sleek Pro)
- **Glassmorphism**: `backdrop-blur-xl`, `bg-slate-900/40`, `border-white/5`.
- **Gradients**: Subtle, ultra-smooth gradients using the `uni-500` (Sky) and `amber-500` accents.
- **Shadows**: Large, soft shadows (`shadow-2xl`).
- **Animations**: Use `framer-motion` for smooth entry/exit (~0.3s). Avoid bouncy, playful motion.

## 4. Mobile Execution
- **Thumb-Friendly**: Primary buttons (Secure/Link) must be large and accessible.
- **Scanning**: Cards should facilitate quick scanning. Use icons to define "Location" and "Finder."
