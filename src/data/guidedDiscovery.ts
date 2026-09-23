import { Waypoints } from "lucide-react"
import type { DimensionKey } from "@/lib/dimension-visuals"

/**
 * Guided discovery: one tool on the Identify a Problem hub that sets out to
 * cover the ground of every guided prompt tool. Rather than picking a tool
 * named after a situation ("Work friction", "Audience problems"), the user
 * first says what they are starting from, which decides the dimension of the
 * problem the run begins with (You, Customer, Problem or Context).
 *
 * After that every route asks **the same questions**. What differs per route
 * is only:
 *
 * - the **anchor**: the thing the run is about, picked with that dimension's
 *   own picker, which also fills that dimension's column and so removes the
 *   matching question from the route;
 * - the **voice**: one further choice ("I am one of them", "Mine", "It is the
 *   first time") that does not add questions but rewrites the shared ones in
 *   the right person and tense;
 * - the **order**, and the odd question that only makes sense on one route
 *   (`voices` on a step).
 *
 * So the content is a small set of `GUIDED_SLOTS`, each with default copy and
 * wording variants keyed by dimension or voice, plus one `GuidedRoute` per
 * dimension listing its steps. `resolveGuidedPath` in
 * `src/lib/guided-discovery.ts` turns the answers so far into the concrete
 * list of questions. Answers are keyed by slot id, so an answer to "who has
 * it" survives a change of voice, or even of route.
 *
 * Drafts live in the `reflectSessions` model under `GUIDED_TOOL_ID`, and a
 * saved problem carries the run as its `reflection` with that same id, so the
 * tool sits beside the lenses without a store of its own.
 */

export const GUIDED_TOOL_ID = "guided"

export const GUIDED_TOOL = {
  id: GUIDED_TOOL_ID,
  title: "Guided discovery",
  shortDescription:
    "Say what you are starting from, then answer the same short set of questions worded for your route.",
  bestFor:
    "Best for when none of the other tools quite fits, or you are not sure which to pick. It starts by asking what you have to hand (your own experience, a group of people, an annoyance or a moment when things go wrong) and words the questions that follow for it.",
  icon: Waypoints,
  estimatedMinutes: 10,
} as const

/** An answer to a choice: which option was taken, kept in the answer's context. */
export const GUIDED_OPTION_FIELD = "optionId"

/** The first question's answer key, and the prefixes of each route's own two keys. */
export const GUIDED_START_ID = "start"
export const guidedVoiceId = (dimension: DimensionKey) => `voice-${dimension}`
export const guidedAnchorId = (dimension: DimensionKey) => `anchor-${dimension}`

/** What a question says. A variant overrides any part of it. */
export type GuidedCopy = {
  question: string
  helperText?: string
  examples?: string[]
  /** For a You anchor: the self-discovery question a new entry is saved under. */
  selfDiscoveryQuestionUrl?: string
}

/** Default copy plus wording variants keyed by dimension ("you") or voice ("you-once"); a voice wins over a dimension. */
export type GuidedWording = {
  copy: GuidedCopy
  variants?: Record<string, Partial<GuidedCopy>>
}

/** One of the shared questions every route draws from. */
export type GuidedSlot = GuidedWording & {
  id: string
  /**
   * Which of the problem's dimension columns the answers land in, rendered
   * with that column's picker. Untagged slots are kept as the problem's
   * reflection only.
   */
  role?: Exclude<DimensionKey, "you">
  /** True if the user can capture multiple distinct answers. */
  multipleAllowed: boolean
}

export type GuidedVoiceOption = {
  id: string
  label: string
  description?: string
}

/** A step on a route: the anchor, the voice choice, or a shared slot, optionally only for some voices. */
export type GuidedStep = "anchor" | "voice" | string | { slot: string; voices: string[] }

export type GuidedRoute = {
  dimension: DimensionKey
  /** How the route is offered on the first question. */
  option: { id: string; label: string; description: string }
  /** The anchor prompt: what the run is about, and the column it fills. */
  anchor: GuidedWording
  /** The one further choice that rewrites the shared questions. */
  voice: GuidedWording & { options: GuidedVoiceOption[] }
  steps: GuidedStep[]
}

/* ─── The nodes the flow renders, built from the above by the rules ─── */

export type GuidedOption = {
  id: string
  label: string
  description?: string
  /** The dimension this option starts from, shown as a pill. Only the first question carries these. */
  dimension?: DimensionKey
}

