# Add "Problem Exploration" step to Problem Discovery

## Context

The current Problem Discovery flow (Introduction → Customers → Sub-Segment → Jobs → Problems → Summary) forces users to start from a blank slate. Many innovators already have fragments of knowledge — problems they've experienced, people they've seen struggling, workarounds they've noticed. This new step captures that raw knowledge **before** the structured flow, so it can inform every subsequent step.

## What we're building

A new **"Problem Exploration"** step inserted between Introduction and Customers. It presents guided prompts for users to brainstorm from existing knowledge. That data then:
- Appears as a **reference panel** in the sidebar on subsequent steps (showing only relevant excerpts)
- Powers a **"Seed from your notes"** button on the Problems step to create draft problem entries

## Implementation

### 1. Data model — [src/types/idea.ts](src/types/idea.ts)

Add new type and extend `Idea`:

```typescript
export type PriorKnowledgeFields = {
  personalFrustrations: string
  whoStruggles: string
  existingWorkarounds: string
  complaintsHeard: string
  whyItMatters: string
}

export const DEFAULT_PRIOR_KNOWLEDGE: PriorKnowledgeFields = {
  personalFrustrations: "",
  whoStruggles: "",
  existingWorkarounds: "",
  complaintsHeard: "",
  whyItMatters: "",
}
```

Add `priorKnowledge: PriorKnowledgeFields` to the `Idea` type and include `DEFAULT_PRIOR_KNOWLEDGE` in `DEFAULT_CUSTOMER`'s sibling defaults.

### 2. Store — [src/store/ideas-model.ts](src/store/ideas-model.ts)

Add `priorKnowledge: { ...DEFAULT_PRIOR_KNOWLEDGE }` to the `newIdea` object in the `create` effect. No other store changes needed — `updateIdea` already accepts `Partial<Idea>`.

### 3. Context — [src/app/(app)/ideas/[ideaId]/problem-discovery/context.tsx](src/app/(app)/ideas/[ideaId]/problem-discovery/context.tsx)

- Add `priorKnowledge` + `setPriorKnowledge` to `ProblemDiscoveryContextValue`
- Derive from `idea?.priorKnowledge ?? { ...DEFAULT_PRIOR_KNOWLEDGE }`
- Insert `{ label: "Problem Exploration", path: "problem-exploration" }` into `NAV_ITEMS` at index 1
- Export a `PRIOR_KNOWLEDGE_RELEVANCE` mapping:
  ```
  customers:             [whoStruggles, whyItMatters]
  customer-sub-segment:  [whoStruggles]
  jobs-to-be-done:       [personalFrustrations, complaintsHeard]
  problems:              [personalFrustrations, existingWorkarounds, complaintsHeard]
  ```

### 4. Layout / sidebar — [src/app/(app)/ideas/[ideaId]/problem-discovery/layout.tsx](src/app/(app)/ideas/[ideaId]/problem-discovery/layout.tsx)

- Add icon for `"problem-exploration"` in `NAV_ICONS` (use `Search` or `Lightbulb` from lucide-react)
- Add a collapsible **"Your Exploration Notes"** card below the existing Sub-Segment card:
  - Only renders when at least one `priorKnowledge` field is non-empty
  - Uses `PRIOR_KNOWLEDGE_RELEVANCE[currentStep]` to show only relevant fields
  - Each field shown as label + truncated excerpt (3 lines max)
  - Collapsed by default, toggle to expand

### 5. New page — `src/app/(app)/ideas/[ideaId]/problem-discovery/problem-exploration/page.tsx` (CREATE)

Follow the same pattern as [customers/page.tsx](src/app/(app)/ideas/[ideaId]/problem-discovery/customers/page.tsx):
- `useProblemDiscovery()` for `priorKnowledge` / `setPriorKnowledge`
- `getAdjacentSteps()` for prev/next (works automatically after NAV_ITEMS update)
- Two tabs: "Your Strategy" / "Use Cases"

**"Your Strategy" tab** — 5 Textarea fields in a branded card:

