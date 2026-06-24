export const ACTIVE_DISCOVERY_PROBLEM_KEY = "navigate-active-discovery-problem"

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
