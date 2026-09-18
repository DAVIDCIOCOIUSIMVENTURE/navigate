/**
 * Builds the example Navigate projects: one importable bundle per example, at
 * bundle format version 3 (see `src/lib/problem-export.ts`).
 *
 *   npm run examples              writes to ./examples
 *   npm run examples -- <dir>     writes somewhere else, such as your Downloads
 *
 * The files are what "Import a project" takes, so they are the quickest way to
 * fill an empty Navigate with something worth looking at: a demo, a screenshot,
 * a teaching session, or a page to test the public preview against.
 *
 * ## Adding an example
 *
 * Push a spec onto `EXAMPLES` at the bottom. Each one carries only what makes
 * it distinctive; `buildBundle` fills in the repetitive shape (the bundle
 * wrapper, empty improvement responses, workspace scaffolding) so every file
 * matches what `buildProjectBundle` actually produces.
 *
 * Three rules worth keeping:
 *
 * 1. **Every dimension id must resolve.** `customers`, `contexts` and
 *    `problems` take built-in slugs from `src/data/dimensionData.ts`, or an id
 *    containing `-user-` that you also list under `customItems`. An id that
 *    matches neither renders as "(deleted item)" in the app. Same for `you`,
 *    which takes `you-user-*` ids listed under `selfDiscovery`.
 * 2. **So must every tool id.** A lens id and its prompt ids come from
 *    `src/data/reflectLenses.ts`, and a research method, its tool and its
 *    prompt ids from `src/data/researchMethods.ts`. Invent one and the app
 *    quietly shows nothing: a lens the hub does not offer sends the journey
 *    rail to the hub instead of the tool, and a capture keyed by prompt ids
 *    the method does not have pre-fills as blank.
 * 3. **Vary the state, not just the subject.** The set is more useful when the
 *    projects are at different points in the journey: one still being explored
 *    with no solutions, one left open as unsure, one correctly ruled out. A
 *    shelf of finished, valid projects teaches less.
 *
 * ## How a tool leaves its mark
 *
 * Match what the app actually writes when a problem is saved, or the example
 * will not behave like a project somebody made. Saving clears the draft, so a
 * finished problem carries the record and the project carries no session:
 *
 * * A guided prompt tool sets `problem.reflection` (`lensId` plus the answers,
 *   keyed by that lens's prompt ids) and leaves `reflect` null.
 * * Research sets `researchCapture` (`methodId`, `toolId`, and answers keyed
 *   by that method's prompt ids) and leaves `research` null.
 * * The Canvas Builder and the Define dialog leave neither; their `source` is
 *   `identify` and `manual`. Only give an example a capture when its `source`
 *   says that tool saved it.
 *
 * The `reflect` and `research` fields are for an example deliberately left
 * mid-draft, and their ids have to resolve just the same.
 *
 * Ids inside a bundle (project, problem, solution, workspace) are ignored on
 * import: everything is created fresh, so they only have to be consistent
 * within the file.
 */
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT_DIR = process.argv[2] ? resolve(process.argv[2]) : join(REPO_ROOT, "examples")
mkdirSync(OUT_DIR, { recursive: true })

const EMPTY_IMPROVEMENTS = {
  coreFunctionality: [], easeOfUse: [], speedConvenience: [], priceValue: [],
  qualityPerception: [], customisation: [], customerSupport: [], trustTransparency: [],
  deliveryFulfilment: [], availabilityAccess: [], emotionalExperience: [],
  socialEthicalValue: [], communication: [], riskReduction: [], postPurchase: [],
}

const DEFAULT_WEIGHTS = { feasibility: 2, impact: 2, cost: 2, timeToImplement: 2 }

const member = (name, email) => ({
  id: `member-${name.split(" ")[0].toLowerCase()}`,
  name,
  email,
})

const job = (id, text, intensity = "") => ({ id, text, intensity })

const existing = (id, text, shortcomings) => ({
  id,
  text,
  shortcomings: shortcomings.map((s, i) => ({ id: id * 10 + i, text: s })),
})

const metric = (value, unit, level = "") => ({ value, unit, level })
const level = (value) => ({ value: null, unit: "", level: value })

/** Turn a compact definition into a full bundle. */
function buildBundle(spec) {
  const now = spec.editedAt
  const hasWorkspace = Boolean(spec.workspace)

  return {
    format: "navigate-problem-bundle",
    version: 3,
    exportedAt: "2026-09-18T09:00:00.000Z",
    project: {
      name: spec.name,
      members: spec.members ?? [],
      visibility: "public",
      reflect: spec.reflect ?? null,
      research: spec.research ?? null,
      canvasDraft: null,
      comparisonWeights: spec.weights ?? DEFAULT_WEIGHTS,
    },
    problem: {
      id: 1,
      createdAt: spec.createdAt,
      editedAt: now,
      title: spec.problem.title,
      description: spec.problem.description,
      customers: spec.problem.customers,
      contexts: spec.problem.contexts,
      problems: spec.problem.problems,
      you: spec.selfDiscovery ? spec.selfDiscovery.map((i) => i.id) : [],
      source: spec.problem.source ?? "identify",
      existingSolutions: spec.problem.existingSolutions ?? [],
      jobsToBeDone: {
        functional: spec.problem.jobs?.functional ?? [],
        emotional: spec.problem.jobs?.emotional ?? [],
        social: spec.problem.jobs?.social ?? [],
      },
      validationAssessment: {
        anchorJob: spec.problem.anchorJob ?? null,
        howManyPeople: spec.problem.market?.people ?? metric(0, ""),
        howOften: spec.problem.market?.often ?? metric(0, ""),
        worthToThem: spec.problem.market?.price ?? metric(0, ""),
        reachableShare: spec.problem.market?.reachable ?? 30,
        obtainableShare: spec.problem.market?.obtainable ?? 10,
        costOfSwitching: spec.problem.competition?.switching ?? level("medium"),
        solutionEffectiveness: spec.problem.competition?.effectiveness ?? level("average"),
        competitorSize: spec.problem.competition?.size ?? level("medium"),
      },
      validationStatus: spec.problem.status,
      contextWhen: spec.problem.contextWhen ?? "",
      segmentSize: spec.problem.segmentSize ?? null,
      customerDescription: spec.problem.customerDescription ?? "",
      reflection: spec.problem.reflection ?? null,
    },
    solutions: (spec.solutions ?? []).map((s, index) => ({
      id: index + 1,
      problemId: 1,
      workspaceId: hasWorkspace ? 1 : null,
      createdAt: spec.createdAt,
      editedAt: now,
      title: s.title,
      description: s.description,
      inspirationSource: s.source ?? "freeform",
      inspirationDetail: s.detail ?? "",
      feasibility: s.scores?.[0] ?? null,
      impact: s.scores?.[1] ?? null,
      cost: s.scores?.[2] ?? null,
      timeToImplement: s.scores?.[3] ?? null,
      validationStatus: s.status ?? "unvalidated",
      trafficLight: s.light ?? null,
      ...(s.analogyDomain ? { analogyDomain: s.analogyDomain, analogyInsight: s.analogyInsight } : {}),
      ...(s.scamperIdeas ? { scamperIdeas: s.scamperIdeas } : {}),
      ...(s.improveIdeas ? { improveIdeas: s.improveIdeas } : {}),
      ...(s.reverseWorseIdeas ? { reverseWorseIdeas: s.reverseWorseIdeas, reverseInversions: s.reverseInversions } : {}),
    })),
    workspace: hasWorkspace
      ? {
          id: 1,
          problemId: 1,
          createdAt: spec.createdAt,
          editedAt: now,
          analysisToolType: spec.workspace.analysisToolType ?? "",
          discoveryToolType: spec.workspace.discoveryToolType ?? "",
          rootCauses: spec.workspace.rootCauses ?? [],
          fiveWhyChains: spec.workspace.fiveWhyChains ?? [],
          affectedGroups: spec.workspace.affectedGroups ?? [],
          rootCauseNotes: spec.workspace.rootCauseNotes ?? "",
          reverseIdeation: [],
          reverseInversion: [],
          analogyDomain: spec.workspace.analogyDomain ?? "",
          analogyInsight: spec.workspace.analogyInsight ?? "",
          improvementResponses: EMPTY_IMPROVEMENTS,
          scamperIdeas: {},
        }
      : null,
    researchCapture: spec.researchCapture ?? null,
    customDimensionItems: {
      customers: spec.customItems?.customers ?? [],
      contexts: spec.customItems?.contexts ?? [],
      problems: spec.customItems?.problems ?? [],
    },
    selfDiscoveryItems: spec.selfDiscovery ?? [],
  }
}