export type GuidedChoiceNode = {
  kind: "choice"
  id: string
  question: string
  helperText?: string
  options: GuidedOption[]
}

export type GuidedPromptNode = GuidedCopy & {
  kind: "prompt"
  id: string
  multipleAllowed: boolean
  role?: DimensionKey
  /** The anchor: this answer is what the rest of the run is about and pre-fills the problem's title. */
  anchor?: boolean
}

export type GuidedNode = GuidedChoiceNode | GuidedPromptNode

/* ─── Content ─── */

export const GUIDED_START: GuidedCopy = {
  question: "What are you starting from?",
  helperText:
    "A problem worth solving can be reached from four directions. Pick the one you have most to say about; the questions that follow are worded for it.",
}

const HOW_THEY_COPE =
  "Nobody just suffers; they build a workaround or pay for one. What people do instead is the best clue to what a solution has to beat and what it might be worth. If the honest answer is \"nothing, we put up with it\", say so: that is a signal too."
const WORKAROUND_YOU =
  "The hack you built once and never stopped using is usually a product hiding in plain sight. Spreadsheets, group chats, phone notes and homemade tools all count."
const WHY_STILL_THERE =
  "Sometimes there is a good reason: a rule, a cost, a supplier who does not need to care because you cannot leave. Sometimes nobody has looked properly. Your best guess tells you whether you have found a gap or a wall."
const MISALLOCATED_SPEND =
  "Misallocated spend often signals a missing or misleading product. The thing paid for promises one outcome and delivers another."

