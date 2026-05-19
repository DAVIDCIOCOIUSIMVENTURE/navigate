import {
  Briefcase,
  HeartHandshake,
  Building2,
  Shuffle,
  Users,
  Radar,
  type LucideIcon,
} from "lucide-react"

/**
 * Static config for the Reflect feature. Each lens defines a guided Q&A. Adding
 * a seventh lens is just appending a `Lens` object here, no code changes needed.
 */

export type LensSelfDiscoverySource = {
  /** Self-discovery category id whose items become starter chips for the matching prompts. */
  category: "knowledge" | "skills-expertise" | "personal-interests" | "social-impact"
  /** Prompt ids that should surface chips from this category. */
  promptIds: string[]
}

export type LensPrompt = {
  id: string
  question: string
  helperText?: string
  examples?: string[]
  /** True if the user can capture multiple distinct answers to this prompt. */
  multipleAllowed: boolean
  /**
   * Ids of follow-up fields asked lazily at the review step (only for answers the
   * user keeps). Each id should map to a field rendered by the review screen.
   */
  capturesContext?: string[]
  /**
   * If true, this prompt's answer is context for later prompts, not a candidate
   * itself (e.g. "Name an organization"). Captured in session state but never
   * becomes a `ProblemCandidate`.
   */
  contextOnly?: boolean
}

export type LensId = "work" | "life" | "insider" | "cross" | "people" | "market"

export type Lens = {
  id: LensId
  title: string
  shortDescription: string
  longDescription: string
  icon: LucideIcon
  /** Tailwind class for the icon tile background. From the brand palette in CLAUDE.md. */
  tileColor: string
  estimatedMinutes: number
  prompts: LensPrompt[]
  /** Optional helper text rendered in the guidance panel for this lens. */
  helperText?: string
  /** Self-discovery items to surface as starter chips inside specific prompts. */
  selfDiscoverySources?: LensSelfDiscoverySource[]
  /**
   * Some lenses (Market signals) don't follow the standard intro -> prompts ->
   * review flow. Mark them here so the lens layout can route differently.
   */
  flowKind?: "standard" | "single-form"
}

