# FindIT Core Architecture: Forensic Matching Handbook

## The "Graduated Strictness" Model

To achieve 99% accuracy in property recovery, FindIT uses a 3-tier data architecture. This model balances the rigid needs of database logistics with the fuzzy reality of human memory and visual ambiguity.

---

### Tier 1: Rigid Attributes (The Container)
**Examples**: `Category`, `Found Location`, `Status`.

- **Philosophy**: Binary and strict.
- **Purpose**: Powering the Admin Dashboards, analytics, and primary sorting.
- **Matching Rule**: These act as **Hard Filters**. If a user is looking for a "Wallet," the engine will NOT suggest a "Phone," even if the patterns match.

---

### Tier 2: Suggested Attributes (The Identity)
**Examples**: `Brand`, `Model`, `Primary Color`.

- **Philosophy**: Suggestive but non-blocking.
- **Purpose**: Guiding the search and handling near-duplicate products.
- **Matching Rule**: These act as **Weighted Vectors**. 
    - A perfect Brand match (Apple === Apple) adds significant score.
    - A "Family" match (iPhone 12 === iPhone 13) adds a partial score.
    - **Crucial**: A mismatch here does NOT discard the potential match.

---

### Tier 3: Fluid Attributes (The Forensic DNA)
**Examples**: `Forensic Tags` (Wallpapers, scratches, specific stickers, serial suffixes).

- **Philosophy**: High-fidelity and unique.
- **Purpose**: definitively proving ownership.
- **Matching Rule**: These act as **Anchors**. 
    - If a unique forensic tag matches (e.g., "Matched on Carrier TNT"), it can override Tier 2 mismatches. 
    - These are the ultimate "Truth" in the FindIT ecosystem.

---

## The Temporal Window (The Anchor)

Because students often delay reporting lost items or lose their only reporting device, we do not use "Found Time" as a hard filter. 

- **Anchor**: `last_seen_at`.
- **Window**: ± 48 hours is the highest priority window. 
- **Rule**: If a high-fidelity Forensic Match is detected, the temporal window is automatically ignored (Evidence of Identity overrides Evidence of Timing).

---

## Admin Transparency

Admins have full visibility into the AI's "Reasoning Tags." The system will flag conflicts (e.g., *"Model Mismatch but Forensic Hit"*) to ensure the final human decision is informed by the platform's visual intelligence.