/* ================================================================== */
/*  The examples                                                       */
/* ================================================================== */

const EXAMPLES = []

/* --- 1. Shared physical infrastructure: wet cycle commutes -------- */
EXAMPLES.push({
  file: "rainy-commutes",
  name: "Rainy commutes",
  createdAt: "2026-09-01T09:00:00.000Z",
  editedAt: "2026-09-17T16:30:00.000Z",
  members: [
    member("Jane Okonkwo", "jane.okonkwo@example.com"),
    member("Tom Reilly", "tom.reilly@example.com"),
  ],
  weights: { feasibility: 2, impact: 3, cost: 2, timeToImplement: 1 },
  selfDiscovery: [
    {
      id: "you-user-cyclist1",
      title: "I have cycled to work for six years and have solved this badly every winter",
      questionUrl: "personal-interests/what-do-you-enjoy",
    },
  ],
  customItems: {
    customers: [
      { id: "customer-user-bikecomm", label: "Year-round bike commuters", createdAt: "2026-09-01T09:05:00.000Z" },
    ],
  },
  problem: {
    source: "reflect",
    reflection: {
      lensId: "own-problems",
      capturedAt: "2026-09-01T09:20:00.000Z",
      prompts: [
        { promptId: "own-anchor", answers: ["Cycling to work year round for the last six years"] },
        {
          promptId: "problems-hit",
          answers: [
            "I arrive soaked two or three mornings a week from October and there is nowhere to hang any of it",
            "Whatever I rode in is still damp at five, so the ride home is worse than the ride in",
          ],
        },
        {
          promptId: "what-you-did",
          answers: [
            "Hung the jacket over the back of my chair and hoped, which never dried it and annoyed everyone near me",
            "Kept a spare set of clothes in a drawer, which does nothing for the kit I actually cycled in",
            "Started reading the forecast the night before and taking the bus on anything doubtful",
          ],
        },
        {
          promptId: "customer",
          answers: ["Year-round bike commuters", "Anyone cycling into a city-centre office"],
        },
      ],
    },
    title: "Cyclists arrive at work soaked and have nowhere to dry off",
    description:
      "People who cycle to work in a British city get rained on two or three mornings a week between October and March. Offices rarely have anywhere to hang wet kit, so cyclists either sit in damp clothes all morning or give up cycling on any day the forecast looks doubtful. The bike is not the problem; the forty minutes after the ride are.",
    customers: ["customer-young-professionals", "customer-eco-conscious", "customer-user-bikecomm"],
    contexts: ["context-commuting", "context-morning-routine", "context-urban-areas"],
    problems: ["problem-inconvenient", "problem-poor-ux"],
    customerDescription:
      "Commuters who cycle three or more days a week into a city-centre office, mostly twenty-five to forty-five, who own decent kit and would keep cycling year round if arriving were not the hard part.",
    contextWhen:
      "On any weekday morning between October and March when it rains before nine, and again at five if the kit has not dried.",
    segmentSize: 120000,
    existingSolutions: [
      existing(1, "Waterproof jackets and overtrousers", [
        "You stay dry on the outside and sweat through on the inside",
        "There is still nowhere to put the wet kit once you arrive",
        "Good ones cost well over a hundred pounds",
      ]),
      existing(2, "Keeping a spare set of clothes at the office", [
        "Needs a locker, which most offices do not have",
        "Does nothing for the kit you cycled in",
      ]),
      existing(3, "Checking the forecast and taking the bus instead", [
        "The bike then sits at home on exactly the days you needed the exercise",
        "Forecasts are wrong often enough that people stop trusting them",
      ]),
    ],
    jobs: {
      functional: [
        job(1, "Arrive at my desk in dry clothes"),
        job(2, "Have the kit dry again before the ride home"),
        job(3, "Keep cycling on days the forecast looks doubtful"),
      ],
      emotional: [
        job(1, "Stop dreading the morning forecast", "strong"),
        job(2, "Feel like cycling in is a sensible choice rather than a gamble", "mild"),
      ],
      social: [job(1, "Not be the person dripping through the open-plan office", "unbearable")],
    },
    anchorJob: { kind: "social", id: 1 },
    market: {
      people: metric(120000, "cyclists"),
      often: metric(90, "per year"),
      price: metric(4, "GBP"),
      reachable: 25,
      obtainable: 8,
    },
    competition: { switching: level("low"), effectiveness: level("poor"), size: level("small") },
    status: "valid",
  },
  workspace: {
    analysisToolType: "five-whys",
    discoveryToolType: "analogy",
    rootCauses: [
      { id: 1, description: "Offices are designed for people who arrive dry" },
      { id: 2, description: "Drying is treated as each cyclist's own problem rather than shared infrastructure" },
    ],
    fiveWhyChains: [
      {
        id: 1,
        whys: [
          "Cyclists sit in damp clothes all morning",
          "Because there is nowhere to hang wet kit",
          "Because offices have no drying space",
          "Because nobody planned for people arriving wet",
          "Because the building was designed around people who drive or take the bus",
        ],
      },
    ],
    affectedGroups: [
      { id: 1, name: "Daily commuting cyclists", severity: "high", description: "Feel it two or three mornings a week for five months of the year." },
      { id: 2, name: "Would-be cyclists", severity: "medium", description: "Never start, because the arrival problem is obvious before the first ride." },
      { id: 3, name: "Building managers", severity: "low", description: "Field the complaints but have no budget line for drying space." },
    ],
    rootCauseNotes:
      "Every existing answer asks the individual to carry the solution with them. The thing that is actually missing is shared, sitting where the bikes already are.",
    analogyDomain: "Ski resorts",
    analogyInsight: "Shared drying rooms are ordinary there and unheard of here.",
  },
  solutions: [
    {
      title: "Heated drying lockers at secure cycle parks",
      description:
        "A bank of ventilated, gently heated lockers at existing secure cycle parking, rented by the month. You hang wet kit on arrival, it dries through the day, and you collect it before the ride home. The lockers sit where the bikes already are, so nobody has to carry wet kit into an office that has no room for it.",
      source: "analogy",
      detail:
        "Borrowed from the drying rooms every ski resort puts at the bottom of the lift. Nobody expects to dry their own kit on holiday, so why do we expect it on a Tuesday?",
      analogyDomain: "Ski resorts",
      analogyInsight: "Shared drying infrastructure beats asking every individual to solve drying on their own.",
      scores: [3, 4, 4, 3],
      status: "valid",
      light: "green",
    },
    {
      title: "A pannier that doubles as a drying bag",
      description:
        "A rigid pannier with a vented liner and a small USB fan, so wet kit dries inside the bag under the desk rather than on the back of a chair. Sold once rather than rented, and it works in any office without asking the building for anything.",
      source: "scamper",
      detail: "Combine: the bag you already carry and the drying you cannot do.",
      scamperIdeas: { combine: "Pannier plus dryer", adapt: "Borrow the vented liner from a laundry bag" },
      scores: [4, 3, 2, 2],
      status: "unsure",
      light: "amber",
    },
    {
      title: "A jacket that wrings itself out",
      description:
        "A cycling jacket with a spin mechanism built into the lining, so you shake it out on arrival and it comes away dry.",
      source: "reverse",
      detail:
        "Came out of asking how to make the problem worse, then inverting it. It survived the ideation and did not survive the scoring.",
      reverseWorseIdeas: ["Make the jacket hold as much water as possible"],
      reverseInversions: ["Make the jacket shed water on demand"],
      scores: [1, 2, 5, 5],
      status: "invalid",
      light: "red",
    },
  ],
})

