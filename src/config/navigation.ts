import { Compass, Heart, Book, Brain, Globe, Target, Lightbulb } from "lucide-react"

export const navigationItems = {
  innovation: [
    {
      title: "Self Discovery",
      url: "/self-discovery",
      icon: Compass
    },
    {
      title: "Problems",
      url: "/problems",
      icon: Target
    },
    {
      title: "Solutions",
      url: "/solutions",
      icon: Lightbulb
    },
  ],
}

export const selfDiscoveryCategoryIcons = {
  "personal-interests": Heart,
  "knowledge": Book,
  "skills-expertise": Brain,
  "social-impact": Globe
}

export function getSelfDiscoveryCategoryIcon(categoryId: string) {
  return selfDiscoveryCategoryIcons[categoryId as keyof typeof selfDiscoveryCategoryIcons]
}
