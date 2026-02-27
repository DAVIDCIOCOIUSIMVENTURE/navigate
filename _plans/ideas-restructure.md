# Ideas Restructure — Implementation Plan

**Spec:** `_specs/ideas-restructure.md`
**Date:** 2026-02-27

---

## Context

The app currently exposes Problem Discovery, Problem Validation, Solution Ideation, and Solution Validation as disconnected top-level routes. The restructure groups them under a single **Idea** concept — each idea is an independent container that tracks a user's innovation journey through stages. The existing client-state workflows are reused and adapted; no new DB persistence is added in this phase.

---

## Phase Overview

```
Phase 1 — Data layer & global Ideas context
Phase 2 — /ideas index page
Phase 3 — Idea creation flow (new idea modal + mode selection)
Phase 4 — /ideas/[ideaId] shell (layout, stage bar, routing)
Phase 5 — Problem Discovery stage (scoped under idea)
Phase 6 — Problem Validation stage (scoped under idea, multi-problem)
Phase 7 — Idea Canvas
Phase 8 — Navigation cleanup (delete old routes, update sidebar/nav)
Phase 9 — Dashboard update
```

---

## Phase 1 — Data Layer & Global Ideas Context

### 1.1 Move shared types to a central location

Create `src/types/idea.ts` — consolidate and re-export all types that are used across stages:

```typescript
// Re-exported from innovation-context for backward compat:
export type { CustomerFields, Job, ProblemItem, ImpactItem, ValidationStatus, ProblemValidation }

export type Idea = {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  mode: "guided" | "quickstart"

  // Problem Discovery
  customer: CustomerFields
  jobs: Job[]
  problems: ProblemItem[]

  // Problem Validation (keyed by problemId via array)
  validations: ProblemValidation[]
  selectedProblemId: number | null

  // Stage flags
  problemDiscoveryComplete: boolean
  problemValidationComplete: boolean
}
```

### 1.2 Create Ideas context

Create `src/context/ideas-context.tsx`:

```typescript
type IdeasContextValue = {
  ideas: Idea[]
  createIdea: (mode: "guided" | "quickstart") => Idea
  updateIdea: (id: number, patch: Partial<Idea>) => void
  getIdea: (id: number) => Idea | undefined
}
```

- `createIdea` auto-names as "Idea 1", "Idea 2" (based on `ideas.length + 1`), sets `createdAt`, returns new Idea
- State lives in `useState<Idea[]>([])` — no DB persistence yet
- Provider exported as `IdeasProvider`
- Hook exported as `useIdeas()`

### 1.3 Mount IdeasProvider in root layout

**File:** `src/app/root-layout-client.tsx`

