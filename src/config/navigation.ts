import { Compass, Heart, Book, Brain, Globe, Search, CheckCircle, Lightbulb, FlaskConical } from "lucide-react"

export const navigationItems = {
  selfDiscovery: [
    {
      title: "Self Discovery",
      url: "/self-discovery",
      icon: Compass
    },
  ],
  innovation: [
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
