import {
  Archive,
  Lightbulb,
  Star,
  Database,
  Swords,
  Rocket,
  type LucideIcon,
} from "lucide-react"

/**
 * Static config for the Research feature. Each method is a guided research flow
 * built around a curated set of external tools where the user can hunt for
 * source material. The user picks a tool, opens it in a new tab, then comes
 * back to fill in a capture form whose answers become a Problem.
 */

export type ResearchToolCategory = "software" | "physical" | "services" | "ip" | "general"

export type ResearchTool = {
  id: string
  name: string
  url: string
  category: ResearchToolCategory
  description: string
  /** One-line tip on how to use this source effectively. */
  tip?: string
}

export type ResearchPrompt = {
  id: string
  question: string
  helperText?: string
  examples?: string[]
  multipleAllowed: boolean
  /**
   * Role in the save-as-problem flow:
   * - "title": this answer becomes the problem description / title (single
   *   prompt per method).
   * - "problems": answers resolve to problem dimension ids.
   * - "customers": answers resolve to customer dimension ids.
   * Untagged prompts are kept as research context only.
   */
  role?: "title" | "problems" | "customers"
}

export type ResearchMethodId =
  | "abandoned-products"
  | "trend-signals"
  | "low-rated-tools"
  | "open-data"
  | "competitor-gaps"
  | "failed-launches"

export type ResearchMethod = {
  id: ResearchMethodId
  title: string
  shortDescription: string
  longDescription: string
  icon: LucideIcon
  estimatedMinutes: number
  tools: ResearchTool[]
  prompts: ResearchPrompt[]
  helperText?: string
}

const TOOL_CATEGORY_LABELS: Record<ResearchToolCategory, string> = {
  software: "Software & apps",
  physical: "Physical products",
  services: "Services & businesses",
  ip: "Patents & IP",
  general: "General",
}

export function getToolCategoryLabel(category: ResearchToolCategory): string {
  return TOOL_CATEGORY_LABELS[category]
}

