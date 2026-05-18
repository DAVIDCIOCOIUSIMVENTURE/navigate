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

const PARENT_BADGE = { icon: TriangleAlert, iconBg: "bg-rose-800" } as const
const MOVE_BADGE = { icon: TriangleAlert, iconBg: "bg-blue-900" } as const
const CARER_BADGE = { icon: TriangleAlert, iconBg: "bg-emerald-800" } as const

/**
 * Examples shown on the "Examples" tab of each Life experiences prompt. Designed
 * to demonstrate the *kind* of answer the prompt is meant to surface, not as
 * templates to copy. Keys map to `LensPrompt.id` in `src/data/reflectLenses.ts`.
 *
 * The same three personas (Becoming a parent, Moving country, Caring for a
 * relative) recur across every prompt, so a learner can follow each story all
 * the way through the lens.
 */
export const LIFE_PROMPT_EXAMPLES: Record<string, LifePromptExample[]> = {
  "significant-experience": [
    {
      experience: "Becoming a parent",
      answer:
        "Recent enough that the small bits of friction are still vivid, not just the big milestones.",
      whyItMatters:
        "Pick something close enough to remember vividly. Distant memories smooth out the details you actually need.",
      ...PARENT_BADGE,
    },
    {
      experience: "Moving country",
      answer:
        "Concrete touchpoints: bank accounts, visas, leases. Each step had its own surface area of friction.",
      whyItMatters:
        "Concrete experiences with many touchpoints surface more problems than abstract ones like 'becoming more confident'.",
      ...MOVE_BADGE,
    },
    {
      experience: "Caring for a relative",
      answer:
        "Involves many different systems and people, with friction sitting at every handoff between them.",
      whyItMatters:
        "Experiences that cross many systems or stakeholders are rich problem territory. Single-actor experiences tend to surface fewer opportunities.",
      ...CARER_BADGE,
    },
  ],
  "harder-than-needed": [
    {
      experience: "Becoming a parent",
      answer:
        "Coordinating between two pediatricians and a daycare that each wanted the same information on different forms.",
      whyItMatters:
        "Repeated handoff friction signals a missing 'family profile' that travels with the child across services.",
      ...PARENT_BADGE,
    },
    {
      experience: "Moving country",
      answer:
        "Proving identity to open a bank account with no local credit history and no permanent address yet.",
      whyItMatters:
        "Newcomers are creditworthy in their old country but invisible in the new one. Cross-border financial portability is an underserved market.",
      ...MOVE_BADGE,
    },
    {
      experience: "Caring for a relative",
      answer:
        "Finding which specialists at the hospital actually had availability without a clear referral path to follow.",
      whyItMatters:
        "Care navigation is opaque to families. The bottleneck is information, not specialist capacity.",
      ...CARER_BADGE,
    },
  ],
  "wish-told": [
    {
      experience: "Becoming a parent",
      answer:
        "That the first three months land critical paperwork (insurance, registration, leave) in the foggiest window of your life.",
      whyItMatters:
        "Major admin lands during peak cognitive load. There's room for life-event-aware admin assistance that batches and pre-fills the worst of it.",
      ...PARENT_BADGE,
    },
    {
      experience: "Moving country",
      answer:
        "That the visa fee was the smallest line item. Legal fees, certified translations, and apostille stamps dwarfed it.",
      whyItMatters:
        "Budgeting tools focus on headline costs and miss the long tail of cross-border admin spend.",
      ...MOVE_BADGE,
    },
    {
      experience: "Caring for a relative",
      answer:
        "That the bottleneck isn't specialist capacity, it's knowing which specialist is actually accepting referrals this month.",
      whyItMatters:
        "Care navigation is opaque to families. The hidden information asymmetry is the product opportunity.",
      ...CARER_BADGE,
    },
  ],
  "wasted-spend": [
    {
      experience: "Becoming a parent",
      answer:
        "An annual baby tracker app subscription that stopped getting opened because logging a 3am feed required more focus than the feed itself.",
      whyItMatters:
        "Baby and wellness apps assume active logging. Sleep-deprived parents need passive sensing, not another tap target.",
      ...PARENT_BADGE,
    },
    {
      experience: "Moving country",
      answer:
        "A premium credit-check report from my home country that no local landlord or bank would accept.",
      whyItMatters:
        "Cross-border financial reputation is non-portable. There's a product in translating creditworthiness across systems.",
      ...MOVE_BADGE,
    },
    {
      experience: "Caring for a relative",
      answer:
        "Three private second-opinion appointments that each referred back to the original specialist anyway.",
      whyItMatters:
        "Families pay to re-explain the same case to every provider. Shared care records would remove the duplicative spend.",
      ...CARER_BADGE,
    },
  ],
  "personal-workaround": [
    {
      experience: "Becoming a parent",
      answer:
        "A running phone note logging each pediatrician visit: what was asked, what was answered, and which form needed updating next.",
      whyItMatters:
        "Parents are stitching together their child's medical record by hand. A portable, parent-owned health record is an obvious product.",
      ...PARENT_BADGE,
    },
    {
      experience: "Moving country",
      answer:
        "A spreadsheet tracking every document I'd had translated: by whom, when, and where the original lived. Reused on every visa renewal.",
      whyItMatters:
        "Newcomers reinvent the same document tracker every time. A persistent immigration document vault is a clear opportunity.",
      ...MOVE_BADGE,
    },
    {
      experience: "Caring for a relative",
      answer:
        "A sibling WhatsApp group used as the daily care log: meals, meds, mood, doctor visits, who took her in.",
      whyItMatters:
        "Family care coordination is happening on the wrong tools. A dedicated multi-caregiver app is a real opportunity.",
      ...CARER_BADGE,
    },
  ],
}
