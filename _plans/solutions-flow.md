# Solutions Flow Implementation Plan

## Context

The Solutions section is the next stage after Problem Validation in the innovation pipeline. For each validated problem, the user goes through 3 phases: analyse the problem deeper (root cause analysis), discover solutions (brainstorm techniques), and analyse the solutions (feasibility & impact scoring). This flow operates on standalone problems from the global `problems` Rematch model.

## Data Model

New file: `src/types/solution.ts`

```TypeScript
export type RootCause = { id: number; description: string }

export type FiveWhyChain = { id: number; whys: string[] } // 5 entries

export type AffectedGroup = {
  id: number
  name: string
  severity: "" | "low" | "medium" | "high" | "critical"
  description: string
}

export type SolutionCandidate = {
  id: number
  title: string
  description: string
  inspirationSource: "" | "scamper" | "reverse" | "analogy" | "freeform"
  inspirationDetail: string
  feasibility: number | null  // 1-5
  impact: number | null       // 1-5
  cost: number | null         // 1-5
  timeToImplement: number | null // 1-5
  notes: string
}

export type ScamperResponses = {
  substitute: string; combine: string; adapt: string; modify: string
  putToOtherUse: string; eliminate: string; reverse: string
}

export type SolutionStatus = "not_started" | "in_progress" | "complete"

export type Solution = {
  id: number
  problemId: number
  createdAt: string
  editedAt: string
  status: SolutionStatus
  // Step 1: Root Cause Analysis
  rootCauses: RootCause[]
  fiveWhyChains: FiveWhyChain[]
  affectedGroups: AffectedGroup[]
  rootCauseNotes: string
  // Step 2: Solution Discovery
  scamperResponses: ScamperResponses
  reverseBrainstorm: string
  reverseInversion: string
  analogyDomain: string
  analogyInsight: string
  candidates: SolutionCandidate[]
  // Step 3: Solution Analysis
  selectedCandidateId: number | null
  analysisNotes: string
  verdict: "none" | "pursue" | "revisit" | "abandon"
}
```

## Rematch Model

New file: `src/store/solutions-model.ts` — mirrors `src/store/problems-model.ts` pattern:

* Storage key: `"navigate-solutions"`
* State: `{ solutions: Solution[], nextId: number }`
* Reducers: `addSolution`, `removeSolution`, `updateSolution`, `setAll`
* Effects: `init`, `create(problemId)`, `update({ id, patch })`, `delete(id)`

**Files to modify:**

* `src/store/index.ts` — register `solutions` model
* `src/app/root-layout-client.tsx` — add `dispatch.solutions.init()`

## Route Structure (10 step pages)

```
src/app/(app)/solutions/
├── page.tsx                         # MODIFY — listing page (validated problems)
└── [solutionRef]/
    ├── layout.tsx                   # Sidebar nav + SolutionProvider wrapper
    ├── context.tsx                  # SolutionProvider, useSolution, NAV_ITEMS, getAdjacentSteps
    ├── introduction/page.tsx        # Overview of the 3 phases
    │
    │  ── Step 1: Root Cause Analysis ──
    ├── root-causes/page.tsx         # Add/edit root cause descriptions
    ├── five-whys/page.tsx           # 5 Whys chains
    ├── affected-groups/page.tsx     # Who is affected + severity
    │
    │  ── Step 2: Solution Discovery ──
    ├── scamper/page.tsx             # SCAMPER guided exercise (7 prompts)
    ├── reverse-brainstorm/page.tsx  # Make it worse → invert
    ├── analogy/page.tsx             # Cross-domain inspiration
    ├── candidates/page.tsx          # Review/add all solution candidates
    │
    │  ── Step 3: Solution Analysis ──
    ├── analysis/page.tsx            # Score candidates (feasibility/impact/cost/time)
    └── summary/page.tsx             # Ranked comparison + pick winner + verdict
```

## NAV\_ITEMS

```TypeScript
export const NAV_ITEMS = [
  { label: "Introduction",          path: "introduction",        section: null },
  { label: "Root Causes",           path: "root-causes",         section: "Root Cause Analysis" },
  { label: "5 Whys Technique",      path: "five-whys",           section: null },
  { label: "Affected Groups",       path: "affected-groups",     section: null },
  { label: "SCAMPER Method",        path: "scamper",             section: "Solution Discovery" },
  { label: "Reverse Brainstorming", path: "reverse-brainstorm",  section: null },
  { label: "Analogy Thinking",      path: "analogy",             section: null },
  { label: "Solution Candidates",   path: "candidates",          section: null },
  { label: "Score & Compare",       path: "analysis",            section: "Solution Analysis" },
  { label: "Summary & Verdict",     path: "summary",             section: null },
] as const
```

