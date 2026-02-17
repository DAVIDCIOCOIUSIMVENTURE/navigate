import { Search, Compass, CheckCircle, Sparkles, ClipboardCheck, Heart, Book, Brain, Globe } from "lucide-react"

export const navigationItems = {
  selfDiscovery: [
    {
      title: "Self Discovery",
      url: "/self-discovery",
      icon: Compass
    },
  ],
  problemDiscovery: [
    {
      title: "Problem Discovery",
      url: "/problem-discovery",
      icon: Search
    },
    {
      title: "Problem Validation",
      url: "/problem-validation",
      icon: CheckCircle
    },
  ],
  solution: [
    {
      title: "Solution Ideation",
      url: "/solution-ideation",
      icon: Sparkles
    },
    {
      title: "Solution Validation",
      url: "/solution-validation",
      icon: ClipboardCheck
    },
  ]
}

export const selfDiscoveryCategoryIcons = {
  "1": Heart,
  "2": Book,
  "3": Brain,
  "4": Globe
}

export function getNavigationItem(path: string) {
  const allItems = [...navigationItems.selfDiscovery, ...navigationItems.problemDiscovery, ...navigationItems.solution]
  return allItems.find(item => item.url === path)
}

export function getSelfDiscoveryCategoryIcon(categoryId: string) {
  return selfDiscoveryCategoryIcons[categoryId as keyof typeof selfDiscoveryCategoryIcons]
} 