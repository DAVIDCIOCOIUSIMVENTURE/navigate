import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core"
import { findingMyCustomers } from "./finding-my-customers-model"

export interface RootModel extends Models<RootModel> {
  findingMyCustomers: typeof findingMyCustomers
}

const models: RootModel = { findingMyCustomers }

export function createStore() {
  return init<RootModel>({ models })
}

export type AppStore = ReturnType<typeof createStore>
export type AppDispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
