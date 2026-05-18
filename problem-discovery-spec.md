# Spec: Guided Problem Discovery Hub ("Reflect")

**Status**: Decisions locked; ready for phase 1
**Last updated**: 2026-05-18
**Route**: `/problems/reflect`

## 1. Goals

1. Give users a guided, question-led way to surface candidate problems, complementing the existing free-form brainstorm canvas at `/problems/brainstorm`.
2. Offer a small set of distinct "lenses", each a short Q&A that nudges the user toward a different source of insight (their own work, life, networks, observations, market signals).
3. Capture answers as **candidates** in a staging area, so the user can review and curate before promoting them to real Problems in the main `/problems` list.
4. Reuse existing patterns: hub-of-tools shape mirrors `/solutions/discover`; outputs land in the same `problems` store after promotion; lens content is static config in `src/data/`.
5. Where it adds real value, surface the user's existing self-discovery items as starter chips inside lens prompts; never auto-fill.
6. Build the feature so adding a seventh lens later is a config change, not a refactor.

## 2. Scope

**In scope:**

* New hub page at `/problems/reflect` with a lens grid and a candidates tray.
* Six starter lenses, each a multi-step flow.
* New Rematch model `problemCandidates` with localStorage persistence.
* "Promote candidate to Problem" path that writes to the `problems` model and links back.
* Read-only consumption of `selfDiscoveryItems` to surface starter chips on relevant prompts (see Section 7.5).
* Guidance content for each step (intro panels, helper text, examples) wired through the existing `GuidancePanel`.
* Sidebar nav entry under Problems (alongside Brainstorm).

**Out of scope (deliberate):**

