---
name: mirror-to-clientapp
description: Mirror a feature or change from the root Next.js app (src/) into the standalone React + Vite app (ClientApp/src/). Use after building or editing anything under src/ that is product code (pages, components, store models, types, data, config, nav), or when the user says "apply to the client app", "port this to ClientApp", "do it in both", or "mirror to the client". The two trees ship the same product and must stay in sync.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

You mirror changes made in the root Next.js app (`src/`) into the standalone React + Vite app (`ClientApp/src/`). Both trees implement the same product; `ClientApp` is the actively-developed extraction. After any feature work in `src/`, the same change must be applied to `ClientApp/src/` so they do not drift.

## What differs between the trees

The folder layout under `src/app/(app)/...`, the store, types, data, config, and components are otherwise **identical**. Only these things differ in `ClientApp`:

| Root (`src/`) | ClientApp (`ClientApp/src/`) |
| --- | --- |
| `import ... from "next/navigation"` (`useRouter`, `usePathname`, `useParams`, `useSearchParams`, `notFound`) | `from "@/lib/router"` (a shim with the same names/shapes) |
| `import Link from "next/link"` | `import Link from "@/components/link"` |
| File-based routing (folders under `src/app/(app)`) | Routes declared explicitly in `ClientApp/src/routes.tsx` |

Everything else (`@/...` alias imports, JSX, logic, Tailwind classes, localStorage keys) is the same. The `"use client"` directive is inert under Vite but harmless; leave it.

## Steps

1. **Find what changed in `src/`.** Use `git status --short` and `git diff` (or the just-finished edits in context) to list the added and modified files under `src/`. Group them:
   - **Pure files** (no `next/*` imports): store models (`src/store/*.ts`), types (`src/types/*.ts`), data (`src/data/*.ts`), most `src/lib/*` and pure `src/components/*`. These copy **verbatim**.
   - **Framework-touching files**: pages (`src/app/(app)/.../page.tsx`, `layout.tsx`) and components that import `next/navigation` or `next/link`. These copy then need import swaps.
   - **Shared wiring files** that you *edited* (not created): `src/store/index.ts`, `src/config/navigation.ts`, `src/app/root-layout-client.tsx`. Re-apply the same edits to the ClientApp copies (do not blindly overwrite: ClientApp versions may have small differences, so apply the same logical change with Edit).

2. **Copy pure files verbatim** into the matching `ClientApp/src/...` path (create parent dirs as needed). Example:
   ```
   cp src/store/foo-model.ts ClientApp/src/store/foo-model.ts
   ```

3. **Copy framework-touching files, then swap imports.** Copy the file, then replace:
   ```
   sed -i 's#from "next/navigation"#from "@/lib/router"#; s#import Link from "next/link"#import Link from "@/components/link"#' "<clientapp-file>"
   ```
   Confirm none remain: `grep -rn "next/navigation\|next/link" ClientApp/src/<paths>` should print nothing. (`useParams` and `useRouter` both come from `@/lib/router`; a combined `import { useParams, useRouter } from "next/navigation"` is handled by the same `from` replacement.)

4. **Re-apply shared-wiring edits.** For `store/index.ts` (register the new model), `config/navigation.ts` (nav entry / icon resolvers), and `root-layout-client.tsx` (the `init()` call and any breadcrumb branch), open the ClientApp copy and make the *same* change you made in root, using Edit so you respect any local differences. Read the ClientApp file first.

5. **Register new routes in `ClientApp/src/routes.tsx`.** For every new page added under `src/app/(app)/<section>`, add the import and a `<Route>` entry. `[param]` folders become `:param`. A `layout.tsx` becomes `element={<TheLayout><Outlet /></TheLayout>}`. Mirror the URL structure and the order used in the nav. There is no file-based routing here; a page not listed in `routes.tsx` is unreachable.

6. **Verify parity.** The ported files should differ from their root counterparts *only* on the swapped import lines:
   ```
   diff <(grep -v 'next/navigation\|next/link\|@/lib/router\|@/components/link' "src/<f>") \
        <(grep -v 'next/navigation\|next/link\|@/lib/router\|@/components/link' "ClientApp/src/<f>")
   ```
   Pure files should be byte-identical (`diff -q`).

7. **Run the ClientApp checks** from inside `ClientApp/`:
   ```
   cd ClientApp && npx tsc --noEmit && npm run lint && npm run test:run
   ```
   `tsc` must be clean. Lint must have **0 errors** (pre-existing `react-refresh/only-export-components` *warnings* in other files are fine; confirm none of your new files appear with `npm run lint 2>&1 | grep -i <feature>`). Tests must pass.

8. **Report** what you mirrored (files copied, edits re-applied, routes added) and the check results. Do **not** commit unless the user asks; if they do, stage only the `ClientApp/...` paths and write a `feat(...): port ... to ClientApp` style message (no em dashes, UK English, the `Co-Authored-By` trailer the repo uses).

## Notes

- Direction is always `src/` → `ClientApp/src/`. Root is where features are authored first in this workflow.
- Do not introduce `next/*` imports into ClientApp, and do not delete the inert `"use client"` lines.
- If a root change *removed* or *renamed* a file, apply the same removal/rename in ClientApp (and drop its route from `routes.tsx`), not just additions.
- Keep localStorage keys identical across trees so data shape stays compatible.
