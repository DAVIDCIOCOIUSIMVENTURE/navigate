export type AnalogyCaseStudy = {
  company: string
  problem: string
  sourceDomain: string
  insight: string
  application: string
  outcome: string
}

export const ANALOGY_CASE_STUDIES: AnalogyCaseStudy[] = [
  {
    company: "McDonald's",
    problem: "In the 1940s, the McDonald brothers wanted to serve food faster and more consistently than traditional drive-in restaurants, which had slow service and inconsistent quality.",
    sourceDomain: "Automotive manufacturing (Ford assembly line)",
    insight: "Henry Ford's assembly line broke complex car assembly into simple, repeatable steps performed by specialised workers, making production fast, cheap, and consistent.",
    application: "Apply the assembly line concept to food preparation: each kitchen worker handles one specific task (grill, fries, drinks, wrapping), moving food through a fixed sequence with standard portions and timing.",
    outcome: "McDonald's 'Speedee Service System' cut burger delivery from 30 minutes to 30 seconds, enabled consistent quality across locations, and became the template for modern fast food. Today McDonald's serves 69 million customers daily across 100+ countries.",
  },
  {
    company: "Formula 1 Pit Stops → NHS Neonatal Transfers",
    problem: "Great Ormond Street Hospital's neonatal intensive care team struggled with handover errors when transferring critically ill babies from surgery to ICU. Miscommunication and missed steps were putting lives at risk.",
    sourceDomain: "Formula 1 racing pit crews",
    insight: "F1 pit crews perform 20+ tasks on a car in under 3 seconds with zero errors, using precise choreography, dedicated roles, silent hand signals, and post-race debriefs to improve every stop.",
    application: "Redesign the neonatal handover like a pit stop: assign each team member one specific task, choreograph the sequence, use silent signals to avoid cross-talk, and debrief after every transfer.",
    outcome: "Technical errors in handovers dropped by ~40% and information handover errors dropped by ~50%. The Ferrari F1 team actually advised the hospital directly. This is now a classic example taught in healthcare and safety management courses.",
  },
  {
    company: "George de Mestral → Velcro",
    problem: "Fastening fabric, bags, and clothing required zippers, buttons, laces, or snaps, all of which were fiddly, slow, and prone to breaking.",
    sourceDomain: "Nature (burrs sticking to a dog's fur)",
    insight: "After a hike in the Alps, de Mestral examined the burrs stuck to his dog under a microscope and saw tiny hooks that caught on anything with a loop-shaped fiber, a reusable and incredibly strong mechanism.",
    application: "Recreate the hook-and-loop structure artificially: one nylon strip with stiff hooks, the other with soft loops. When pressed together they grip; when peeled apart they separate cleanly.",
    outcome: "Velcro became one of the most successful bio-inspired inventions in history, used in everything from astronaut spacesuits to children's shoes to medical devices. It remains a canonical example of biomimicry: solving a human problem by copying nature's solution.",
  },
]
