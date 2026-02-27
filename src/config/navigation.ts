import { Compass, Heart, Book, Brain, Globe, Lightbulb } from "lucide-react"

export const navigationItems = {
  ideas: [
    {
      title: "Ideas",
      url: "/ideas",
      icon: Lightbulb
    },
  ],
  selfDiscovery: [
    {
      title: "Self Discovery",
      url: "/self-discovery",
      icon: Compass
    },
  ],
}

export const selfDiscoveryCategoryIcons = {
  "personal-interests": Heart,
  "knowledge": Book,
  "skills-expertise": Brain,
  "social-impact": Globe
}

export function getNavigationItem(path: string) {
  const allItems = [...navigationItems.ideas, ...navigationItems.selfDiscovery]
  return allItems.find(item => item.url === path)
}

export function getSelfDiscoveryCategoryIcon(categoryId: string) {
  return selfDiscoveryCategoryIcons[categoryId as keyof typeof selfDiscoveryCategoryIcons]
}
