import { Compass, Heart, Book, Brain, Globe, Search, Lightbulb, FlaskConical } from "lucide-react"

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
      icon: Search
    },
    {
      title: "Solution Discovery",
      url: "/solution-discovery",
      icon: Lightbulb
    },
    {
      title: "Solution Ideation",
      url: "/solution-ideation",
      icon: FlaskConical
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
