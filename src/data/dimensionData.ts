import type { DimensionColumn, DimensionItem } from "@/app/(app)/problems/identify/data"

export const audienceGroups: DimensionItem[] = [
  // ── By life stage ──
  {
    id: "customer-life-stage",
    label: "By Life Stage",
    children: [
      { id: "customer-children", label: "Children (Under 13)" },
      { id: "customer-teenagers", label: "Teenagers (13-19)" },
      { id: "customer-college-students", label: "University Students" },
      { id: "customer-young-professionals", label: "Young Professionals (22-35)" },
      { id: "customer-new-parents", label: "New Parents" },
      { id: "customer-parents-school-age", label: "Parents of School-Age Children" },
      { id: "customer-midlife-adults", label: "Mid-Life Adults (40-55)" },
      { id: "customer-pre-retirees", label: "Pre-Retirees (55-65)" },
      { id: "customer-retirees", label: "Retirees & Seniors (65+)" },
    ],
  },
  // ── By lifestyle ──
  {
    id: "customer-lifestyle",
    label: "By Lifestyle",
    children: [
      { id: "customer-health-conscious", label: "Health-Conscious Individuals" },
      { id: "customer-budget-conscious", label: "Budget-Conscious / Frugal" },
      { id: "customer-eco-conscious", label: "Eco-Conscious / Sustainable Living" },
      { id: "customer-tech-enthusiasts", label: "Tech Enthusiasts / Early Adopters" },
      { id: "customer-remote-workers", label: "Remote & Hybrid Workers" },
      { id: "customer-digital-nomads", label: "Digital Nomads" },
      { id: "customer-frequent-travelers", label: "Frequent Travellers" },
      { id: "customer-pet-owners", label: "Pet Owners" },
      { id: "customer-hobbyists", label: "Hobbyists & Creators" },
      { id: "customer-fitness-enthusiasts", label: "Fitness Enthusiasts" },
      { id: "customer-caregivers", label: "Caregivers (Elderly / Disabled)" },
    ],
  },
  // ── Small business & freelance ──
  {
    id: "customer-small-business",
    label: "Small Business & Freelance",
    children: [
      { id: "customer-solopreneurs", label: "Solopreneurs & Freelancers" },
      { id: "customer-startups", label: "Startups" },
      { id: "customer-local-retail", label: "Local Retail & Shops" },
      { id: "customer-restaurants-food", label: "Restaurants & Food Service" },
      { id: "customer-professional-services", label: "Professional Services (Legal, Accounting)" },
      { id: "customer-trades-contractors", label: "Trades & Contractors (Plumbing, Electric)" },
      { id: "customer-creative-agencies", label: "Creative & Marketing Agencies" },
      { id: "customer-ecommerce-sellers", label: "E-Commerce Sellers" },
    ],
  },
  // ── Enterprise & corporate ──
  {
    id: "customer-enterprise",
    label: "Enterprise & Corporate",
    children: [
      { id: "customer-hr-people-ops", label: "HR & People Operations" },
      { id: "customer-sales-teams", label: "Sales Teams" },
      { id: "customer-marketing-teams", label: "Marketing Teams" },
      { id: "customer-engineering-teams", label: "Engineering & IT Teams" },
      { id: "customer-operations-logistics", label: "Operations & Logistics" },
      { id: "customer-finance-accounting", label: "Finance & Accounting" },
      { id: "customer-executive-leadership", label: "Executive Leadership / C-Suite" },
    ],
  },
  // ── Industry verticals ──
  {
    id: "customer-industries",
    label: "Industry Verticals",
    children: [
      { id: "customer-healthcare", label: "Healthcare & Pharma" },
      { id: "customer-education-sector", label: "Education & EdTech" },
      { id: "customer-financial-services", label: "Financial Services & FinTech" },
      { id: "customer-real-estate", label: "Real Estate & PropTech" },
      { id: "customer-agriculture", label: "Agriculture & AgTech" },
      { id: "customer-construction", label: "Construction & Infrastructure" },
      { id: "customer-logistics-supply", label: "Logistics & Supply Chain" },
      { id: "customer-hospitality-tourism", label: "Hospitality & Tourism" },
      { id: "customer-media-entertainment", label: "Media & Entertainment" },
      { id: "customer-manufacturing", label: "Manufacturing" },
      { id: "customer-energy-utilities", label: "Energy & Utilities" },
      { id: "customer-legal-compliance", label: "Legal & Compliance" },
    ],
  },
  // ── Public & social sector ──
  {
    id: "customer-public-sector",
    label: "Public & Social Sector",
    children: [
      { id: "customer-government", label: "Government & Municipalities" },
      { id: "customer-nonprofits", label: "Nonprofits & NGOs" },
      { id: "customer-community-orgs", label: "Community Organisations" },
      { id: "customer-religious-orgs", label: "Religious Organisations" },
      { id: "customer-social-enterprises", label: "Social Enterprises" },
    ],
  },
]

