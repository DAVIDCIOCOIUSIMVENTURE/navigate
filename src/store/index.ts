import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core"
import { journal } from "./journal-model"
import { settings } from "./settings-model"
import { problemTriggers } from "./problem-triggers-model"
import { ideas } from "./ideas-model"

export interface RootModel extends Models<RootModel> {
  journal: typeof journal
  settings: typeof settings
  problemTriggers: typeof problemTriggers
  ideas: typeof ideas
}

const models: RootModel = { journal, settings, problemTriggers, ideas }

export function createStore() {
  return init<RootModel>({ models })
}

export type AppStore = ReturnType<typeof createStore>
export type AppDispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
