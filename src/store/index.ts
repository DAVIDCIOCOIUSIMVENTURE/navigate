import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core"
import { notes } from "./notes-model"
import { settings } from "./settings-model"
import { selfDiscoveryItems } from "./self-discovery-items-model"
import { customBrainstormItems } from "./custom-brainstorm-items-model"
import { problems } from "./problems-model"
import { accountSettings } from "./account-settings-model"
import { solutions } from "./solutions-model"
import { solutionWorkspaces } from "./solution-workspaces-model"
import { problemCandidates } from "./problem-candidates-model"
import { reflectSessions } from "./reflect-sessions-model"
export interface RootModel extends Models<RootModel> {
  notes: typeof notes
  settings: typeof settings
  selfDiscoveryItems: typeof selfDiscoveryItems
  customBrainstormItems: typeof customBrainstormItems
  problems: typeof problems
  accountSettings: typeof accountSettings
  solutions: typeof solutions
  solutionWorkspaces: typeof solutionWorkspaces
  problemCandidates: typeof problemCandidates
  reflectSessions: typeof reflectSessions
}

const models: RootModel = { notes, settings, selfDiscoveryItems, customBrainstormItems, problems, accountSettings, solutions, solutionWorkspaces, problemCandidates, reflectSessions }

export function createStore() {
  return init<RootModel>({ models })
}

export type AppStore = ReturnType<typeof createStore>
export type AppDispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
