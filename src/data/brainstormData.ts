import type { BrainstormColumn } from "@/app/(app)/problems/brainstorm/data"

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
      // ── Financial moments ──
      {
        id: "ctx-financial",
        label: "Financial Moments",
        children: [
          { id: "ctx-tax-season", label: "Tax Season / Filing Taxes" },
          { id: "ctx-large-purchase", label: "Making a Large Purchase (Car, Home)" },
          { id: "ctx-insurance-claims", label: "Dealing with Insurance Claims" },
          { id: "ctx-applying-loans", label: "Applying for Loans / Credit" },
          { id: "ctx-managing-debt", label: "Managing Debt" },
          { id: "ctx-unexpected-expenses", label: "Unexpected Expenses" },
          { id: "ctx-investing", label: "Investing & Financial Planning" },
        ],
      },
      // ── Health & wellness ──
      {
        id: "ctx-health",
        label: "Health & Wellness",
        children: [
          { id: "ctx-doctor-visit", label: "At the Doctor / Dentist" },
          { id: "ctx-chronic-condition", label: "Managing a Chronic Condition" },
          { id: "ctx-recovering-illness", label: "Recovering from Illness / Injury" },
          { id: "ctx-mental-health-care", label: "Mental Health Care" },
          { id: "ctx-navigating-health-insurance", label: "Navigating Health Insurance / Billing" },
          { id: "ctx-caring-for-sick-family", label: "Caring for a Sick Family Member" },
        ],
      },
      // ── Parenting & childcare ──
      {
        id: "ctx-parenting",
        label: "Parenting & Childcare",
        children: [
          { id: "ctx-school-dropoff-pickup", label: "School Drop-Off / Pickup" },
          { id: "ctx-helping-homework", label: "Helping with Homework" },
          { id: "ctx-finding-childcare", label: "Finding Childcare" },
          { id: "ctx-kids-activities", label: "Managing Kids' Activities & Schedules" },
          { id: "ctx-dealing-with-schools", label: "Dealing with Schools & Teachers" },
          { id: "ctx-screen-time", label: "Managing Screen Time" },
        ],
      },
      // ── Learning & education ──
      {
        id: "ctx-learning",
        label: "Learning & Education",
        children: [
          { id: "ctx-studying-exams", label: "Studying for Exams" },
          { id: "ctx-online-course", label: "Taking an Online Course" },
          { id: "ctx-learning-new-tool", label: "Learning a New Tool at Work" },
          { id: "ctx-onboarding-software", label: "Onboarding into New Software" },
          { id: "ctx-professional-certification", label: "Professional Certification" },
          { id: "ctx-self-teaching", label: "Self-Teaching a New Skill" },
        ],
      },
      // ── Emergencies & unexpected events ──
      {
        id: "ctx-emergencies",
        label: "Emergencies & Unexpected Events",
        children: [
          { id: "ctx-car-breakdown", label: "Car Breakdown" },
          { id: "ctx-home-repair-emergency", label: "Home Repair Emergency" },
          { id: "ctx-natural-disaster", label: "Natural Disaster" },
          { id: "ctx-dealing-bureaucracy", label: "Dealing with Bureaucracy (Legal / Government)" },
          { id: "ctx-identity-theft", label: "Identity Theft / Fraud" },
          { id: "ctx-medical-emergency", label: "Medical Emergency" },
        ],
      },
      // ── Leisure & recreation ──
      {
        id: "ctx-leisure",
        label: "Leisure & Recreation",
        children: [
          { id: "ctx-planning-vacation", label: "Planning a Vacation" },
          { id: "ctx-dining-out", label: "Dining Out" },
          { id: "ctx-attending-events", label: "Attending Concerts / Events" },
          { id: "ctx-hosting-party", label: "Hosting a Party / Gathering" },
          { id: "ctx-weekend-activities", label: "Weekend Activities" },
          { id: "ctx-outdoor-recreation", label: "Outdoor Recreation & Sports" },
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
      // ── Timing & urgency ──
      {
        id: "pt-timing",
        label: "Timing & Urgency",
        children: [
          { id: "pt-inconvenient-timing", label: "Needs Arise at Inconvenient Times" },
          { id: "pt-long-wait-times", label: "Too-Long Wait Times" },
          { id: "pt-tight-windows", label: "Time-Sensitive with Tight Windows" },
          { id: "pt-results-too-late", label: "Results Come Too Late to Be Useful" },
          { id: "pt-poor-scheduling", label: "Poor Scheduling / Availability" },
          { id: "pt-deadline-pressure", label: "Deadline Pressure & Rushing" },
        ],
      },
      // ── Switching & lock-in ──
      {
        id: "pt-switching",
        label: "Switching & Lock-In",
        children: [
          { id: "pt-high-switching-costs", label: "High Switching Costs" },
          { id: "pt-vendor-lock-in", label: "Vendor Lock-In" },
          { id: "pt-data-not-portable", label: "Data Not Portable" },
          { id: "pt-no-migration-path", label: "No Easy Migration Path" },
          { id: "pt-backward-compatibility", label: "Backward Compatibility Issues" },
          { id: "pt-losing-history", label: "Losing History / Progress When Switching" },
        ],
      },
      // ── Discovery & awareness ──
      {
        id: "pt-discovery",
        label: "Discovery & Awareness",
        children: [
          { id: "pt-dont-know-exists", label: "Don't Know a Solution Exists" },
          { id: "pt-hard-to-find", label: "Hard to Find What You Need" },
          { id: "pt-not-knowing-where-to-start", label: "Not Knowing Where to Start" },
          { id: "pt-poor-discoverability", label: "Poor Discoverability" },
          { id: "pt-overwhelming-options", label: "Overwhelming Number of Options" },
          { id: "pt-unaware-of-problem", label: "Unaware the Problem Exists" },
        ],
      },
      // ── Support & service gaps ──
      {
        id: "pt-support",
        label: "Support & Service Gaps",
        children: [
          { id: "pt-poor-customer-support", label: "Poor Customer Support" },
          { id: "pt-no-after-sales-help", label: "No After-Sales Help" },
          { id: "pt-no-community-support", label: "Lack of Peer / Community Support" },
          { id: "pt-cant-reach-human", label: "Can't Reach a Real Person" },
          { id: "pt-long-resolution-times", label: "Long Resolution Times" },
          { id: "pt-no-self-service", label: "No Self-Service Option" },
        ],
      },
      // ── Motivation & behaviour ──
      {
        id: "pt-motivation",
        label: "Motivation & Behaviour",
        children: [
          { id: "pt-hard-to-stay-motivated", label: "Hard to Stay Motivated" },
          { id: "pt-easy-to-procrastinate", label: "Easy to Procrastinate" },
          { id: "pt-requires-too-much-willpower", label: "Requires Too Much Willpower" },
          { id: "pt-choice-overload", label: "Cognitive Overload from Too Many Choices" },
          { id: "pt-bad-defaults", label: "Defaults Work Against You" },
          { id: "pt-habit-formation", label: "Hard to Build / Break Habits" },
        ],
      },
      // ── Emotional & psychological burden ──
      {
        id: "pt-emotional",
        label: "Emotional & Psychological Burden",
        children: [
          { id: "pt-anxiety-inducing", label: "Anxiety-Inducing Processes" },
          { id: "pt-embarrassing", label: "Embarrassing to Deal With" },
          { id: "pt-isolating", label: "Isolating / Lonely Experience" },
          { id: "pt-guilt-inducing", label: "Guilt-Inducing" },
          { id: "pt-causes-avoidance", label: "So Overwhelming It Causes Avoidance" },
          { id: "pt-emotionally-draining", label: "Emotionally Draining" },
        ],
      },
    ],
  },
]
