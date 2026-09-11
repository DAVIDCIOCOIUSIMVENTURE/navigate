import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SolutionMetricKey } from "@/types/solution"
import {
  DEFAULT_METRIC_WEIGHTS,
  normaliseWeights,
  type MetricImportance,
  type MetricWeights,
} from "@/lib/solution-comparison"

const STORAGE_KEY = "navigate-solution-comparison"

/**
 * How important each solution metric is to the user when comparing
 * solutions. The Compare solutions page ranks solutions by these weights;
 * the traffic light the user then gives each solution lives on the
 * `Solution` itself.
 */
interface SolutionComparisonState {
  weights: MetricWeights
}

const defaultState: SolutionComparisonState = {
  weights: DEFAULT_METRIC_WEIGHTS,
}

function saveToStorage(state: SolutionComparisonState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): SolutionComparisonState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SolutionComparisonState>
    return { weights: normaliseWeights(parsed.weights) }
  } catch {
    return null
  }
}

export const solutionComparison = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setWeights(state, weights: MetricWeights) {
      return { ...state, weights }
    },

    setWeight(state, { key, value }: { key: SolutionMetricKey; value: MetricImportance }) {
      return { ...state, weights: { ...state.weights, [key]: value } }
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.solutionComparison.setWeights(stored.weights)
      }
    },

    updateWeight(payload: { key: SolutionMetricKey; value: MetricImportance }, rootState) {
      dispatch.solutionComparison.setWeight(payload)
      saveToStorage({ weights: { ...rootState.solutionComparison.weights, [payload.key]: payload.value } })
    },

    resetWeights() {
      dispatch.solutionComparison.setWeights(DEFAULT_METRIC_WEIGHTS)
      saveToStorage({ weights: DEFAULT_METRIC_WEIGHTS })
    },
  }),
})
