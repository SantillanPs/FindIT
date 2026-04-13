# FindIT Backend Design Standards

This document defines the core architecture for data handling and backend communication in the FindIT project. All future features must adhere to "The Supabase Way" and TanStack Query patterns.

---

## 🏛️ Core Principle: "The Supabase Way"
Primary logic should live in the **Database Layer**, not the **Application Layer**. React should be a simple "passenger" that displays data, while Supabase handles the processing.

### 1. Read Operations (Views)
**MANDATORY**: Avoid complex `.select().order().filter()` chains in JavaScript.
- Create a **Postgres View** for any non-trivial fetch.
- **Security**: Mask sensitive data (like full names) inside the View using SQL.
- **Performance**: Move calculations (counts, averages, sorts) into the View.

### 2. Automated Integrity (Triggers)
**MANDATORY**: Never manually update "stats" tables or "count" columns from the frontend.
- Use **Postgres Triggers** to automatically update `hit_counts`, `leaderboard_points`, or `timestamps`.
- This ensures data remains consistent even if a frontend update fails.

### 3. Shared Logic (RPC)
- Use **Functions (RPC)** for complex business logic that involves multiple tables (e.g., "Safe Item Claiming").
- This keeps the logic centralized and reusable for future Mobile or Admin portals.

---

## ⚡ Data Synchronization: TanStack Query
We use `@tanstack/react-query` as our global state and synchronization engine.

### 1. Standard Query Hooks
All data fetching must be wrapped in `useQuery`. 
- **Centralization**: Common data (Categories, Colleges) must stay in `MasterDataContext.jsx`.
- **Cache Management**: Use appropriate `staleTime` (e.g., 1 hour for categories, 5 mins for leaderboards).

### 2. Mutation & Invalidation
- After a successful `INSERT` or `UPDATE`, always use `queryClient.invalidateQueries` to ensure the UI refreshes instantly.

---

## 🔒 Security Architecture: "Privacy by Design"
- **Row Level Security (RLS)**: Must be enabled on every table.
- **Service Role**: Never used in the frontend.
- **Masking**: If a student is anonymous, their `first_name` and `last_name` must be truncated in the **Database View**, never in the JS file.

---

## ✅ Checklist for New Features
- [ ] Is the data sorted/filtered in a **View**?
- [ ] Are sensitive fields masked in **SQL**?
- [ ] Is the fetch handled by **TanStack Query**?
- [ ] Are incremental updates handled by a **Trigger**?