The `section` field (non-null only on the first item of each phase) renders as a small section divider/label in the sidebar nav.

## Page Details

### Solutions Listing (`page.tsx`)

* Show all problems where `validationStatus === "valid"`
* For each: problem description, validation badge, solution status (check if solution record exists)
* "Start" button → `dispatch.solutions.create(problemId)` → navigate to `/solutions/{id}/introduction`
* "Continue" button → navigate to existing solution
* Empty state: "No validated problems yet" with link to Problems

### Introduction

* Problem displayed in highlighted card (from problems store via context)
* Timeline showing the 3 phases with icons
* "Get Started" → root-causes

### Root Causes

* Tabs: "Your Analysis" / "Case Studies"
* Dynamic list: add/remove root cause strings (Input + button pattern from existing-solutions page)

### 5 Whys

* Tabs: "Your Analysis" / "Case Studies"
* Vertical chain of 5 textareas per chain, support multiple chains
* Visual cascade with connecting lines

### Affected Groups

* Tabs: "Your Analysis" / "Case Studies"
* Add/remove groups: name (Input), description (Textarea), severity (ToggleGroup: low/medium/high/critical)

### SCAMPER

* Tabs: "Your Strategy" / "Case Studies"
* 7 Textarea fields with prompts for each SCAMPER letter
* "Add as Candidate" button per section → creates SolutionCandidate

### Reverse Brainstorming

* Tabs: "Your Strategy" / "Case Studies"
* Two Textareas: "How to make it worse?" and "Flip each idea"
* "Add as Candidate" button

### Analogy Thinking

* Tabs: "Your Strategy" / "Case Studies"
* Input for domain, Textarea for insight
* "Add as Candidate" button

### Solution Candidates

* Review all candidates (cards with title, description, source badge)
* Add freeform candidates (title + description)
* Edit/delete inline

### Score & Compare (Analysis)

* Tabs: "Your Strategy" / "Case Studies"
* Per candidate: 4 scoring ToggleGroups (1-5) for feasibility, impact, cost, time
* Comparison table below

### Summary & Verdict

* Ranked list (composite score)
* Select winner radio
* Verdict: Pursue / Revisit / Abandon
* Next steps guidance based on verdict

## Layout

Follows exact pattern from `src/app/(app)/problems/[problemRef]/layout.tsx`:

* Desktop: sticky sidebar (w-56) with section-divided nav + "View Problem" button
* Mobile: collapsible top card
* Content area: right side, full width
* ProblemSummaryDialog for the "View Problem" button (reuse existing component)

## Context Provider

Follows exact pattern from `src/app/(app)/problems/[problemRef]/context.tsx`:

* Reads solution from `state.solutions.solutions.find(s => s.id === solutionId)`
* Reads problem from `state.problems.problems.find(p => p.id === solution.problemId)`
* Each field has a `useCallback` setter dispatching `dispatch.solutions.update({ id, patch })`
* Exports: `SolutionProvider`, `useSolution`, `NAV_ITEMS`, `getAdjacentSteps`

## Implementation Order

1. **Foundation**: `src/types/solution.ts` + `src/store/solutions-model.ts` + register in store + init in root layout
2. **Shell**: context.tsx + layout.tsx + all 10 page stubs (Card + nav buttons only)
3. **Listing**: Rewrite `solutions/page.tsx` with problem table + start/continue
4. **Step 1 pages**: introduction, root-causes, five-whys, affected-groups
5. **Step 2 pages**: scamper, reverse-brainstorm, analogy, candidates
6. **Step 3 pages**: analysis, summary

## Key Files to Modify

* `src/store/index.ts` — add solutions model
* `src/app/root-layout-client.tsx` — add `dispatch.solutions.init()`
* `src/app/(app)/solutions/page.tsx` — rewrite from placeholder

## Key Files to Reference

* `src/store/problems-model.ts` — model pattern
* `src/app/(app)/problems/[problemRef]/context.tsx` — context pattern
* `src/app/(app)/problems/[problemRef]/layout.tsx` — layout pattern
* `src/app/(app)/problems/[problemRef]/introduction/page.tsx` — intro page pattern
* `src/app/(app)/problems/[problemRef]/existing-solutions/page.tsx` — CRUD list pattern
* `src/app/(app)/problems/[problemRef]/validate/page.tsx` — scoring/toggle pattern
* `src/app/(app)/problems/[problemRef]/summary/page.tsx` — summary + verdict pattern

## Verification

1. `npm run lint` — no lint errors
2. `npx tsc --noEmit` — no type errors
3. `npm run test:run` — existing tests pass
4. Manual: create a problem via brainstorm, validate it, then navigate to Solutions listing → Start → walk through all 10 steps → verify data persists on refresh (localStorage)

