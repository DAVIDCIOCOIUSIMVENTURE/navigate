import { createModel } from "@rematch/core"
import type { RootModel } from "."

export interface Problem {
  id: number
  text: string
}

export interface Solution {
  id: number
  text: string
  problems: Problem[]
}

export interface CustomerProfile {
  name: string
  occupation: string
  whoTheyAre: string
  goals: string
  frustrations: string
}

export interface Job {
  id: number
  job: string
  functional: string
  emotional: string
  social: string
  solutions: Solution[]
}

interface State {
  customerProfile: CustomerProfile
  ageMin: number
  ageMax: number
  jobs: Job[]
  nextJobId: number
  nextSolutionId: number
  nextProblemId: number
}

export const findingMyCustomers = createModel<RootModel>()({
  state: {
    customerProfile: { name: "", occupation: "", whoTheyAre: "", goals: "", frustrations: "" },
    ageMin: 18,
    ageMax: 65,
    jobs: [{ id: 1, job: "", functional: "", emotional: "", social: "", solutions: [] }],
    nextJobId: 2,
    nextSolutionId: 1,
    nextProblemId: 1,
  } as State,
  reducers: {
    updateCustomerProfile(state, payload: { field: keyof CustomerProfile; value: string }) {
      return {
        ...state,
        customerProfile: { ...state.customerProfile, [payload.field]: payload.value },
      }
    },
    updateAgeRange(state, payload: { min: number; max: number }) {
      return { ...state, ageMin: payload.min, ageMax: payload.max }
    },
    addJob(state) {
      return {
        ...state,
        jobs: [
          ...state.jobs,
          { id: state.nextJobId, job: "", functional: "", emotional: "", social: "", solutions: [] },
        ],
        nextJobId: state.nextJobId + 1,
      }
    },
    updateJob(state, payload: { id: number; field: keyof Omit<Job, "id" | "solutions">; value: string }) {
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
      const newSolution: Solution = { id: state.nextSolutionId, text: "", problems: [] }
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
    addProblem(state, payload: { jobId: number; solutionId: number }) {
      const newProblem: Problem = { id: state.nextProblemId, text: "" }
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? {
                ...j,
                solutions: j.solutions.map((s) =>
                  s.id === payload.solutionId ? { ...s, problems: [...s.problems, newProblem] } : s
                ),
              }
            : j
        ),
        nextProblemId: state.nextProblemId + 1,
      }
    },
    updateProblem(state, payload: { jobId: number; solutionId: number; id: number; text: string }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? {
                ...j,
                solutions: j.solutions.map((s) =>
                  s.id === payload.solutionId
                    ? { ...s, problems: s.problems.map((p) => (p.id === payload.id ? { ...p, text: payload.text } : p)) }
                    : s
                ),
              }
            : j
        ),
      }
    },
    removeProblem(state, payload: { jobId: number; solutionId: number; id: number }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? {
                ...j,
                solutions: j.solutions.map((s) =>
                  s.id === payload.solutionId
                    ? { ...s, problems: s.problems.filter((p) => p.id !== payload.id) }
                    : s
                ),
              }
            : j
        ),
      }
    },
  },
})
