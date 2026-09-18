import { getReflectLens } from "@/data/reflectLenses"
import { projectRoutes } from "@/lib/projects"
import {
  lensRoot,
  parseLensPath,
  lensHrefs,
  lensPromptHref,
  lensResumeHref,
  lensReviewHref,
  lensStepHref,
} from "./routes"

const life = getReflectLens("life")!
const lastLifeIndex = life.prompts.length - 1
const P = 4
const ROOT = lensRoot(P, "life")

describe("lens hrefs", () => {
  it("sits directly under the project's identify hub", () => {
    expect(ROOT).toBe("/projects/4/identify/life")
  })

  it("builds 1-based prompt urls", () => {
    expect(lensPromptHref(P, "life", 0)).toBe(`${ROOT}/prompts/1`)
    expect(lensPromptHref(P, "life", 2)).toBe(`${ROOT}/prompts/3`)
  })

  it("maps steps to their route", () => {
    expect(lensStepHref(P, "prompts", "life", 1)).toBe(`${ROOT}/prompts/2`)
    expect(lensStepHref(P, "review", "life")).toBe(lensReviewHref(P, "life"))
  })

  it("binds the builders to a project and a lens", () => {
    const hrefs = lensHrefs(P, "life")
    expect(hrefs.root()).toBe(ROOT)
    expect(hrefs.prompt(1)).toBe(lensPromptHref(P, "life", 1))
    expect(hrefs.review()).toBe(lensReviewHref(P, "life"))
    expect(hrefs.step("review")).toBe(lensReviewHref(P, "life"))
  })
})

describe("parseLensPath", () => {
  it("treats the bare tool url (with or without a trailing slash) as the root", () => {
    expect(parseLensPath(ROOT)).toEqual({ kind: "root", lens: life })
    expect(parseLensPath(`${ROOT}/`)).toEqual({ kind: "root", lens: life })
  })

  it("parses canonical prompt and review urls", () => {
    expect(parseLensPath(`${ROOT}/prompts/2`)).toEqual({
      kind: "prompts",
      lens: life,
      promptIndex: 1,
    })
    expect(parseLensPath(`${ROOT}/review`)).toEqual({ kind: "review", lens: life })
  })

  it("sends a tool the hub does not offer back to the hub", () => {
    const hub = projectRoutes.identify(P)
    expect(parseLensPath(`/projects/${P}/identify/nope/prompts/1`)).toEqual({ kind: "redirect", href: hub })
    // Drafted but not offered, so it has no route of its own.
    expect(parseLensPath(`/projects/${P}/identify/insider/prompts/1`)).toEqual({ kind: "redirect", href: hub })
    // The hub's other tools own their own folders and never reach this parser.
    expect(parseLensPath(`/projects/${P}/identify/canvas-builder`)).toEqual({ kind: "redirect", href: hub })
  })

  it("redirects a bare prompts segment to the first prompt", () => {
    const first = lensPromptHref(P, "life", 0)
    expect(parseLensPath(`${ROOT}/prompts`)).toEqual({ kind: "redirect", href: first })
    expect(parseLensPath(`${ROOT}/prompts/abc`)).toEqual({ kind: "redirect", href: first })
  })

  it("clamps out-of-range prompt numbers", () => {
    expect(parseLensPath(`${ROOT}/prompts/0`)).toEqual({
      kind: "redirect",
      href: lensPromptHref(P, "life", 0),
    })
    expect(parseLensPath(`${ROOT}/prompts/999`)).toEqual({
      kind: "redirect",
      href: lensPromptHref(P, "life", lastLifeIndex),
    })
  })

  it("redirects extra segments after review", () => {
    expect(parseLensPath(`${ROOT}/review/extra`)).toEqual({
      kind: "redirect",
      href: lensReviewHref(P, "life"),
    })
  })
})

describe("lensResumeHref", () => {
  it("starts at the first prompt with no position, or one left in another tool", () => {
    const first = lensPromptHref(P, "life", 0)
    expect(lensResumeHref(P, life, null, null, 0)).toBe(first)
    expect(lensResumeHref(P, life, "life", null, 2)).toBe(first)
    expect(lensResumeHref(P, life, "work", "review", 0)).toBe(first)
  })

  it("resumes review and prompts, clamping the stored index", () => {
    expect(lensResumeHref(P, life, "life", "review", 0)).toBe(lensReviewHref(P, "life"))
    expect(lensResumeHref(P, life, "life", "prompts", 1)).toBe(lensPromptHref(P, "life", 1))
    expect(lensResumeHref(P, life, "life", "prompts", 999)).toBe(lensPromptHref(P, "life", lastLifeIndex))
  })
})
