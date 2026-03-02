import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { Idea } from "@/types/idea"

interface IdeasState {
  ideas: Idea[]
  nextId: number
}

const defaultState: IdeasState = {
  ideas: [],
  nextId: 1,
}

export const ideas = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addIdea(state, idea: Idea) {
      return { ...state, ideas: [...state.ideas, idea], nextId: state.nextId + 1 }
    },

    updateIdea(state, { id, patch }: { id: number; patch: Partial<Idea> }) {
      return {
        ...state,
        ideas: state.ideas.map((idea) =>
          idea.id === id
            ? { ...idea, ...patch, updatedAt: new Date().toISOString() }
            : idea
        ),
      }
    },
  },
})
