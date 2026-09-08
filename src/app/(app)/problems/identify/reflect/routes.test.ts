import { getReflectLens } from "@/data/reflectLenses"
import {
  REFLECT_ROOT,
  parseReflectPath,
  reflectPromptHref,
  reflectResumeHref,
  reflectReviewHref,
  reflectStepHref,
} from "./routes"

const life = getReflectLens("life")!
const lastLifeIndex = life.prompts.length - 1

describe("reflect hrefs", () => {
  it("builds 1-based prompt urls", () => {
    expect(reflectPromptHref("life", 0)).toBe(`${REFLECT_ROOT}/life/prompts/1`)
    expect(reflectPromptHref("life", 2)).toBe(`${REFLECT_ROOT}/life/prompts/3`)
  })

  it("maps steps to their route", () => {
    expect(reflectStepHref("pick", "life")).toBe(REFLECT_ROOT)
    expect(reflectStepHref("prompts", "life", 1)).toBe(`${REFLECT_ROOT}/life/prompts/2`)
    expect(reflectStepHref("review", "life")).toBe(reflectReviewHref("life"))
  })
})

describe("parseReflectPath", () => {
  it("treats the root (with or without a trailing slash) as the pick step", () => {
    expect(parseReflectPath(REFLECT_ROOT)).toEqual({ kind: "pick" })
    expect(parseReflectPath(`${REFLECT_ROOT}/`)).toEqual({ kind: "pick" })
  })

  it("parses canonical prompt and review urls", () => {
    expect(parseReflectPath(`${REFLECT_ROOT}/life/prompts/2`)).toEqual({
      kind: "prompts",
      lens: life,
      promptIndex: 1,
    })
    expect(parseReflectPath(`${REFLECT_ROOT}/life/review`)).toEqual({ kind: "review", lens: life })
  })

  it("redirects an unknown lens back to the picker", () => {
    expect(parseReflectPath(`${REFLECT_ROOT}/nope/prompts/1`)).toEqual({
      kind: "redirect",
      href: REFLECT_ROOT,
    })
  })

  it("redirects a bare lens or bare prompts segment to the first prompt", () => {
    const first = reflectPromptHref("life", 0)
    expect(parseReflectPath(`${REFLECT_ROOT}/life`)).toEqual({ kind: "redirect", href: first })
    expect(parseReflectPath(`${REFLECT_ROOT}/life/prompts`)).toEqual({ kind: "redirect", href: first })
    expect(parseReflectPath(`${REFLECT_ROOT}/life/prompts/abc`)).toEqual({ kind: "redirect", href: first })
  })

  it("clamps out-of-range prompt numbers", () => {
    expect(parseReflectPath(`${REFLECT_ROOT}/life/prompts/0`)).toEqual({
      kind: "redirect",
      href: reflectPromptHref("life", 0),
    })
    expect(parseReflectPath(`${REFLECT_ROOT}/life/prompts/999`)).toEqual({
      kind: "redirect",
      href: reflectPromptHref("life", lastLifeIndex),
    })
  })

  it("redirects extra segments after review", () => {
    expect(parseReflectPath(`${REFLECT_ROOT}/life/review/extra`)).toEqual({
      kind: "redirect",
      href: reflectReviewHref("life"),
    })
  })
})

describe("reflectResumeHref", () => {
  it("returns null without a usable lens or when the user was on the picker", () => {
    expect(reflectResumeHref(null, "prompts", 0)).toBeNull()
    expect(reflectResumeHref("nope", "prompts", 0)).toBeNull()
    expect(reflectResumeHref("life", "pick", 3)).toBeNull()
  })

  it("resumes review and prompts, clamping the stored index", () => {
    expect(reflectResumeHref("life", "review", 0)).toBe(reflectReviewHref("life"))
    expect(reflectResumeHref("life", "prompts", 1)).toBe(reflectPromptHref("life", 1))
    expect(reflectResumeHref("life", null, 999)).toBe(reflectPromptHref("life", lastLifeIndex))
  })
})
