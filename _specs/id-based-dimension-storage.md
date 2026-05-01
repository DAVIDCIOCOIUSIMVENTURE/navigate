# ID-Based Dimension Storage: Feature Specification

**Date:** 2026-04-30
**Status:** Draft

---

## Overview

The brainstorm dimensions (You, Customer, Context, Problem) currently persist the human-readable **label** of each selected item on the Problem record. This couples saved data to display strings: renaming a label rewrites history, free-typed values can't be edited centrally, and translation is impossible without breaking saved records.

This spec moves dimension storage to stable **IDs** and introduces a per-user "custom catalog" for items the user adds themselves.

localStorage will be wiped before this ships, so we don't need migration code or backwards-compatibility shims.

---

## Terminology

To avoid the historical "trigger" name, this spec uses the following vocabulary:

- **Self-discovery (the section)**: the feature at `/self-discovery`. Contains categories.
- **Category**: top-level grouping inside self-discovery (e.g. "Personal Interests, Passions & Experience", "Knowledge", "Skills & Expertise", "Social & Environmental Impact"). Each category contains questions.
- **Question**: a prompt the user answers within a category. Each question can offer **suggestions** (predefined toggleable answers) and accept **free-text** input.
- **Self-discovery item**: a single answer captured under a question. Created either by toggling a suggestion or by free-typing. The previous codebase called these "problem triggers"; that name is dropped going forward.
- **Dimension**: one of the four brainstorm columns (You, Customer, Context, Problem).
- **Built-in items**: items hand-authored in `brainstormData.ts`. Available in Customer, Context, Problem.
- **Custom items**: user-authored items in the dimension catalog. Available in Customer, Context, Problem.
- **You-column items**: in the brainstorm "You" column, the leaf items are exactly the user's self-discovery items (no built-ins, no custom catalog separately).

So when we say `Problem.you[]`, we're referencing **self-discovery item ids**. When we say `Problem.customers[]`, `.contexts[]`, `.problems[]`, we're referencing built-in ids or custom-item ids.

---

## Goals

- Save dimension selections by stable ID, not label.
- Let users add their own items to any of the four dimensions.
- Decouple saved Problems from display text so labels can be renamed or translated without touching history.
- Treat user-authored content (custom items, self-discovery items) as language-agnostic: stored exactly as typed, not translated.
- Drop the legacy "trigger" terminology in favour of "self-discovery item".

## Non-goals

- Editing or deleting **built-in** items at runtime (those are authored in `brainstormData.ts`).
- Translating user-authored labels.
- Sharing custom catalogs across users (everything stays in localStorage).
- Any database / Prisma work; the database is still disabled.

---

## ID conventions

All dimension item IDs follow `<column-singular>-<slug>` for built-ins and `<column-singular>-user-<8-char-uuid>` for user-authored items. The "You" dimension has no built-ins; every entry there is a user-authored self-discovery item that follows the same `<singular>-user-<id>` shape.

### Column singulars

| Column id (in `brainstormData.ts`) | Singular prefix |
| ---------------------------------- | --------------- |
| `customers` | `customer` |
| `contexts` | `context` |
| `problems` | `problem` |
| `you` | `you` (only used in fallbacks; "You" items are self-discovery item ids) |

### Built-in items (authored)

Stable, semantic, hand-authored slugs:

```
customer-teenagers
customer-young-professionals
customer-solopreneurs

context-morning-routine
context-commuting
context-tax-season

problem-too-complex
problem-information-overload
problem-late-fees
```

Group / category nodes (non-leaf items) follow the same pattern (`customer-life-stage`, `context-daily-routines`). They aren't saved on Problems but their IDs need to stay unique within their column.

### User-added custom items

Generated when a user adds a custom item from the canvas, builder, or edit dialog. Format:

```
customer-user-7e3f1a2b
context-user-9d8c4f01
problem-user-4a1bf2c3
```

The 8-char suffix is `crypto.randomUUID().slice(0, 8)`. Collision risk is negligible at the scale of one user's local catalog.

### Self-discovery items (the "You" dimension)