Wrap the existing tree with `<IdeasProvider>` at the same level as `InnovationProvider`. The old `InnovationProvider` can remain temporarily (it's used by old routes being deleted later — remove it in Phase 8).

---

## Phase 2 — /ideas Index Page

### Files to create

- `src/app/ideas/page.tsx` — ideas list
- `src/app/ideas/layout.tsx` — minimal wrapper (no sidebar change needed; global sidebar handles it)

### `page.tsx` behaviour

- `useIdeas()` to get all ideas
- If `ideas.length === 0`: empty state card with "Start Generating New Idea" button
- If ideas exist: grid/list of idea cards + "Start Generating New Idea" button in top-right
- Each idea card shows:
  - Title (editable inline or via small rename icon)
  - Customer segment name (`idea.customer.segmentName` or "No segment yet")
  - Stage progress: 4 dot/icon indicators (Problem Discovery, Problem Validation, Solution Discovery, Solution Validation) — filled/outlined based on `problemDiscoveryComplete`, `problemValidationComplete`
  - "Open" button → navigates to `/ideas/[id]`

### Rename idea

Inline rename: clicking the title shows an `<input>` in place; on blur/Enter, calls `updateIdea(id, { title })`.

---

## Phase 3 — New Idea Creation Flow

### Files to create

- `src/app/ideas/new/page.tsx` — mode selection page

### Flow

1. "Start Generating New Idea" button on the ideas index navigates to `/ideas/new`
2. `/ideas/new` shows two large option cards:
   - **Guided Journey** — "Walk me through it step by step"
   - **Quick Start** — "I already know what I'm doing"
3. On selection:
   - Call `createIdea(mode)` — returns new idea with auto-generated id and title
   - **Guided:** `router.push(`/ideas/${idea.id}/problem-discovery/customers`)`
   - **Quick Start:** `router.push(`/ideas/${idea.id}/canvas`)`

---

## Phase 4 — Idea Shell Layout

### Files to create

- `src/app/ideas/[ideaId]/layout.tsx` — provides idea-scoped context + stage bar
- `src/app/ideas/[ideaId]/page.tsx` — redirect to current stage

### `layout.tsx`

Reads `ideaId` from params, looks up idea via `useIdeas()`.

Renders:
```
IdeaShellLayout
├── Stage bar (horizontal, top of content area — below global header)
│   ├── Stage 1: Problem Discovery  [dot indicator]
│   ├── Stage 2: Problem Validation [dot indicator]
│   ├── Stage 3: Solution Discovery [dot indicator, dimmed]
│   └── Stage 4: Solution Validation [dot indicator, dimmed]
└── children (the stage content with its own nested layout)
```

Stage bar items are clickable links to the stage root (e.g., `/ideas/[id]/problem-discovery/customers`). Disabled for future stages.

### `page.tsx`

Redirect logic:
- If `problemDiscoveryComplete` → redirect to `/ideas/[id]/problem-validation/pick-a-problem`
- Else → redirect to `/ideas/[id]/problem-discovery/customers`

---

## Phase 5 — Problem Discovery Stage

### Files to create

```
src/app/ideas/[ideaId]/problem-discovery/
├── context.tsx        ← adapted from guided-workflow/context.tsx
├── layout.tsx         ← adapted from guided-workflow/layout.tsx
├── customers/
│   └── page.tsx       ← adapted from guided-workflow/customers/page.tsx
├── jobs-to-be-done/
│   └── page.tsx       ← adapted from guided-workflow/jobs-to-be-done/page.tsx
├── problems/
│   └── page.tsx       ← adapted from guided-workflow/problems/page.tsx
└── summary/
    └── page.tsx       ← adapted from guided-workflow/summary/page.tsx
```

### `context.tsx`

Adapted from `src/app/problem-discovery/guided-workflow/context.tsx` with changes:
- Remove steps not needed (introduction, pick-a-problem — those move to validation)
- `NAV_ITEMS` becomes 4 steps: Customers, Jobs to Be Done, Problems, Summary
- `BASE` = `/ideas/${ideaId}/problem-discovery` (dynamic — passed via provider prop or read from URL)
- State reads/writes to the parent idea via `updateIdea()` from `useIdeas()`:
  - On mount, initialise from `idea.customer`, `idea.jobs`, `idea.problems`
  - Each setter also calls `updateIdea(ideaId, { customer: ... })` to persist to ideas store

### `layout.tsx`

Same pattern as `guided-workflow/layout.tsx`:
- Wraps children with `ProblemDiscoveryProvider`
- Left sidebar: step nav buttons + customer segment name card (once `customer.segmentName` is set)
- **Self Discovery triggers panel**: collapsible panel in sidebar showing problem triggers from `useInnovation()` (the global triggers from Self Discovery). Labelled "Your Problem Triggers" — read-only reference list. This satisfies the resolved decision on Self Discovery integration.

### `summary/page.tsx`

- Shows all jobs + problems per job
- If no problems: warning banner "You haven't added any problems yet. You can still continue, but you'll need to come back and add problems before validating." + "Continue to Problem Validation" button
- If problems exist: "Continue to Problem Validation" button → `router.push(`/ideas/${ideaId}/problem-validation/pick-a-problem`)` + calls `updateIdea(ideaId, { problemDiscoveryComplete: true })`

### URL navigation

`getAdjacentSteps()` adapted to use dynamic base path: `/ideas/${ideaId}/problem-discovery`.

---

## Phase 6 — Problem Validation Stage

### Files to create

```
src/app/ideas/[ideaId]/problem-validation/
├── context.tsx         ← adapted from problem-validation/context.tsx
├── layout.tsx          ← adapted from problem-validation/layout.tsx
├── pick-a-problem/
│   └── page.tsx        ← adapted from problem-validation/pick-a-problem/page.tsx
├── alternatives/
│   └── page.tsx
├── context-step/
│   └── page.tsx
├── shortcomings/
│   └── page.tsx
├── emotional-impact/
│   └── page.tsx
├── quantifiable-impact/
│   └── page.tsx
└── verdict/
    └── page.tsx
```

### `context.tsx`

Adapted from `src/app/problem-validation/context.tsx` with changes:
- Instead of reading problems from global `InnovationProvider`, reads from `getIdea(ideaId).problems`
- Instead of saving validations to `InnovationProvider`, saves to `updateIdea(ideaId, { validations: [...] })`
- `loadValidation(problemId)` looks up in `idea.validations`
- `saveValidation()` calls `updateIdea(ideaId, { validations: upserted, selectedProblemId })`
- Multi-problem: `setSelectedProblemId` auto-saves current validation before loading next (calls `saveValidation()` before `loadValidation(newId)`)

### `pick-a-problem/page.tsx`

- If `idea.problems.length === 0`: empty state with message + "Back to Problem Discovery" button → `/ideas/${ideaId}/problem-discovery/problems`
- If problems exist: grouped by job, each showing validation status badge (`unvalidated` / `in_progress` / `valid` / `invalid`)
- Clicking a problem sets `selectedProblemId` → auto-navigates to `/alternatives`

### `verdict/page.tsx`

On verdict save:
- If all problems now have `valid` or `invalid` status: call `updateIdea(ideaId, { problemValidationComplete: true })`
- Redirect to `/ideas/${ideaId}/problem-validation/pick-a-problem` (so user can pick another problem or see overview)

### `layout.tsx`

Same sidebar pattern. Sidebar shows:
- Step nav buttons
- Currently selected problem name card (once a problem is selected)
- Status summary: "X of Y problems validated"

---

## Phase 7 — Idea Canvas

### Files to create

- `src/app/ideas/[ideaId]/canvas/page.tsx`

### Behaviour

Reads from `getIdea(ideaId)`:
- **Customer Segment card**: `idea.customer.*`
- **Core Problem card**: best candidate = first `valid` validation, else first problem
- **Context card**: from `selectedValidation.contextWhen`
- **Alternatives card**: from `selectedValidation.alternatives`
- **Shortcomings card**: from `selectedValidation.shortcomings`
- **Emotional Impact card**: from `selectedValidation.emotionalImpact`
- **Quantifiable Impact card**: from `selectedValidation.impacts`

Each card is editable via dialog (same pattern as existing `src/app/problem-discovery/page.tsx`). Edits call `updateIdea()` directly.

For quick-start ideas: all cards start empty and are freely editable.

**Reuse:** The canvas card + dialog pattern from `src/app/problem-discovery/page.tsx` can be extracted into shared components if desired, but is not required — copy-and-adapt is fine for now.

---

## Phase 8 — Navigation Cleanup

### 8.1 Update `src/config/navigation.ts`

Remove `problemDiscovery` and `solution` groups. Add:
```typescript
ideas: [{ title: "Ideas", url: "/ideas", icon: Lightbulb }]
```

New structure:
```typescript
navigationItems = {
  board: [],
  ideas: [{ title: "Ideas", url: "/ideas", icon: Lightbulb }],
  selfDiscovery: [{ title: "Self Discovery", url: "/self-discovery", icon: Compass }],
}
```

### 8.2 Update `src/components/app-sidebar.tsx`

Replace the `problemDiscovery` and `solution` nav item loops with the new `ideas` group.

### 8.3 Delete old route trees

Delete entire directories:
- `src/app/problem-discovery/` (all subdirectories and files)
- `src/app/problem-validation/` (all subdirectories and files)
- `src/app/solution-ideation/` (placeholder page, just delete)
- `src/app/solution-validation/` (placeholder page, just delete)

### 8.4 Remove InnovationProvider from root layout

Once old routes are deleted, `src/context/innovation-context.tsx` and its usage in `src/app/root-layout-client.tsx` can be removed. The `Idea` type in `src/types/idea.ts` carries all that data per-idea now.

---

## Phase 9 — Dashboard Update

**File:** `src/app/page.tsx`

- Replace the hardcoded stats with live counts from `useIdeas()`:
  - "Ideas" count: `ideas.length`
  - "Problems discovered": sum of `idea.problems.length` across all ideas
  - "Problems validated": count of validations with status `valid` or `invalid`
- Update quick-action links to point to `/ideas` (instead of `/problem-discovery`)
- Keep the triple-diamond image and achievements section as-is

---

## Critical Files Reference

| File | Action |
|------|--------|
| `src/context/ideas-context.tsx` | **Create** — new global Ideas state |
| `src/types/idea.ts` | **Create** — shared Idea type |
| `src/app/root-layout-client.tsx` | **Modify** — add IdeasProvider, later remove InnovationProvider |
| `src/app/ideas/page.tsx` | **Create** — ideas index |
| `src/app/ideas/new/page.tsx` | **Create** — mode selection |
| `src/app/ideas/[ideaId]/layout.tsx` | **Create** — stage bar shell |
| `src/app/ideas/[ideaId]/problem-discovery/context.tsx` | **Create** — adapted from `guided-workflow/context.tsx` |
| `src/app/ideas/[ideaId]/problem-discovery/layout.tsx` | **Create** — adapted from `guided-workflow/layout.tsx` |
| `src/app/ideas/[ideaId]/problem-discovery/*/page.tsx` | **Create** — 4 step pages |
| `src/app/ideas/[ideaId]/problem-validation/context.tsx` | **Create** — adapted from `problem-validation/context.tsx` |
| `src/app/ideas/[ideaId]/problem-validation/layout.tsx` | **Create** — adapted from `problem-validation/layout.tsx` |
| `src/app/ideas/[ideaId]/problem-validation/*/page.tsx` | **Create** — 7 step pages |
| `src/app/ideas/[ideaId]/canvas/page.tsx` | **Create** — idea canvas |
| `src/config/navigation.ts` | **Modify** — replace problem/solution nav with Ideas |
| `src/components/app-sidebar.tsx` | **Modify** — update nav groups rendered |
| `src/app/problem-discovery/` | **Delete** |
| `src/app/problem-validation/` | **Delete** |
| `src/app/solution-ideation/` | **Delete** |
| `src/app/solution-validation/` | **Delete** |
| `src/context/innovation-context.tsx` | **Delete** (Phase 8, after old routes gone) |
| `src/app/page.tsx` | **Modify** — live idea stats |

---

## Reuse Notes

- **Layout pattern**: Copy sidebar + nav-button pattern from `guided-workflow/layout.tsx` — don't invent a new one
- **Step navigation**: Copy `getAdjacentSteps()` pattern from `guided-workflow/context.tsx` / `problem-validation/context.tsx`; adapt base path to be dynamic
- **Canvas cards**: Copy card+dialog edit pattern from `src/app/problem-discovery/page.tsx`
- **Status badges**: Copy badge pattern from `problem-validation/pick-a-problem/page.tsx`
- **Field display**: Copy `Field` component pattern from summary pages
- **Button variants**: `variant="secondary"` for active step, `variant="ghost"` for inactive — consistent across all sidebars

---

## Verification

1. `npm run dev` — app starts on port 4000, no console errors
2. Navigate to `/ideas` — empty state shown with CTA
3. Create a **Guided** idea — auto-named "Idea 1", lands on `/ideas/1/problem-discovery/customers`
4. Fill in customers → jobs → problems → summary — data persists across steps; summary shows all problems
5. Continue to Problem Validation → pick a problem → fill in all 6 steps → give a verdict
6. Return to Pick a Problem — status badge updates for that problem; other problems still show "unvalidated"
7. Pick a second problem — previous validation data preserved; new problem loads blank
8. Navigate to `/ideas/1/canvas` — cards show validated problem data
9. Create a **Quick Start** idea — auto-named "Idea 2", lands directly on `/ideas/2/canvas`
10. Edit a canvas card — changes persist when navigating away and back
11. `/ideas` index shows both ideas with correct stage progress indicators
12. Global sidebar shows "Ideas" link only (no Problem Discovery / Problem Validation entries)
13. Old URLs (`/problem-discovery`, `/problem-validation`) return 404
14. Dashboard stats reflect live idea/problem counts