export const dimensionColumns: DimensionColumn[] = [
  {
    id: "customers",
    title: "Customer",
    items: audienceGroups,
  },
  {
    id: "contexts",
    title: "Context",
    items: [
      // ── Daily routines ──
      {
        id: "context-daily",
        label: "Daily Routines",
        children: [
          { id: "context-morning-routine", label: "Morning Routine" },
          { id: "context-commuting", label: "Commuting" },
          { id: "context-cooking-meals", label: "Cooking & Meal Prep" },
          { id: "context-shopping-errands", label: "Shopping & Errands" },
          { id: "context-exercising", label: "Exercising & Working Out" },
          { id: "context-evening-winding-down", label: "Evening / Winding Down" },
          { id: "context-managing-household", label: "Managing the Household" },
        ],
      },
      // ── Work & professional ──
      {
        id: "context-work",
        label: "Work & Professional",
        children: [
          { id: "context-in-office", label: "In the Office" },
          { id: "context-working-remotely", label: "Working from Home / Remotely" },
          { id: "context-in-meetings", label: "In Meetings" },
          { id: "context-collaborating", label: "Collaborating with Teams" },
          { id: "context-hiring-onboarding", label: "Hiring & Onboarding" },
          { id: "context-presenting-pitching", label: "Presenting & Pitching" },
          { id: "context-managing-projects", label: "Managing Projects & Deadlines" },
          { id: "context-business-travel", label: "Business Travel" },
        ],
      },
      // ── Social & community ──
      {
        id: "context-social",
        label: "Social & Community",
        children: [
          { id: "context-family-gatherings", label: "Family Gatherings" },
          { id: "context-socializing-friends", label: "Socialising with Friends" },
          { id: "context-dating-relationships", label: "Dating & Relationships" },
          { id: "context-community-events", label: "Community Events" },
          { id: "context-volunteering", label: "Volunteering" },
          { id: "context-religious-spiritual", label: "Religious & Spiritual Settings" },
        ],
      },
      // ── Life transitions ──
      {
        id: "context-transitions",
        label: "Life Transitions",
        children: [
          { id: "context-starting-new-job", label: "Starting a New Job" },
          { id: "context-moving-relocating", label: "Moving / Relocating" },
          { id: "context-having-a-baby", label: "Having a Baby" },
          { id: "context-going-back-to-school", label: "Going Back to School" },
          { id: "context-retirement", label: "Entering Retirement" },
          { id: "context-career-change", label: "Career Change" },
          { id: "context-health-crisis", label: "Dealing with Health Issues" },
          { id: "context-loss-grief", label: "Coping with Loss / Grief" },
          { id: "context-divorce-separation", label: "Divorce / Separation" },
        ],
      },
      // ── Environments ──
      {
        id: "context-environments",
        label: "Environments",
        children: [
          { id: "context-urban-areas", label: "Urban Areas" },
          { id: "context-suburban", label: "Suburban Areas" },
          { id: "context-rural-areas", label: "Rural Areas" },
          { id: "context-outdoors-nature", label: "Outdoors & Nature" },
          { id: "context-public-transport", label: "Public Transport" },
          { id: "context-healthcare-facility", label: "Hospitals & Clinics" },
          { id: "context-educational-institution", label: "Schools & Universities" },
          { id: "context-traveling-abroad", label: "Travelling Abroad" },
        ],
      },
      // ── Digital contexts ──
      {
        id: "context-digital",
        label: "Digital Contexts",
        children: [
          { id: "context-online-shopping", label: "Online Shopping" },
          { id: "context-social-media", label: "Using Social Media" },
          { id: "context-searching-info", label: "Searching for Information" },
          { id: "context-using-apps", label: "Using Mobile Apps" },
          { id: "context-gaming", label: "Gaming" },
          { id: "context-streaming-content", label: "Streaming Content" },
          { id: "context-managing-finances-online", label: "Managing Finances Online" },
        ],
      },
      // ── Financial moments ──
      {
        id: "context-financial",
        label: "Financial Moments",
        children: [
          { id: "context-tax-season", label: "Tax Season / Filing Taxes" },
          { id: "context-large-purchase", label: "Making a Large Purchase (Car, Home)" },
          { id: "context-insurance-claims", label: "Dealing with Insurance Claims" },
          { id: "context-applying-loans", label: "Applying for Loans / Credit" },
          { id: "context-managing-debt", label: "Managing Debt" },
          { id: "context-unexpected-expenses", label: "Unexpected Expenses" },
          { id: "context-investing", label: "Investing & Financial Planning" },
        ],
      },
      // ── Health & wellness ──
      {
        id: "context-health",
        label: "Health & Wellness",
        children: [
          { id: "context-doctor-visit", label: "At the Doctor / Dentist" },
          { id: "context-chronic-condition", label: "Managing a Chronic Condition" },
          { id: "context-recovering-illness", label: "Recovering from Illness / Injury" },
          { id: "context-mental-health-care", label: "Mental Health Care" },
          { id: "context-navigating-health-insurance", label: "Navigating Health Insurance / Billing" },
          { id: "context-caring-for-sick-family", label: "Caring for a Sick Family Member" },
        ],
      },
      // ── Parenting & childcare ──
      {
        id: "context-parenting",
        label: "Parenting & Childcare",
        children: [
          { id: "context-school-dropoff-pickup", label: "School Drop-Off / Pickup" },
          { id: "context-helping-homework", label: "Helping with Homework" },
          { id: "context-finding-childcare", label: "Finding Childcare" },
          { id: "context-kids-activities", label: "Managing Kids' Activities & Schedules" },
          { id: "context-dealing-with-schools", label: "Dealing with Schools & Teachers" },
          { id: "context-screen-time", label: "Managing Screen Time" },
        ],
      },
      // ── Learning & education ──
      {
        id: "context-learning",
        label: "Learning & Education",
        children: [
          { id: "context-studying-exams", label: "Studying for Exams" },
          { id: "context-online-course", label: "Taking an Online Course" },
          { id: "context-learning-new-tool", label: "Learning a New Tool at Work" },
          { id: "context-onboarding-software", label: "Onboarding into New Software" },
          { id: "context-professional-certification", label: "Professional Certification" },
          { id: "context-self-teaching", label: "Self-Teaching a New Skill" },
        ],
      },
      // ── Emergencies & unexpected events ──
      {
        id: "context-emergencies",
        label: "Emergencies & Unexpected Events",
        children: [
          { id: "context-car-breakdown", label: "Car Breakdown" },
          { id: "context-home-repair-emergency", label: "Home Repair Emergency" },
          { id: "context-natural-disaster", label: "Natural Disaster" },
          { id: "context-dealing-bureaucracy", label: "Dealing with Bureaucracy (Legal / Government)" },
          { id: "context-identity-theft", label: "Identity Theft / Fraud" },
          { id: "context-medical-emergency", label: "Medical Emergency" },
        ],
      },
      // ── Leisure & recreation ──
      {
        id: "context-leisure",
        label: "Leisure & Recreation",
        children: [
          { id: "context-planning-vacation", label: "Planning a Holiday" },
          { id: "context-dining-out", label: "Dining Out" },
          { id: "context-attending-events", label: "Attending Concerts / Events" },
          { id: "context-hosting-party", label: "Hosting a Party / Gathering" },
          { id: "context-weekend-activities", label: "Weekend Activities" },
          { id: "context-outdoor-recreation", label: "Outdoor Recreation & Sports" },
        ],
      },
    ],
  },
  {
    id: "problems",
    title: "Problem",
    items: [
      // ── Friction & usability ──
      {
        id: "problem-friction",
        label: "Friction & Usability",
        children: [
          { id: "problem-too-complex", label: "Too Complex / Hard to Use" },
          { id: "problem-time-consuming", label: "Time-Consuming Processes" },
          { id: "problem-manual-repetitive", label: "Manual & Repetitive Tasks" },
          { id: "problem-poor-ux", label: "Poor User Experience" },
          { id: "problem-inconvenient", label: "Inconvenient / Hard to Access" },
          { id: "problem-steep-learning-curve", label: "Steep Learning Curve" },
        ],
      },
      // ── Information & knowledge ──
      {
        id: "problem-information",
        label: "Information & Knowledge",
        children: [
          { id: "problem-lack-transparency", label: "Lack of Transparency" },
          { id: "problem-information-overload", label: "Information Overload" },
          { id: "problem-hard-to-compare", label: "Hard to Compare Options" },
          { id: "problem-outdated-info", label: "Outdated / Inaccurate Information" },
          { id: "problem-scattered-knowledge", label: "Scattered / Siloed Knowledge" },
          { id: "problem-unclear-guidance", label: "Unclear Guidance / Instructions" },
        ],
      },
      // ── Trust & safety ──
      {
        id: "problem-trust",
        label: "Trust & Safety",
        children: [
          { id: "problem-lack-of-trust", label: "Lack of Trust" },
          { id: "problem-quality-uncertainty", label: "Quality Uncertainty" },
          { id: "problem-hidden-costs", label: "Hidden Costs & Fees" },
          { id: "problem-privacy-concerns", label: "Privacy & Data Concerns" },
          { id: "problem-safety-risks", label: "Safety & Security Risks" },
          { id: "problem-fraud-scams", label: "Fraud & Scams" },
        ],
      },
      // ── Access & affordability ──
      {
        id: "problem-access",
        label: "Access & Affordability",
        children: [
          { id: "problem-high-costs", label: "High Costs / Overpriced" },
          { id: "problem-geographic-limits", label: "Geographic Limitations" },
          { id: "problem-language-barriers", label: "Language Barriers" },
          { id: "problem-digital-divide", label: "Digital Divide / Tech Literacy Gap" },
          { id: "problem-physical-accessibility", label: "Physical Accessibility Barriers" },
          { id: "problem-limited-availability", label: "Limited Availability / Scarcity" },
        ],
      },
      // ── Coordination & alignment ──
      {
        id: "problem-coordination",
        label: "Coordination & Alignment",
        children: [
          { id: "problem-fragmented-tools", label: "Fragmented Tools & Solutions" },
          { id: "problem-communication-gaps", label: "Communication Gaps" },
          { id: "problem-misaligned-incentives", label: "Misaligned Incentives" },
          { id: "problem-lack-standardization", label: "Lack of Standardisation" },
          { id: "problem-handoff-failures", label: "Handoff & Transition Failures" },
          { id: "problem-stakeholder-conflicts", label: "Stakeholder Conflicts" },
        ],
      },
      // ── Performance & reliability ──
      {
        id: "problem-performance",
        label: "Performance & Reliability",
        children: [
          { id: "problem-inefficiency", label: "Inefficiency / Waste" },
          { id: "problem-unreliable", label: "Unreliable / Inconsistent" },
          { id: "problem-slow-processes", label: "Slow Processes & Bottlenecks" },
          { id: "problem-limited-customization", label: "Limited Customisation" },
          { id: "problem-doesnt-scale", label: "Doesn't Scale" },
          { id: "problem-poor-integration", label: "Poor Integration / Compatibility" },
        ],
      },
      // ── Regulatory & compliance ──
      {
        id: "problem-regulatory",
        label: "Regulatory & Compliance",
        children: [
          { id: "problem-regulatory-complexity", label: "Regulatory Complexity" },
          { id: "problem-compliance-burden", label: "Compliance Burden" },
          { id: "problem-changing-regulations", label: "Constantly Changing Rules" },
          { id: "problem-cross-border-issues", label: "Cross-Border / Jurisdictional Issues" },
        ],
      },
      // ── Environmental & social ──
      {
        id: "problem-environmental",
        label: "Environmental & Social",
        children: [
          { id: "problem-environmental-impact", label: "Negative Environmental Impact" },
          { id: "problem-waste-overconsumption", label: "Waste & Overconsumption" },
          { id: "problem-social-inequality", label: "Social Inequality" },
          { id: "problem-ethical-concerns", label: "Ethical Concerns" },
        ],
      },
      // ── Timing & urgency ──
      {
        id: "problem-timing",
        label: "Timing & Urgency",
        children: [
          { id: "problem-inconvenient-timing", label: "Needs Arise at Inconvenient Times" },
          { id: "problem-long-wait-times", label: "Too-Long Wait Times" },
          { id: "problem-tight-windows", label: "Time-Sensitive with Tight Windows" },
          { id: "problem-results-too-late", label: "Results Come Too Late to Be Useful" },
          { id: "problem-poor-scheduling", label: "Poor Scheduling / Availability" },
          { id: "problem-deadline-pressure", label: "Deadline Pressure & Rushing" },
        ],
      },
      // ── Switching & lock-in ──
      {
        id: "problem-switching",
        label: "Switching & Lock-In",
        children: [
          { id: "problem-high-switching-costs", label: "High Switching Costs" },
          { id: "problem-vendor-lock-in", label: "Vendor Lock-In" },
          { id: "problem-data-not-portable", label: "Data Not Portable" },
          { id: "problem-no-migration-path", label: "No Easy Migration Path" },
          { id: "problem-backward-compatibility", label: "Backward Compatibility Issues" },
          { id: "problem-losing-history", label: "Losing History / Progress When Switching" },
        ],
      },
      // ── Discovery & awareness ──
      {
        id: "problem-discovery",
        label: "Discovery & Awareness",
        children: [
          { id: "problem-dont-know-exists", label: "Don't Know a Solution Exists" },
          { id: "problem-hard-to-find", label: "Hard to Find What You Need" },
          { id: "problem-not-knowing-where-to-start", label: "Not Knowing Where to Start" },
          { id: "problem-poor-discoverability", label: "Poor Discoverability" },
          { id: "problem-overwhelming-options", label: "Overwhelming Number of Options" },
          { id: "problem-unaware-of-problem", label: "Unaware the Problem Exists" },
        ],
      },
      // ── Support & service gaps ──
      {
        id: "problem-support",
        label: "Support & Service Gaps",
        children: [
          { id: "problem-poor-customer-support", label: "Poor Customer Support" },
          { id: "problem-no-after-sales-help", label: "No After-Sales Help" },
          { id: "problem-no-community-support", label: "Lack of Peer / Community Support" },
          { id: "problem-cant-reach-human", label: "Can't Reach a Real Person" },
          { id: "problem-long-resolution-times", label: "Long Resolution Times" },
          { id: "problem-no-self-service", label: "No Self-Service Option" },
        ],
      },
      // ── Motivation & behaviour ──
      {
        id: "problem-motivation",
        label: "Motivation & Behaviour",
        children: [
          { id: "problem-hard-to-stay-motivated", label: "Hard to Stay Motivated" },
          { id: "problem-easy-to-procrastinate", label: "Easy to Procrastinate" },
          { id: "problem-requires-too-much-willpower", label: "Requires Too Much Willpower" },
          { id: "problem-choice-overload", label: "Cognitive Overload from Too Many Choices" },
          { id: "problem-bad-defaults", label: "Defaults Work Against You" },
          { id: "problem-habit-formation", label: "Hard to Build / Break Habits" },
        ],
      },
      // ── Emotional & psychological burden ──
      {
        id: "problem-emotional",
        label: "Emotional & Psychological Burden",
        children: [
          { id: "problem-anxiety-inducing", label: "Anxiety-Inducing Processes" },
          { id: "problem-embarrassing", label: "Embarrassing to Deal With" },
          { id: "problem-isolating", label: "Isolating / Lonely Experience" },
          { id: "problem-guilt-inducing", label: "Guilt-Inducing" },
          { id: "problem-causes-avoidance", label: "So Overwhelming It Causes Avoidance" },
          { id: "problem-emotionally-draining", label: "Emotionally Draining" },
        ],
      },
    ],
  },
]
