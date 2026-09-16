export type ScamperCaseStudy = {
  company: string
  problem: string
  dimensions: {
    letter: string
    title: string
    idea: string
  }[]
  outcome: string
}

export const SCAMPER_CASE_STUDIES: ScamperCaseStudy[] = [
  {
    company: "Dyson",
    problem: "Traditional vacuum cleaners lose suction as the bag fills up, frustrating customers with declining performance.",
    dimensions: [
      { letter: "S", title: "Substitute", idea: "Replace the bag with cyclonic air separation, using centrifugal force instead of filtration to capture dust." },
      { letter: "C", title: "Combine", idea: "Combine the dust collection and filtration into one transparent chamber so users can see when to empty." },
      { letter: "A", title: "Adapt", idea: "Adapt industrial cyclone technology (used in sawmills and factories) to a household appliance." },
      { letter: "M", title: "Modify", idea: "Shrink the cyclone from factory-scale to handheld size, using multiple smaller cyclones layered together." },
      { letter: "E", title: "Eliminate", idea: "Eliminate disposable bags entirely, removing the recurring cost and environmental waste." },
      { letter: "R", title: "Reverse", idea: "Reverse the expectation: instead of suction declining over time, maintain constant suction throughout use." },
    ],
    outcome: "Dyson created the first bagless vacuum cleaner by adapting industrial cyclone separation for home use. This eliminated a major pain point (loss of suction) and removed the need for replacement bags, creating a premium product that disrupted the entire vacuum industry.",
  },
  {
    company: "Netflix (DVD to Streaming)",
    problem: "Renting movies from video stores meant driving there, dealing with limited stock, paying late fees, and returning on time.",
    dimensions: [
      { letter: "S", title: "Substitute", idea: "Substitute the physical store visit with mail delivery, then later substitute the DVD itself with digital streaming." },
      { letter: "C", title: "Combine", idea: "Combine movie rental with a monthly subscription model so customers pay once and watch as many films as they like." },
      { letter: "A", title: "Adapt", idea: "Adapt the subscription model from magazines and gyms, applying the concept of unlimited access for a flat fee." },
      { letter: "M", title: "Modify", idea: "Modify the return process: with streaming, there is nothing to return at all. With DVDs, prepaid envelopes removed the friction." },
      { letter: "P", title: "Put to Other Use", idea: "Use viewing data (originally just logistics info) to power personalised recommendations and later to greenlight original content." },
      { letter: "E", title: "Eliminate", idea: "Eliminate late fees entirely, removing the most hated aspect of traditional video rental." },
      { letter: "R", title: "Reverse", idea: "Reverse the model: instead of customers going to the content, deliver content directly to the customer." },
    ],
    outcome: "Netflix disrupted Blockbuster by eliminating late fees and store visits, first with DVD-by-mail subscriptions, then with streaming. By reversing the delivery model and repurposing viewing data, they transformed from a rental company into the world's largest entertainment platform.",
  },
  {
    company: "IKEA",
    problem: "Buying quality furniture was expensive and required delivery, professional assembly, and visits to hard-to-reach showrooms.",
    dimensions: [
      { letter: "S", title: "Substitute", idea: "Substitute pre-assembled furniture with flat-pack kits that customers assemble themselves." },
      { letter: "C", title: "Combine", idea: "Combine a furniture store with a restaurant, play area, and lifestyle showroom to create a full-day destination experience." },
      { letter: "A", title: "Adapt", idea: "Adapt warehouse logistics to retail, allowing customers to pick items from a self-serve warehouse and take them home immediately." },
      { letter: "M", title: "Modify", idea: "Modify the packaging: compress furniture into flat boxes that fit in a standard car, eliminating the need for delivery trucks." },
      { letter: "P", title: "Put to Other Use", idea: "Use the showroom floor as full-scale room mock-ups, so customers can visualise how products look in a real living space." },
      { letter: "E", title: "Eliminate", idea: "Eliminate the delivery requirement and assembly labour cost, passing those savings to the customer as lower prices." },
      { letter: "R", title: "Reverse", idea: "Reverse the flow: instead of a shop assistant helping you, customers navigate a self-guided path and self-serve from the warehouse." },
    ],
    outcome: "IKEA made quality furniture accessible and affordable by eliminating delivery and assembly costs through flat-pack design. They turned the showroom into an experience destination and the warehouse into self-service retail, creating a model that competitors still struggle to replicate.",
  },
]
