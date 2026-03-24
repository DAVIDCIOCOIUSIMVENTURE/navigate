export type ExistingSolutionCaseStudy = {
  company: string
  solutions: {
    name: string
    shortcomings: string[]
    impacts: string[]
  }[]
}

export const EXISTING_SOLUTIONS_CASE_STUDIES: ExistingSolutionCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    solutions: [
      {
        name: "BCC in Gmail / Outlook",
        shortcomings: [
          "No way to track opens or clicks",
          "Emails look unprofessional — plain text, no branding",
          "BCC limits vary by provider (often capped at 500 recipients)",
          "No unsubscribe link, risking spam complaints",
        ],
        impacts: [
          "Time Lost — business owners spent 2–3 hours manually managing contact lists in spreadsheets",
          "Customer Churn — unsubscribe requests went to personal inbox and were often missed, damaging trust",
          "Emotional Impact — owners felt embarrassed sending ugly emails that didn't reflect their brand",
        ],
      },
      {
        name: "Enterprise email platforms (e.g. Constant Contact, early Salesforce Marketing Cloud)",
        shortcomings: [
          "Pricing started at $100+/month — too expensive for micro-businesses",
          "Complex setup requiring technical knowledge or a consultant",
          "Feature-heavy interfaces designed for marketing teams, not solo operators",
        ],
        impacts: [
          "Money Wasted — small businesses paying for features they never used",
          "Productivity Loss — hours spent learning complex tools instead of running the business",
          "Emotional Impact — felt intimidating and exclusionary, like 'this isn't for people like me'",
        ],
      },
      {
        name: "Doing nothing — relying on word of mouth and social media only",
        shortcomings: [
          "No direct line to existing customers",
          "Algorithm changes could kill reach overnight",
          "No way to segment or personalise messages",
        ],
        impacts: [
          "Revenue Impact — repeat purchase rates were lower without a way to re-engage past buyers",
          "Emotional Impact — felt like shouting into the void with no feedback on what worked",
        ],
      },
    ],
  },
  {
    company: "Notion (early adopter phase)",
    solutions: [
      {
        name: "Google Docs + Trello + Evernote (tool sprawl)",
        shortcomings: [
          "Information scattered across 3+ apps with no central index",
          "Different permissions and sharing models per tool",
          "No relational links between notes, tasks, and docs",
          "Context-switching overhead between apps multiple times per hour",
        ],
        impacts: [
          "Time Lost — teams spent ~30 min/day searching for information across tools",
          "Productivity Loss — onboarding new team members took days because knowledge lived in personal accounts",
          "Emotional Impact — constant low-grade frustration of never knowing where something was saved",
        ],
      },
      {
        name: "Company wiki tools (e.g. Confluence)",
        shortcomings: [
          "Slow, clunky editing experience that discouraged updates",
          "Pages became stale because nobody wanted to maintain them",
          "Poor mobile experience",
          "Required admin setup and IT involvement",
        ],
        impacts: [
          "Productivity Loss — outdated wiki pages led to teams making decisions on wrong information",
          "Support Tickets — internal helpdesk fielded questions that should have been answered by docs",
          "Emotional Impact — teams resented the wiki as a chore rather than a useful tool",
        ],
      },
      {
        name: "Spreadsheets as project trackers",
        shortcomings: [
          "No built-in views (kanban, calendar, timeline)",
          "Formulas break when rows are moved or deleted",
          "No commenting or assignment features",
        ],
        impacts: [
          "Error Rates — manual status updates were frequently out of date, causing duplicate or missed work",
          "Time Lost — project leads spent hours each week updating and formatting spreadsheets",
          "Emotional Impact — felt like busywork that added no real value",
        ],
      },
    ],
  },
]
