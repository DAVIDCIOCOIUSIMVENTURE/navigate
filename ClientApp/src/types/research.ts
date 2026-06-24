export type ResearchPromptCapture = {
  promptId: string
  answers: string[]
}

export type ResearchCapture = {
  methodId: string
  toolId: string | null
  capturedAt: string
  prompts: ResearchPromptCapture[]
}
