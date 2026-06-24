import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import type { LensId } from "@/data/reflectLenses"

/** Lookup: self-discovery question `url` -> category `url`. Built once from the static catalog. */
const QUESTION_URL_TO_CATEGORY: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const cat of SELF_DISCOVERY_CATEGORIES) {
    for (const q of cat.questions) {
      map[q.url] = cat.url
    }
  }
  return map
})()

export function getCategoryForItem(item: SelfDiscoveryItem): string | null {
  return QUESTION_URL_TO_CATEGORY[item.questionUrl] ?? null
}

export function filterItemsByCategory(
  items: SelfDiscoveryItem[],
  category: string
): SelfDiscoveryItem[] {
  return items.filter((it) => getCategoryForItem(it) === category)
}

/**
 * Decide which lenses to mark "Recommended" given a user's self-discovery answers.
 * Per spec 7.2:
 *   Knowledge or Skills items   -> Work + Insider
 *   Interests items             -> Life + Cross-context
 */
export function getRecommendedLensIds(items: SelfDiscoveryItem[]): Set<LensId> {
  const categories = new Set<string>()
  for (const item of items) {
    const cat = getCategoryForItem(item)
    if (cat) categories.add(cat)
  }
  const recommended = new Set<LensId>()
  if (categories.has("knowledge") || categories.has("skills-expertise")) {
    recommended.add("work")
    recommended.add("insider")
  }
  if (categories.has("personal-interests")) {
    recommended.add("life")
    recommended.add("cross")
  }
  return recommended
}
