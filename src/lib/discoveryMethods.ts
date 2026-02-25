import { Globe, Target, UserSearch, type LucideIcon } from "lucide-react"

export type DiscoveryMethod = {
  id: string
  title: string
  description: string
  examples: string[]
  href: string | null
  icon: LucideIcon
}

export const DISCOVERY_METHODS: DiscoveryMethod[] = [
  {
    id: "already-know",
    title: "I Already Know My Problem",
    description:
      "Skip the discovery phase if you have a clear problem in mind. Jump straight to defining it properly and exploring how to solve it.",
    examples: [
      "You've spotted a recurring frustration in your own work or daily life",
      "Customers or colleagues have told you directly what they struggle with",
      "You've already done research and have a specific problem statement ready",
    ],
    href: null,
    icon: Target,
  },
  {
    id: "finding-my-customers",
    title: "Start From Finding My Customers",
    description:
      "Begin by identifying and describing the specific people you want to serve. By anchoring discovery in real customers, you can uncover their jobs to be done, explore existing solutions they use, and reveal the problems those solutions leave unsolved.",
    examples: [
      "Freelance designers struggling to get clear, consolidated feedback from clients",
      "New parents returning to work who can't find flexible childcare that fits their hours",
      "Independent café owners overwhelmed by staff scheduling without dedicated management tools",
    ],
    href: "/problem-discovery/find-new-problems/finding-my-customers",
    icon: UserSearch,
  },
  {
    id: "environment-changes",
    title: "Changes in the Environment",
    description:
      "Look for problems triggered by shifts in technology, regulation, economy, or culture. External changes often disrupt established habits and create gaps that new solutions can fill.",
    examples: [
      "Businesses adapting to new data-privacy regulations like GDPR",
      "Workers reskilling after automation replaces their previous roles",
      "Consumers seeking sustainable alternatives following environmental policy changes",
    ],
    href: null,
    icon: Globe,
  },
]