/* --- 2. Non-profit / circular economy: school uniform ------------- */
EXAMPLES.push({
  file: "school-uniform-swap",
  name: "Outgrown school uniform",
  createdAt: "2026-04-12T09:00:00.000Z",
  editedAt: "2026-09-02T14:20:00.000Z",
  members: [
    member("Priya Sharma", "priya.sharma@example.com"),
    member("Denise Clarke", "denise.clarke@example.com"),
    member("Marcus Bell", "marcus.bell@example.com"),
  ],
  weights: { feasibility: 3, impact: 3, cost: 3, timeToImplement: 1 },
  selfDiscovery: [
    {
      id: "you-user-uniform1",
      title: "I ran the PTA second-hand stall for three years and watched it work",
      questionUrl: "work-experience/what-have-you-organised",
    },
    {
      id: "you-user-uniform2",
      title: "I care about waste more than almost anything else",
      questionUrl: "social-impact/what-change-matters-to-you",
    },
  ],
  customItems: {
    customers: [
      { id: "customer-user-primaryfam", label: "Primary school families on tight budgets", createdAt: "2026-04-12T09:05:00.000Z" },
    ],
  },
  problem: {
    source: "reflect",
    reflection: {
      lensId: "own-problems",
      capturedAt: "2026-04-12T09:30:00.000Z",
      prompts: [
        { promptId: "own-anchor", answers: ["Running the PTA second-hand uniform stall for three years"] },
        {
          promptId: "problems-hit",
          answers: [
            "Two bin bags of perfectly good jumpers in my loft and a sixty pound bill in August, both in the same fortnight",
            "The stall only ran twice a year, which is never when a child actually outgrows something",
            "Families who needed it most were the least likely to come and pick through a table in public",
          ],
        },
        {
          promptId: "what-you-did",
          answers: [
            "Stored the bags in my own garage between fairs because nobody else had room",
            "Started a class WhatsApp group for swaps, which worked for one year group and died when I left",
          ],
        },
        {
          promptId: "customer",
          answers: ["Primary school families on tight budgets", "Parents of children at state primary schools"],
        },
      ],
    },
    title: "School uniform is outgrown long before it is worn out",
    description:
      "A primary school jumper lasts three or four years of wear but fits for about one. Families buy new every September, often branded and only available from one supplier, and the outgrown set goes to landfill or sits in a loft. The families who feel it hardest are the ones who can least afford to buy twice, and the second-hand options that exist depend entirely on one volunteer with a garage.",
    customers: ["customer-parents-school-age", "customer-budget-conscious", "customer-user-primaryfam"],
    contexts: ["context-school-dropoff-pickup", "context-dealing-with-schools", "context-shopping-errands"],
    problems: ["problem-high-costs", "problem-waste-overconsumption", "problem-limited-availability"],
    customerDescription:
      "Parents and carers of children at state primary schools, most with two or more children, who buy a full uniform set every year and replace items mid-year as children grow.",
    contextWhen:
      "In the last two weeks of August, and again whenever a growth spurt makes a jumper too small in the middle of a term.",
    segmentSize: 4600000,
    existingSolutions: [
      existing(1, "The PTA second-hand stall at the summer fair", [
        "Runs twice a year, which is nothing like when families actually need it",
        "Depends on one volunteer storing bags in their garage",
        "Stock is whatever happened to be donated, in whatever sizes",
      ]),
      existing(2, "Buying new from the school's single approved supplier", [
        "A full set runs to well over sixty pounds per child",
        "Branded items cannot be bought anywhere cheaper",
        "Nothing comes back when the child grows out of it",
      ]),
      existing(3, "Passing things down between friends", [
        "Only works if you happen to know a family one year ahead with the same size child",
        "Nobody wants to ask, so most do not",
      ]),
    ],
    jobs: {
      functional: [
        job(1, "Get a uniform that fits before the first day of term"),
        job(2, "Spend less than sixty pounds a child in September"),
        job(3, "Get the outgrown set out of the house and to somebody who needs it"),
      ],
      emotional: [
        job(1, "Stop feeling wasteful about throwing away clothes that are perfectly good", "strong"),
        job(2, "Not have to worry about the September bill landing with everything else", "strong"),
      ],
      social: [job(1, "Have my child look the same as everyone else on the first day", "unbearable")],
    },
    anchorJob: { kind: "social", id: 1 },
    market: {
      people: metric(4600000, "families"),
      often: metric(1, "per year"),
      price: metric(18, "GBP"),
      reachable: 12,
      obtainable: 15,
    },
    competition: { switching: level("low"), effectiveness: level("poor"), size: level("small") },
    status: "valid",
  },
  workspace: {
    analysisToolType: "root-causes",
    discoveryToolType: "analogy",
    rootCauses: [
      { id: 1, description: "Uniform is sized for a body that changes faster than the cloth wears" },
      { id: 2, description: "Exclusive supplier deals remove the second-hand market for branded items" },
      { id: 3, description: "Reuse depends on volunteers rather than on anything the school runs" },
    ],
    affectedGroups: [
      { id: 1, name: "Families with two or more primary-age children", severity: "high", description: "Pay the September bill more than once and feel every increase." },
      { id: 2, name: "PTA volunteers", severity: "medium", description: "Carry the entire reuse system personally, and burn out." },
      { id: 3, name: "Schools", severity: "low", description: "Field the complaints about cost but have no mechanism to answer them." },
    ],
    rootCauseNotes:
      "Every existing answer treats reuse as a favour somebody does. Nothing treats it as a service the school could simply have.",
    analogyDomain: "Libraries",
    analogyInsight: "Nobody thinks it is odd to borrow a book and bring it back. The same idea applied to jumpers removes the awkwardness of asking.",
  },
  solutions: [
    {
      title: "A uniform library run by the school",
      description:
        "A rail in the school entrance holding clean, sorted, sized uniform. Families take what fits and bring back what does not, with no sign-up and no questions. The school runs it as part of the office rota rather than leaning on one volunteer, so it is open every day rather than twice a year.",
      source: "analogy",
      detail: "Taken from how a library works: borrow, return, no transaction, no awkwardness.",
      analogyDomain: "Libraries",
      analogyInsight: "Borrowing and returning removes the stigma that asking for hand-me-downs carries.",
      scores: [4, 5, 2, 2],
      status: "valid",
      light: "green",
    },
    {
      title: "A swap app for the school gate",
      description:
        "A phone app where parents list outgrown items by school and size, and get notified when their child's next size appears. Matching happens between families and the school is not involved at all.",
      source: "scamper",
      detail: "Substitute: replace the physical stall with a listing, so it runs all year.",
      scamperIdeas: { substitute: "A listing instead of a stall", eliminate: "Remove the need for storage space" },
      scores: [3, 3, 3, 3],
      status: "unsure",
      light: "amber",
    },
  ],
})

