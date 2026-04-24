export interface FoundationsCaseStudy {
  id: string
  title: string
  summary: string
  outcome: "went-wrong" | "went-right"
  link?: string
}

export interface FoundationsVideo {
  id: string
  title: string
  description?: string
  youtubeId?: string
  url?: string
}

export interface FoundationsSection {
  url: string
  title: string
  shortTitle: string
  tagline: string
  iconKey: "compass" | "search" | "flask" | "clock" | "trophy"
  intro: string
  keyPoints: string[]
  videos: FoundationsVideo[]
  caseStudies: FoundationsCaseStudy[]
}

export const FOUNDATIONS_SECTIONS: FoundationsSection[] = [
  {
    url: "why-the-right-idea",
    title: "Why finding the right idea matters",
    shortTitle: "The right idea",
    tagline: "Not every idea is worth pursuing. The one you start with shapes everything that follows.",
    iconKey: "compass",
    intro:
      "Most founders fall in love with the first idea that excites them. The research tells a different story: the idea you start with is rarely the one that works. What matters is whether the idea connects to a real need, a real market, and something you're genuinely positioned to build.",
    keyPoints: [
      "Survivorship bias: we only hear about ideas that worked, not the thousands that didn't.",
      "Passion alone is not a filter. Plenty of people are passionate about things nobody will pay for.",
      "The right idea sits at the intersection of a real problem, a reachable audience, and your unfair advantage.",
      "Pivots are common: expect the idea to evolve as you learn.",
    ],
    videos: [
      {
        id: "right-idea-intro",
        title: "How to pick a startup idea",
        description: "A short framing on how experienced founders evaluate ideas before committing.",
      },
      {
        id: "right-idea-founders",
        title: "Founders on picking the wrong thing first",
        description: "Three founders reflect on what they'd tell their earlier selves.",
      },
    ],
    caseStudies: [
      {
        id: "quibi",
        title: "Quibi",
        summary:
          "Raised $1.75B for short-form mobile video. Shut down within six months. The idea was built on an assumed behaviour (watching premium content in short bursts on the go) that never materialised, especially once the pandemic kept people at home.",
        outcome: "went-wrong",
      },
      {
        id: "juicero",
        title: "Juicero",
        summary:
          "A $400 Wi-Fi connected juicer pressing proprietary juice packs. The idea solved a problem nobody had; customers discovered the packs could be squeezed by hand. Closed in 16 months.",
        outcome: "went-wrong",
      },
    ],
  },
  {
    url: "why-validate-the-problem",
    title: "Why validate the problem first",
    shortTitle: "Validate the problem",
    tagline: "If the problem isn't real, nothing you build on top will matter.",
    iconKey: "search",
    intro:
      "Skipping problem validation is the most common way startups fail. Founders hear a few friends say 'that would be great' and treat it as proof. Real validation means finding people who feel the problem strongly enough to pay, switch, or change their behaviour to solve it.",
    keyPoints: [
      "Polite enthusiasm is not validation. People say they'd use things they never actually use.",
      "A real problem shows up in behaviour: workarounds, hacks, spreadsheet fixes, money already being spent.",
      "Validating the problem is cheap. Building the wrong product is expensive.",
      "The goal is to disprove your assumption, not confirm it.",
    ],
    videos: [
      {
        id: "problem-first",
        title: "The Mom Test, explained",
        description: "Why customer conversations usually lie to you, and how to ask questions that don't.",
      },
      {
        id: "problem-validation-stories",
        title: "Founders on problems they assumed were real",
        description: "What it felt like to realise, months in, that the problem wasn't a problem.",
      },
    ],
    caseStudies: [
      {
        id: "webvan",
        title: "Webvan",
        summary:
          "Online grocery delivery built out $1B of warehouse infrastructure before validating that customers would change shopping habits at scale. Collapsed in 2001. The problem (grocery inconvenience) was real but not urgent enough to justify the logistics.",
        outcome: "went-wrong",
      },
      {
        id: "google-glass",
        title: "Google Glass",
        summary:
          "A technology in search of a problem. Consumers never articulated a need for face-worn computing, and social friction (the 'glasshole' reaction) made the implicit problem: awkwardness: worse than the one it solved.",
        outcome: "went-wrong",
      },
    ],
  },
  {
    url: "why-validate-the-solution",
    title: "Why validate the solution",
    shortTitle: "Validate the solution",
    tagline: "A real problem doesn't mean your solution is the one people want.",
    iconKey: "flask",
    intro:
      "Even when the problem is genuine, the leap to 'therefore people will use what I'm about to build' is a big one. Solution validation is about testing, with the smallest possible artefact, whether your specific approach is the one customers will actually adopt.",
    keyPoints: [
      "Customers rarely want what they say they want; they want what solves their problem with the least effort.",
      "A landing page, mockup, or concierge test beats a six-month build every time.",
      "Willingness to pay is the strongest signal; willingness to wait on a list is the next strongest.",
      "If nobody engages with the tiniest version, the full build won't save it.",
    ],
    videos: [
      {
        id: "mvp-explained",
        title: "What an MVP actually is",
        description: "Why the minimum viable product is about learning, not shipping a small version of the thing.",
      },
      {
        id: "concierge-tests",
        title: "Concierge and Wizard-of-Oz tests",
        description: "How founders validate solutions without writing code.",
      },
    ],
    caseStudies: [
      {
        id: "segway",
        title: "Segway",
        summary:
          "The product worked perfectly. The problem (short-distance urban transport) was real. But the solution (a $5,000 two-wheeled scooter requiring a learning curve and raising social friction) was not the one the market wanted. Sold far below projections.",
        outcome: "went-wrong",
      },
      {
        id: "new-coca-cola",
        title: "New Coca Cola",
        summary:
          "Coca-Cola validated in blind taste tests that people preferred the new formula. They did not validate that customers wanted Coca-Cola to change. Withdrawn within 79 days.",
        outcome: "went-wrong",
      },
    ],
  },
  {
    url: "the-cost-of-skipping",
    title: "The cost of skipping",
    shortTitle: "The cost of skipping",
    tagline: "Time, money, and morale: what it actually costs to build the wrong thing.",
    iconKey: "clock",
    intro:
      "It's tempting to skip ahead because building feels like progress. But every month spent on an unvalidated idea is a month of runway, focus, and team energy you cannot get back. The cost is not just financial; founders who ship the wrong thing often lose the confidence to try again.",
    keyPoints: [
      "Runway burned on the wrong problem rarely gets replenished.",
      "Teams lose trust in leadership that keeps pivoting after each failed launch.",
      "Sunk-cost bias makes it harder to kill a project the longer you've worked on it.",
      "Opportunity cost: the right idea is the one you didn't pursue because you were busy.",
    ],
    videos: [
      {
        id: "cost-of-skipping",
        title: "What building the wrong thing really costs",
        description: "A breakdown of the time, money, and emotional cost of unvalidated launches.",
      },
    ],
    caseStudies: [
      {
        id: "google-plus",
        title: "Google+",
        summary:
          "Years of engineering investment and an entire product integration strategy built on the assumption that users wanted another social network. Shut down after repeated relaunches. The problem was assumed rather than validated against Facebook's entrenched behaviour.",
        outcome: "went-wrong",
      },
      {
        id: "theranos",
        title: "Theranos",
        summary:
          "An extreme example: the technology was never validated, and product demos were staged. Everything downstream (funding, partnerships, regulatory risk) compounded on an unvalidated base, ending in criminal charges.",
        outcome: "went-wrong",
      },
    ],
  },
  {
    url: "when-it-goes-right",
    title: "When it goes right",
    shortTitle: "When it goes right",
    tagline: "Founders who did the work, and what they learned along the way.",
    iconKey: "trophy",
    intro:
      "The stories here are not about lucky breaks. They're about founders who spent weeks or months in problem and solution validation before committing capital. The patterns are consistent: talk to users, start small, kill your own ideas quickly, and only scale once the signal is unmistakable.",
    keyPoints: [
      "Talk to more people than feels reasonable. Ten conversations is not enough.",
      "Ship the smallest thing that can fail fast.",
      "Pay attention to what users do, not what they say.",
      "Be willing to change direction the moment the data says so.",
    ],
    videos: [
      {
        id: "airbnb-validation",
        title: "Airbnb's early validation",
        description: "How the founders manually tested the idea with cereal boxes and photography before writing code.",
      },
      {
        id: "dropbox-video",
        title: "The Dropbox explainer video",
        description: "A three-minute video validated the solution before a line of product code shipped.",
      },
    ],
    caseStudies: [
      {
        id: "airbnb",
        title: "Airbnb",
        summary:
          "Before building, the founders rented out their own flat, photographed listings by hand, and manually confirmed that travellers would pay strangers for a spare room. The slow, unglamorous validation work is what separated them from earlier home-sharing attempts.",
        outcome: "went-right",
      },
      {
        id: "dropbox",
        title: "Dropbox",
        summary:
          "Drew Houston posted a short explainer video demonstrating the intended product. The waitlist jumped from 5,000 to 75,000 overnight, validating both the problem (file syncing pain) and the solution approach before significant engineering.",
        outcome: "went-right",
      },
      {
        id: "buffer",
        title: "Buffer",
        summary:
          "Joel Gascoigne built a two-page landing site (what it does, pricing tiers) before writing any product. When people clicked through to 'buy', he knew there was willingness to pay. Only then did he start building.",
        outcome: "went-right",
      },
    ],
  },
]

export function getFoundationsSection(url: string): FoundationsSection | undefined {
  return FOUNDATIONS_SECTIONS.find((s) => s.url === url)
}
