import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core"
import { marketSegmentation } from "./market-segmentation-model"

export interface RootModel extends Models<RootModel> {
  marketSegmentation: typeof marketSegmentation
}

const models: RootModel = { marketSegmentation }

export function createStore() {
  return init<RootModel>({ models })
}

export type AppStore = ReturnType<typeof createStore>
export type AppDispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