/* --- 3. Community / food waste, mid-journey, no solutions yet ----- */
EXAMPLES.push({
  file: "allotment-glut",
  name: "The August allotment glut",
  createdAt: "2026-08-20T08:00:00.000Z",
  editedAt: "2026-09-14T18:45:00.000Z",
  members: [member("Aisha Rahman", "aisha.rahman@example.com")],
  selfDiscovery: [
    {
      id: "you-user-allot1",
      title: "I have had an allotment for eleven years and give away half of what I grow",
      questionUrl: "personal-interests/what-do-you-enjoy",
    },
  ],
  problem: {
    source: "research",
    title: "Allotment holders grow far more than they can eat, and most of the surplus rots",
    description:
      "For six weeks every August a single allotment plot produces more courgettes, beans and tomatoes than one household can possibly get through. Growers give what they can to neighbours, then watch the rest go soft on the plot. Meanwhile the food bank two streets away is buying tinned vegetables. Nobody has a way of connecting the glut to the need in the few days the food is good for.",
    customers: ["customer-hobbyists", "customer-retirees", "customer-community-orgs"],
    contexts: ["context-outdoors-nature", "context-volunteering", "context-community-events"],
    problems: ["problem-waste-overconsumption", "problem-coordination", "problem-tight-windows"],
    customerDescription:
      "People with an allotment plot or a productive garden, skewing older and retired, who grow far more than they eat and hate throwing it away.",
    contextWhen:
      "Late July through September, when everything ripens at once and a glut lasts days rather than weeks.",
    segmentSize: 330000,
    existingSolutions: [
      existing(1, "Leaving a box of surplus at the allotment gate", [
        "Only reaches other allotment holders, who have exactly the same glut",
        "Whatever is left goes off in the box",
      ]),
      existing(2, "Dropping surplus at the food bank", [
        "Most will only take tinned and packaged food, not fresh",
        "Opening hours rarely match when somebody has just picked a crate of beans",
      ]),
      existing(3, "Freezing or preserving it", [
        "Takes an evening per batch and a freezer most people do not have space in",
        "Does not help anyone else",
      ]),
    ],
    jobs: {
      functional: [
        job(1, "Get a crate of ripe veg to somebody who will eat it within two days"),
        job(2, "Avoid a trip across town for a box of courgettes"),
      ],
      emotional: [job(1, "Stop feeling guilty about the waste at the end of every August", "strong")],
      social: [job(1, "Be the neighbour who feeds people rather than the one with a compost heap of tomatoes", "mild")],
    },
    anchorJob: { kind: "emotional", id: 1 },
    // Deliberately unsized: this project has not reached the market step yet.
    market: { people: metric(0, ""), often: metric(0, ""), price: metric(0, "") },
    status: "in_progress",
  },
  workspace: {
    analysisToolType: "five-whys",
    fiveWhyChains: [
      {
        id: 1,
        whys: [
          "Surplus vegetables rot on the plot",
          "Because the grower cannot find anyone to take them in time",
          "Because the people who would want them do not know the surplus exists",
          "Because there is no route between a plot and a kitchen that needs food",
          "Because giving food away has been left to chance and neighbourliness",
        ],
      },
    ],
    affectedGroups: [
      { id: 1, name: "Allotment holders", severity: "medium", description: "Feel the waste personally every year." },
      { id: 2, name: "Food banks and community kitchens", severity: "high", description: "Buy in vegetables while fresh ones rot nearby." },
    ],
    rootCauseNotes:
      "The food, the need and the willingness all exist within a mile of each other. The only thing missing is knowing, on the day.",
  },
  researchCapture: {
    methodId: "abandoned-products",
    toolId: "product-hunt-discontinued",
    capturedAt: "2026-09-06T11:00:00.000Z",
    prompts: [
      {
        promptId: "product-name",
        answers: ["Harvest Share, a local surplus-produce noticeboard, listed as no longer maintained in 2018"],
      },
      {
        promptId: "what-it-did",
        answers: [
          "A map and a noticeboard where growers posted what they had spare that week and anyone nearby could claim it. Used mostly by allotment associations and a few community kitchens, in the low thousands.",
        ],
      },
      {
        promptId: "why-abandoned",
        answers: [
          "Founder burnout, by the look of the last few posts. One person was moderating listings by hand, and the whole thing was seasonal, so it went quiet for eight months of the year and never built a habit.",
        ],
      },
      {
        promptId: "unmet-need",
        answers: [
          "Growers with more ripe produce than they can eat cannot find anyone to take it in the two or three days it stays good",
          "Community kitchens buy in vegetables while fresh ones rot a street away, because nobody tells them the surplus exists",
        ],
      },
      {
        promptId: "what-changed",
        answers: [
          "Every allotment site now has a WhatsApp group, so the listing no longer has to be the thing that carries the audience",
          "Food banks and community kitchens have far more coordination between them than they did in 2018",
        ],
      },
      {
        promptId: "audience",
        answers: ["Allotment holders", "Community kitchens and food banks"],
      },
    ],
  },
  solutions: [],
})

