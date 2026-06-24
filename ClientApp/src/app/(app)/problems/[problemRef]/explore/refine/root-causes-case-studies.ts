export type RootCausesCaseStudy = {
  company: string
  problem: string
  causes: { title: string; detail: string }[]
  notes: string
  outcome: string
}

export const ROOT_CAUSES_CASE_STUDIES: RootCausesCaseStudy[] = [
  {
    company: "Toyota (post-war production)",
    problem: "Vehicles were leaving the line with defects, and rework was eating into both quality and margin.",
    causes: [
      { title: "Pressure to hit volume targets", detail: "Operators were rewarded for throughput, so flagging a defect felt like punishing yourself by stopping the line." },
      { title: "Defects discovered too late", detail: "Faults were caught at final inspection, by which point the root issue was several stations upstream and hard to trace." },
      { title: "Fragmented ownership", detail: "No single role owned end-to-end quality; each station fixed what landed in front of it without questioning where it came from." },
      { title: "Tooling drift", detail: "Jigs and presses were maintained on a fixed calendar, not on usage, so worn equipment introduced subtle variation between shifts." },
      { title: "Tribal knowledge", detail: "Senior operators knew the workarounds for each machine's quirks, but nothing was documented for new hires." },
    ],
    notes: "Many surface-level 'human error' incidents actually traced back to system design: incentives, timing of inspection, or missing documentation. Fixing the people would not have fixed the line.",
    outcome: "Toyota responded by giving any operator the authority to stop the line (the andon cord), moving quality checks upstream, and standardising work instructions. The result became the Toyota Production System, which redefined manufacturing quality worldwide.",
  },
  {
    company: "Slack (early enterprise rollout)",
    problem: "Large companies trialled Slack but adoption stalled after a few weeks, with most channels going quiet.",
    causes: [
      { title: "No clear channel taxonomy", detail: "Teams spun up dozens of overlapping channels with no naming convention, so people did not know where to post or read." },
      { title: "Notification overload", detail: "Default settings pinged users for every message, training them to mute aggressively and then miss everything." },
      { title: "Unclear etiquette", detail: "There was no shared norm about response times, threading, or when to use DMs versus channels, so people defaulted to email." },
      { title: "Executive absence", detail: "Senior leaders kept communicating over email, which signalled to everyone that Slack was optional." },
      { title: "No onboarding ritual", detail: "New hires were dropped into a workspace with hundreds of channels and zero context about which ones mattered." },
    ],
    notes: "The product worked. The failure mode was social and organisational: without rituals, defaults, and visible leadership, the tool collapsed back to email regardless of feature parity.",
    outcome: "Slack built a dedicated Customer Success function that worked with admins to design channel structures, set saner notification defaults, and run executive launches. Adoption rates inside enterprise accounts climbed sharply, paving the way for the Salesforce acquisition.",
  },
  {
    company: "NHS A&E waiting times",
    problem: "Emergency departments routinely missed the four-hour treat-or-admit target, with patients waiting on trolleys in corridors.",
    causes: [
      { title: "Bed blocking upstream", detail: "Medically fit patients could not be discharged because social care packages were not ready, so wards stayed full and A&E had nowhere to admit to." },
      { title: "GP access bottleneck", detail: "Patients who could not get a same-week GP appointment used A&E as a default, inflating demand for urgent care." },
      { title: "Staff rotas misaligned with demand", detail: "Peak attendance falls in late afternoon and evening, but consultant cover thinned out at exactly those hours." },
      { title: "Diagnostic queue", detail: "Imaging and pathology turnaround in-hours was acceptable; out-of-hours it ballooned, stranding patients waiting for a result before disposition." },
      { title: "Repeat attendances", detail: "A small cohort of frail and socially isolated patients accounted for a disproportionate share of attendances, often readmitted within days of discharge." },
    ],
    notes: "Almost none of the root causes lived inside A&E itself. The visible queue was a downstream symptom of choices made in social care, primary care, and workforce planning.",
    outcome: "Trusts that paired A&E investment with discharge-to-assess teams, evening GP hubs, and frequent-attender care plans saw the largest sustained improvements. The exercise became a textbook case for systems thinking in healthcare policy.",
  },
]