* External integrations with research sites, app stores, trend trackers, data portals. Lens 6 (Market signals) is a lightweight capture form; it does not call out to or scrape external services.
* AI-generated prompts or summaries. All prompts are static; users type their own answers.
* Per-user persistence. Like the rest of the app, this is browser-local until the auth/DB work lands.
* Rich candidate editing (tags, descriptions, scoring). Candidates have a title and a few captured context fields. Anything richer happens after promotion to a Problem.
* Candidate decay or auto-cleanup. Candidates persist indefinitely (decision #2).
* Duplicate detection across lenses. If two lenses produce near-identical candidates, both stay (decision #3).
* Sharing or exporting candidates.

## 3. Naming

Locked: route segment is `reflect`, sidebar label is "Reflect", lens label in copy is "lens" (lowercase, e.g. "Work friction lens"), candidate object is a "problem candidate" in code and a "candidate" in user-facing copy.

The name "Reflect" was chosen over "Discover" to avoid overloading the term already used by `/solutions/discover`, and because most lenses lean introspective (work, life, insider, people). The Market signals lens is the exception; the name still fits since the user is reflecting on what they've observed externally.

## 4. Information architecture

```
/problems
  /brainstorm          (existing free-form canvas)
  /reflect             (NEW hub: intro + lens grid + candidates tray)
  /reflect/[lensId]    (NEW lens flow: intro -> prompts -> review -> done)
  /[problemRef]/...    (existing problem refinement flow)
```

Sidebar (under Problems):

```
Problems
  All problems
  Brainstorm
  Reflect            <- new
```

Update both `src/config/navigation.ts` and `getSection` in `src/app/root-layout-client.tsx` (per CLAUDE.md, both must change together when a new top-level section is added).

## 5. Core concepts

### 5.1 Lens

A lens is a guided Q&A defined entirely in static config (`src/data/reflectLenses.ts`). Each lens has:

* `id` (slug used in routes and as candidate source)
* `title`, `shortDescription`, `longDescription`
* `iconKey` and `tileColor` drawn from the brand palette (see CLAUDE.md theme tiles)
* `estimatedMinutes` (rough completion time shown on the card)
* `prompts: LensPrompt[]` (ordered list of question cards)
* `helperText` block (rendered in the guidance panel for this lens)
* `selfDiscoverySources?: { category: string; promptIds: string[] }[]` (see Section 7.5)

A `LensPrompt` is:

```ts
type LensPrompt = {
  id: string;
  question: string;            // the user-facing prompt
  helperText?: string;         // tip shown under the prompt
  examples?: string[];         // 2 to 4 short examples
  multipleAllowed: boolean;    // true if user can add multiple answers to one prompt
  capturesContext?: string[];  // ids of follow-up fields (e.g. "who-else", "how-often")
};
```

Each non-empty answer becomes a `ProblemCandidate`, with `lensId`, `promptId`, and any captured context attached.

### 5.2 Candidate

A `ProblemCandidate` is an unrefined problem the user has not yet committed to. It lives in its own model so the main `/problems` list stays clean. Candidates persist indefinitely. They can be:

* Edited (title and context fields)
* Dismissed (soft-delete with `dismissedAt`; hidden by default, recoverable from a "dismissed" filter)
* Promoted to a Problem (creates a blank `Problem` via `dispatch.problems.create` using the candidate title; sets `promotedToProblemId` on the candidate; the candidate then renders in a "promoted" filter)

A candidate is intentionally lightweight: a short title in the user's own words, plus any context the prompt asked for. The richer fields (`customers`, `contexts`, validation, etc.) are added during the existing problem refinement flow at `/problems/[problemRef]`.

## 6. Data model

### 6.1 New Rematch model: `problemCandidates`

* **File**: `src/store/problem-candidates-model.ts`
* **localStorage key**: `navigate-problem-candidates`
* **Init**: registered in `src/store/index.ts`; `init()` called from `src/app/root-layout-client.tsx` on mount (matches existing pattern).

State shape:

```ts
type ProblemCandidate = {
  id: string;                  // "candidate-<8-char>"
  title: string;               // candidate problem in user's words
  lensId: string;              // "work" | "life" | "insider" | "cross" | "people" | "market"
  promptId: string;            // which prompt produced this
  sessionId: string;           // groups candidates from one lens session
  context: Record<string, string>;  // captured follow-up answers
  createdAt: number;
  editedAt: number;
  dismissedAt?: number;
  promotedToProblemId?: number;
};

type ProblemCandidatesState = {
  items: ProblemCandidate[];
  hydrated: boolean;
};
```

Effects:

* `create(payload)`, `update({ id, ... })`, `delete(id)` (hard delete; rare, mainly for tests)
* `dismiss(id)` / `restore(id)` (soft delete)
* `promote(id)` (creates a blank Problem via `dispatch.problems.create({ problemTitle: candidate.title, source: "reflect" })`; sets `promotedToProblemId`; returns the new problem id so the UI can route). The new Problem starts blank: no prefilled customers / contexts / problems / you columns. Captured context on the candidate stays on the candidate as a reference; the user fills the columns themselves in the refinement flow (decision #4).
* `bulkCreateForSession({ sessionId, lensId, answers })` (used when the user submits a lens; writes all candidates from one session in a single dispatch)
* `init()` (hydrates from localStorage)

### 6.2 Problems model: minor addition

* Add `"reflect"` to the `Problem.source` union (check `src/store/problems-model.ts` for the current set). Promoted candidates get `source: "reflect"`.

### 6.3 No schema changes elsewhere

Self-discovery, solutions, and workspaces are untouched. The hub and several lenses **read** from `selfDiscoveryItems` (see Section 7.5) but never write to it.

## 7. UX flows

### 7.1 Hub page (`/problems/reflect`)

Three regions on one page, top to bottom:

1. **Intro card** (collapsible after first visit; remembered as `reflectIntroDismissed` in the `settings` model)

   * One paragraph: what Reflect is and how it differs from Brainstorm.
   * Bullet list: when to use Reflect (you want prompts) vs Brainstorm (you have ideas already).
   * Link to guidance panel for deeper explanation.

2. **Lens grid** (6 cards, responsive 1-2-3 columns)

   * Each card: icon tile (brand palette color), title, one-line description, estimated minutes, "Start lens" button.
   * If the user has self-discovery answers, surface a small "Recommended" badge on the lens that maps best (see 7.2).

3. **Candidates tray** (only renders if `items.length > 0`)

   * Tabs: **Active** (default), **Promoted**, **Dismissed**.
   * Each row: candidate title, source lens, age (relative), inline actions (Edit, Promote, Dismiss).
   * Bulk: "Promote selected" and "Dismiss selected".
   * Empty state inside Active: "No candidates yet. Pick a lens above to start."

### 7.2 Lens recommendation

On hub mount, read `selfDiscoveryItems`. If the user has answers in:

* Knowledge or Skills categories: badge "Recommended" on **Work friction** and **Insider angle**.
* Interests category: badge on **Life experiences** and **Cross-context patterns**.
* Nothing: no badges; show the lenses in default order.

This is a non-blocking nudge, not a gate.

### 7.3 Lens flow (`/problems/reflect/[lensId]`)

Mirrors the multi-step pattern of `/problems/[problemRef]` and `/solutions/discover`. A new `ReflectProvider` context at `src/app/(app)/problems/reflect/context.tsx`:

* Holds the active `sessionId` (UUID created on flow entry).
* Holds in-progress answers in component state until the review step.
* Exposes step navigation (`goNext`, `goBack`, `complete`).

Steps (one per route segment under `/problems/reflect/[lensId]/`):

1. **`introduction`**

   * Restate the lens purpose in two or three sentences.
   * "What you'll get out of this": 3 bullets.
   * "Start" button advances to first prompt.

2. **`prompts`** (single route that paginates the lens's prompts client-side, one per screen)

   * Question, helper text, optional examples (collapsible).
   * Optional "From your self-discovery" chip panel above the textarea, per Section 7.5.
   * Answer textarea. If `multipleAllowed`, an "Add another answer" button to add more text rows.
   * Skip button (advances without recording an answer).
   * "Back" / "Next" navigation.
   * Progress indicator (e.g. "3 of 5").
   * On narrow containers (via `useContainerSize()`), switch to a single-column layout with a larger textarea, hide the progress sidebar, and stack examples below the question (decision #6).

3. **`review`**

   * Lists all answers from this session, grouped by prompt.
   * User can edit any answer in place or delete it before committing.
   * Optional context fields are surfaced here for any answer that has them (lazy capture: ask the follow-ups only after the user has decided the answer is worth keeping).
   * "Save as candidates" button calls `dispatch.problemCandidates.bulkCreateForSession(...)` and routes to:

4. **`done`**

   * Confirmation with the count of candidates created.
   * Two CTAs: "Try another lens" (back to hub) and "Review candidates" (jumps to the candidates tray on the hub).

### 7.4 Promotion to Problem

From any candidate row:

1. User clicks "Promote".
2. Confirmation dialog with the candidate title prefilled as the new Problem title (editable). Dialog reminds the user that the new Problem starts blank; they'll fill out customers / contexts / problems / you in the refinement flow.
3. On confirm, `dispatch.problemCandidates.promote(id)` runs, creates a blank Problem, returns the new problem id.
4. Toast: "Created Problem. Open it now?" with link to `/problems/[newId]`.

### 7.5 Self-discovery integration

Lenses that can benefit from existing user data show a "From your self-discovery" panel above the answer textarea on relevant prompts. The panel lists the user's saved self-discovery items in the matching category as clickable chips. Clicking a chip drops the item's title into the textarea as a starter; the user then edits or extends it. The integration is suggestion-only, never auto-fill; the textarea stays empty until the user clicks a chip or types.

| Lens | Prompts that surface chips | Self-discovery source |
| ---- | --------------------------- | --------------------- |
| Work friction | Prompts 1, 3, 4 (time-consuming tasks, frustrating processes, workarounds) | Knowledge + Skills items |
| Life experiences | Prompt 1 (significant experience) | Interests items |
| Insider angle | Prompt 1 (name the organization) | Knowledge items |
| Cross-context patterns | Prompt 1 (hobby vs job) | Interests items |
| People around you | (none) | self-contained per decision #5 |
| Market signals | (none) | n/a |

If the user has no items in the matching category, the panel is hidden entirely; the lens still works exactly as if the user had never used self-discovery. This integration is a read-only consumer of `selfDiscoveryItems`; no writes.

Implementation note: keep the chip-to-textarea wiring in one shared component (`<SelfDiscoveryChips category="knowledge" onPick={...}/>`) so all four integration points use the same UI and the same selector logic.

## 8. Lens content

The wording below is the spec's working copy. All lens content is in our own voice and is not copied from any source. Tune in implementation; treat as a starting point.

### Lens 1: Work friction

**Description**: Mine your own job for repeated annoyances, expensive habits, and "this should just exist" thoughts.
**Tile color**: `bg-blue-900` (navy)
**Estimated minutes**: 8
**Self-discovery chips**: Knowledge + Skills items on prompts 1, 3, 4.

Prompts:

1. **What's something at work you spend a surprising amount of time on each week?**

   * Helper: think about tasks you'd struggle to explain why they take so long.
   * Examples: chasing approvals; reformatting reports; jumping between five tools to do one thing.
2. **What's something at work you (or your team) spend money on that feels like more than it's worth?**

   * Helper: subscriptions, contractors, recurring purchases.
3. **What process at your job has frustrated you in the last month?**

   * Examples: onboarding a new teammate; getting access to a system; a specific recurring meeting.
4. **Where do you work around a system instead of through it?**

   * Helper: workarounds usually point to a missing tool.
   * Examples: spreadsheets that shadow an official tool; private notes that duplicate a CRM.
5. **What "this should just exist" thought have you had recently?**

   * Helper: small, specific, and slightly weird is good.

Context capture (lazy, at review): for each kept answer, ask "Who else has this problem? (a role, an industry, a team type)".

### Lens 2: Life experiences

**Description**: Productize what you've already lived through. The friction you remember is friction others are about to hit.
**Tile color**: `bg-yellow-600` (mustard)
**Estimated minutes**: 10
**Self-discovery chips**: Interests items on prompt 1.

Prompts:

1. **What's something significant you've navigated in the last few years?**

   * Examples: moving country; a health change; becoming a parent; switching careers; caring for a relative.
2. **Looking back at that experience, what part was harder than it needed to be?**
3. **What did you wish someone had told you upfront?**

   * Helper: not generic advice; the specific thing you only learned by doing.
4. **What did you spend money on during that experience that turned out not to help?**

   * Helper: misallocated spend often signals a missing or misleading product.
5. **What workaround did you build for yourself that you still use?**

Context capture: "Who else is going through this (or about to)? Roughly how many people, in a phrase?".

### Lens 3: Insider angle

**Description**: Use what you know about organizations from the inside. Outsiders can't see what you've seen.
**Tile color**: `bg-emerald-800` (dark emerald)
**Estimated minutes**: 10
**Self-discovery chips**: Knowledge items on prompt 1.

Prompts:

1. **Name an organization you've worked at or know intimately.**

   * Helper: this answer isn't a candidate; it sets context for the rest. Pick one and the prompts below refer to it.
2. **What internal process there was obviously broken but never got fixed?**

   * Examples: a manual handoff between two teams; a report that everyone re-derives from scratch.
3. **What opportunity did people discuss inside but the organization never pursued?**

   * Helper: often this is something with the wrong owner, not the wrong idea.
4. **What does everyone there quietly complain about?**
5. **What knowledge from inside that organization would surprise an outsider?**

   * Helper: surprising knowledge is sellable knowledge.

Context capture: "Which other organizations have the same setup? (a sector or size)".

### Lens 4: Cross-context patterns

**Description**: Spot something that works in one industry, hobby, or country and is missing in another you know.
**Tile color**: `bg-violet-800` (dark violet)
**Estimated minutes**: 8
**Self-discovery chips**: Interests items on prompt 1.

Prompts:

1. **Something normal in your hobby that's missing in your job, or vice versa.**

   * Examples: scoring systems; tournament brackets; community moderation conventions.
2. **Something common in another country or culture you know that isn't here.**

   * Examples: a payment method; a bureaucratic shortcut; a social ritual; a piece of infrastructure.
3. **Something common in one industry you've worked in that another industry would benefit from.**
4. **A solution that's normal for one age group or generation that no one's adapted for another.**

Context capture: "Who would benefit from the transplant? Why hasn't this happened yet?".

### Lens 5: People around you

**Description**: Observation, not introspection. The people in your daily life are a problem source you can verify by asking them.
**Tile color**: `bg-rose-800` (dark rose)
**Estimated minutes**: 8
**Self-discovery chips**: none (self-contained per decision #5).

Prompts:

1. **Pick one person in your life you observe regularly.**

   * Helper: this answer sets context; not a candidate.
2. **What do you hear them complain about repeatedly?**
3. **What workaround have you watched them build for themselves?**
4. **What do they spend hours doing that they wish was faster, cheaper, or easier?**
5. **What life stage are they in that has its own friction?**

   * Examples: new job; new parent; recently retired; first time renting.

Context capture: "Roughly how many other people are in the same situation?".

### Lens 6: Market signals (lightweight)

**Description**: A capture form for problems you spot by looking outward (reviews, trend lists, public data, research). This lens doesn't ask you what to look at; it gives you a place to write down what you find.
**Tile color**: `bg-orange-700` (burnt orange)
**Estimated minutes**: 5
**Self-discovery chips**: none.

Structure differs from lenses 1 to 5: a single screen, not a paginated flow.

Fields:

* **What did you find?** (title)
* **Where did you see it?** (one line: "low ratings on X tool"; "trending topic on Y"; "open dataset Z"; etc.)
* **What problem does it suggest?** (the candidate text)
* **Who is affected?** (free text)

"Save as candidate" creates one candidate per submission. The form clears after save with a "Add another" prompt, so the user can capture several finds in one sitting.

This lens has a guidance side panel listing categories of sources (low-rated tools, trend trackers, research aggregators, public data sets) without naming specific URLs. The user supplies the URLs; we just give the shape.

## 9. Guidance content

Each step has a guidance topic registered with the existing `GuidancePanel` system (`src/context/guidance-context.tsx`). The user opens it via the existing info-icon pattern.

Guidance topics to add:

| Topic id | Where it shows | Content |
| -------- | -------------- | ------- |
| `reflect-hub` | Hub intro | What Reflect is for; when to use it vs Brainstorm; the candidates flow. |
| `reflect-lens-work` | Work lens intro and prompts | What "work friction" means; why repeated small annoyances matter; one short example. |
| `reflect-lens-life` | Life lens | Why retrospective matters more than current pain; the "wish I knew" framing. |
| `reflect-lens-insider` | Insider lens | Why one organization is enough; how to anonymize if you're worried. |
| `reflect-lens-cross` | Cross-context lens | How transplants work; the "why not yet" question that gates whether it's a real opportunity. |
| `reflect-lens-people` | People lens | Ethics of using observed friction; reminder to validate by asking the person. |
| `reflect-lens-market` | Market lens | Categories of sources to scan; what to capture (not the URL, the insight). |
| `reflect-candidates` | Candidates tray | What a candidate is; difference from a Problem; when to promote vs dismiss. |
| `reflect-promotion` | Promotion dialog | What gets created (a blank Problem); the refinement flow that follows. |
| `reflect-self-discovery-chips` | Anywhere chips appear | What the chips are; that they're suggestions, not constraints; that the panel only appears if you have self-discovery items. |

Helper text **inside** the flow (not in the guidance panel) is colocated with each prompt in `src/data/reflectLenses.ts` so it travels with the question.

## 10. Component structure

```
src/app/(app)/problems/reflect/
  layout.tsx                       // wraps in ReflectProvider
  page.tsx                         // hub: intro, lens grid, candidates tray
  context.tsx                      // ReflectProvider + NAV_ITEMS for the flow
  candidates-tray.tsx              // tabs + rows; reads problemCandidates
  lens-card.tsx                    // single card in the grid
  promotion-dialog.tsx             // confirm + edit title before promoting
  self-discovery-chips.tsx         // shared chip panel; reused by all lens prompts that opt in
  [lensId]/
    layout.tsx                     // step nav scaffolding
    introduction/page.tsx
    prompts/page.tsx               // paginates prompts client-side
    review/page.tsx
    done/page.tsx

src/data/
  reflectLenses.ts                 // all lens content (id, prompts, helperText, icon, color, self-discovery sources)

src/store/
  problem-candidates-model.ts      // new Rematch model
  index.ts                         // register model + AppDispatch update

src/types/
  problem-discovery.ts             // ProblemCandidate, Lens, LensPrompt types

src/config/
  navigation.ts                    // add Reflect under Problems
```

Reuse, do not rebuild:

* `Card`, `Button`, `Tabs`, `Dialog`, `Sheet` from `src/components/ui/`.
* The step header pattern from `/problems/[problemRef]` (look at its `layout.tsx`).
* The `useContainerSize()` hook for responsive layout in the lens grid and prompts pages.
* The `useGuidance()` hook for guidance panel registration.

## 11. Integration points

* **`problems` model**: gains `"reflect"` as a valid `source` value. Otherwise unchanged.
* **`selfDiscoveryItems` model**: read-only consumer in the hub (Recommended badge) and inside the shared `<SelfDiscoveryChips>` component (starter chips on opt-in prompts).
* **`settings` model**: stores a `reflectIntroDismissed` boolean so the hub intro card collapses by default after first visit.
* **Sidebar**: new entry. Update `src/config/navigation.ts` and `getSection` in `src/app/root-layout-client.tsx` together.
* **Dashboard**: optional, future. Could show "X active candidates" tile; not in this spec.

## 12. Testing

Follow existing patterns:

* **Reducers**: pure-function tests for `problemCandidates` (`bulkCreateForSession`, `promote`, `dismiss`, `restore`). Pattern as in `src/store/notes-model.test.ts`.
* **Promotion flow**: integration-style test that dispatches `promote` against a real store; asserts a blank Problem is created with `source: "reflect"`, the title matches, and that `promotedToProblemId` is set on the candidate.
* **Lens config**: a schema-style test that walks `reflectLenses.ts` and asserts every lens has at least one prompt, a tile color from the allowed palette, and a unique id. Catches drift when adding a lens.
* **Hub recommendation**: hook test for the "Recommended" badge logic given various `selfDiscoveryItems` states.
* **Self-discovery chips**: hook/component test that confirms the chip panel renders the right category, is hidden when there are no items, and inserts the chosen title into the textarea without overwriting existing user input.

No UI-level tests for the prompt pages in this phase. Add when behavior gets more complex.

## 13. Implementation phases

Three PR-sized chunks, each independently shippable. Phase boundaries are checkpoints, not hard gates: keep going if scope is small.

**Phase 1: Foundations**

* `problemCandidates` model + tests + localStorage hydration.
* `reflectLenses.ts` with all six lenses' static content.
* Sidebar entry + `getSection` update.
* Hub page (intro card + lens grid + empty candidates tray). Lens cards link to a stub `[lensId]/introduction` that just shows "Coming soon".

Phase 1 ships a navigable shell with no real lens flow yet. This is enough to evaluate the IA and copy.

**Phase 2: Lens flow + promotion**

* `ReflectProvider` context.
* `introduction`, `prompts`, `review`, `done` step pages, generic across lenses.
* Shared `<SelfDiscoveryChips>` component (used by phase 2 even though only some lenses opt in).
* Candidates tray fully working (active/promoted/dismissed tabs, actions).
* Promotion dialog + writes to `problems` model with `source: "reflect"`. New Problems are blank.
* Toast + link to the new Problem.

After phase 2 the feature is end-to-end usable for lenses 1 through 5.

**Phase 3: Polish + market lens + guidance**

* Lens 6 (Market signals) with its custom single-screen form.
* Guidance panel topics registered (`reflect-hub`, per-lens, candidates, promotion, self-discovery-chips).
* Recommended badges driven by self-discovery data.
* Bulk actions on candidates (promote selected, dismiss selected).
* Settings: `reflectIntroDismissed`.

## 14. Locked decisions

| # | Decision | Choice |
| - | -------- | ------ |
| 1 | Route segment | `reflect` |
| 2 | Candidate lifecycle | Keep forever; no auto-decay |
| 3 | Cross-lens duplicate handling | Leave both; no detection |
| 4 | Promotion default | Create a blank Problem; user fills the columns during refinement |
| 5 | People lens import from self-discovery | Self-contained; no integration |
| 6 | Mobile prompts layout | Single-column larger textarea via `useContainerSize()` |
| 7 | Self-discovery integration on other lenses | Yes, on Work / Life / Insider / Cross-context (see Section 7.5) |

## 15. Notes on inspiration and originality

The high-level shape (mining personal experience, observing others, scanning market signals) is a well-trodden approach in product idea generation literature. The lens set above is a deliberate reshaping: six lenses instead of seventeen, grouped by the user's relationship to the information source (self, network, market), with wording, structure, prompts, and tile assignments written from scratch for this app. No source material is copied. If we later quote or paraphrase a specific external framework anywhere in the UI, attribute it.
