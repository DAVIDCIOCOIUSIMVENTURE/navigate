import { getReflectLens } from "@/data/reflectLenses"
import {
  reflectRoot,
  parseReflectPath,
  reflectHrefs,
  reflectPromptHref,
  reflectResumeHref,
  reflectReviewHref,
  reflectStepHref,
} from "./routes"

const life = getReflectLens("life")!
const lastLifeIndex = life.prompts.length - 1
const P = 4
const ROOT = reflectRoot(P)

describe("reflect hrefs", () => {
  it("lives under the project", () => {
    expect(ROOT).toBe("/projects/4/identify/reflect")
  })

  it("builds 1-based prompt urls", () => {
    expect(reflectPromptHref(P, "life", 0)).toBe(`${ROOT}/life/prompts/1`)
    expect(reflectPromptHref(P, "life", 2)).toBe(`${ROOT}/life/prompts/3`)
  })

  it("maps steps to their route", () => {
    expect(reflectStepHref(P, "pick", "life")).toBe(ROOT)
    expect(reflectStepHref(P, "prompts", "life", 1)).toBe(`${ROOT}/life/prompts/2`)
    expect(reflectStepHref(P, "review", "life")).toBe(reflectReviewHref(P, "life"))
  })

  it("binds the builders to a project", () => {
    const hrefs = reflectHrefs(P)
    expect(hrefs.pick()).toBe(ROOT)
    expect(hrefs.prompt("life", 1)).toBe(reflectPromptHref(P, "life", 1))
    expect(hrefs.review("life")).toBe(reflectReviewHref(P, "life"))
    expect(hrefs.step("review", "life")).toBe(reflectReviewHref(P, "life"))
  })
})

describe("parseReflectPath", () => {
  it("treats the root (with or without a trailing slash) as the pick step", () => {
    expect(parseReflectPath(ROOT)).toEqual({ kind: "pick" })
    expect(parseReflectPath(`${ROOT}/`)).toEqual({ kind: "pick" })
  })

  it("parses canonical prompt and review urls", () => {
    expect(parseReflectPath(`${ROOT}/life/prompts/2`)).toEqual({
      kind: "prompts",
      lens: life,
      promptIndex: 1,
    })
    expect(parseReflectPath(`${ROOT}/life/review`)).toEqual({ kind: "review", lens: life })
  })

  it("redirects an unknown lens back to the picker of the same project", () => {
    expect(parseReflectPath(`${ROOT}/nope/prompts/1`)).toEqual({
      kind: "redirect",
      href: ROOT,
    })
  })

  it("redirects a bare lens or bare prompts segment to the first prompt", () => {
    const first = reflectPromptHref(P, "life", 0)
    expect(parseReflectPath(`${ROOT}/life`)).toEqual({ kind: "redirect", href: first })
    expect(parseReflectPath(`${ROOT}/life/prompts`)).toEqual({ kind: "redirect", href: first })
    expect(parseReflectPath(`${ROOT}/life/prompts/abc`)).toEqual({ kind: "redirect", href: first })
  })

  it("clamps out-of-range prompt numbers", () => {
    expect(parseReflectPath(`${ROOT}/life/prompts/0`)).toEqual({
      kind: "redirect",
      href: reflectPromptHref(P, "life", 0),
    })
    expect(parseReflectPath(`${ROOT}/life/prompts/999`)).toEqual({
      kind: "redirect",
      href: reflectPromptHref(P, "life", lastLifeIndex),
    })
  })

  it("redirects extra segments after review", () => {
    expect(parseReflectPath(`${ROOT}/life/review/extra`)).toEqual({
      kind: "redirect",
      href: reflectReviewHref(P, "life"),
    })
  })
})

describe("reflectResumeHref", () => {
  it("returns null without a usable lens or when the user was on the picker", () => {
    expect(reflectResumeHref(P, null, "prompts", 0)).toBeNull()
    expect(reflectResumeHref(P, "nope", "prompts", 0)).toBeNull()
    expect(reflectResumeHref(P, "life", "pick", 3)).toBeNull()
  })

  it("resumes review and prompts, clamping the stored index", () => {
    expect(reflectResumeHref(P, "life", "review", 0)).toBe(reflectReviewHref(P, "life"))
    expect(reflectResumeHref(P, "life", "prompts", 1)).toBe(reflectPromptHref(P, "life", 1))
    expect(reflectResumeHref(P, "life", null, 999)).toBe(reflectPromptHref(P, "life", lastLifeIndex))
  })
})
