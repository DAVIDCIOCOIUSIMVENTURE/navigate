# Ideas Restructure — Feature Specification

**Date:** 2026-02-27
**Status:** Draft

---

## Overview

The application is being restructured around the concept of an **Idea**. Each idea represents a focused innovation attempt: identify a customer segment, discover and validate a core problem for that segment, then discover and validate a solution.

The current routes (Problem Discovery, Problem Validation, Solution Ideation, Solution Validation) will no longer exist as standalone top-level destinations. They will instead become **stages within an idea**.

---

## The Idea Model

An idea is a container that tracks progress through four sequential stages:

```
Idea
├── Stage 1: Problem Discovery
│   └── Customer segment, jobs to be done, problems per job
├── Stage 2: Problem Validation
│   └── Pick a problem → validate it (context, alternatives, impacts, verdict)
├── Stage 3: Solution Discovery   [future scope]
│   └── Brainstorm solutions for the validated problem
└── Stage 4: Solution Validation  [future scope]
    └── Validate a chosen solution
```

**Output of a completed idea:** A canvas showing:
- Selected customer segment
- Core validated problem (with context, impact, alternatives)
- Validated chosen solution

---

## Ideas Index Page (`/ideas`)

This becomes the primary landing page for the main innovation workflow (replaces the current top-level nav items for Problem Discovery, Problem Validation, etc.).

### What it shows

- A **list/grid of all ideas** the user has created, each showing:
  - Idea title (auto-generated or user-named, e.g., "Idea #1", "Busy Professionals – Time Management")
  - Customer segment name (if set)
  - Current stage indicator (Problem Discovery / Problem Validation / Solution Discovery / Solution Validation)
  - Stage completion status per stage (e.g., progress dots or icons)
  - Date created / last updated
  - Quick-access link to open the idea
- A prominent **"Start Generating New Idea"** button

### Empty state

When no ideas exist, show an encouraging empty state with the "Start Generating New Idea" CTA.

---

## Creating a New Idea

When the user clicks "Start Generating New Idea", they are presented with a **choice modal or page**:

### Option A: Guided Journey

> "Walk me through it step by step"

Takes the user through the full four-stage guided workflow:

1. **Problem Discovery** — Define customer segment, jobs to be done, and problems
2. **Problem Validation** — Pick and validate a problem
3. **Solution Discovery** — (future) Brainstorm solutions
4. **Solution Validation** — (future) Validate a solution

Navigation is linear with the ability to go back. Each stage must be completed (or skipped with a warning) before moving to the next.

### Option B: Quick Start

> "I already know what I'm doing"

Takes the user directly to the **Idea Canvas** for that idea — a free-form canvas with all cards visible and editable immediately:

- Customer Segment card
- Core Problem card (with context, alternatives, quantifiable impact, emotional impact)
- Solution card (future)

The canvas is the same output view that the guided journey produces, but pre-populated/empty for direct editing.

---

## Idea Detail — Guided Journey

### URL structure

```
/ideas/[ideaId]                          → redirects to current stage
/ideas/[ideaId]/problem-discovery        → Problem Discovery stage root
/ideas/[ideaId]/problem-discovery/customers
/ideas/[ideaId]/problem-discovery/jobs-to-be-done
/ideas/[ideaId]/problem-discovery/problems
/ideas/[ideaId]/problem-discovery/summary

/ideas/[ideaId]/problem-validation       → Problem Validation stage root
/ideas/[ideaId]/problem-validation/pick-a-problem
/ideas/[ideaId]/problem-validation/alternatives
/ideas/[ideaId]/problem-validation/context
/ideas/[ideaId]/problem-validation/shortcomings
/ideas/[ideaId]/problem-validation/emotional-impact
/ideas/[ideaId]/problem-validation/quantifiable-impact
/ideas/[ideaId]/problem-validation/verdict

/ideas/[ideaId]/canvas                   → Idea Canvas (output view)
```

### Navigation / layout

- A top-level stage bar shows the four stages (Problem Discovery, Problem Validation, Solution Discovery, Solution Validation) with completion status
- Within each stage, a sidebar shows the steps for that stage
- Breadcrumb: Ideas → [Idea Title] → [Stage] → [Step]
- The sidebar for Problem Discovery shows the customer segment name once set
- The sidebar for Problem Validation shows the currently selected problem once set

---

## Problem Discovery Stage (within an idea)

Consolidates the current `/problem-discovery/guided-workflow` flow and relevant parts of `/problem-discovery/find-new-problems/finding-my-customers`.

### Steps

1. **Customers** — Define the customer segment:
   - Segment name, occupation, age range
   - Who they are, what they do
   - Goals & motivations
   - Frustrations & challenges

2. **Jobs to Be Done** — For the defined customer, list jobs:
   - Job description
   - Functional dimension
   - Emotional dimension
   - Social dimension

3. **Problems** — For each job, list problems the customer faces:
   - Problems are associated with a specific job
   - Multiple problems per job are allowed
   - Problems are listed in aggregate (all jobs visible)

4. **Summary** — Review all problems across all jobs before proceeding to validation

### Key behaviour

- All data belongs to this specific idea (isolated per ideaId)
- The user can return and edit any step at any time
- Changes to customers/jobs/problems persist within the idea

---

## Problem Validation Stage (within an idea)

Maps closely to the current `/problem-validation` workflow but is now scoped to an idea.

### Multi-problem validation

This is the critical requirement: **an idea can have many problems** (from multiple jobs), and the user should be able to validate any of them. All validations are retained simultaneously.

#### Pick a Problem

