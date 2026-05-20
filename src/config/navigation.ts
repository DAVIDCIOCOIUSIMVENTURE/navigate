import { BookOpen, Compass, Heart, Book, Brain, Briefcase, Globe, Target, Lightbulb, LayoutDashboard, Search, FlaskConical, Clock, Trophy, Milestone, Hammer, Route, Users, RotateCcw, Plus, type LucideIcon } from "lucide-react"

export const navigationItems = {
  innovation: [
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
  topMenu: [
    {
      title: "Why It Matters",
      url: "/foundations",
      icon: BookOpen
    },
    {
      title: "Next Steps",
      url: "/next-steps",
      icon: Milestone
    },
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard
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
  "work-experience": Briefcase,
  "social-impact": Globe,
  "audience": Users,
  "other": Plus,
}

export function getSelfDiscoveryCategoryIcon(categoryId: string) {
  return selfDiscoveryCategoryIcons[categoryId as keyof typeof selfDiscoveryCategoryIcons]
}

export const nextStepsTopicIcons: Record<string, LucideIcon> = {
  hammer: Hammer,
  flask: FlaskConical,
  route: Route,
  users: Users,
  "rotate-ccw": RotateCcw,
}

export function getNextStepsTopicIcon(iconKey: string): LucideIcon {
  return nextStepsTopicIcons[iconKey] ?? Milestone
}