/* --- 4. B2B service: quoting for small builders ------------------- */
EXAMPLES.push({
  file: "builders-quoting",
  name: "Quoting for small builders",
  createdAt: "2026-02-03T10:00:00.000Z",
  editedAt: "2026-08-28T17:00:00.000Z",
  members: [
    member("Sean Docherty", "sean.docherty@example.com"),
    member("Nina Patel", "nina.patel@example.com"),
  ],
  weights: { feasibility: 2, impact: 3, cost: 1, timeToImplement: 3 },
  customItems: {
    customers: [
      { id: "customer-user-solobuild", label: "One-to-five person building firms", createdAt: "2026-02-03T10:10:00.000Z" },
    ],
    problems: [
      { id: "problem-user-quoteeve", label: "Work that only happens after hours", createdAt: "2026-02-03T10:12:00.000Z" },
    ],
  },
  selfDiscovery: [
    {
      id: "you-user-builder1",
      title: "I spent nine years as a site manager and wrote quotes every Sunday night",
      questionUrl: "work-experience/what-have-you-done",
    },
  ],
  problem: {
    title: "Small builders write quotes at nine at night and lose money on the ones they win",
    description:
      "A two-person building firm quotes for maybe fifteen jobs to win four. Each quote takes two hours of measuring, pricing and typing, all of it unpaid and almost all of it after the working day has finished. The prices come from memory and last year's invoices, so the margin on the jobs they win is a guess. The firms that price carefully are too slow to respond and lose the work to whoever answered first.",
    customers: ["customer-trades-contractors", "customer-solopreneurs", "customer-user-solobuild"],
    contexts: ["context-evening-winding-down", "context-managing-projects", "context-presenting-pitching"],
    problems: ["problem-time-consuming", "problem-manual-repetitive", "problem-user-quoteeve"],
    customerDescription:
      "Building firms of one to five people doing domestic extensions, loft conversions and renovations, turning over between eighty thousand and half a million a year, where the owner is on the tools all day and does the office work at night.",
    contextWhen:
      "Every evening and most Sunday afternoons, and urgently in the two days after a site visit while the customer is still deciding.",
    segmentSize: 180000,
    existingSolutions: [
      existing(1, "A spreadsheet built up over years", [
        "Prices go stale and nobody notices until a job loses money",
        "Only the owner understands it, so nobody else can quote",
        "Still takes two hours per quote",
      ]),
      existing(2, "Estimating software aimed at larger contractors", [
        "Priced per seat at a level that only makes sense above twenty staff",
        "Takes a fortnight to set up before it produces a single quote",
        "Assumes an office and a quantity surveyor, neither of which exist here",
      ]),
      existing(3, "Quoting from memory on the spot", [
        "Fast, and wrong often enough to wipe out the margin on a whole job",
        "No record of how the number was reached when the customer queries it",
      ]),
    ],
    jobs: {
      functional: [
        job(1, "Get a priced quote to the customer within forty-eight hours of the site visit"),
        job(2, "Know the margin on a job before agreeing to it"),
        job(3, "Get the evening back"),
      ],
      emotional: [
        job(1, "Stop dreading Sunday night", "strong"),
        job(2, "Feel confident the number is right rather than hoping it is", "unbearable"),
      ],
      social: [job(1, "Look professional next to the bigger firm quoting for the same job", "strong")],
    },
    anchorJob: { kind: "emotional", id: 2 },
    market: {
      people: metric(180000, "firms"),
      often: metric(15, "per year"),
      price: metric(35, "GBP"),
      reachable: 20,
      obtainable: 6,
    },
    competition: { switching: level("medium"), effectiveness: level("poor"), size: level("large") },
    status: "valid",
  },
  workspace: {
    analysisToolType: "affected-groups",
    discoveryToolType: "improve",
    rootCauses: [
      { id: 1, description: "Quoting is unpaid work, so it gets done in unpaid hours" },
      { id: 2, description: "The tools that price properly are built for firms twenty times the size" },
      { id: 3, description: "Speed and accuracy pull in opposite directions, and speed usually wins the job" },
    ],
    affectedGroups: [
      { id: 1, name: "The owner", severity: "critical", description: "Does every quote personally, after a full day on site." },
      { id: 2, name: "The owner's family", severity: "high", description: "Loses the evenings and most of Sunday." },
      { id: 3, name: "Customers", severity: "medium", description: "Wait days for a number and cannot compare quotes that are structured differently." },
    ],
    rootCauseNotes:
      "The firms that price well are slow, and the firms that are fast price badly. Nothing lets a small firm be both.",
  },
  solutions: [
    {
      title: "Quote from the site visit on a phone",
      description:
        "Measure rooms with the phone camera on site, pick the job type, and the app prices it from a materials feed and the firm's own labour rates. The customer gets a proper quote before the builder has left the drive. The pricing is the firm's own, built up from the jobs it has already done, so it gets more accurate rather than staler.",
      source: "improve",
      detail: "Took the spreadsheet everyone already has and asked what would make it worth opening on site.",
      improveIdeas: { speedConvenience: "Quote before leaving the drive", qualityPerception: "Prices that update themselves" },
      scores: [3, 5, 3, 4],
      status: "valid",
      light: "green",
    },
    {
      title: "A shared price book for the trade",
      description:
        "A subscription price book of regional labour and materials rates, updated monthly from what member firms actually paid. It does not produce the quote, it just stops the prices going stale.",
      source: "scamper",
      detail: "Combine: pool what every firm already knows separately.",
      scamperIdeas: { combine: "Pool pricing across firms" },
      scores: [4, 3, 2, 2],
      status: "unsure",
      light: "amber",
    },
    {
      title: "A quoting service staffed by ex-estimators",
      description:
        "Send photos and measurements to a human estimator who returns a finished quote within a day, charged per quote.",
      source: "freeform",
      detail: "",
      scores: [4, 4, 5, 3],
      status: "invalid",
      light: "red",
    },
  ],
})

