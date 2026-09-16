import type { FlowNavItem } from "@/components/flow-shell"
import { projectRoutes } from "@/lib/projects"

/** The Compare solutions steps, in order. */
export const NAV_ITEMS: readonly FlowNavItem[] = [
  { label: "Introduction", path: "introduction", section: null },
  { label: "Rate solutions", path: "rate", section: null },
  { label: "Review", path: "review", section: null },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string, projectId: number) {
  const base = projectRoutes.compareBase(projectId)
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment)
  return {
    prevPath: idx > 0 ? `${base}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx >= 0 && idx < STEP_PATHS.length - 1 ? `${base}/${STEP_PATHS[idx + 1]}` : null,
  }
}
