export type FiveWhysChain = {
  startingProblem: string
  whys: string[] // exactly 5 entries
  rootCause: string
}

export type FiveWhysCaseStudy = {
  company: string
  problem: string
  chains: FiveWhysChain[]
  outcome: string
}

export const FIVE_WHYS_CASE_STUDIES: FiveWhysCaseStudy[] = [
  {
    company: "Toyota (the original 5 Whys)",
    problem: "A welding robot on the assembly line stopped mid-shift, halting production.",
    chains: [
      {
        startingProblem: "The robot stopped working.",
        whys: [
          "Why? An overload tripped the circuit breaker.",
          "Why was there an overload? The bearing was not lubricated enough and seized.",
          "Why was it not lubricated enough? The lubrication pump was not pumping enough oil.",
          "Why was the pump not pumping enough? The pump intake was clogged with metal shavings.",
          "Why were there shavings in the intake? Because there is no filter on the pump.",
        ],
        rootCause: "Missing filter on the lubrication pump. Replacing the breaker would have brought the line back up for a day; fitting a filter prevented every future recurrence.",
      },
    ],
    outcome: "Taiichi Ohno used this exact example to teach engineers to push past the first plausible answer. The 5 Whys became a foundational technique of the Toyota Production System and is now taught across lean manufacturing, software, and healthcare.",
  },
  {
    company: "NASA Jefferson Memorial",
    problem: "The Jefferson Memorial's exterior was deteriorating noticeably faster than other monuments on the National Mall.",
    chains: [
      {
        startingProblem: "The marble facade is degrading.",
        whys: [
          "Why? Cleaning crews are using harsh detergents to scrub the stone.",
          "Why so often? There is heavy bird droppings every morning that needs removing.",
          "Why so many birds? The birds eat the spiders that live on the building.",
          "Why so many spiders? The spiders eat the swarms of midges that gather at dusk.",
          "Why so many midges? The memorial is lit earlier than nearby monuments, and the lights attract midges from the river at dusk.",
        ],
        rootCause: "Lighting schedule. The fix was not stronger detergent or bird deterrents but turning the floodlights on one hour later, which broke the entire ecological chain.",
      },
    ],
    outcome: "By delaying the lights by an hour, the National Park Service cut midge swarms by ~90%, which collapsed the spider and bird populations on the building, which eliminated the need for aggressive cleaning. The case became a classic teaching example for systems thinking and root cause analysis.",
  },
  {
    company: "Amazon (S3 outage, 2017)",
    problem: "A large portion of S3 in the US-EAST-1 region went offline for nearly four hours, taking down a significant chunk of the public internet with it.",
    chains: [
      {
        startingProblem: "S3 was unavailable for several hours.",
        whys: [
          "Why? Two critical S3 subsystems (the index and placement subsystems) were taken offline.",
          "Why were they offline? An engineer ran a debugging command that was meant to remove a small set of servers.",
          "Why did it remove more than intended? The command had a typo that caused it to remove a much larger set than the engineer intended.",
          "Why was that even possible? The tool allowed wide-blast-radius operations without confirmation or capacity limits.",
          "Why was recovery slow? The subsystems had not been fully restarted in years, and the restart procedure had not been exercised at this scale.",
        ],
        rootCause: "Tooling without safety rails plus an unrehearsed recovery path. The typo was the trigger; the absent guardrails and stale runbook were the real cause.",
      },
    ],
    outcome: "Amazon added safety checks to the operational tool to prevent capacity from being removed below a minimum threshold, broke up the index subsystem into smaller cells to reduce blast radius, and required regular restart drills. The incident write-up is now a canonical reference for SRE practice industry-wide.",
  },
]