export const GUIDED_SLOTS: GuidedSlot[] = [
  {
    id: "problems",
    role: "problems",
    multipleAllowed: true,
    copy: {
      question: "What goes wrong?",
      helperText:
        "Specific friction beats broad pain. Steps people redo, information they cannot find, or things that always hit at the worst possible time are good signals.",
      examples: [
        "Coordinating the same form across three providers who each wanted their own copy",
        "Tracking invoices across three clients who each want a different format",
      ],
    },
    variants: {
      "you-once": {
        question: "Looking back, what was harder than it needed to be?",
        helperText:
          "Friction you remember vividly is friction others are about to hit. Steps you had to redo, information you could not find, or things that always hit at the worst possible time are good signals.",
        examples: [
          "Coordinating the same form across three providers who each wanted their own copy",
          "Proving identity without a local credit history",
          "Finding which specialists actually had availability without a referral",
        ],
      },
      "you-recurring": {
        question: "What about it has frustrated you recently?",
        helperText:
          "Recent friction is easier to describe. Steps you had to redo, information you could not find, or things that always hit at the worst possible time are good signals.",
        examples: [
          "Chasing approvals across three departments for a routine purchase",
          "Tracking which kids had paid for the tournament and which had not",
          "A weekly meeting that always overruns and never decides anything",
        ],
      },
      "customers-member": {
        question: "What do you and people like you struggle with that you shouldn't have to?",
        helperText:
          "Answer for the group, not just yourself: the friction you share is the friction worth solving. Steps you all redo, information none of you can find, things you have all learned to live with.",
      },
      "customers-serve": {
        question: "What do they bring to you, or complain about, again and again?",
        helperText:
          "The requests that keep coming back are the clearest signal. Stick to what they actually say and ask for rather than what you think they need.",
        examples: ["The same question about which form to fill in, every week", "Being asked to redo work because the brief changed halfway"],
      },
      "customers-observe": {
        question: "What have you seen them struggle with?",
        helperText:
          "Only what you have actually watched them deal with, not what you assume they deal with. If you have not seen it, leave it out and go and look.",
        examples: ["Keeping in-store stock counts in sync with the online shop", "Working out which of five similar tools they are supposed to use"],
      },
      contexts: {
        question: "What goes wrong in that moment?",
        helperText: "Describe the friction as it actually happens: what people are trying to do, and what stops them.",
        examples: ["Finding somewhere to leave the pram on a packed train", "Working out what to cook with what is actually in the fridge"],
      },
      "contexts-time": {
        question: "What goes wrong when there is no time to do it properly?",
        helperText: "Under pressure people skip steps, guess and pay for it later. Which corners get cut, and what does that cost?",
        examples: ["Booking the first tradesperson who answers, whatever they charge", "Signing the form without reading the fees"],
      },
      "contexts-first": {
        question: "What do people get wrong or miss the first time round?",
        helperText: "The first time through, nobody knows which step matters or which cost is coming. What only becomes obvious afterwards?",
        examples: ["Not knowing the deposit is due before the contract is signed", "Finding out the referral was needed after the appointment"],
      },
      "contexts-many": {
        question: "Where does it break down between the people or the steps?",
        helperText:
          "Handovers are where things fall through: the form that goes to three places, the message nobody owns, the decision that waits on someone else.",
        examples: ["Each department wants its own copy of the same form", "Nobody knows who is supposed to confirm the booking"],
      },
    },
  },
  {
    id: "occasion",
    multipleAllowed: true,
    copy: {
      question: "Describe one real occasion when it went wrong.",
      helperText:
        "One real occasion beats a complaint in general. Where was it, what was the person in the middle of, and exactly what went wrong? The details are what turn an annoyance into a problem you can describe to somebody else.",
      examples: [
        "Tuesday lunchtime, trying to cancel a gym membership on a phone, and being told to ring a number that only answers between nine and five",
        "Booking a plumber for a leak and discovering the call-out charge only once he was standing in the kitchen",
      ],
    },
    variants: {
      "problems-mine": {
        question: "When did it last happen to you? Describe that moment.",
        helperText:
          "One real occasion beats a complaint in general. Where were you, what were you in the middle of, and exactly what went wrong? Add another occasion if a different one comes to mind.",
      },
      "problems-theirs": {
        question: "When did you last watch them deal with it? Describe that moment.",
        helperText:
          "What were they trying to do, what got in the way, and how did they react? The details you noticed are what turn a complaint into a problem you can describe to somebody else.",
        examples: [
          "Setting up my mum's new phone and finding every step assumed she already had a working email account",
          "Watching a colleague retype a delivery address into three systems for one order",
        ],
      },
      "problems-general": {
        question: "Where have you seen it come up: complaints, reviews, conversations?",
        helperText: "Name the places you keep meeting it. A pattern you can point to is evidence; a feeling that everybody has it is not.",
        examples: [
          "Every one-star review of the three biggest apps in the category says the same thing",
          "It comes up whenever the street WhatsApp group talks about tradespeople",
        ],
      },
    },
  },
  {
    id: "wish",
    multipleAllowed: true,
    copy: {
      question: "What do you wish someone had told you at the start?",
      helperText:
        "Think about the moment you realised something too late: a cost you did not budget for, a deadline nobody flagged, a step that only made sense once you had done it wrong. Skip generic advice and go for the specific thing you only figured out the hard way.",
      examples: [
        "That the visa fee was the smallest line item; translations and certifications dwarfed it",
        "That the first three months land critical paperwork in the foggiest window of your life",
      ],
    },
  },
  {
    id: "customers",
    role: "customers",
    multipleAllowed: true,
    copy: {
      question: "Who has this problem?",
      helperText:
        "Think about who is in the same situation when it bites: the same job, life stage or set-up. Pick the groups you have actually seen deal with it rather than everyone who plausibly might.",
      examples: ["Anyone with a subscription they have stopped using", "Homeowners facing an emergency repair for the first time"],
    },
    variants: {
      you: {
        question: "Who else goes through this?",
        helperText:
          "Other people in the same situation, role or life stage who would likely feel the same friction. Optional, but a customer makes the problem much easier to refine later.",
        examples: ["First-time parents in the first six months", "Operations leads at companies of a similar size", "Volunteer coaches handling their own admin"],
      },
      problems: {
        question: "Who else runs into this?",
        examples: [
          "Anyone with a subscription they have stopped using",
          "Homeowners facing an emergency repair for the first time",
          "Adult children setting up technology for elderly parents",
        ],
      },
      contexts: {
        question: "Who tends to be in that situation?",
        helperText: "The people for whom this moment comes round most often, or matters most when it does.",
        examples: ["Commuters with young children", "People renting for the first time", "Anyone starting a new job remotely"],
      },
    },
  },
  {
    id: "contexts",
    role: "contexts",
    multipleAllowed: true,
    copy: {
      question: "When and where does it bite hardest?",
      helperText:
        "A deadline, a first time, a bad day, a particular place or device. Naming the moment tells you where a solution would have to show up to be any use.",
      examples: [
        "In a lunch break, on a phone, with no time to be passed around",
        "In an emergency, with no time to compare options",
        "When helping someone else, so you cannot see what they see",
      ],
    },
    variants: {
      you: {
        question: "When does it bite hardest?",
        examples: ["In the first three months", "At month end", "When helping someone else, so you cannot see what they see"],
      },
    },
  },
  {
    id: "cope",
    multipleAllowed: true,
    copy: {
      question: "How do people cope with it today?",
      helperText: HOW_THEY_COPE,
      examples: [
        "A calendar reminder the day before every free trial ends",
        "Asking the street WhatsApp group who they used and what it cost",
        "A printed cheat sheet taped next to the till",
      ],
    },
    variants: {
      you: {
        question: "What have you worked out or built for yourself that you still use?",
        helperText: WORKAROUND_YOU,
        examples: [
          "A running phone note logging each appointment and which form needed updating next",
          "A spreadsheet that shadows the official system because the system cannot filter what we need",
          "A family WhatsApp group used as the daily care log",
        ],
      },
      customers: {
        question: "How do they cope with it today?",
        examples: [
          "A shared spreadsheet that shadows the official tool",
          "A WhatsApp group used as the real schedule, with a pinned plan everyone updates",
          "A printed cheat sheet taped next to the till",
        ],
      },
      problems: { question: "How do people get around it today?" },
      contexts: {
        question: "How do they get through it today?",
        examples: ["Leaving twenty minutes early, every day", "A checklist someone shared in a forum", "Asking whoever did it last"],
      },
    },
  },
  {
    id: "spend",
    multipleAllowed: true,
    copy: {
      question: "What do people spend money, time or attention on that doesn't really help?",
      helperText: MISALLOCATED_SPEND,
      examples: [
        "Subscriptions to tools they barely use past the first month",
        "Paid courses that cover everything except the part they actually got stuck on",
      ],
    },
    variants: {
      "you-once": {
        question: "What did you spend money on that turned out not to help?",
        examples: [
          "An annual baby tracker subscription that died because logging a 3am feed needed too much focus",
          "A premium credit report from home that no local bank or landlord would accept",
        ],
      },
      "you-recurring": {
        question: "What takes a surprising amount of your time, money or attention?",
        helperText:
          "Tasks you would struggle to explain the length of, subscriptions nobody uses past month one, tools that overlap. Misallocated effort is usually a missing or misshaped product.",
        examples: [
          "Reformatting the same report for five different people",
          "Reconciling numbers between two systems that should agree",
          "Three tools that all do roughly the same thing",
        ],
      },
      customers: { question: "What do they spend money, time or attention on that doesn't really help?" },
    },
  },
  {
    id: "why",
    multipleAllowed: true,
    copy: {
      question: "Why do you think nobody has fixed it?",
      helperText: WHY_STILL_THERE,
      examples: [
        "The company earns from people forgetting to cancel, so it has no reason to make it easier",
        "Each trade is too small to build a booking service, and nobody trusts the big directories",
      ],
    },
    variants: {
      contexts: {
        question: "Why do you think it is still like this?",
        examples: ["Nobody owns the moment: it falls between two services", "It only happens to each person once, so nobody complains twice"],
      },
    },
  },
]