Self-discovery items live in their own store (renamed from `problemTriggers` to `selfDiscoveryItems`) because they carry self-discovery linking metadata (`questionUrl`, `suggestionId`) that plain custom dimension items don't. They share the **same id convention** as custom dimension items:

```
you-user-<8-char-uuid-slice>
```

Examples:

```
you-user-550e8400
you-user-61f7c84d
```

That keeps every user-authored item across the four dimensions readable at a glance: `customer-user-…`, `context-user-…`, `problem-user-…`, `you-user-…`. Saved Problems reference these ids in `Problem.you[]` directly.

There are no built-in IDs in the "You" column because every "You" entry is created by the user during self-discovery (either by free-typing an answer or by toggling a suggestion).

---

## Data model

### Built-in catalog: `src/data/brainstormData.ts`

Existing tree shape, IDs renamed to the new convention:

```ts
export const brainstormColumns: BrainstormColumn[] = [
  {
    id: "customers",
    title: "Customer",
    items: [
      {
        id: "customer-life-stage",
        label: "By Life Stage",
        children: [
          { id: "customer-teenagers", label: "Teenagers (13-19)" },
          { id: "customer-college-students", label: "College Students" },
          // ...
        ],
      },
      // ...other groups
    ],
  },
  { id: "contexts", title: "Context", items: [/* ... */] },
  { id: "problems", title: "Problem", items: [/* ... */] },
]
```

Column membership is implicit from the tree position. Items don't carry an explicit `columnId` field.

### User catalog: `src/store/custom-brainstorm-items-model.ts` (new)

```ts
export interface CustomBrainstormItem {
  id: string         // e.g. "customer-user-7e3f1a2b"
  label: string      // user-typed, in user's language
  createdAt: string  // ISO timestamp
}

interface CustomBrainstormItemsState {
  byColumn: Record<string, CustomBrainstormItem[]>
}

const defaultState: CustomBrainstormItemsState = {
  byColumn: {
    customers: [],
    contexts: [],
    problems: [],
    you: [],   // intentionally empty: "You" is driven by triggers, not custom items
  },
}
```

Persisted to localStorage as `navigate-custom-brainstorm-items`.

Reducers:

- `add({ columnId, label }): { id }` mints a new id, appends, persists, returns the id so the caller can immediately tick it.
- `rename({ id, label })` updates an existing item's label.
- `remove({ id })` removes the catalog entry. Saved Problems that referenced the id remain intact and render "(deleted item)" for it.

The model is registered alongside the others and `init()` runs from `root-layout-client.tsx` like the rest.

### Problem record: `src/store/problems-model.ts` (no shape change)

```ts
type Problem = {
  // ...existing fields
  customers: string[]   // each entry is now an ID, e.g. "customer-teenagers" or "customer-user-7e3f1a2b"
  contexts: string[]    // same
  problems: string[]    // same
  you: string[]         // each entry is a self-discovery item id, e.g. "you-user-550e8400"
}
```

Field shapes stay `string[]`. Only the contents change from labels to IDs.

### Self-discovery items: `src/store/self-discovery-items-model.ts` (renamed)

Renamed from `src/store/problem-triggers-model.ts`. The Rematch model name changes from `problemTriggers` to `selfDiscoveryItems`, the type from `ProblemTrigger` to `SelfDiscoveryItem`, and the array key from `triggers` to `items`. The localStorage key changes from `navigate-problem-triggers` to `navigate-self-discovery-items`. Reducer names follow the new noun (`addItem`, `removeItem`, `setItems`). DB will be wiped, so no migration is needed.

```ts
export interface SelfDiscoveryItem {
  id: string          // "you-user-<8-char-uuid-slice>"
  title: string       // user-typed (or suggestion label), in user's language
  questionUrl: string
  suggestionId?: string
}

interface SelfDiscoveryItemsState {
  items: SelfDiscoveryItem[]
}

// reducer
addItem(state, payload) {
  const id = `you-user-${crypto.randomUUID().slice(0, 8)}`
  return {
    ...state,
    items: [...state.items, { id, ...payload }],
  }
}
```

Persisted to localStorage as `navigate-self-discovery-items`.

