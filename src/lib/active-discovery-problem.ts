export const ACTIVE_DISCOVERY_PROBLEM_KEY = "navigate-active-discovery-problem"

/**
 * Where "Identify solutions" lands. There is no picker hub for solutions
 * (Identify Solutions is the only tool), so every entry point goes straight
 * to the first step of the Identify Solutions flow.
 */
export const IDENTIFY_SOLUTIONS_START_HREF = "/solutions/identify/select-problem"

/** Start a fresh Identify Solutions run: forget the previous active problem, then open the first step. */
export function startIdentifySolutions(push: (href: string) => void) {
  saveActiveDiscoveryProblemId(null)
  push(IDENTIFY_SOLUTIONS_START_HREF)
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