export const GUIDED_ROUTES: GuidedRoute[] = [
  {
    dimension: "you",
    option: {
      id: "start-you",
      label: "My own experience",
      description: "Something you have lived through, do regularly, or have built for yourself.",
    },
    // The kind of experience decides which self-discovery question the anchor
    // draws from, so on this route the voice is asked before the anchor.
    voice: {
      copy: {
        question: "What kind of experience is it?",
        helperText:
          "The questions differ: something you went through once is answered from memory, something you keep doing is answered from last week.",
      },
      options: [
        {
          id: "you-once",
          label: "Something I went through once",
          description: "A move, a diagnosis, a new baby, a career change: significant, and behind you.",
        },
        {
          id: "you-recurring",
          label: "Something I do again and again",
          description: "A job, a responsibility, a hobby, a routine: familiar enough that you have stopped noticing its rough edges.",
        },
      ],
    },
    anchor: {
      copy: {
        question: "Which experience do you want to look at?",
        helperText: "Pick one from your self-discovery or add a new one. Keeping it to one makes the next questions specific.",
        selfDiscoveryQuestionUrl: "life-experiences",
      },
      variants: {
        "you-once": {
          question: "Which experience do you want to look back on?",
          examples: ["Becoming a parent", "Moving country", "Caring for an ageing relative"],
          selfDiscoveryQuestionUrl: "life-experiences",
        },
        "you-recurring": {
          question: "Which activity, role or responsibility do you want to look at?",
          helperText:
            "Pick one from your self-discovery or add a new one. It can be paid or unpaid, a job or a hobby: what matters is that you do it often enough to know its rough edges.",
          examples: ["Running the operations team at a logistics company", "Coaching a junior football team", "Managing the household budget"],
          selfDiscoveryQuestionUrl: "work-done",
        },
      },
    },
    steps: ["voice", "anchor", "problems", { slot: "wish", voices: ["you-once"] }, "spend", "cope", "customers", "contexts", "why"],
  },
  {
    dimension: "customers",
    option: {
      id: "start-customers",
      label: "People I know or want to serve",
      description: "A group whose days you have watched closely: customers, colleagues, a community.",
    },
    anchor: {
      copy: {
        question: "Which group of people do you want to start from?",
        helperText:
          "Pick one from your self-discovery, your existing customers or the built-in list. One group at a time keeps the next questions specific.",
        examples: ["First-time freelancers", "Parents of school-age children", "Small local retailers"],
      },
    },
    voice: {
      copy: {
        question: "How do you know them?",
        helperText: "Where your knowledge comes from changes what you can be sure of, so the questions are worded for it.",
      },
      options: [
        { id: "customers-member", label: "I am one of them" },
        { id: "customers-serve", label: "I work with or serve them" },
        { id: "customers-observe", label: "I have watched them from the outside" },
      ],
    },
    steps: ["anchor", "voice", "problems", "contexts", "cope", "spend", "why"],
  },
  {
    dimension: "problems",
    option: {
      id: "start-problems",
      label: "Something that annoys me, or someone I know",
      description: "A recurring irritation you can name, even if you cannot yet say who else has it.",
    },
    anchor: {
      copy: {
        question: "What is the annoyance?",
        helperText:
          "Pick the kind of pain from the list, or add your own in your own words. Keep it to one so the next questions stay specific.",
        examples: [
          "Being kept on hold to fix something that should take two minutes",
          "Fees that only appear at the checkout",
          "Instructions written for people who already know the answer",
        ],
      },
    },
    voice: {
      copy: {
        question: "Whose annoyance is it?",
        helperText: "The questions ask for real occasions, so they are worded for whoever was there.",
      },
      options: [
        { id: "problems-mine", label: "Mine" },
        { id: "problems-theirs", label: "Someone I know" },
        { id: "problems-general", label: "Something I keep noticing in general" },
      ],
    },
    steps: ["anchor", "voice", "occasion", "customers", "contexts", "cope", "spend", "why"],
  },
  {
    dimension: "contexts",
    option: {
      id: "start-contexts",
      label: "A moment when things go wrong",
      description: "A situation, place or time that reliably makes things harder than they should be.",
    },
    anchor: {
      copy: {
        question: "Which moment or situation do you want to start from?",
        helperText:
          "Pick one from the list or add your own. A moment is a time, a place or a state people find themselves in: a commute, a first day, an emergency, a lunch break.",
        examples: ["Commuting", "Moving house", "The first week in a new job"],
      },
    },
    voice: {
      copy: {
        question: "What makes that moment hard?",
        helperText: "Moments go wrong for different reasons, and the questions are worded for the one you pick.",
      },
      options: [
        { id: "contexts-time", label: "There is no time" },
        { id: "contexts-first", label: "It is the first time" },
        { id: "contexts-many", label: "Too many people or steps are involved" },
        { id: "contexts-other", label: "Something else" },
      ],
    },
    steps: ["anchor", "voice", "problems", "customers", "cope", "spend", "why"],
  },
]

/** The route that starts from this dimension. */
export function getGuidedRoute(dimension: DimensionKey): GuidedRoute | undefined {
  return GUIDED_ROUTES.find((route) => route.dimension === dimension)
}

export function getGuidedSlot(id: string): GuidedSlot | undefined {
  return GUIDED_SLOTS.find((slot) => slot.id === id)
}

/** Every key an answer can be stored under, for opening a session. */
export const GUIDED_ANSWER_IDS: string[] = [
  GUIDED_START_ID,
  ...GUIDED_ROUTES.flatMap((route) => [guidedVoiceId(route.dimension), guidedAnchorId(route.dimension)]),
  ...GUIDED_SLOTS.map((slot) => slot.id),
]
