import { describe, it, expect } from "vitest"
import {
  REFLECT_LENSES,
  getAnchorPrompt,
  getAnchorPromptId,
  getReflectLens,
  getRolePromptId,
  startsFromProblem,
} from "./reflectLenses"

describe("REFLECT_LENSES schema", () => {
  it("has unique lens ids that getReflectLens resolves", () => {
    const ids = REFLECT_LENSES.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(getReflectLens(id)?.id).toBe(id)
    expect(getReflectLens("market")).toBeUndefined()
  })

  it("every prompt id is unique within its lens", () => {
    for (const lens of REFLECT_LENSES) {
      const ids = lens.prompts.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it("every lens has exactly one anchor, and prompts beyond it", () => {
    for (const lens of REFLECT_LENSES) {
      expect(lens.prompts.filter((p) => p.contextOnly)).toHaveLength(1)
      expect(getAnchorPrompt(lens).multipleAllowed).toBe(false)
      expect(lens.prompts.some((p) => !p.contextOnly)).toBe(true)
    }
  })

  it("every lens saves into the problems column, which the review step needs", () => {
    for (const lens of REFLECT_LENSES) {
      expect(getRolePromptId(lens, "problems")).not.toBeNull()
    }
  })

  it("uses each dimension role at most once per lens, since the save reads one prompt per column", () => {
    for (const lens of REFLECT_LENSES) {
      for (const role of ["problems", "customers", "contexts"] as const) {
        expect(lens.prompts.filter((p) => p.role === role).length).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe("Something that annoys you", () => {
  const lens = getReflectLens("annoyance")!

  it("is the one lens that starts from a problem type rather than a situation", () => {
    expect(getAnchorPrompt(lens).role).toBe("problems")
    expect(REFLECT_LENSES.filter(startsFromProblem).map((l) => l.id)).toEqual(["annoyance"])
  })

  it("works backwards to who has it and when it bites, so it fills every dimension column", () => {
    const anchorId = getAnchorPromptId(lens)
    const customersId = getRolePromptId(lens, "customers")
    const contextsId = getRolePromptId(lens, "contexts")
    expect(customersId).not.toBeNull()
    expect(contextsId).not.toBeNull()
    expect([customersId, contextsId]).not.toContain(anchorId)
    // The dimension prompts follow the questions that make the annoyance concrete.
    const order = lens.prompts.map((p) => p.id)
    expect(order.indexOf("last-time")).toBeLessThan(order.indexOf("who-else"))
    expect(order.indexOf("trying-to-do")).toBeLessThan(order.indexOf("who-else"))
    expect(order.indexOf("who-else")).toBeLessThan(order.indexOf("when-it-bites"))
  })
})
