import { Search, Compass, CheckCircle, Sparkles, ClipboardCheck, Lightbulb, Heart, Book, Brain, Globe } from "lucide-react"

export const navigationItems = {
  problemDiscovery: [
    {
      title: "Self Discovery",
      url: "/self-discovery",
      icon: Compass
    },
    {
      title: "Idea Buckets",
      url: "/idea-triggers",
      icon: Lightbulb
    },
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
  const allItems = [...navigationItems.problemDiscovery, ...navigationItems.solution]
  return allItems.find(item => item.url === path)
}

export function getSelfDiscoveryCategoryIcon(categoryId: string) {
  return selfDiscoveryCategoryIcons[categoryId as keyof typeof selfDiscoveryCategoryIcons]
} 