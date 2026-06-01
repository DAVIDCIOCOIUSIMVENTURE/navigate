import { Mail, Notebook, Glasses, Car, type LucideIcon } from "lucide-react"

export type ExistingSolutionCaseStudy = {
  company: string
  icon: LucideIcon
  iconBg: string
  solutions: {
    name: string
    shortcomings: { text: string }[]
  }[]
}

export const EXISTING_SOLUTIONS_CASE_STUDIES: ExistingSolutionCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    icon: Mail,
    iconBg: "bg-yellow-500",
    solutions: [
      {
        name: "BCC in Gmail / Outlook",
        shortcomings: [
          { text: "BCC limits (often capped at 500 recipients) forced business owners to spend 2-3 hours manually splitting contact lists in spreadsheets." },
          { text: "No unsubscribe link, so opt-out requests landed in personal inboxes and were often missed, damaging trust and risking spam complaints." },
          { text: "Plain-text emails with no branding left owners feeling embarrassed sending messages that didn't reflect their business." },
          { text: "No way to track opens or clicks, so owners had no signal of what worked and improving campaigns became guesswork." },
        ],
      },
      {
        name: "Enterprise email platforms (e.g. Constant Contact, early Salesforce Marketing Cloud)",
        shortcomings: [
          { text: "Pricing started at $100+/month, too expensive for micro-businesses who ended up paying for features they never used." },
          { text: "Complex setup required technical knowledge or a consultant, costing hours that should have gone toward running the business." },
          { text: "Feature-heavy interfaces designed for marketing teams felt intimidating and exclusionary to solo operators, like 'this isn't for people like me'." },
        ],
      },
      {
        name: "Doing nothing: relying on word of mouth and social media only",
        shortcomings: [
          { text: "No direct line to existing customers, so repeat purchase rates suffered without a way to re-engage past buyers." },
          { text: "Algorithm changes could kill reach overnight, with audience size dropping unpredictably whenever platforms tweaked their feeds." },
          { text: "No way to segment or personalise messages, leaving owners feeling like they were shouting into the void with no feedback on what worked." },
        ],
      },
    ],
  },
  {
    company: "Notion (early adopter phase)",
    icon: Notebook,
    iconBg: "bg-slate-700",
    solutions: [
      {
        name: "Google Docs + Trello + Evernote (tool sprawl)",
        shortcomings: [
          { text: "Information scattered across 3+ apps with no central index, forcing teams to spend ~30 min/day searching for what they needed." },
          { text: "Different permissions and sharing models per tool meant onboarding new team members took days, since knowledge lived in personal accounts." },
          { text: "No relational links between notes, tasks, and docs led to decisions being made with incomplete context when related info lived in a different app." },
          { text: "Context-switching between apps multiple times per hour created constant low-grade frustration of never knowing where something was saved." },
        ],
      },
      {
        name: "Company wiki tools (e.g. Confluence)",
        shortcomings: [
          { text: "Slow, clunky editing discouraged updates, leaving teams to resent the wiki as a chore rather than a useful tool." },
          { text: "Pages became stale because nobody wanted to maintain them, so teams ended up making decisions on outdated information." },
          { text: "Poor mobile experience meant employees couldn't reference docs on the go and had to wait until they were back at their desks." },
          { text: "Required admin setup and IT involvement, so the internal helpdesk fielded questions that should have been answered by docs." },
        ],
      },
      {
        name: "Spreadsheets as project trackers",
        shortcomings: [
          { text: "No built-in views (kanban, calendar, timeline), so project leads spent hours each week updating and formatting cells by hand." },
          { text: "Formulas break when rows are moved or deleted, leaving status updates frequently out of date and causing duplicate or missed work." },
          { text: "No commenting or assignment features made the whole exercise feel like busywork that added no real value." },
        ],
      },
    ],
  },
  {
    company: "Warby Parker (launch)",
    icon: Glasses,
    iconBg: "bg-blue-900",
    solutions: [
      {
        name: "Optical retail chains (LensCrafters, Pearle Vision, all Luxottica-owned)",
        shortcomings: [
          { text: "A single pair routinely cost $300-500, because the same company owned the frames, the lenses, and the stores, leaving customers no real price competition." },
          { text: "Frame selection was dominated by a few licensed designer brands, all marked up heavily, so the apparent 'choice' was an illusion." },
          { text: "The in-store sales process pushed upsells (coatings, upgrades) that inflated the final bill well beyond the sticker price." },
        ],
      },
      {
        name: "Independent opticians",
        shortcomings: [
          { text: "Personal service came at an even higher price, putting it out of reach for budget-conscious buyers." },
          { text: "Limited frame ranges and inconsistent stock meant customers often couldn't find a style they liked locally." },
          { text: "Restricted hours and single locations forced people to take time off work for what should be a quick purchase." },
        ],
      },
      {
        name: "Cheap online sellers (e.g. Zenni Optical)",
        shortcomings: [
          { text: "Rock-bottom prices came with no way to try frames on, so buyers gambled on fit and often received glasses that looked wrong." },
          { text: "Bargain-basement branding made customers question the quality and the accuracy of the lenses." },
          { text: "Awkward or non-existent returns meant a bad guess was money wasted, which deterred people from risking it at all." },
        ],
      },
    ],
  },
  {
    company: "Uber (launch)",
    icon: Car,
    iconBg: "bg-zinc-900",
    solutions: [
      {
        name: "Traditional taxis (street hail or phone dispatch)",
        shortcomings: [
          { text: "No reliable ETA: you stood on a corner with no idea if or when a cab would come, and dispatchers often didn't pick up." },
          { text: "Cash-only or clunky card machines meant fumbling for payment and arguments over broken terminals at the end of every ride." },
          { text: "Inconsistent cars and drivers with no accountability: a bad or unsafe ride had no real way to be reported or refunded." },
        ],
      },
      {
        name: "Licensed car and limo services",
        shortcomings: [
          { text: "Required calling ahead and booking in advance, useless for a spontaneous trip across town." },
          { text: "Opaque pricing quoted over the phone left customers unsure what they'd actually pay until the journey was over." },
          { text: "Premium rates with no app, no live tracking, and no transparency about where the car actually was." },
        ],
      },
      {
        name: "Driving and parking yourself",
        shortcomings: [
          { text: "Parking in dense cities was expensive, scarce, and time-consuming, often costing more than the trip was worth." },
          { text: "Drinking, working, or relaxing en route was impossible when you had to be the one behind the wheel." },
          { text: "Traffic and navigation stress fell entirely on you, with no option to hand it off to someone else." },
        ],
      },
    ],
  },
]
