import { describe, it, expect } from "vitest"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import {
  getCategoryForItem,
  filterItemsByCategory,
  getRecommendedLensIds,
} from "./reflect-recommendations"

function item(questionUrl: string, title = "x"): SelfDiscoveryItem {
  return { id: `you-user-${title}`, title, questionUrl }
}

describe("reflect-recommendations", () => {
  it("maps a real self-discovery question url to its category", () => {
    expect(getCategoryForItem(item("hobbies-interests"))).toBe("personal-interests")
  })

  it("returns null for an unknown question url", () => {
    expect(getCategoryForItem(item("totally-made-up"))).toBeNull()
  })

  it("filterItemsByCategory keeps only items in the given category", () => {
    const items = [
      item("hobbies-interests", "a"),
      item("totally-made-up", "b"),
    ]
    expect(filterItemsByCategory(items, "personal-interests")).toHaveLength(1)
    expect(filterItemsByCategory(items, "personal-interests")[0].title).toBe("a")
  })

  it("returns empty set when no items provided", () => {
    expect(getRecommendedLensIds([])).toEqual(new Set())
  })

  it("Interests items recommend Life and Cross-context lenses", () => {
    const result = getRecommendedLensIds([item("hobbies-interests")])
    expect(result.has("life")).toBe(true)
    expect(result.has("cross")).toBe(true)
    expect(result.has("work")).toBe(false)
    expect(result.has("insider")).toBe(false)
  })

  it("returns empty set when items have unrecognised question urls", () => {
    expect(getRecommendedLensIds([item("totally-made-up")])).toEqual(new Set())
  })

  it("Knowledge items recommend Work and Insider lenses", () => {
    const result = getRecommendedLensIds([item("areas-of-knowledge")])
    expect(result.has("work")).toBe(true)
    expect(result.has("insider")).toBe(true)
    expect(result.has("life")).toBe(false)
    expect(result.has("cross")).toBe(false)
  })

  it("Skills items recommend Work and Insider lenses", () => {
    const result = getRecommendedLensIds([item("technical-skills")])
    expect(result.has("work")).toBe(true)
    expect(result.has("insider")).toBe(true)
  })

  it("combines categories: knowledge + interests recommends all four", () => {
    const result = getRecommendedLensIds([
      item("areas-of-knowledge"),
      item("hobbies-interests"),
    ])
    expect(result).toEqual(new Set(["work", "insider", "life", "cross"]))
  })
})
