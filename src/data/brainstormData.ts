import type { BrainstormColumn } from "@/app/(app)/problem-discovery/brainstorm/data"

export const brainstormColumns: BrainstormColumn[] = [
  {
    id: "customer-segments",
    title: "Customer Segments",
    items: [
      // ── By life stage ──
      {
        id: "cs-life-stage",
        label: "By Life Stage",
        children: [
          { id: "cs-teenagers", label: "Teenagers (13-19)" },
          { id: "cs-college-students", label: "College Students" },
          { id: "cs-young-professionals", label: "Young Professionals (22-35)" },
          { id: "cs-new-parents", label: "New Parents" },
          { id: "cs-parents-school-age", label: "Parents of School-Age Children" },
          { id: "cs-midlife-adults", label: "Mid-Life Adults (40-55)" },
          { id: "cs-pre-retirees", label: "Pre-Retirees (55-65)" },
          { id: "cs-retirees", label: "Retirees & Seniors (65+)" },
        ],
      },
      // ── By lifestyle ──
      {
        id: "cs-lifestyle",
        label: "By Lifestyle",
        children: [
          { id: "cs-health-conscious", label: "Health-Conscious Individuals" },
          { id: "cs-budget-conscious", label: "Budget-Conscious / Frugal" },
          { id: "cs-eco-conscious", label: "Eco-Conscious / Sustainable Living" },
          { id: "cs-tech-enthusiasts", label: "Tech Enthusiasts / Early Adopters" },
          { id: "cs-remote-workers", label: "Remote & Hybrid Workers" },
          { id: "cs-digital-nomads", label: "Digital Nomads" },
          { id: "cs-frequent-travelers", label: "Frequent Travelers" },
          { id: "cs-pet-owners", label: "Pet Owners" },
          { id: "cs-hobbyists", label: "Hobbyists & Creators" },
          { id: "cs-fitness-enthusiasts", label: "Fitness Enthusiasts" },
          { id: "cs-caregivers", label: "Caregivers (Elderly / Disabled)" },
        ],
      },
      // ── Small business & freelance ──
      {
        id: "cs-small-business",
        label: "Small Business & Freelance",
        children: [
          { id: "cs-solopreneurs", label: "Solopreneurs & Freelancers" },
          { id: "cs-local-retail", label: "Local Retail & Shops" },
          { id: "cs-restaurants-food", label: "Restaurants & Food Service" },
          { id: "cs-professional-services", label: "Professional Services (Legal, Accounting)" },
          { id: "cs-trades-contractors", label: "Trades & Contractors (Plumbing, Electric)" },
          { id: "cs-creative-agencies", label: "Creative & Marketing Agencies" },
          { id: "cs-ecommerce-sellers", label: "E-Commerce Sellers" },
        ],
      },
      // ── Enterprise & corporate ──
      {
        id: "cs-enterprise",
        label: "Enterprise & Corporate",
        children: [
          { id: "cs-hr-people-ops", label: "HR & People Operations" },
          { id: "cs-sales-teams", label: "Sales Teams" },
          { id: "cs-marketing-teams", label: "Marketing Teams" },
          { id: "cs-engineering-teams", label: "Engineering & IT Teams" },
          { id: "cs-operations-logistics", label: "Operations & Logistics" },
          { id: "cs-finance-accounting", label: "Finance & Accounting" },
          { id: "cs-executive-leadership", label: "Executive Leadership / C-Suite" },
        ],
      },
      // ── Industry verticals ──
      {
        id: "cs-industries",
        label: "Industry Verticals",
        children: [
          { id: "cs-healthcare", label: "Healthcare & Pharma" },
          { id: "cs-education-sector", label: "Education & EdTech" },
          { id: "cs-financial-services", label: "Financial Services & FinTech" },
          { id: "cs-real-estate", label: "Real Estate & PropTech" },
          { id: "cs-agriculture", label: "Agriculture & AgTech" },
          { id: "cs-construction", label: "Construction & Infrastructure" },
          { id: "cs-logistics-supply", label: "Logistics & Supply Chain" },
          { id: "cs-hospitality-tourism", label: "Hospitality & Tourism" },
          { id: "cs-media-entertainment", label: "Media & Entertainment" },
          { id: "cs-manufacturing", label: "Manufacturing" },
          { id: "cs-energy-utilities", label: "Energy & Utilities" },
          { id: "cs-legal-compliance", label: "Legal & Compliance" },
        ],
      },
      // ── Public & social sector ──
      {
        id: "cs-public-sector",
        label: "Public & Social Sector",
        children: [
          { id: "cs-government", label: "Government & Municipalities" },
          { id: "cs-nonprofits", label: "Nonprofits & NGOs" },
          { id: "cs-community-orgs", label: "Community Organizations" },
          { id: "cs-social-enterprises", label: "Social Enterprises" },
        ],
      },
    ],
  },
  {
    id: "contexts",
    title: "Contexts",
    items: [
      // ── Daily routines ──
      {
        id: "ctx-daily",
        label: "Daily Routines",
        children: [
          { id: "ctx-morning-routine", label: "Morning Routine" },
          { id: "ctx-commuting", label: "Commuting" },
          { id: "ctx-cooking-meals", label: "Cooking & Meal Prep" },
          { id: "ctx-shopping-errands", label: "Shopping & Errands" },
          { id: "ctx-exercising", label: "Exercising & Working Out" },
          { id: "ctx-evening-winding-down", label: "Evening / Winding Down" },
          { id: "ctx-managing-household", label: "Managing the Household" },
        ],
      },
      // ── Work & professional ──
      {
        id: "ctx-work",
        label: "Work & Professional",
        children: [
          { id: "ctx-in-office", label: "In the Office" },
          { id: "ctx-working-remotely", label: "Working from Home / Remotely" },
          { id: "ctx-in-meetings", label: "In Meetings" },
          { id: "ctx-collaborating", label: "Collaborating with Teams" },
          { id: "ctx-hiring-onboarding", label: "Hiring & Onboarding" },
          { id: "ctx-presenting-pitching", label: "Presenting & Pitching" },
          { id: "ctx-managing-projects", label: "Managing Projects & Deadlines" },
          { id: "ctx-business-travel", label: "Business Travel" },
        ],
      },
      // ── Social & community ──
      {
        id: "ctx-social",
        label: "Social & Community",
        children: [
          { id: "ctx-family-gatherings", label: "Family Gatherings" },
          { id: "ctx-socializing-friends", label: "Socializing with Friends" },
          { id: "ctx-dating-relationships", label: "Dating & Relationships" },
          { id: "ctx-community-events", label: "Community Events" },
          { id: "ctx-volunteering", label: "Volunteering" },
          { id: "ctx-religious-spiritual", label: "Religious & Spiritual Settings" },
        ],
      },
      // ── Life transitions ──
      {
        id: "ctx-transitions",
        label: "Life Transitions",
        children: [
          { id: "ctx-starting-new-job", label: "Starting a New Job" },
          { id: "ctx-moving-relocating", label: "Moving / Relocating" },
          { id: "ctx-having-a-baby", label: "Having a Baby" },
          { id: "ctx-going-back-to-school", label: "Going Back to School" },
          { id: "ctx-retirement", label: "Entering Retirement" },
          { id: "ctx-career-change", label: "Career Change" },
          { id: "ctx-health-crisis", label: "Dealing with Health Issues" },
          { id: "ctx-loss-grief", label: "Coping with Loss / Grief" },
          { id: "ctx-divorce-separation", label: "Divorce / Separation" },
        ],
      },
      // ── Environments ──
      {
        id: "ctx-environments",
        label: "Environments",
        children: [
          { id: "ctx-urban-areas", label: "Urban Areas" },
          { id: "ctx-suburban", label: "Suburban Areas" },
          { id: "ctx-rural-areas", label: "Rural Areas" },
          { id: "ctx-outdoors-nature", label: "Outdoors & Nature" },
          { id: "ctx-public-transport", label: "Public Transport" },
          { id: "ctx-healthcare-facility", label: "Hospitals & Clinics" },
          { id: "ctx-educational-institution", label: "Schools & Universities" },
          { id: "ctx-traveling-abroad", label: "Traveling Abroad" },
        ],
      },
      // ── Digital contexts ──
      {
        id: "ctx-digital",
        label: "Digital Contexts",
        children: [
          { id: "ctx-online-shopping", label: "Online Shopping" },
          { id: "ctx-social-media", label: "Using Social Media" },
          { id: "ctx-searching-info", label: "Searching for Information" },
          { id: "ctx-using-apps", label: "Using Mobile Apps" },
          { id: "ctx-gaming", label: "Gaming" },
          { id: "ctx-streaming-content", label: "Streaming Content" },
          { id: "ctx-managing-finances-online", label: "Managing Finances Online" },
        ],
      },
    ],
  },
  {
    id: "jobs-to-be-done",
    title: "Jobs to be Done",
    items: [
      // ── Functional jobs ──
      {
        id: "jtbd-functional",
        label: "Functional Jobs",
        children: [
          { id: "jtbd-manage-finances", label: "Manage Personal / Business Finances" },
          { id: "jtbd-organize-tasks", label: "Organize Tasks & Responsibilities" },
          { id: "jtbd-find-information", label: "Find Reliable Information Quickly" },
          { id: "jtbd-make-decisions", label: "Make Informed Decisions" },
          { id: "jtbd-communicate", label: "Communicate Effectively" },
          { id: "jtbd-track-progress", label: "Track Progress & Performance" },
          { id: "jtbd-automate-tasks", label: "Automate Repetitive Tasks" },
          { id: "jtbd-coordinate-people", label: "Coordinate People & Schedules" },
          { id: "jtbd-maintain-assets", label: "Maintain Equipment / Property" },
          { id: "jtbd-navigate-regulations", label: "Navigate Rules & Regulations" },
        ],
      },
      // ── Personal growth ──
      {
        id: "jtbd-growth",
        label: "Personal Growth",
        children: [
          { id: "jtbd-learn-skills", label: "Learn New Skills" },
          { id: "jtbd-advance-career", label: "Advance My Career" },
          { id: "jtbd-stay-healthy", label: "Stay Physically Healthy" },
          { id: "jtbd-mental-wellbeing", label: "Maintain Mental Wellbeing" },
          { id: "jtbd-build-habits", label: "Build Better Habits" },
          { id: "jtbd-express-creativity", label: "Express Creativity" },
          { id: "jtbd-gain-independence", label: "Gain Independence / Self-Sufficiency" },
        ],
      },
      // ── Emotional jobs ──
      {
        id: "jtbd-emotional",
        label: "Emotional Jobs",
        children: [
          { id: "jtbd-feel-secure", label: "Feel Safe & Secure" },
          { id: "jtbd-reduce-anxiety", label: "Reduce Anxiety & Stress" },
          { id: "jtbd-feel-in-control", label: "Feel in Control" },
          { id: "jtbd-feel-confident", label: "Feel Confident & Competent" },
          { id: "jtbd-find-meaning", label: "Find Purpose & Meaning" },
          { id: "jtbd-have-fun", label: "Have Fun & Be Entertained" },
          { id: "jtbd-feel-valued", label: "Feel Valued & Appreciated" },
        ],
      },
      // ── Social jobs ──
      {
        id: "jtbd-social",
        label: "Social Jobs",
        children: [
          { id: "jtbd-build-relationships", label: "Build & Maintain Relationships" },
          { id: "jtbd-belong-community", label: "Belong to a Community" },
          { id: "jtbd-earn-trust", label: "Earn Trust & Credibility" },
          { id: "jtbd-collaborate", label: "Collaborate with Others" },
          { id: "jtbd-share-experiences", label: "Share Experiences & Knowledge" },
          { id: "jtbd-get-recognition", label: "Get Recognition & Status" },
          { id: "jtbd-help-others", label: "Help Others / Give Back" },
        ],
      },
      // ── Practical / economic ──
      {
        id: "jtbd-practical",
        label: "Practical & Economic",
        children: [
          { id: "jtbd-save-money", label: "Save Money / Reduce Costs" },
          { id: "jtbd-save-time", label: "Save Time" },
          { id: "jtbd-increase-revenue", label: "Increase Revenue / Income" },
          { id: "jtbd-reduce-risk", label: "Reduce Risk & Uncertainty" },
          { id: "jtbd-ensure-quality", label: "Ensure Quality & Reliability" },
          { id: "jtbd-stay-compliant", label: "Stay Compliant with Regulations" },
          { id: "jtbd-scale-operations", label: "Scale Operations" },
          { id: "jtbd-protect-data", label: "Protect Data & Privacy" },
        ],
      },
    ],
  },
  {
    id: "problem-types",
    title: "Problem Types",
    items: [
      // ── Friction & usability ──
      {
        id: "pt-friction",
        label: "Friction & Usability",
        children: [
          { id: "pt-too-complex", label: "Too Complex / Hard to Use" },
          { id: "pt-time-consuming", label: "Time-Consuming Processes" },
          { id: "pt-manual-repetitive", label: "Manual & Repetitive Tasks" },
          { id: "pt-poor-ux", label: "Poor User Experience" },
          { id: "pt-inconvenient", label: "Inconvenient / Hard to Access" },
          { id: "pt-steep-learning-curve", label: "Steep Learning Curve" },
        ],
      },
      // ── Information & knowledge ──
      {
        id: "pt-information",
        label: "Information & Knowledge",
        children: [
          { id: "pt-lack-transparency", label: "Lack of Transparency" },
          { id: "pt-information-overload", label: "Information Overload" },
          { id: "pt-hard-to-compare", label: "Hard to Compare Options" },
          { id: "pt-outdated-info", label: "Outdated / Inaccurate Information" },
          { id: "pt-scattered-knowledge", label: "Scattered / Siloed Knowledge" },
          { id: "pt-unclear-guidance", label: "Unclear Guidance / Instructions" },
        ],
      },
      // ── Trust & safety ──
      {
        id: "pt-trust",
        label: "Trust & Safety",
        children: [
          { id: "pt-lack-of-trust", label: "Lack of Trust" },
          { id: "pt-quality-uncertainty", label: "Quality Uncertainty" },
          { id: "pt-hidden-costs", label: "Hidden Costs & Fees" },
          { id: "pt-privacy-concerns", label: "Privacy & Data Concerns" },
          { id: "pt-safety-risks", label: "Safety & Security Risks" },
          { id: "pt-fraud-scams", label: "Fraud & Scams" },
        ],
      },
      // ── Access & affordability ──
      {
        id: "pt-access",
        label: "Access & Affordability",
        children: [
          { id: "pt-high-costs", label: "High Costs / Overpriced" },
          { id: "pt-geographic-limits", label: "Geographic Limitations" },
          { id: "pt-language-barriers", label: "Language Barriers" },
          { id: "pt-digital-divide", label: "Digital Divide / Tech Literacy Gap" },
          { id: "pt-physical-accessibility", label: "Physical Accessibility Barriers" },
          { id: "pt-limited-availability", label: "Limited Availability / Scarcity" },
        ],
      },
      // ── Coordination & alignment ──
      {
        id: "pt-coordination",
        label: "Coordination & Alignment",
        children: [
          { id: "pt-fragmented-tools", label: "Fragmented Tools & Solutions" },
          { id: "pt-communication-gaps", label: "Communication Gaps" },
          { id: "pt-misaligned-incentives", label: "Misaligned Incentives" },
          { id: "pt-lack-standardization", label: "Lack of Standardization" },
          { id: "pt-handoff-failures", label: "Handoff & Transition Failures" },
          { id: "pt-stakeholder-conflicts", label: "Stakeholder Conflicts" },
        ],
      },
      // ── Performance & reliability ──
      {
        id: "pt-performance",
        label: "Performance & Reliability",
        children: [
          { id: "pt-inefficiency", label: "Inefficiency / Waste" },
          { id: "pt-unreliable", label: "Unreliable / Inconsistent" },
          { id: "pt-slow-processes", label: "Slow Processes & Bottlenecks" },
          { id: "pt-limited-customization", label: "Limited Customization" },
          { id: "pt-doesnt-scale", label: "Doesn't Scale" },
          { id: "pt-poor-integration", label: "Poor Integration / Compatibility" },
        ],
      },
      // ── Regulatory & compliance ──
      {
        id: "pt-regulatory",
        label: "Regulatory & Compliance",
        children: [
          { id: "pt-regulatory-complexity", label: "Regulatory Complexity" },
          { id: "pt-compliance-burden", label: "Compliance Burden" },
          { id: "pt-changing-regulations", label: "Constantly Changing Rules" },
          { id: "pt-cross-border-issues", label: "Cross-Border / Jurisdictional Issues" },
        ],
      },
      // ── Environmental & social ──
      {
        id: "pt-environmental",
        label: "Environmental & Social",
        children: [
          { id: "pt-environmental-impact", label: "Negative Environmental Impact" },
          { id: "pt-waste-overconsumption", label: "Waste & Overconsumption" },
          { id: "pt-social-inequality", label: "Social Inequality" },
          { id: "pt-ethical-concerns", label: "Ethical Concerns" },
        ],
      },
    ],
  },
]