Brainstorm uses each item's `id` as the leaf id when constructing the dynamic "You" column. The id is now consistent with the rest of the user-authored namespace (`customer-user-*`, `context-user-*`, `problem-user-*`, `you-user-*`).

---

## Save flow

### Builder (`handleSave` in `src/app/(app)/problems/brainstorm/page.tsx`)

Was: walked `selectedByColumn`, called `findLabel` for each id, saved labels.
After: saves selected ids per column directly, no label lookup.

```ts
const handleSave = () => {
  const selections: Record<string, string[]> = {}
  for (const col of columns) {
    selections[col.id] = selectedByColumn[col.id] ?? []   // already ids
  }
  onSave(selections, description)
  dispatch.settings.resetBrainstormBuilder()
}
```

### Canvas (`saveCombination` in the same file)

The canvas's pre-save edit dialog lets a user free-type comma-separated values. Each token resolves to either a built-in id, an existing custom id, or a freshly-minted custom id:

```ts
const saveCombination = async () => {
  const patch: Partial<Pick<Problem, "customers" | "contexts" | "problems" | "you">> = {}
  for (const column of allColumns) {
    const field = COLUMN_TO_FIELD[column.id]
    const raw = saveFields[column.id]?.trim() ?? ""
    const tokens = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : []
    patch[field] = tokens.map((token) => resolveOrCreate(column.id, token))
  }
  // ...rest unchanged
}

function resolveOrCreate(columnId: string, token: string): string {
  // 1. If token already looks like an id and exists, use it.
  if (isKnownId(columnId, token)) return token

  // 2. Built-in match by label?
  const built = findBuiltInIdByLabel(columnId, token)
  if (built) return built

  // 3. Existing user item match?
  const existing = customByColumn[columnId]?.find((i) => i.label === token)
  if (existing) return existing.id

  // 4. Mint a new user item.
  return dispatch.customBrainstormItems.add({ columnId, label: token }).id
}
```

The same `resolveOrCreate` is used by the brainstorm edit dialog, the standalone search-problem dialog, and the edit-problem dialog.

`Problem.you[]` is populated only via brainstorm selections (You column items); the edit dialogs don't expose a free-text "you" field, so self-discovery item ids are never created from typed text. New self-discovery items are authored exclusively in the self-discovery flow.

---

## Render flow

### `resolveDimensionLabel` helper (new: `src/lib/dimension-labels.ts`)

```ts
import { brainstormColumns } from "@/data/brainstormData"
import type { BrainstormItem } from "@/app/(app)/problems/brainstorm/data"
import type { CustomBrainstormItem } from "@/store/custom-brainstorm-items-model"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"

export function resolveDimensionLabel(
  columnId: string,
  id: string,
  customByColumn: Record<string, CustomBrainstormItem[]>,
  selfDiscoveryItems: SelfDiscoveryItem[]
): string {
  // 1. Built-in tree (recursive search of items + children)
  const column = brainstormColumns.find((c) => c.id === columnId)
  if (column) {
    const found = findInTree(column.items, id)
    if (found) return found.label  // i18n hook later
  }
  // 2. User catalog
  const custom = customByColumn[columnId]?.find((i) => i.id === id)
  if (custom) return custom.label
  // 3. Self-discovery items (only for "you")
  if (columnId === "you") {
    const item = selfDiscoveryItems.find((i) => i.id === id)
    if (item) return item.title
  }
  return "(deleted item)"
}

function findInTree(items: BrainstormItem[], id: string): BrainstormItem | null {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const child = findInTree(item.children, id)
      if (child) return child
    }
  }
  return null
}
```

### React hook: `useDimensionLabel`

```ts
export function useDimensionLabel(columnId: string, id: string) {
  const customByColumn = useSelector((s: RootState) => s.customBrainstormItems.byColumn)
  const selfDiscoveryItems = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  return useMemo(
    () => resolveDimensionLabel(columnId, id, customByColumn, selfDiscoveryItems),
    [columnId, id, customByColumn, selfDiscoveryItems]
  )
}
```

Every display surface that currently shows a label (`ProblemSummaryDialog`, validation layout tags, dashboard recent activity, brainstorm pills, problem table cells) switches to this hook (or to `resolveDimensionLabel` directly when iterating outside React).

