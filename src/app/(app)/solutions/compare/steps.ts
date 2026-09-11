import type { FlowNavItem } from "@/components/flow-shell"

export const COMPARE_BASE = "/solutions/compare"

/** The Compare solutions steps, in order. */
export const NAV_ITEMS: readonly FlowNavItem[] = [
  { label: "Introduction", path: "introduction", section: null },
  { label: "Rate solutions", path: "rate", section: null },
  { label: "Review", path: "review", section: null },
] as const

const STEP_PATHS = NAV_ITEMS.map((item) => item.path)

export function getAdjacentSteps(pathname: string) {
  const segment = pathname.split("/").pop() ?? ""
  const idx = STEP_PATHS.indexOf(segment)
  return {
    prevPath: idx > 0 ? `${COMPARE_BASE}/${STEP_PATHS[idx - 1]}` : null,
    nextPath: idx >= 0 && idx < STEP_PATHS.length - 1 ? `${COMPARE_BASE}/${STEP_PATHS[idx + 1]}` : null,
  }
}
