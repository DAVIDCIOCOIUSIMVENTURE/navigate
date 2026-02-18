import { createModel } from "@rematch/core"
import type { RootModel } from "."

export interface Solution {
  id: number
  text: string
}

export interface Problem {
  id: number
  text: string
}

export interface MarketSegment {
  segment: string
  description: string
}

export interface Job {
  id: number
  job: string
  functional: string
  emotional: string
  social: string
  solutions: Solution[]
  problems: Problem[]
}

interface State {
  marketSegment: MarketSegment
  jobs: Job[]
  nextJobId: number
  nextSolutionId: number
  nextProblemId: number
}

export const marketSegmentation = createModel<RootModel>()({
  state: {
    marketSegment: { segment: "", description: "" },
    jobs: [{ id: 1, job: "", functional: "", emotional: "", social: "", solutions: [], problems: [] }],
    nextJobId: 2,
    nextSolutionId: 1,
    nextProblemId: 1,
  } as State,
  reducers: {
    updateMarketSegment(state, payload: { field: keyof MarketSegment; value: string }) {
      return {
        ...state,
        marketSegment: { ...state.marketSegment, [payload.field]: payload.value },
      }
    },
    addJob(state) {
      return {
        ...state,
        jobs: [
          ...state.jobs,
          { id: state.nextJobId, job: "", functional: "", emotional: "", social: "", solutions: [], problems: [] },
        ],
        nextJobId: state.nextJobId + 1,
      }
    },
    updateJob(state, payload: { id: number; field: keyof Omit<Job, "id" | "solutions" | "problems">; value: string }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.id ? { ...j, [payload.field]: payload.value } : j
        ),
      }
    },
    removeJob(state, id: number) {
      if (state.jobs.length === 1) return state
      return {
        ...state,
        jobs: state.jobs.filter((j) => j.id !== id),
      }
    },
    addSolution(state, jobId: number) {
      const newSolution: Solution = { id: state.nextSolutionId, text: "" }
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === jobId ? { ...j, solutions: [...j.solutions, newSolution] } : j
        ),
        nextSolutionId: state.nextSolutionId + 1,
      }
    },
    updateSolution(state, payload: { jobId: number; id: number; text: string }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? { ...j, solutions: j.solutions.map((s) => (s.id === payload.id ? { ...s, text: payload.text } : s)) }
            : j
        ),
      }
    },
    removeSolution(state, payload: { jobId: number; id: number }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? { ...j, solutions: j.solutions.filter((s) => s.id !== payload.id) }
            : j
        ),
      }
    },
    addProblem(state, jobId: number) {
      const newProblem: Problem = { id: state.nextProblemId, text: "" }
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === jobId ? { ...j, problems: [...j.problems, newProblem] } : j
        ),
        nextProblemId: state.nextProblemId + 1,
      }
    },
    updateProblem(state, payload: { jobId: number; id: number; text: string }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? { ...j, problems: j.problems.map((p) => (p.id === payload.id ? { ...p, text: payload.text } : p)) }
            : j
        ),
      }
    },
    removeProblem(state, payload: { jobId: number; id: number }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? { ...j, problems: j.problems.filter((p) => p.id !== payload.id) }
            : j
        ),
      }
    },
  },
})