export const RESEARCH_METHODS: ResearchMethod[] = [
  {
    id: "abandoned-products",
    title: "Improving abandoned products",
    shortDescription:
      "Find products that were shut down, discontinued, or quietly died and ask why nobody picked up where they left off.",
    longDescription:
      "Every year, thousands of products are shut down, discontinued, abandoned by their owners, or quietly fade out. Many of them had real users with real problems. This method walks you through curated sources where you can hunt for an abandoned product (software, physical, service, or patent), then capture what it was, why it died, and why it might be worth bringing back, rethinking, or replacing.",
    icon: Archive,
    estimatedMinutes: 15,
    helperText:
      "Pick one tool to browse, find one product that catches your eye, and answer the prompts about that one product. Run the method again for the next idea.",
    tools: [
      {
        id: "killed-by-google",
        name: "Killed by Google",
        url: "https://killedbygoogle.com/",
        category: "software",
        description:
          "A community-maintained graveyard of Google products that were shut down. Includes apps, services, hardware, and APIs with dates and short obituaries.",
        tip: "Look for products that had a passionate audience but were killed for strategic reasons, not lack of demand.",
      },
      {
        id: "product-hunt-discontinued",
        name: "Product Hunt (discontinued topic)",
        url: "https://www.producthunt.com/topics/discontinued",
        category: "software",
        description:
          "Product Hunt's 'discontinued' topic collects launches whose owners marked them as no longer maintained. Many indie launches die when the founder moves on.",
        tip: "Sort by date and aim for posts at least 3 years old. Check whether the product's site still resolves.",
      },
      {
        id: "alternativeto-discontinued",
        name: "AlternativeTo (discontinued filter)",
        url: "https://alternativeto.net/software/?license=discontinued",
        category: "software",
        description:
          "Software directory with a built-in 'discontinued' filter. Each entry lists its replacements, which tells you how the market absorbed the loss.",
        tip: "An app with many 'looking for alternative' comments and weak replacements is a strong signal.",
      },
      {
        id: "github-archived",
        name: "GitHub archived repositories",
        url: "https://github.com/search?q=archived%3Atrue+stars%3A%3E500&type=repositories",
        category: "software",
        description:
          "Search GitHub for archived repos with significant stars. Archived means the maintainer explicitly stepped away. Often there's a live user base looking for a fork.",
        tip: "Filter by stars and language. Read the last few issues before archival to spot unmet user needs.",
      },
      {
        id: "kickended",
        name: "Kickended (zero-backer Kickstarters)",
        url: "https://www.kickended.com/",
        category: "physical",
        description:
          "A curated archive of Kickstarter campaigns that ended with zero backers. The strongest possible signal that an idea, audience, or pitch missed the market.",
        tip: "Don't dismiss them: many failed on positioning or distribution rather than the product itself.",
      },
      {
        id: "wikipedia-discontinued",
        name: "Wikipedia: discontinued products lists",
        url: "https://en.wikipedia.org/wiki/Category:Discontinued_products",
        category: "physical",
        description:
          "Wikipedia category pages aggregating lists of discontinued products by brand and decade. Excellent for physical goods and hardware.",
        tip: "Look at why each was discontinued. Cost, distribution, and timing often beat the actual product.",
      },
      {
        id: "ebay-discontinued",
        name: "eBay 'no longer made' searches",
        url: "https://www.ebay.com/sch/i.html?_nkw=discontinued",
        category: "physical",
        description:
          "Search eBay for 'discontinued' in any category. Used and collector pricing tells you whether the product still has a paying audience.",
        tip: "Items that sell for more used than their original retail price are flashing a 'remake me' signal.",
      },
      {
        id: "failory-cemetery",
        name: "Failory Startup Cemetery",
        url: "https://www.failory.com/cemetery",
        category: "services",
        description:
          "A curated list of startups that took funding and shut down, with founder write-ups explaining what went wrong. Free to browse, no paywall.",
        tip: "Companies that closed with users (not just runway) are the most interesting. Look for acquihires, not bankruptcies.",
      },
      {
        id: "wayback-machine",
        name: "Wayback Machine for vanished sites",
        url: "https://web.archive.org/",
        category: "general",
        description:
          "Look up sites you remember that no longer exist. The archive often captures the last marketing pitch, pricing, and even user reviews.",
        tip: "Search the archive for niche directories from 5-10 years ago. Whole categories of tools have gone dark.",
      },
      {
        id: "google-patents",
        name: "Google Patents",
        url: "https://patents.google.com/",
        category: "ip",
        description:
          "Search the global patent corpus. Apply the 'Status: Expired' filter from the sidebar to find inventions whose IP has lapsed and are free to build on.",
        tip: "Read the 'Background of the Invention' section first. It states the problem in plain language.",
      },
      {
        id: "uspto-abandoned-trademarks",
        name: "USPTO abandoned trademarks",
        url: "https://tmsearch.uspto.gov/",
        category: "ip",
        description:
          "Search the US trademark database for abandoned marks. Abandoned brand names with prior consumer awareness can sometimes be re-registered.",
        tip: "Pair an abandoned trademark with a discontinued product list for the strongest revive candidates.",
      },
      {
        id: "reddit-asksomeone-built",
        name: "Reddit r/SomebodyMakeThis",
        url: "https://www.reddit.com/r/SomebodyMakeThis/top/?t=all",
        category: "general",
        description:
          "A subreddit where people request products and tools they wish existed. Cross-reference with discontinued lists to spot returning demand.",
        tip: "Sort by top of all time. Posts with many 'this used to exist!' comments are the gold.",
      },
    ],
    prompts: [
      {
        id: "product-name",
        question: "Which abandoned product did you find?",
        helperText:
          "Name it specifically, and add the source so you can come back to it later (e.g. company name, link, year discontinued).",
        examples: [
          "Google Reader (RSS feed reader, shut down 2013)",
          "Anki Vector (consumer robot, manufacturer shut down 2019)",
          "Skedaddle (long-distance bus crowdsourcing, closed 2019)",
        ],
        multipleAllowed: false,
      },
      {
        id: "what-it-did",
        question: "What did it do, and who used it?",
        helperText:
          "Describe the product in plain language as if you were explaining it to someone who never used it. Note the rough size of the audience if you know.",
        examples: [
          "An RSS reader that let power users follow hundreds of sites in one inbox. Used by journalists, researchers, and developers.",
          "A small home robot that recognised faces and reacted with personality. Bought as a companion gadget by tech enthusiasts and families.",
        ],
        multipleAllowed: false,
      },
      {
        id: "why-abandoned",
        question: "Why was it abandoned?",
        helperText:
          "The reason matters more than the death. Strategic decision, funding, founder burnout, regulation, and tech debt all suggest different opportunities.",
        examples: [
          "Strategic: parent company pivoted to social and starved the product of resources.",
          "Funding: ran out of runway before reaching profitable scale.",
          "Tech: depended on a platform API that was deprecated.",
        ],
        multipleAllowed: false,
      },
      {
        id: "unmet-need",
        question: "What problem did it solve that users still have today?",
        helperText:
          "This is the candidate problem you'll save. Phrase it as a problem in present tense, from the user's point of view.",
        examples: [
          "Power readers can't follow hundreds of sources in one place without paying for an enterprise tool",
          "Families want a small home companion robot that's expressive without sending data to the cloud",
          "Long-distance travellers in mid-size cities have no affordable inter-city options outside major routes",
        ],
        multipleAllowed: true,
        role: "problems",
      },
      {
        id: "what-changed",
        question: "What's changed since it died that might make it work now?",
        helperText:
          "Cheaper hardware, better AI, new distribution, a regulatory shift, a behaviour change. If nothing has changed, that's a useful signal too.",
        examples: [
          "Edge AI now runs on £30 chips, so a privacy-respecting companion robot is finally cheap enough.",
          "Newsletter culture has trained millions of readers to pay for niche content directly.",
          "Remote work has created a long-distance commuting audience that didn't exist before.",
        ],
        multipleAllowed: true,
      },
      {
        id: "audience",
        question: "Who would you build this for today?",
        helperText:
          "Optional, but adding a customer makes the problem easier to refine later. The original audience may have moved on; the new one may be different.",
        examples: [
          "Independent researchers and journalists who already pay for tools",
          "Parents of young children looking for screen-free, privacy-respecting tech",
          "Remote workers in mid-size towns",
        ],
        multipleAllowed: true,
        role: "customers",
      },
    ],
  },
  {
    id: "trend-signals",
    title: "Trend signals",
    shortDescription:
      "Capture problems hinted at by search trends, social chatter, and breakout topics across the web.",
    longDescription:
      "Use trend trackers (Google Trends, Exploding Topics, Reddit risers) to find topics whose attention is growing fast. Each rising trend is usually a problem people are quietly trying to solve.",
    icon: Rocket,
    estimatedMinutes: 12,
    tools: [],
    prompts: [],
  },
  {
    id: "low-rated-tools",
    title: "Low-rated, high-demand tools",
    shortDescription:
      "Hunt app stores and SaaS directories for tools that have lots of users but poor reviews. The complaints are your starting point.",
    longDescription:
      "Tools with thousands of installs and a 2-star average are a strong signal. The need is real enough to drive downloads; the existing solutions are bad enough to drive frustration. The reviews are a free corpus of problem statements.",
    icon: Star,
    estimatedMinutes: 12,
    tools: [],
    prompts: [],
  },
  {
    id: "open-data",
    title: "Public data and research",
    shortDescription:
      "Mine open data portals, scientific papers, and industry reports for problems hiding in the numbers.",
    longDescription:
      "Open data and academic research surface problems that aren't yet on consumer radar: emerging health risks, regulatory shifts, infrastructure gaps. Use them to capture problems most builders haven't seen yet.",
    icon: Database,
    estimatedMinutes: 15,
    tools: [],
    prompts: [],
  },
  {
    id: "competitor-gaps",
    title: "Competitor gaps",
    shortDescription:
      "Pick a category, study the leaders, and capture the use cases they consistently ignore or handle badly.",
    longDescription:
      "Market leaders optimise for the median customer. The edges, the segments they ignore, the use cases they treat as edge cases, are usually where new products win. This method walks you through analysing one category for gaps.",
    icon: Swords,
    estimatedMinutes: 15,
    tools: [],
    prompts: [],
  },
  {
    id: "failed-launches",
    title: "Failed product launches",
    shortDescription:
      "Study write-ups from products that launched, struggled, and pivoted or closed. The first attempt's mistakes often map to a better second attempt.",
    longDescription:
      "Read founder write-ups, shutdown letters, and 'why we failed' essays. The patterns repeat: wrong audience, wrong timing, wrong pricing. Each pattern is a doorway to a problem someone else can solve better.",
    icon: Lightbulb,
    estimatedMinutes: 12,
    tools: [],
    prompts: [],
  },
]

export const RESEARCH_METHOD_BY_ID: Record<ResearchMethodId, ResearchMethod> = RESEARCH_METHODS.reduce(
  (acc, m) => {
    acc[m.id] = m
    return acc
  },
  {} as Record<ResearchMethodId, ResearchMethod>
)

export function getResearchMethod(id: string): ResearchMethod | undefined {
  return RESEARCH_METHOD_BY_ID[id as ResearchMethodId]
}
