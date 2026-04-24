import { BookOpen, Compass, Heart, Book, Brain, Globe, Target, Lightbulb, Search, FlaskConical, Clock, Trophy, type LucideIcon } from "lucide-react"

export const navigationItems = {
  innovation: [
    {
      title: "Why It Matters",
      url: "/foundations",
      icon: BookOpen
    },
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

export const foundationsSectionIcons: Record<string, LucideIcon> = {
  compass: Compass,
  search: Search,
  flask: FlaskConical,
  clock: Clock,
  trophy: Trophy,
}

export function getFoundationsSectionIcon(iconKey: string): LucideIcon {
  return foundationsSectionIcons[iconKey] ?? BookOpen
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
