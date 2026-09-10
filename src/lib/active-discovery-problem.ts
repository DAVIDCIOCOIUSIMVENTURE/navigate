export const ACTIVE_DISCOVERY_PROBLEM_KEY = "navigate-active-discovery-problem"

/**
 * Where "Identify solutions" lands. There is no picker hub for solutions
 * (Solution Discovery is the only tool), so every entry point goes straight
 * to the first step of the discovery flow.
 */
export const SOLUTION_DISCOVERY_START_HREF = "/solutions/discover/select-problem"

/** Start a fresh Solution Discovery run: forget the previous active problem, then open the first step. */
export function startSolutionDiscovery(push: (href: string) => void) {
  saveActiveDiscoveryProblemId(null)
  push(SOLUTION_DISCOVERY_START_HREF)
}

export function loadActiveDiscoveryProblemId(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ACTIVE_DISCOVERY_PROBLEM_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveActiveDiscoveryProblemId(id: number | null) {
  if (typeof window === "undefined") return
  try {
    if (id === null) localStorage.removeItem(ACTIVE_DISCOVERY_PROBLEM_KEY)
    else localStorage.setItem(ACTIVE_DISCOVERY_PROBLEM_KEY, String(id))
  } catch {
    // ignore storage errors
  }
}
