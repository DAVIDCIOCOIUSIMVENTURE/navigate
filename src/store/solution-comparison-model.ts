import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SolutionMetricKey } from "@/types/solution"
import {
  DEFAULT_METRIC_WEIGHTS,
  normaliseWeights,
  type MetricImportance,
  type MetricWeights,
} from "@/lib/solution-comparison"
import { parsePerProject, perProjectReducers, type PerProject, type PerProjectState } from "./per-project"

const STORAGE_KEY = "navigate-solution-comparison"

/**
 * How important each solution metric is to the user when comparing the
 * solutions of one project. A bootstrapped project can favour cheap, quick
 * wins while a funded one chases impact, so the weights are kept per
 * project. The Compare solutions flow ranks the project's solutions by them;
 * the traffic light the user then gives each solution lives on the
 * `Solution` itself.
 */
type SolutionComparisonState = PerProjectState<MetricWeights>

const defaultState: SolutionComparisonState = {
  byProject: {},
  hydrated: false,
}

/** The weights of one project, the defaults until it has set any. */
export function selectComparisonWeights(state: { solutionComparison: SolutionComparisonState }, projectId: number): MetricWeights {
  return state.solutionComparison.byProject[projectId] ?? DEFAULT_METRIC_WEIGHTS
}

function saveToStorage(byProject: PerProject<MetricWeights>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ byProject }))
  } catch {
    // ignore storage errors
  }
}

/** Reads the stored map. Weights saved before projects existed had no project to belong to and are dropped. */
function loadFromStorage(): PerProject<MetricWeights> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { byProject?: unknown }
    return parsePerProject(parsed.byProject, normaliseWeights)
  } catch {
    return {}
  }
}

const { update: updateProject, clear: clearProjectSlice } = perProjectReducers(DEFAULT_METRIC_WEIGHTS, saveToStorage)

export const solutionComparison = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setAll(state, byProject: PerProject<MetricWeights>): SolutionComparisonState {
      return { ...state, byProject, hydrated: true }
    },

    setWeights(state, payload: { projectId: number; weights: MetricWeights }): SolutionComparisonState {
      return updateProject(state, payload, (_current, { weights }) => weights)
    },

    /** Forgets one project's weights. */
    clearProject(state, projectId: number): SolutionComparisonState {
      return clearProjectSlice(state, projectId)
    },
  },

  effects: (dispatch) => ({
    init() {
      dispatch.solutionComparison.setAll(loadFromStorage())
    },

    updateWeight({ projectId, key, value }: { projectId: number; key: SolutionMetricKey; value: MetricImportance }, rootState) {
      const current = selectComparisonWeights(rootState, projectId)
      dispatch.solutionComparison.setWeights({ projectId, weights: { ...current, [key]: value } })
    },
  }),
})