- Displays all problems discovered in the Problem Discovery stage, grouped by job
- Each problem shows its current validation status: `unvalidated` / `in_progress` / `valid` / `invalid`
- The user selects one problem to validate (or continue validating)
- Selecting a different problem loads that problem's saved validation state
- Previously entered data for other problems is preserved

#### Validation steps (per selected problem)

1. **Pick a Problem** — Select which problem to validate (as above)
2. **Alternatives** — What solutions currently exist for this problem?
3. **Context** — When/where does this problem occur?
4. **Shortcomings** — Why do current alternatives fall short?
5. **Emotional Impact** — How does this make the customer feel?
6. **Quantifiable Impact** — Measurable costs (time lost, money wasted, etc.)
7. **Verdict** — Is this problem valid? Mark as `valid` or `invalid` with a reason

#### Switching problems mid-validation

- Auto-save the current problem's validation state when switching to another problem
- Load the new problem's saved state (or blank if never started)
- The step indicator shows which step the user was on per problem (resume from last step)
- The user can navigate freely between problems without losing data

#### Problem validation status summary

At the Pick a Problem step (and on the stage summary), show a status overview:
- How many problems are validated / invalid / in progress / unvalidated
- Which problem is currently selected

---

## Idea Canvas (`/ideas/[ideaId]/canvas`)

A visual canvas view that acts as both:
1. The **quick start entry point** (all cards empty, directly editable)
2. The **output/summary view** for the guided journey (cards populated from guided data)

### Canvas cards

| Card | Contents |
|------|----------|
| **Customer Segment** | Segment name, occupation, age range, who they are, goals, frustrations |
| **Core Problem** | Selected validated problem text, associated job |
| **Context** | When/where the problem occurs |
| **Alternatives** | Current solutions the customer uses |
| **Shortcomings** | Why alternatives fall short |
| **Emotional Impact** | How the problem makes the customer feel |
| **Quantifiable Impact** | Time lost, money wasted, frequency, etc. |
| **Solution** | (future) Validated solution |

### Behaviour

- Each card is editable via modal dialog (inline edit)
- In quick-start mode, all cards start empty
- In guided mode, cards are populated from the idea's stage data
- Edits made on the canvas sync back to the underlying idea data (same source of truth)

---

## Data Model (Client-Side State)

> Note: The app is currently client-state only (no DB persistence for these flows). This spec does not require DB persistence — state management approach to be decided during implementation.

### Idea

```typescript
type Idea = {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  mode: "guided" | "quickstart"

  // Problem Discovery data
  customer: CustomerFields
  jobs: Job[]
  problems: ProblemItem[]

  // Problem Validation data (one per problem)
  validations: ProblemValidation[]
  selectedProblemId: number | null  // last problem being validated

  // Stage completion flags
  problemDiscoveryComplete: boolean
  problemValidationComplete: boolean
  // solutionDiscoveryComplete: boolean  (future)
  // solutionValidationComplete: boolean (future)
}
```

### Types (reuse existing from `src/context/innovation-context.tsx`)

- `CustomerFields` — unchanged
- `Job` — unchanged
- `ProblemItem` — unchanged
- `ProblemValidation` — unchanged
- `ImpactItem` — unchanged
- `ValidationStatus` — unchanged

### Ideas store / context

A new top-level context or Rematch model manages the list of ideas:

```typescript
type IdeasState = {
  ideas: Idea[]
  activeIdeaId: number | null
}
```

Key operations:
- `createIdea(mode)` → creates new Idea, sets activeIdeaId
- `updateIdea(id, patch)` → partial update
- `getIdea(id)` → lookup by id
- `setActiveIdea(id)`

---

## Navigation Changes

### Sidebar

The current top-level nav items (Problem Discovery, Problem Validation, Solution Ideation, Solution Validation) are **removed** from the sidebar.

New sidebar structure:

```
Navigate (logo)
├── Dashboard (/)
├── Ideas (/ideas)          ← new primary destination
└── Self Discovery (/self-discovery)
```

> Solution Ideation and Solution Validation will return as stages within Ideas once implemented.

### Routing

- `/problem-discovery/*` routes — retired (or redirected)
- `/problem-validation/*` routes — retired (or redirected)
- `/ideas` — new index
- `/ideas/[ideaId]/*` — new idea detail routes

---

## Out of Scope (Future)

- **Solution Discovery stage** — brainstorm solutions for a validated problem
- **Solution Validation stage** — validate a chosen solution
- **DB persistence** — saving idea state to PostgreSQL via Prisma
- **Multiple customer segments per idea** — current spec is one segment per idea
- **Collaboration / sharing ideas**
- **Exporting canvas as PDF/image**

---

## Resolved Decisions

1. **Idea naming** — Ideas are auto-named sequentially ("Idea 1", "Idea 2", etc.) on creation. The user can rename the idea at any point later (e.g., from the Ideas index or from inside the idea).

2. **Self Discovery integration** — When viewing an idea's Problem Discovery stage, the user can import their problem triggers from Self Discovery as reference material. The triggers appear as a reference panel/list the user can consult when writing problems, but are not automatically inserted.

3. **Retiring old routes** — Old routes (`/problem-discovery/*`, `/problem-validation/*`) are deleted and reworked to fit the new `/ideas/[ideaId]/...` structure. No redirects.

4. **Stage gating** — Soft gate with progressive feedback:
   - A warning is shown on the Problem Discovery summary if no problems have been added, but the user can still proceed to Problem Validation.
   - On the Problem Validation "Pick a Problem" step, if there are no problems, a message is shown with a "Back to Problem Discovery" button instead of a problem list.
