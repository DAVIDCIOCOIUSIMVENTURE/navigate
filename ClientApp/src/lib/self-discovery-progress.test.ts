import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import {
  getCategoryProgress,
  getSelfDiscoveryProgress,
  isQuestionComplete,
} from "./self-discovery-progress"

const firstCategory = SELF_DISCOVERY_CATEGORIES[0]
const totalQuestions = SELF_DISCOVERY_CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0)

function item(questionUrl: string, title = "an answer"): SelfDiscoveryItem {
  return { id: `you-user-${questionUrl}-${title}`, title, questionUrl }
}

describe("isQuestionComplete", () => {
  it("is false with no items", () => {
    expect(isQuestionComplete([], firstCategory.questions[0].url)).toBe(false)
  })

  it("is true after a single item", () => {
    const url = firstCategory.questions[0].url
    expect(isQuestionComplete([item(url)], url)).toBe(true)
  })

  it("ignores items belonging to other questions", () => {
    const [first, second] = firstCategory.questions
    expect(isQuestionComplete([item(second.url)], first.url)).toBe(false)
  })
})

describe("getCategoryProgress", () => {
  it("counts each answered question once", () => {
    const url = firstCategory.questions[0].url
    expect(getCategoryProgress([item(url, "a"), item(url, "b")], firstCategory.url)).toEqual({
      completed: 1,
      total: firstCategory.questions.length,
    })
  })

  it("reports zero for an unknown category", () => {
    expect(getCategoryProgress([], "not-a-category")).toEqual({ completed: 0, total: 0 })
  })
})

describe("getSelfDiscoveryProgress", () => {
  it("counts questions across every category", () => {
    expect(getSelfDiscoveryProgress([])).toEqual({ completed: 0, total: totalQuestions })
  })

  it("ignores items whose question is not part of the catalogue", () => {
    expect(getSelfDiscoveryProgress([item("other")])).toEqual({
      completed: 0,
      total: totalQuestions,
    })
  })

  it("reaches the total once every question has an item", () => {
    const items = SELF_DISCOVERY_CATEGORIES.flatMap((c) => c.questions.map((q) => item(q.url)))
    expect(getSelfDiscoveryProgress(items)).toEqual({
      completed: totalQuestions,
      total: totalQuestions,
    })
  })
})