---

## UI: adding custom items

### Single entry point: a top-level "Add your own item" button

Both the brainstorm canvas and the brainstorm builder gain a new toolbar button alongside Search / Full View / Show Saved Problems. Clicking opens an "Add custom item" dialog with:

1. A **dimension selector** (segmented control or radio): Customer, Context, Problem. The "You" dimension is intentionally **not** offered here; users add to "You" by capturing triggers in the self-discovery flow.
2. A **label input** (single-line, required).
3. **Cancel** and **Add** actions.

Submitting calls `customBrainstormItems.add({ columnId, label })`. After success:

- The new item is appended to the relevant column's user catalog.
- It is **auto-ticked** in the current selection (so the user immediately sees it counted toward their problem).
- The toast confirms: "Added to {ColumnTitle}: {label}".

### Synthetic "Your items" category in each column

When at least one custom item exists for a column, a synthetic group is appended to that column at render time:

```ts
{
  id: "customer-user-group",  // synthetic, not stored
  label: "Your items",
  children: customByColumn["customers"].map((i) => ({ id: i.id, label: i.label })),
}
```

This group renders the same as built-in groups (collapsible, with a count badge), at the bottom of the column. The synthetic group is **never** persisted: it exists only in the rendered tree.

If a column has **no** custom items, the "Your items" group is hidden entirely (no empty state inside the column).

### Managing custom items

Each column's settings cog gains a "Manage your items" entry, opening a small dialog that lists the user catalog for that column and allows **rename** and **delete** per row.

Deleting a custom item removes it from the catalog. Saved Problems that referenced its id keep the id and render "(deleted item)" for it until edited.

### Free-text dialog parity

The pre-save edit dialog (canvas) and the edit-problem dialog still accept comma-separated free-text. Each unrecognised token continues to flow through `resolveOrCreate`, which mints a new custom item under the hood. So users have two ways to author custom items: the explicit dialog, and the free-text fallback.

---

## Localization (consideration only)

Translation is **not implemented** in this work; this section just records the design choice that ID-based storage *enables* later.

- **Built-in items**: stable ids decouple saved data from display strings. A future locale-keyed table (e.g. `customer-teenagers` → per-locale label) could be added without modifying any saved Problem. Until then, `resolveDimensionLabel` returns the authored `label` directly.
- **User-authored content** (custom catalog items, self-discovery items): stored exactly as typed. Never translated.

This means a user who adds "Indie game devs" sees that exact text in any UI language; built-in items would localize per UI language once an i18n table exists.

---

## Sample localStorage snapshots

After a user has done some self-discovery, added two custom items, and saved a Problem in the brainstorm:

### `navigate-problem-triggers`

```json
{
  "triggers": [
    {
      "id": "you-user-550e8400",
      "title": "Hiking",
      "questionUrl": "hobbies-and-interests",
      "suggestionId": "hobby-hiking"
    },
    {
      "id": "you-user-61f7c84d",
      "title": "Caring for an aging parent",
      "questionUrl": "life-experiences"
    }
  ]
}
```

### `navigate-custom-brainstorm-items`

```json
{
  "byColumn": {
    "customers": [
      {
        "id": "customer-user-7e3f1a2b",
        "label": "Indie game devs",
        "createdAt": "2026-04-30T10:21:33.918Z"
      }
    ],
    "contexts": [
      {
        "id": "context-user-9d8c4f01",
        "label": "During school pickup",
        "createdAt": "2026-04-30T10:22:14.502Z"
      }
    ],
    "problems": [],
    "you": []
  }
}
```

### `navigate-problems`

```json
{
  "problems": [
    {
      "id": 1,
      "createdAt": "2026-04-30T10:23:02.114Z",
      "editedAt": "2026-04-30T10:23:02.114Z",
      "description": "Indie game devs struggle to price their work during school pickup runs",
      "customers": [
        "customer-young-professionals",
        "customer-user-7e3f1a2b"
      ],
      "contexts": [
        "context-commuting",
        "context-user-9d8c4f01"
      ],
      "problems": [
        "problem-too-complex"
      ],
      "you": [
        "you-user-550e8400",
        "you-user-61f7c84d"
      ],
      "source": "brainstorm",
      "existingSolutions": [],
      "emotionalImpact": [],
      "validationStatus": "unvalidated",
      "validationReason": "",
      "contextWhen": "",
      "segmentSize": null,
      "customerDescription": ""
    }
  ],
  "nextId": 2
}
```