| Field | Label | Placeholder |
|-------|-------|-------------|
| `personalFrustrations` | What frustrations have you experienced? | Think about moments where you felt stuck, annoyed, or had to work around something... |
| `whoStruggles` | Who do you see struggling with this? | Describe the types of people who face this problem. What's their situation? |
| `existingWorkarounds` | What workarounds or makeshift solutions exist? | How are people currently dealing with this? Spreadsheets, manual processes, asking friends... |
| `complaintsHeard` | What have you heard others complain about? | Think about conversations, social media, forums, or news stories... |
| `whyItMatters` | Why does this matter to you? | What draws you to this problem space? What would change if it were solved? |

**"Use Cases" tab** — example brainstorm entries for each existing use case (HR, Freelancers, Education).

### 6. Introduction page — [src/app/(app)/ideas/[ideaId]/problem-discovery/introduction/page.tsx](src/app/(app)/ideas/[ideaId]/problem-discovery/introduction/page.tsx)

Insert new entry at position 0 in the `STEPS` array:
```
{ icon: Search, title: "Problem Exploration", description: "Brainstorm from your existing knowledge and experience before diving into the structured flow.", bg: "bg-amber-100 dark:bg-amber-950", color: "text-amber-600 dark:text-amber-400" }
```

### 7. Use cases data — [src/app/(app)/ideas/[ideaId]/problem-discovery/use-cases.ts](src/app/(app)/ideas/[ideaId]/problem-discovery/use-cases.ts)

Add a `priorKnowledge` field to each use case object with example brainstorming content for the "Use Cases" tab on the new page.

### 8. Problem seeding — [src/app/(app)/ideas/[ideaId]/problem-discovery/problems/page.tsx](src/app/(app)/ideas/[ideaId]/problem-discovery/problems/page.tsx)

Add a **"Seed from your notes"** button per job that:
- Appears when `personalFrustrations` or `complaintsHeard` has content AND the job has 0 problems
- On click: splits the text by newlines, filters empties, creates a `Problem` entry for each line
- Button disappears once problems exist on that job

### 9. Quickstart parity — [src/app/(app)/ideas/[ideaId]/(quickstart)/problem-discovery/quickstart/page.tsx](src/app/(app)/ideas/[ideaId]/(quickstart)/problem-discovery/quickstart/page.tsx)

Add a collapsible "Problem Exploration" card at the top of the quickstart canvas (above Customer Segment) with the same 5 textarea fields.

## Migration

Existing ideas in localStorage won't have `priorKnowledge`. The context fallback (`idea?.priorKnowledge ?? DEFAULT_PRIOR_KNOWLEDGE`) handles this gracefully — no migration needed.

## Files summary

| Action | File |
|--------|------|
| Modify | `src/types/idea.ts` |
| Modify | `src/store/ideas-model.ts` |
| Modify | `src/app/(app)/ideas/[ideaId]/problem-discovery/context.tsx` |
| Modify | `src/app/(app)/ideas/[ideaId]/problem-discovery/layout.tsx` |
| **Create** | `src/app/(app)/ideas/[ideaId]/problem-discovery/problem-exploration/page.tsx` |
| Modify | `src/app/(app)/ideas/[ideaId]/problem-discovery/introduction/page.tsx` |
| Modify | `src/app/(app)/ideas/[ideaId]/problem-discovery/use-cases.ts` |
| Modify | `src/app/(app)/ideas/[ideaId]/problem-discovery/problems/page.tsx` |
| Modify | `src/app/(app)/ideas/[ideaId]/(quickstart)/problem-discovery/quickstart/page.tsx` |

## Verification

1. `npm run dev` — navigate to an idea's Problem Discovery
2. Confirm "Problem Exploration" appears in sidebar nav between Introduction and Customers
3. Fill in brainstorm fields, navigate to Customers — confirm sidebar reference panel shows relevant excerpts
4. Navigate to Problems — confirm "Seed from your notes" button appears and creates draft problems
5. Create a quickstart idea — confirm the Problem Exploration card appears at top
6. `npm run lint && npx tsc --noEmit && npm run test:run` — all green
