import { createModel } from "@rematch/core"
import type { RootModel } from "."

export interface ChildItem {
  id: number
  text: string
}

export interface JobItem {
  id: number
  text: string
  type: "solution" | "problem"
  children: ChildItem[]
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
  items: JobItem[]
}

interface State {
  customerProfile: CustomerProfile
  ageMin: number
  ageMax: number
  jobs: Job[]
  nextJobId: number
  nextItemId: number
  nextChildId: number
}

export const findingMyCustomers = createModel<RootModel>()({
  state: {
    customerProfile: { name: "", occupation: "", whoTheyAre: "", goals: "", frustrations: "" },
    ageMin: 18,
    ageMax: 65,
    jobs: [{ id: 1, job: "", functional: "", emotional: "", social: "", items: [] }],
    nextJobId: 2,
    nextItemId: 1,
    nextChildId: 1,
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
          { id: state.nextJobId, job: "", functional: "", emotional: "", social: "", items: [] },
        ],
        nextJobId: state.nextJobId + 1,
      }
    },
    updateJob(state, payload: { id: number; field: keyof Omit<Job, "id" | "items">; value: string }) {
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
    addItem(state, payload: { jobId: number; type: "solution" | "problem" }) {
      const newItem: JobItem = { id: state.nextItemId, text: "", type: payload.type, children: [] }
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId ? { ...j, items: [...j.items, newItem] } : j
        ),
        nextItemId: state.nextItemId + 1,
      }
    },
    updateItemText(state, payload: { jobId: number; itemId: number; text: string }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? { ...j, items: j.items.map((item) => item.id === payload.itemId ? { ...item, text: payload.text } : item) }
            : j
        ),
      }
    },
    updateItemType(state, payload: { jobId: number; itemId: number; type: "solution" | "problem" }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? { ...j, items: j.items.map((item) => item.id === payload.itemId ? { ...item, type: payload.type, children: [] } : item) }
            : j
        ),
      }
    },
    removeItem(state, payload: { jobId: number; itemId: number }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? { ...j, items: j.items.filter((item) => item.id !== payload.itemId) }
            : j
        ),
      }
    },
    addChild(state, payload: { jobId: number; itemId: number }) {
      const newChild: ChildItem = { id: state.nextChildId, text: "" }
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? {
                ...j,
                items: j.items.map((item) =>
                  item.id === payload.itemId ? { ...item, children: [...item.children, newChild] } : item
                ),
              }
            : j
        ),
        nextChildId: state.nextChildId + 1,
      }
    },
    updateChild(state, payload: { jobId: number; itemId: number; childId: number; text: string }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? {
                ...j,
                items: j.items.map((item) =>
                  item.id === payload.itemId
                    ? { ...item, children: item.children.map((c) => c.id === payload.childId ? { ...c, text: payload.text } : c) }
                    : item
                ),
              }
            : j
        ),
      }
    },
    removeChild(state, payload: { jobId: number; itemId: number; childId: number }) {
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === payload.jobId
            ? {
                ...j,
                items: j.items.map((item) =>
                  item.id === payload.itemId
                    ? { ...item, children: item.children.filter((c) => c.id !== payload.childId) }
                    : item
                ),
              }
            : j
        ),
      }
    },
  },
})