When the brainstorm canvas renders this Problem in the saved-problems table, each cell calls `resolveDimensionLabel(columnId, id, ...)` to display "Young Professionals (22-35)", "Indie game devs", "Commuting", "During school pickup", "Too Complex / Hard to Use", "Hiking", "Caring for an aging parent".

---

## Acceptance criteria

1. Selecting an item in the canvas places its **id**, not its label, in `Problem.<column>[]`.
2. Same for the builder.
3. Free-typing a value in the canvas pre-save dialog or any edit dialog creates (or reuses) a custom catalog entry and saves its id.
4. Clicking the toolbar "Add your own item" button opens a dialog that requires a dimension and a label, then appends a new id under the relevant column's user catalog and auto-ticks the new item.
5. The "You" dimension is **not** an option in the add-custom dialog (custom additions to "You" happen via self-discovery only).
6. A column with at least one custom item shows a "Your items" synthetic group at the bottom; columns with none don't show the group.
7. Custom items can only be **leaves**; users cannot author groups.
8. Renaming a built-in `label` in `brainstormData.ts` does not affect any saved Problem's stored data; saved Problems display the new label automatically on next render.
9. Renaming a custom item via "Manage your items" updates the displayed label everywhere it's referenced (saved Problems, brainstorm pills, etc.) without modifying any Problem record.
10. Deleting a custom item leaves saved Problems intact, displaying "(deleted item)" wherever the deleted id appears.
11. **Deleting a self-discovery item** that's referenced by one or more saved Problems shows a confirmation dialog naming how many Problems reference it, with the choice to proceed or cancel. After confirmation, the saved Problems still keep the id and render "(deleted item)" for the trigger.
12. Brainstorm canvas and builder share selection state (already true after the recent unification).
13. The "Clear data by category" controls in `/settings/data-privacy` include a "Custom dimension items" entry that clears `navigate-custom-brainstorm-items`.

## Decisions (resolved questions)

The original open questions have been answered:

1. **"Add custom..." UI placement**: a single toolbar button at the top of both canvas and builder, opening an "Add custom item" dialog with a dimension selector and label input. Auto-ticks the new item after creation.
2. **Group-level selection**: not supported; users only ever toggle individual leaves.
3. **i18n**: not in scope. Considered only when shaping the data model. No translation table or library yet.
4. **Trigger deletion**: warn the user if any saved Problem references the trigger before deleting (see acceptance criterion 11).
5. **Custom item nesting**: leaves only; users can't author groups. Their items always appear under the synthetic "Your items" group.

---

## Implementation outline

Roughly in order, each step independently mergeable:

1. Rename built-in ids in `src/data/brainstormData.ts` to the new convention. (Pure data change, no other files affected if save flow still uses labels.)
2. Add `customBrainstormItems` Rematch model + register in store + `init()` from root layout.
3. Add `src/lib/dimension-labels.ts` (`resolveDimensionLabel`, `useDimensionLabel`, `findBuiltInIdByLabel`).
4. Switch the brainstorm save flow (`handleSave`, `saveCombination`) and edit dialogs to use ids and `resolveOrCreate`. Update Problem record contents to ids going forward.
5. Switch every display surface to read through `useDimensionLabel`. (`ProblemSummaryDialog`, validation layouts, intro/summary pages, dashboard activity, brainstorm pills.)
6. Inject the synthetic "Your items" group into the brainstorm column tree at render time (canvas + builder).
7. Add the toolbar "Add your own item" button + dialog to canvas and builder.
8. Add "Manage your items" dialog accessible from each column's settings dropdown.
9. Add the trigger-deletion warning in the self-discovery delete handler (count referencing Problems, show confirmation).
10. Add the new "Custom dimension items" storage entry to `/settings/data-privacy`.
