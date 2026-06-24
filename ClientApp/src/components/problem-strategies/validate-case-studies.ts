import { Mail, Notebook, Glasses, Car, type LucideIcon } from "lucide-react"

export type CaseStudyJob = {
  text: string
  intensity: "mild" | "strong" | "unbearable"
}

export type ValidateCaseStudy = {
  company: string
  icon: LucideIcon
  iconBg: string
  jobs: {
    functional: string[]
    emotional: CaseStudyJob[]
    social: CaseStudyJob[]
  }
  howManyPeople: { value: number; detail: string }
  howOften: { value: number; unit: string; detail: string }
  worthToThem: { value: number; unit: string; detail: string }
  reachableShare: { value: number; detail: string }
  obtainableShare: { value: number; detail: string }
  costOfSwitching: { level: "none" | "low" | "medium" | "high" | "prohibitive"; detail: string }
  solutionEffectiveness: { level: "terrible" | "poor" | "average" | "good" | "excellent"; detail: string }
  competitorSize: { level: "micro" | "small" | "medium" | "large" | "giant"; detail: string }
  verdict: string
  reasoning: string
}

export const VALIDATE_CASE_STUDIES: ValidateCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    icon: Mail,
    iconBg: "bg-yellow-500",
    jobs: {
      functional: [
        "Send a campaign to a customer list without exposing addresses.",
        "See whether anyone opened or clicked the last campaign.",
        "Schedule a recurring newsletter without thinking about it each week.",
      ],
      emotional: [
        { text: "Stop dreading hitting send on the next BCC list.", intensity: "strong" },
        { text: "Feel like a legitimate business, not someone fumbling through a workaround.", intensity: "strong" },
      ],
      social: [
        { text: "Not look amateur to customers when an email goes out.", intensity: "strong" },
      ],
    },
    howManyPeople: {
      value: 30000000,
      detail: "~30 million small businesses in the US alone, most with no email marketing tool at all.",
    },
    howOften: {
      value: 2,
      unit: "per week",
      detail: "Small business owners need to communicate with customers weekly: promotions, updates, newsletters. This is a recurring, ongoing need, not a one-off.",
    },
    worthToThem: {
      value: 20,
      unit: "pounds per month",
      detail: "Each email campaign could drive £50-500 in direct sales for a small shop. Businesses were willing to pay £10-30/month, anchored on the strong emotional pull of not looking unprofessional.",
    },
    reachableShare: {
      value: 35,
      detail: "Initially launchable to English-speaking small businesses with internet access and a customer list, roughly a third of the global total market.",
    },
    obtainableShare: {
      value: 10,
      detail: "Realistic capture in the early years given that Constant Contact and AWeber already had distribution to the mid-market.",
    },
    costOfSwitching: {
      level: "none",
      detail: "Most small businesses had no existing email tool, so there was nothing to switch from. The free tier eliminated any financial barrier to getting started.",
    },
    solutionEffectiveness: {
      level: "poor",
      detail: "Existing tools like Constant Contact were clunky, expensive, and designed for enterprises. Small businesses either used nothing or cobbled together manual BCC emails, which were error-prone and unprofessional.",
    },
    competitorSize: {
      level: "medium",
      detail: "Constant Contact and AWeber existed but were mid-sized companies focused on larger businesses. No dominant player owned the small business email marketing space.",
    },
    verdict: "Valid: Worth Solving",
    reasoning:
      "Huge underserved audience with a frequent, recurring need and a strong emotional pull to stop looking amateur. The opportunity was not in high per-customer revenue but in the sheer volume of businesses that had zero solution. Mailchimp validated this by offering a free tier and watching organic growth explode.",
  },
  {
    company: "Notion (early adopter phase)",
    icon: Notebook,
    iconBg: "bg-slate-700",
    jobs: {
      functional: [
        "Keep notes, tasks, and docs in one place instead of five.",
        "Share a single source of truth with the rest of the team.",
        "Stop losing work to sync conflicts across tools.",
      ],
      emotional: [
        { text: "Stop feeling overwhelmed by tool fragmentation every morning.", intensity: "unbearable" },
        { text: "Feel in control of the team's knowledge instead of chasing it.", intensity: "strong" },
      ],
      social: [
        { text: "Be seen as the person who finally fixed the team's chaos.", intensity: "strong" },
      ],
    },
    howManyPeople: {
      value: 50000000,
      detail: "~50 million knowledge workers globally using 3+ disconnected productivity tools daily.",
    },
    howOften: {
      value: 30,
      unit: "per day",
      detail: "Tool-switching happens dozens of times per day. The friction is constant: every time someone needs to find a note, check a task, or update a doc, they hit this problem.",
    },
    worthToThem: {
      value: 15,
      unit: "pounds per user per month",
      detail: "Teams were already paying £10-30/user/month across multiple tools (Trello, Evernote, Google Workspace). The unbearable emotional pull is what justified consolidating: the cost saving alone would not have moved them.",
    },
    reachableShare: {
      value: 25,
      detail: "Initially launchable to English-speaking knowledge workers in mid-sized tech and creative teams. Larger enterprises had procurement cycles Notion could not crack early on.",
    },
    obtainableShare: {
      value: 7,
      detail: "A realistic capture given Google Workspace and Microsoft were already in most of those teams. Power-user evangelism made conversion cheap inside teams, but cross-team rollout was slow.",
    },
    costOfSwitching: {
      level: "high",
      detail: "Migrating notes, docs, and workflows from multiple tools required significant effort. Teams needed to rebuild templates, retrain habits, and convince every member to adopt the new tool.",
    },
    solutionEffectiveness: {
      level: "average",
      detail: "Individual tools (Trello, Evernote, Google Docs) each did their specific job adequately, but the fragmentation across multiple tools created friction. No single solution addressed the full workflow effectively.",
    },
    competitorSize: {
      level: "large",
      detail: "Google Workspace, Microsoft Office, Atlassian, and Evernote were all large, well-funded competitors. However, none offered a unified all-in-one workspace, leaving a gap Notion could exploit.",
    },
    verdict: "Valid: Worth Solving",
    reasoning:
      "The combination of a massive audience, extremely high frequency, and an unbearable emotional job made this a strong opportunity. Notion validated it by seeing power users organically convert their entire teams, the problem was painful enough that individuals championed the switch without top-down mandates.",
  },
  {
    company: "Warby Parker (launch)",
    icon: Glasses,
    iconBg: "bg-blue-900",
    jobs: {
      functional: [
        "Get accurate prescription glasses without paying £300+ at the optician.",
        "Try frames on at home before committing to a pair.",
        "Replace or update frames as your style or prescription changes.",
      ],
      emotional: [
        { text: "Stop feeling ripped off by the markup on a basic necessity.", intensity: "strong" },
        { text: "Feel confident and good-looking in frames you actually chose.", intensity: "strong" },
      ],
      social: [
        { text: "Look current and put-together to the people you see every day.", intensity: "strong" },
      ],
    },
    howManyPeople: {
      value: 150000000,
      detail: "~150 million US adults wear corrective lenses, the vast majority buying from a handful of retail chains.",
    },
    howOften: {
      value: 1,
      unit: "every 1-2 years",
      detail: "Glasses are replaced infrequently, when a prescription changes or frames break or go out of style. Far less often than the SaaS examples, but each purchase is high-value. Low frequency does not kill an opportunity when the price per purchase is high.",
    },
    worthToThem: {
      value: 95,
      unit: "pounds per pair",
      detail: "Incumbents charged £300-500 for a single pair. Warby Parker proved customers would happily pay a flat £95, anchored on the relief of not feeling ripped off rather than on the lowest possible price.",
    },
    reachableShare: {
      value: 30,
      detail: "Initially launchable to US online shoppers comfortable buying single-vision prescription glasses without an in-store fitting, roughly a third of the total glasses-wearing market.",
    },
    obtainableShare: {
      value: 5,
      detail: "A realistic early capture given Luxottica's lock on retail shelves and most customers' habit of buying glasses wherever they get their eyes tested.",
    },
    costOfSwitching: {
      level: "low",
      detail: "Buying glasses is a fresh purchase each time, with no contract or data to migrate. The home try-on programme removed the one real barrier: not being able to try frames before buying online.",
    },
    solutionEffectiveness: {
      level: "good",
      detail: "The glasses themselves worked fine and stores offered fittings, so the product was not broken. The pain was the price and the buying experience, not the function: a subtler but very real source of frustration.",
    },
    competitorSize: {
      level: "giant",
      detail: "Luxottica owned most frame brands, the major retail chains (LensCrafters, Pearle Vision, Sunglass Hut), and the lens maker, controlling pricing end to end. A vertically integrated near-monopoly.",
    },
    verdict: "Valid: Worth Solving",
    reasoning:
      "A rare case where a huge market and very high price per purchase offset low frequency. The pain was not a broken product, it was being overcharged for a necessity by a near-monopoly. Warby Parker validated it by going direct, charging a flat £95, and using free home try-ons to remove the only real reason not to buy glasses online.",
  },
  {
    company: "Uber (launch)",
    icon: Car,
    iconBg: "bg-zinc-900",
    jobs: {
      functional: [
        "Get a reliable ride within minutes without phoning a dispatcher and hoping.",
        "Know a car is actually coming and watch it approach on a map.",
        "Pay automatically without fumbling for cash or a card at the end of the trip.",
      ],
      emotional: [
        { text: "Stop the anxiety of standing on a corner not knowing if a cab will ever come.", intensity: "strong" },
        { text: "Feel looked-after and a bit special arriving in a clean black car.", intensity: "mild" },
      ],
      social: [
        { text: "Look in-control and professional arriving on time to clients and dates.", intensity: "strong" },
      ],
    },
    howManyPeople: {
      value: 50000000,
      detail: "~50 million urban professionals in major US cities who regularly need point-to-point transport and find taxis unreliable.",
    },
    howOften: {
      value: 4,
      unit: "per week",
      detail: "Urban professionals take multiple paid rides a week: to meetings, airports, and nights out. A frequent, recurring need rather than a rare event.",
    },
    worthToThem: {
      value: 25,
      unit: "pounds per ride",
      detail: "Early Uber Black cost a premium over a taxi, often £20-35 a trip. Customers happily paid more than a cab because the strong job was reliability and not being stranded, not the lowest fare.",
    },
    reachableShare: {
      value: 20,
      detail: "Initially launchable to smartphone-owning professionals in a few dense cities (San Francisco first) who could afford a premium black-car fare, a small slice of the total ride market.",
    },
    obtainableShare: {
      value: 8,
      detail: "A realistic early capture given entrenched taxi fleets, medallion systems, and city-by-city regulation that limited how fast Uber could expand.",
    },
    costOfSwitching: {
      level: "low",
      detail: "Hailing a taxi or calling a car service required no commitment, so trying Uber for a single ride cost the customer nothing. The app simply made the better option one tap away.",
    },
    solutionEffectiveness: {
      level: "poor",
      detail: "Taxis and traditional car services were unreliable: no-shows, no ETA, cash-only payment, dirty cars, and dispatchers you couldn't reach. The core job of 'get me there reliably' was badly served.",
    },
    competitorSize: {
      level: "large",
      detail: "Taxi fleets and medallion owners were entrenched and politically protected city by city, but fragmented and locally run, with no national player offering a better experience.",
    },
    verdict: "Valid: Worth Solving",
    reasoning:
      "A frequent, recurring need that incumbents served badly, paired with a strong emotional job: not being stranded. Uber validated it by launching a premium black-car service in one city, proving people would happily pay more for a reliable, tracked, cashless ride before expanding down-market to UberX.",
  },
]