/* --- 5. Charity / rural loneliness, unsure verdict ---------------- */
EXAMPLES.push({
  file: "village-connection",
  name: "Winter in the village",
  createdAt: "2026-05-30T09:30:00.000Z",
  editedAt: "2026-09-10T11:15:00.000Z",
  members: [
    member("Eleanor Whitfield", "eleanor.whitfield@example.com"),
    member("Gareth Pryce", "gareth.pryce@example.com"),
    member("Sofia Almeida", "sofia.almeida@example.com"),
    member("Ruth Kaminski", "ruth.kaminski@example.com"),
  ],
  weights: { feasibility: 3, impact: 3, cost: 2, timeToImplement: 2 },
  selfDiscovery: [
    {
      id: "you-user-village1",
      title: "I grew up in a village of four hundred people and watched my grandmother stop leaving the house",
      questionUrl: "personal-interests/what-shaped-you",
    },
    {
      id: "you-user-village2",
      title: "I have run a community transport scheme and know what volunteers will and will not do",
      questionUrl: "work-experience/what-have-you-organised",
    },
  ],
  problem: {
    source: "reflect",
    reflection: {
      lensId: "life",
      capturedAt: "2026-05-30T10:00:00.000Z",
      prompts: [
        {
          promptId: "significant-experience",
          answers: ["Growing up in a village of four hundred people and watching my grandmother stop leaving the house"],
        },
        {
          promptId: "harder-than-needed",
          answers: [
            "Once she gave up the car there was nothing she could get to on her own, and everything on offer was four miles away",
            "The clubs all met in the daytime in the next town, which is exactly the journey she could no longer make",
            "Winter made it much worse, because it is dark from half past three and there is no lit pavement",
          ],
        },
        {
          promptId: "wish-told",
          answers: [
            "That giving up driving is the moment the isolation starts, not the moment her health changed",
            "That she would never once ring anybody and ask to be collected",
          ],
        },
        {
          promptId: "wasted-spend",
          answers: ["A tablet bought so she could video call, which stayed in its box"],
        },
        {
          promptId: "personal-workaround",
          answers: ["A rota between four of us to ring on fixed evenings, which held for a while and then slipped"],
        },
        {
          promptId: "customer",
          answers: ["Older people living alone in small villages", "The family and neighbours who quietly keep an eye out"],
        },
      ],
    },
    title: "Older people in rural villages go whole weeks in winter without speaking to anyone",
    description:
      "In a village with no shop, one bus a day and no pavement lighting, an eighty-year-old who has stopped driving is effectively housebound from November to March. The clubs that exist meet in the daytime in the next town, which is exactly the journey that is no longer possible. The isolation is not caused by there being nothing on. It is caused by the four miles between the person and the thing that is on.",
    customers: ["customer-retirees", "customer-caregivers", "customer-community-orgs"],
    contexts: ["context-rural-areas", "context-evening-winding-down", "context-community-events"],
    problems: ["problem-isolating", "problem-geographic-limits", "problem-limited-availability"],
    customerDescription:
      "People over seventy-five living alone in villages under a thousand people, who have given up driving in the last five years and have family more than an hour away.",
    contextWhen:
      "November to March, and most acutely in the four hours after dark, which in December starts at half past three.",
    segmentSize: 210000,
    existingSolutions: [
      existing(1, "The lunch club in the next town", [
        "Requires the journey that is precisely the thing that stopped being possible",
        "Runs on Tuesdays, so it does nothing for the other six days",
      ]),
      existing(2, "A weekly phone call from a befriending charity", [
        "Fifteen minutes a week against a hundred and twelve waking hours",
        "Waiting lists run to months in rural counties",
      ]),
      existing(3, "Family visiting at weekends", [
        "Depends entirely on having family nearby, which is the thing that has changed",
        "Weekends only, and not every weekend",
      ]),
      existing(4, "Community transport minibuses", [
        "Booked days ahead, so it cannot answer a bad afternoon",
        "Depends on volunteer drivers who are themselves mostly over seventy",
      ]),
    ],
    jobs: {
      functional: [
        job(1, "Get out of the house at least twice a week between November and March"),
        job(2, "Get to the thing without driving and without asking a favour"),
      ],
      emotional: [
        job(1, "Have something to look forward to in the week", "unbearable"),
        job(2, "Stop feeling like a burden on the people who would give me a lift", "strong"),
      ],
      social: [job(1, "Still be part of the village rather than somebody it happens around", "strong")],
    },
    anchorJob: { kind: "emotional", id: 1 },
    market: {
      people: metric(210000, "people"),
      often: metric(20, "per year"),
      price: metric(6, "GBP"),
      reachable: 8,
      obtainable: 10,
    },
    competition: { switching: level("low"), effectiveness: level("poor"), size: level("small") },
    // The evidence pointed both ways: the need is obvious, the willingness to
    // pay is not, and that is exactly why this one is left open.
    status: "unsure",
  },
  workspace: {
    analysisToolType: "affected-groups",
    affectedGroups: [
      { id: 1, name: "Housebound villagers over seventy-five", severity: "critical", description: "Feel it every day for five months of the year." },
      { id: 2, name: "Adult children living far away", severity: "high", description: "Carry constant low-level worry and can do very little from two hours away." },
      { id: 3, name: "Village volunteers", severity: "medium", description: "Willing, ageing, and already stretched across four other schemes." },
      { id: 4, name: "GP surgeries", severity: "medium", description: "See the consequences as appointments that are really about loneliness." },
    ],
    rootCauseNotes:
      "Every answer we found moves the person to the activity. Nobody has tried moving the activity to the person, because the village hall is cold and nobody wants to book it for four people.",
  },
  solutions: [
    {
      title: "A warm room, open every afternoon",
      description:
        "One heated room in the village hall, open from noon to six every weekday from November to March, with a kettle and nothing programmed. No booking, no activity, no sign-up. The cost is heating one room rather than running an event, and the point is that it is always open, so nobody has to plan to go.",
      source: "reverse",
      detail:
        "Came from asking how to make isolation worse: put everything on in the next town, at a fixed time, with a booking form. Inverting each of those gave the answer.",
      reverseWorseIdeas: ["Hold everything four miles away", "Make people book a week ahead", "Run it once a week at a fixed time"],
      reverseInversions: ["Hold it in the village", "No booking at all", "Open every day"],
      scores: [4, 4, 2, 2],
      status: "unsure",
      light: "amber",
    },
    {
      title: "A driver who is going anyway",
      description:
        "A list of villagers who drive into town on known days, matched with people who need a lift, run through the parish newsletter rather than an app. No fares, no insurance complications, no scheduling: only journeys that were already happening.",
      source: "scamper",
      detail: "Adapt: use the journeys that already exist rather than creating new ones.",
      scamperIdeas: { adapt: "Use journeys already happening", eliminate: "No booking system, no fares" },
      scores: [3, 3, 1, 2],
      status: "unsure",
      light: "amber",
    },
  ],
})

