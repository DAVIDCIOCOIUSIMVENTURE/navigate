import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core"
import { journal } from "./journal-model"

export interface RootModel extends Models<RootModel> {
  journal: typeof journal
}

const models: RootModel = { journal }

export function createStore() {
  return init<RootModel>({ models })
}

export type AppStore = ReturnType<typeof createStore>
export type AppDispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
