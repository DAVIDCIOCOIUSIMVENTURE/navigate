/**
 * Shared shape for state that belongs to one project at a time: in-progress
 * drafts and preferences that must not leak from one project into another.
 * Each model keeps a `byProject` map from project id to its own slice and
 * reads it through `forProject`, which supplies the empty slice for a project
 * that has not touched the feature yet, so callers never see `undefined`.
 */
export type PerProject<T> = Record<number, T>

/** The state shape every per-project model has: the map plus its hydration flag. */
export interface PerProjectState<T> {
  byProject: PerProject<T>
  hydrated: boolean
}

export function forProject<T>(map: PerProject<T>, projectId: number, empty: T): T {
  return map[projectId] ?? empty
}

/** Returns the map with the project's slice replaced by `next`. */
export function withProject<T>(map: PerProject<T>, projectId: number, next: T): PerProject<T> {
  return { ...map, [projectId]: next }
}

/** Returns the map without the project's slice. */
export function withoutProject<T>(map: PerProject<T>, projectId: number): PerProject<T> {
  const { [projectId]: _removed, ...rest } = map
  void _removed
  return rest
}

/** Reads a persisted `byProject` map, keeping only entries under numeric keys. */
export function parsePerProject<T>(value: unknown, parseSlice: (raw: unknown) => T | null): PerProject<T> {
  const out: PerProject<T> = {}
  if (!value || typeof value !== "object") return out
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!/^\d+$/.test(key)) continue
    const slice = parseSlice(raw)
    if (slice !== null) out[Number(key)] = slice
  }
  return out
}

/**
 * Builds the two reducers every per-project model needs, closed over that
 * model's empty slice and its own persistence. `update` applies a change to
 * one project's slice, `clear` forgets it, and both return the state
 * unchanged when nothing changed so a no-op neither re-renders nor writes.
 */
export function perProjectReducers<T>(empty: T, save: (byProject: PerProject<T>) => void) {
  return {
    update<S extends PerProjectState<T>, P extends { projectId: number }>(
      state: S,
      payload: P,
      change: (slice: T, payload: P) => T,
    ): S {
      const current = forProject(state.byProject, payload.projectId, empty)
      const next = change(current, payload)
      if (next === current) return state
      const byProject = withProject(state.byProject, payload.projectId, next)
      save(byProject)
      return { ...state, byProject }
    },

    clear<S extends PerProjectState<T>>(state: S, projectId: number): S {
      if (!(projectId in state.byProject)) return state
      const byProject = withoutProject(state.byProject, projectId)
      save(byProject)
      return { ...state, byProject }
    },
  }
}
