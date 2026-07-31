import { BookOpen, Compass, Heart, Book, Brain, Briefcase, Globe, Target, Lightbulb, Home, Search, FlaskConical, Clock, Trophy, Milestone, Hammer, Route, Users, RotateCcw, Plus, FolderKanban, LayoutDashboard, Presentation, type LucideIcon } from "lucide-react"

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
  sidebar: [
    {
      title: "Home",
      url: "/",
      icon: Home
    },
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
    {
      title: "Next Steps",
      url: "/next-steps",
      icon: Milestone
    },
    {
      title: "Portfolios",
      url: "/portfolios",
      icon: FolderKanban
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

export const portfolioActionIcons: Record<string, LucideIcon> = {
  ...nextStepsTopicIcons,
  "layout-dashboard": LayoutDashboard,
  presentation: Presentation,
}

export function getPortfolioActionIcon(iconKey: string): LucideIcon {
  return portfolioActionIcons[iconKey] ?? Milestone
}
