export type ReflectionPromptCapture = {
  promptId: string
  answers: string[]
}

export type ReflectionCapture = {
  lensId: string
  capturedAt: string
  prompts: ReflectionPromptCapture[]
}