/* --- 6. Consumer physical product, ruled out --------------------- */
EXAMPLES.push({
  file: "cooking-for-one",
  name: "Cooking for one",
  createdAt: "2026-06-14T19:00:00.000Z",
  editedAt: "2026-07-30T20:30:00.000Z",
  members: [member("Callum Frazer", "callum.frazer@example.com")],
  selfDiscovery: [
    {
      id: "you-user-cook1",
      title: "I have lived alone for six years and have thrown away a lot of half-used vegetables",
      questionUrl: "personal-interests/what-frustrates-you",
    },
  ],
  problem: {
    source: "identify",
    title: "People living alone buy ingredients in twos and fours and throw half of it away",
    description:
      "Supermarket packaging is built for a household of four. Somebody cooking for one buys a bag of six peppers, uses one, and bins four. The recipes are written for four as well, so cooking properly means eating the same thing for three days. The waste is obvious and irritating, and it turns out most people have already made peace with it.",
    customers: ["customer-young-professionals", "customer-retirees", "customer-budget-conscious"],
    contexts: ["context-cooking-meals", "context-shopping-errands", "context-evening-winding-down"],
    problems: ["problem-waste-overconsumption", "problem-limited-customization", "problem-high-costs"],
    customerDescription:
      "Single-person households, weighted towards under-thirties in flatshares and over-sixties living alone, who cook from scratch at least three times a week.",
    contextWhen: "Every weekday evening, and at the point of the weekly shop.",
    segmentSize: 8300000,
    existingSolutions: [
      existing(1, "Cooking for four and eating leftovers", [
        "Works, and is what almost everybody already does",
        "Gets boring by the third night but not badly enough to change anything",
      ]),
      existing(2, "Freezing the surplus", [
        "Also works, also what people already do",
        "Needs freezer space and a bit of organisation",
      ]),
      existing(3, "Recipe box subscriptions", [
        "Portioned correctly, and priced at roughly twice the supermarket",
        "Solves the portioning by removing the choice",
      ]),
    ],
    jobs: {
      functional: [
        job(1, "Cook one good meal without buying four portions of everything"),
        job(2, "Waste less food"),
      ],
      emotional: [job(1, "Stop feeling wasteful every time the vegetable drawer gets cleared out", "mild")],
      social: [],
    },
    anchorJob: { kind: "emotional", id: 1 },
    market: {
      people: metric(8300000, "households"),
      often: metric(150, "per year"),
      price: metric(1, "GBP"),
      reachable: 5,
      obtainable: 3,
    },
    competition: { switching: level("high"), effectiveness: level("good"), size: level("giant") },
    // Ruled out, and worth keeping as an example of a problem correctly
    // abandoned: real, widely felt, and already solved well enough.
    status: "invalid",
  },
  workspace: {
    analysisToolType: "five-whys",
    fiveWhyChains: [
      {
        id: 1,
        whys: [
          "Single people throw away food they bought",
          "Because it is sold in quantities for four",
          "Because packaging and pricing are built around the family shop",
          "Because that is where the volume is",
          "Because single households, though numerous, buy less per trip and are worth less to the retailer",
        ],
      },
    ],
    rootCauseNotes:
      "The interviews killed this one. Everybody recognised the problem instantly and nobody had ever done anything about it, which turned out to mean leftovers and the freezer are a perfectly good answer. The pain is real and about two pounds a week wide.",
  },
  solutions: [
    {
      title: "Single-portion produce packs",
      description:
        "Loose produce sold in genuine single portions: one pepper, eighty grams of mince, a third of a cabbage, priced per portion rather than per kilo.",
      source: "freeform",
      detail: "The obvious answer, which is also the one the supermarkets have already tried and mostly withdrawn.",
      scores: [2, 2, 4, 4],
      status: "invalid",
      light: "red",
    },
  ],
})

