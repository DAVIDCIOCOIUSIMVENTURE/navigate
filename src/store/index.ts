import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core"
import { notes } from "./notes-model"
import { settings } from "./settings-model"
import { problemTriggers } from "./problem-triggers-model"
import { problems } from "./problems-model"
import { accountSettings } from "./account-settings-model"
import { solutions } from "./solutions-model"
import { solutionWorkspaces } from "./solution-workspaces-model"
export interface RootModel extends Models<RootModel> {
  notes: typeof notes
  settings: typeof settings
  problemTriggers: typeof problemTriggers
  problems: typeof problems
  accountSettings: typeof accountSettings
  solutions: typeof solutions
  solutionWorkspaces: typeof solutionWorkspaces
}

const models: RootModel = { notes, settings, problemTriggers, problems, accountSettings, solutions, solutionWorkspaces }

export function createStore() {
  return init<RootModel>({ models })
}

export type AppStore = ReturnType<typeof createStore>
export type AppDispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