export const REFLECT_LENSES: Lens[] = [
  {
    id: "life",
    title: "Life experiences",
    shortDescription: "Productize what you've already lived through. The friction you remember is friction others are about to hit.",
    longDescription:
      "Look back at one significant experience you've navigated and pull out the parts that were harder than they needed to be. You focus on a single experience per run so the prompts stay specific; to explore another, simply run this tool again and pick a different one.",
    icon: HeartHandshake,
    tileColor: "bg-yellow-600",
    estimatedMinutes: 10,
    helperText:
      "Retrospective beats current pain here. The specific things you only learned by doing are the things others are looking for.",
    prompts: [
      {
        id: "significant-experience",
        question: "What life experiences have you acquired?",
        helperText:
          "Pick one from your self-discovery, or add a new one. One experience at a time keeps the next prompts specific. To explore another experience later, run this tool again. This selection sets the stage for the next prompts.",
        examples: [
          "Becoming a parent",
          "Moving country",
          "Caring for an aging relative",
        ],
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "harder-than-needed",
        question: "Looking back at that experience, what part was harder than it needed to be?",
        helperText:
          "Friction you remember vividly is friction others are about to hit. Repeated handoffs, missing info, and time-of-day pain are good signals.",
        examples: [
          "Coordinating the same form across three providers who each wanted their own copy",
          "Proving identity without a local credit history",
          "Finding which specialists actually had availability without a referral",
        ],
        multipleAllowed: true,
      },
      {
        id: "wish-told",
        question: "What did you wish someone had told you upfront?",
        helperText:
          "Not generic advice. The specific thing you only learned by doing, and only because doing it broke something.",
        examples: [
          "That the visa fee was the smallest line item; translations and certifications dwarfed it",
          "That the first three months land critical paperwork in the foggiest window of your life",
          "That the bottleneck isn't specialist capacity, it's knowing who is accepting referrals this month",
        ],
        multipleAllowed: true,
      },
      {
        id: "wasted-spend",
        question: "What did you spend money on during that experience that turned out not to help?",
        helperText:
          "Misallocated spend often signals a missing or misleading product. The thing you paid for promised one outcome and delivered something else.",
        examples: [
          "An annual baby tracker subscription that died because logging a 3am feed needed too much focus",
          "A premium credit report from home that no local bank or landlord would accept",
          "Three private second opinions that all referred back to the first specialist",
        ],
        multipleAllowed: true,
      },
      {
        id: "personal-workaround",
        question: "What workaround did you build for yourself that you still use?",
        helperText:
          "The hack you built once and never stopped using is usually a product hiding in plain sight. Spreadsheets, group chats, and phone notes are the giveaways.",
        examples: [
          "A running phone note logging each pediatrician visit and which form needed updating next",
          "A spreadsheet of every document I've had translated: who, when, and where the original lives",
          "A sibling WhatsApp group used as the daily care log: meals, meds, doctor visits",
        ],
        multipleAllowed: true,
      },
      {
        id: "customer",
        question: "Who is this for?",
        helperText:
          "Optional, but giving the problem a customer makes it easier to define later. You are the source of this insight; pick the customer segments who feel this problem the same way.",
        examples: [
          "First-time parents in the first six months",
          "Skilled immigrants in their first year in a new country",
          "Adult children coordinating care for a parent at a distance",
        ],
        multipleAllowed: true,
      },
    ],
  },
  {
    id: "work",
    title: "Work friction",
    shortDescription: "Mine your own job for repeated annoyances and \"this should just exist\" thoughts.",
    longDescription:
      "Look at the things you do every week and the systems you work around. The friction you've stopped noticing is often the friction worth productizing.",
    icon: Briefcase,
    tileColor: "bg-blue-900",
    estimatedMinutes: 8,
    helperText:
      "Repeated small annoyances at work are easy to dismiss but they point to missing tools. Small, specific, and slightly weird are good signals.",
    selfDiscoverySources: [
      { category: "knowledge", promptIds: ["time-consuming", "frustrating-process", "workarounds"] },
      { category: "skills-expertise", promptIds: ["time-consuming", "frustrating-process", "workarounds"] },
    ],
    prompts: [
      {
        id: "time-consuming",
        question: "What's something at work you spend a surprising amount of time on each week?",
        helperText: "Think about tasks you'd struggle to explain why they take so long.",
        examples: [
          "Chasing approvals across departments",
          "Reformatting reports for different stakeholders",
          "Jumping between five tools to complete one task",
        ],
        multipleAllowed: true,
        capturesContext: ["who-else"],
      },
      {
        id: "expensive",
        question: "What's something you (or your team) spend money on at work that feels like more than it's worth?",
        helperText: "Subscriptions, contractors, recurring purchases.",
        multipleAllowed: true,
        capturesContext: ["who-else"],
      },
      {
        id: "frustrating-process",
        question: "What process at your job has frustrated you in the last month?",
        examples: [
          "Onboarding a new teammate",
          "Getting access to a system",
          "A specific recurring meeting",
        ],
        multipleAllowed: true,
        capturesContext: ["who-else"],
      },
      {
        id: "workarounds",
        question: "Where do you work around a system instead of through it?",
        helperText: "Workarounds usually point to a missing tool.",
        examples: [
          "Spreadsheets that shadow an official tool",
          "Private notes that duplicate a CRM",
        ],
        multipleAllowed: true,
        capturesContext: ["who-else"],
      },
      {
        id: "should-exist",
        question: "What \"this should just exist\" thought have you had recently?",
        helperText: "Small, specific, and slightly weird is good.",
        multipleAllowed: true,
        capturesContext: ["who-else"],
      },
    ],
  },
  {
    id: "insider",
    title: "Insider angle",
    shortDescription: "Use what you know about organizations from the inside. Outsiders can't see what you've seen.",
    longDescription:
      "Pick one organization you know intimately and answer the prompts about that one place. The aim is to surface the things only an insider would notice.",
    icon: Building2,
    tileColor: "bg-emerald-800",
    estimatedMinutes: 10,
    helperText:
      "One organization is enough. If you're worried about specifics, anonymize the language; the prompts work just as well in general terms.",
    selfDiscoverySources: [
      { category: "knowledge", promptIds: ["org-name"] },
    ],
    prompts: [
      {
        id: "org-name",
        question: "Name an organization you've worked at or know intimately.",
        helperText: "This answer isn't a candidate. It sets context for the prompts that follow.",
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "broken-process",
        question: "What internal process there was obviously broken but never got fixed?",
        examples: [
          "A manual handoff between two teams",
          "A report that everyone re-derives from scratch",
        ],
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
      {
        id: "skipped-opportunity",
        question: "What opportunity did people discuss inside but the organization never pursued?",
        helperText: "Often this is something with the wrong owner, not the wrong idea.",
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
      {
        id: "quiet-complaint",
        question: "What does everyone there quietly complain about?",
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
      {
        id: "surprising-knowledge",
        question: "What knowledge from inside that organization would surprise an outsider?",
        helperText: "Surprising knowledge is sellable knowledge.",
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
    ],
  },
  {
    id: "cross",
    title: "Cross-context patterns",
    shortDescription: "Spot something that works in one industry, hobby, or country and is missing in another you know.",
    longDescription:
      "A pattern that's normal in one context can be a fresh idea in another. The interesting question is usually why nobody has moved it yet.",
    icon: Shuffle,
    tileColor: "bg-violet-800",
    estimatedMinutes: 8,
    helperText:
      "Always ask \"why hasn't this happened yet?\". A clean answer (regulation, timing, distribution) often gates whether the transplant is a real opportunity.",
    selfDiscoverySources: [
      { category: "personal-interests", promptIds: ["hobby-vs-job"] },
    ],
    prompts: [
      {
        id: "hobby-vs-job",
        question: "Something normal in your hobby that's missing in your job, or vice versa.",
        examples: [
          "Scoring systems",
          "Tournament brackets",
          "Community moderation conventions",
        ],
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
      {
        id: "country-pattern",
        question: "Something common in another country or culture you know that isn't here.",
        examples: [
          "A payment method",
          "A bureaucratic shortcut",
          "A piece of infrastructure",
        ],
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
      {
        id: "industry-pattern",
        question: "Something common in one industry you've worked in that another industry would benefit from.",
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
      {
        id: "generational-pattern",
        question: "A solution that's normal for one age group or generation that no one's adapted for another.",
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
    ],
  },
  {
    id: "people",
    title: "People around you",
    shortDescription: "Observation, not introspection. The people in your daily life are a problem source you can verify by asking them.",
    longDescription:
      "Pick one person you observe regularly and answer the prompts with them in mind. Then validate by actually asking them.",
    icon: Users,
    tileColor: "bg-rose-800",
    estimatedMinutes: 8,
    helperText:
      "Treat this as observation, not assumption. Anything you capture here should be confirmed by talking to the person before you commit to it.",
    prompts: [
      {
        id: "person",
        question: "Pick one person in your life you observe regularly.",
        helperText: "This answer sets context. It doesn't become a candidate.",
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "repeated-complaint",
        question: "What do you hear them complain about repeatedly?",
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
      {
        id: "their-workaround",
        question: "What workaround have you watched them build for themselves?",
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
      {
        id: "hours-spent",
        question: "What do they spend hours doing that they wish was faster, cheaper, or easier?",
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
      {
        id: "life-stage",
        question: "What life stage are they in that has its own friction?",
        examples: ["New job", "New parent", "Recently retired", "First time renting"],
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
    ],
  },
  {
    id: "market",
    title: "Market signals",
    shortDescription: "A capture form for problems you spot by looking outward at reviews, trends, public data, and research.",
    longDescription:
      "This lens doesn't ask you what to look at. It gives you a place to write down what you find when you scan low-rated tools, trend trackers, open data, and research.",
    icon: Radar,
    tileColor: "bg-orange-700",
    estimatedMinutes: 5,
    flowKind: "single-form",
    helperText:
      "Useful source categories: low-rated but in-demand products on app stores, trend-tracking sites, scientific or industry research aggregators, public data portals. Capture the insight, not just the URL.",
    prompts: [
      {
        id: "what-found",
        question: "What did you find?",
        helperText: "A short title for the signal you spotted.",
        multipleAllowed: false,
      },
      {
        id: "where-seen",
        question: "Where did you see it?",
        helperText: "One line. The source category or the specific tool / dataset / report.",
        multipleAllowed: false,
      },
      {
        id: "what-problem",
        question: "What problem does it suggest?",
        helperText: "This is the candidate. Phrase it as a problem in plain language.",
        multipleAllowed: false,
      },
      {
        id: "who-affected",
        question: "Who is affected?",
        multipleAllowed: false,
      },
    ],
  },
]

/**
 * Field labels for the lazy context-capture fields rendered on the review step.
 * Prompt's `capturesContext` is a list of these field ids.
 */
export const LENS_CONTEXT_FIELDS: Record<string, { label: string; helperText?: string }> = {
  "who-else": {
    label: "Who else has this problem?",
    helperText: "A role, an industry, a team type.",
  },
  "other-orgs": {
    label: "Which other organizations have the same setup?",
    helperText: "A sector or a size.",
  },
  "who-benefits": {
    label: "Who would benefit from the transplant?",
  },
  "why-not-yet": {
    label: "Why hasn't this happened yet?",
    helperText: "Regulation, timing, distribution, or something else.",
  },
  "how-many": {
    label: "Roughly how many other people are in the same situation?",
  },
}

export const REFLECT_LENS_BY_ID: Record<LensId, Lens> = REFLECT_LENSES.reduce(
  (acc, lens) => {
    acc[lens.id] = lens
    return acc
  },
  {} as Record<LensId, Lens>
)

export function getReflectLens(id: string): Lens | undefined {
  return REFLECT_LENS_BY_ID[id as LensId]
}
