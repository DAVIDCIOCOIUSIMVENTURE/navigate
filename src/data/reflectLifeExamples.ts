import { TriangleAlert, type LucideIcon } from "lucide-react"

export type LifePromptExample = {
  /** The life experience this example is about. Used as the tab label and card heading. */
  experience: string
  /** The observation / answer in plain prose. */
  answer: string
  /** Short note on why this surfaces a problem worth exploring. */
  whyItMatters: string
  icon?: LucideIcon
  /** Tailwind tile color. Use a brand palette class. */
  iconBg?: string
}

/**
 * Examples shown on the "Examples" tab of each Life experiences prompt. Designed
 * to demonstrate the *kind* of answer the prompt is meant to surface, not as
 * templates to copy. Keys map to `LensPrompt.id` in `src/data/reflectLenses.ts`.
 */
export const LIFE_PROMPT_EXAMPLES: Record<string, LifePromptExample[]> = {
  "significant-experience": [
    {
      experience: "Becoming a parent",
      answer:
        "Recent enough that the small bits of friction are still vivid, not just the big milestones.",
      whyItMatters:
        "Pick something close enough to remember vividly. Distant memories smooth out the details you actually need.",
      icon: TriangleAlert,
      iconBg: "bg-rose-800",
    },
    {
      experience: "Moving country",
      answer:
        "Concrete touchpoints: bank accounts, visas, leases. Each step had its own surface area of friction.",
      whyItMatters:
        "Concrete experiences with many touchpoints surface more problems than abstract ones like 'becoming more confident'.",
      icon: TriangleAlert,
      iconBg: "bg-blue-900",
    },
    {
      experience: "Caring for a relative",
      answer:
        "Involves many different systems and people, with friction sitting at every handoff between them.",
      whyItMatters:
        "Experiences that cross many systems or stakeholders are rich problem territory. Single-actor experiences tend to surface fewer opportunities.",
      icon: TriangleAlert,
      iconBg: "bg-emerald-800",
    },
  ],
  "harder-than-needed": [
    {
      experience: "Becoming a parent",
      answer:
        "Coordinating between two pediatricians and a daycare that each wanted the same information on different forms.",
      whyItMatters:
        "Repeated handoff friction signals a missing 'family profile' that travels with the child across services.",
      icon: TriangleAlert,
      iconBg: "bg-rose-800",
    },
    {
      experience: "Moving country",
      answer:
        "Proving identity to open a bank account with no local credit history and no permanent address yet.",
      whyItMatters:
        "Newcomers are creditworthy in their old country but invisible in the new one. Cross-border financial portability is an underserved market.",
      icon: TriangleAlert,
      iconBg: "bg-blue-900",
    },
    {
      experience: "Caring for a relative",
      answer:
        "Finding which specialists at the hospital actually had availability without a clear referral path to follow.",
      whyItMatters:
        "Care navigation is opaque to families. The bottleneck is information, not specialist capacity.",
      icon: TriangleAlert,
      iconBg: "bg-emerald-800",
    },
  ],
  "wish-told": [
    {
      experience: "Switching careers",
      answer:
        "That recruiters in the new field auto-screen on keywords that aren't on most career-switcher CVs.",
      whyItMatters:
        "Generic career-switch advice misses the real bottleneck: applicant tracking systems pattern-matching on vocabulary.",
      icon: TriangleAlert,
      iconBg: "bg-violet-800",
    },
    {
      experience: "Studying abroad",
      answer:
        "The visa cost was the smallest line item. Legal fees, certified translations, and apostille stamps dwarfed it.",
      whyItMatters:
        "The headline cost of complex life moves is misleading. Budgeting tools focus on the wrong line items.",
      icon: TriangleAlert,
      iconBg: "bg-orange-700",
    },
    {
      experience: "Going freelance",
      answer:
        "Self-employment tax effectively doubles what you owe on income people forget to set aside for.",
      whyItMatters:
        "Tax surprises for freelancers point at a per-invoice automatic withholding product.",
      icon: TriangleAlert,
      iconBg: "bg-yellow-600",
    },
  ],
  "wasted-spend": [
    {
      experience: "Recovering from burnout",
      answer:
        "An annual meditation app subscription that went unused because focusing long enough to start a session was the problem.",
      whyItMatters:
        "Generic wellness products do not meet people where they are during burnout. Severity-aware onboarding matters more than content.",
      icon: TriangleAlert,
      iconBg: "bg-emerald-800",
    },
    {
      experience: "First-time renting",
      answer:
        "A premium credit-check report the landlord did not accept because it was not from their preferred vendor.",
      whyItMatters:
        "Renters pay for things landlords arbitrarily reject. Standardising what counts as proof of creditworthiness is the opportunity.",
      icon: TriangleAlert,
      iconBg: "bg-blue-900",
    },
    {
      experience: "Buying a first home",
      answer:
        "Three pre-purchase building inspections on three houses, each flagging broadly the same recurring issues.",
      whyItMatters:
        "Inspection findings are not shared between sellers and serial buyers. A data-sharing platform could remove the repeated spend.",
      icon: TriangleAlert,
      iconBg: "bg-violet-800",
    },
  ],
  "personal-workaround": [
    {
      experience: "Long-distance relationship",
      answer:
        "A shared calendar of phone-call slots that adjusts for daylight savings in both countries automatically.",
      whyItMatters:
        "Time-zone-aware shared time is a niche but real product. Existing calendar tools assume both people are colocated.",
      icon: TriangleAlert,
      iconBg: "bg-rose-800",
    },
    {
      experience: "Recovering from a serious illness",
      answer:
        "A spreadsheet of medications, side effects, and which doctor prescribed each one across three clinics.",
      whyItMatters:
        "Patients are doing manual medication reconciliation that electronic health record systems should do for them.",
      icon: TriangleAlert,
      iconBg: "bg-emerald-800",
    },
    {
      experience: "Caring for an aging parent",
      answer:
        "A sibling WhatsApp group used informally as the parent's daily care log: meals, meds, mood, doctor visits.",
      whyItMatters:
        "Family care coordination is happening on the wrong tools. A dedicated multi-caregiver app is a clear opportunity.",
      icon: TriangleAlert,
      iconBg: "bg-yellow-600",
    },
  ],
}