/* --- 7. Healthcare service --------------------------------------- */
EXAMPLES.push({
  file: "repeat-prescriptions",
  name: "Repeat prescriptions",
  createdAt: "2026-01-20T08:45:00.000Z",
  editedAt: "2026-09-05T13:00:00.000Z",
  members: [
    member("Grace Adeyemi", "grace.adeyemi@example.com"),
    member("Tomasz Nowak", "tomasz.nowak@example.com"),
  ],
  weights: { feasibility: 3, impact: 3, cost: 1, timeToImplement: 2 },
  customItems: {
    contexts: [
      { id: "context-user-runningout", label: "The week the tablets run out", createdAt: "2026-01-20T08:50:00.000Z" },
    ],
  },
  selfDiscovery: [
    {
      id: "you-user-pharm1",
      title: "I worked in a community pharmacy for four years and answered this phone call every single day",
      questionUrl: "work-experience/what-have-you-done",
    },
  ],
  problem: {
    title: "Getting a repeat prescription takes four phone calls and two trips, every single month",
    description:
      "Somebody managing three long-term conditions orders their repeat from the surgery, waits two working days, then rings the pharmacy to find out whether it arrived, then goes in to be told one item is out of stock and the others are not ready. It takes about a week of low-level chasing every month, and the people doing the chasing are the people least able to do it: older, often unwell, often without transport.",
    customers: ["customer-retirees", "customer-caregivers", "customer-healthcare"],
    contexts: ["context-chronic-condition", "context-doctor-visit", "context-user-runningout"],
    problems: ["problem-long-wait-times", "problem-communication-gaps", "problem-handoff-failures"],
    customerDescription:
      "People on three or more repeat medications, mostly over sixty-five, and the family members who do the chasing on their behalf.",
    contextWhen:
      "Every month, starting about a week before the current supply runs out, and urgently once it has.",
    segmentSize: 1500000,
    existingSolutions: [
      existing(1, "The NHS App repeat ordering", [
        "Orders well, then goes silent about everything that happens next",
        "Says nothing about whether the pharmacy actually has the item",
        "Assumes a smartphone and the confidence to use it",
      ]),
      existing(2, "Ringing the pharmacy to check", [
        "Engaged at exactly the times somebody is free to ring",
        "The answer is usually ring back tomorrow",
      ]),
      existing(3, "Repeat dispensing arranged by the surgery", [
        "Excellent when it is set up, and almost nobody is offered it",
        "Falls over the moment a dose changes",
      ]),
      existing(4, "Just going to the pharmacy and hoping", [
        "Two trips more often than one",
        "Hardest on exactly the people who find trips hardest",
      ]),
    ],
    jobs: {
      functional: [
        job(1, "Have the tablets in my hand before the current box runs out"),
        job(2, "Make one trip rather than three"),
        job(3, "Find out about an out-of-stock item before setting off, not at the counter"),
      ],
      emotional: [
        job(1, "Stop worrying about running out of a medicine I cannot stop taking", "unbearable"),
        job(2, "Stop feeling like a nuisance for ringing again", "strong"),
      ],
      social: [job(1, "Not have to ask my daughter to sort it out again", "strong")],
    },
    anchorJob: { kind: "emotional", id: 1 },
    market: {
      people: metric(1500000, "patients"),
      often: metric(12, "per year"),
      price: metric(3, "GBP"),
      reachable: 15,
      obtainable: 8,
    },
    competition: { switching: level("low"), effectiveness: level("poor"), size: level("medium") },
    status: "valid",
  },
  workspace: {
    analysisToolType: "root-causes",
    discoveryToolType: "analogy",
    rootCauses: [
      { id: 1, description: "Three organisations hold one piece of information between them and none of them owns it" },
      { id: 2, description: "The patient is the only thing connecting the surgery, the pharmacy and the wholesaler" },
      { id: 3, description: "Nothing tells anyone that a step has finished" },
    ],
    affectedGroups: [
      { id: 1, name: "Patients on multiple repeats", severity: "critical", description: "Do the chasing monthly, while unwell." },
      { id: 2, name: "Family carers", severity: "high", description: "Take on the chasing, usually remotely and during their own working hours." },
      { id: 3, name: "Pharmacy staff", severity: "high", description: "Spend a large part of every day answering the same phone call." },
      { id: 4, name: "GP reception", severity: "medium", description: "Field the calls that should have gone to the pharmacy." },
    ],
    rootCauseNotes:
      "Nobody in the chain is doing anything wrong. The patient is simply the only messaging system between three organisations that do not talk to each other.",
    analogyDomain: "Parcel delivery",
    analogyInsight:
      "A fourteen pound parcel tells you it has been picked, packed, dispatched and is three stops away. A month of medication tells you nothing at all.",
  },
  solutions: [
    {
      title: "Track it like a parcel",
      description:
        "One text per stage: request received by the surgery, prescription signed, sent to the pharmacy, dispensed, ready to collect. Nothing is asked of the patient and no app is needed. It does not make the process faster, it makes it visible, which removes every one of the chasing phone calls.",
      source: "analogy",
      detail: "Straight from parcel tracking. The wait is tolerable when you know where the thing is.",
      analogyDomain: "Parcel delivery",
      analogyInsight: "Visibility is worth more than speed when the wait is unavoidable.",
      scores: [4, 5, 2, 2],
      status: "valid",
      light: "green",
    },
    {
      title: "Tell people about out-of-stock items before they set off",
      description:
        "A stock check against the pharmacy's own system at the moment the prescription arrives, so the patient is told the same day that one of four items will be a week late, rather than finding out at the counter.",
      source: "improve",
      detail: "Took the existing NHS App flow and asked what the single most useful missing message would be.",
      improveIdeas: { communication: "Say what is out of stock, on the day" },
      scores: [3, 4, 2, 3],
      status: "valid",
      light: "green",
    },
    {
      title: "A monthly delivery subscription",
      description:
        "A pharmacy that posts everything monthly on a fixed date, with no ordering step at all.",
      source: "scamper",
      detail: "Eliminate: remove the collection trip entirely.",
      scamperIdeas: { eliminate: "No trip at all" },
      scores: [3, 4, 4, 4],
      status: "unsure",
      light: "amber",
    },
  ],
})

/* ================================================================== */

for (const spec of EXAMPLES) {
  const bundle = buildBundle(spec)
  const path = join(OUT_DIR, `${spec.file}.navigate.json`)
  writeFileSync(path, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  console.log(
    `${spec.file.padEnd(24)} ${String(spec.problem.status).padEnd(12)} ` +
      `${(spec.solutions ?? []).length} solutions, ${(spec.members ?? []).length} in the team`,
  )
}
console.log(`\n${EXAMPLES.length} bundles written to ${OUT_DIR}`)
