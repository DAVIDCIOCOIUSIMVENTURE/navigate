import { describe, it, expect } from "vitest"
import { REFLECT_LENSES, LENS_CONTEXT_FIELDS } from "./reflectLenses"

describe("REFLECT_LENSES schema", () => {
  it("has unique lens ids", () => {
    const ids = REFLECT_LENSES.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every lens has at least one prompt", () => {
    for (const lens of REFLECT_LENSES) {
      expect(lens.prompts.length).toBeGreaterThan(0)
    }
  })

  it("every lens has at least one non-contextOnly prompt", () => {
    for (const lens of REFLECT_LENSES) {
      expect(lens.prompts.some((p) => !p.contextOnly)).toBe(true)
    }
  })

  it("every prompt id is unique within its lens", () => {
    for (const lens of REFLECT_LENSES) {
      const ids = lens.prompts.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it("every capturesContext id has a matching entry in LENS_CONTEXT_FIELDS", () => {
    for (const lens of REFLECT_LENSES) {
      for (const prompt of lens.prompts) {
        for (const fieldId of prompt.capturesContext ?? []) {
          expect(LENS_CONTEXT_FIELDS[fieldId]).toBeDefined()
        }
      }
    }
  })

  it("every selfDiscoverySources promptId references an existing prompt", () => {
    for (const lens of REFLECT_LENSES) {
      const promptIds = new Set(lens.prompts.map((p) => p.id))
      for (const source of lens.selfDiscoverySources ?? []) {
        for (const promptId of source.promptIds) {
          expect(promptIds.has(promptId)).toBe(true)
        }
      }
    }
  })
})
