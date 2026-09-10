export type ReverseCaseStudy = {
  company: string
  problem: string
  worseIdeas: string[]
  flippedIdeas: string[]
  outcome: string
}

export const REVERSE_CASE_STUDIES: ReverseCaseStudy[] = [
  {
    company: "Airbnb",
    problem: "Early Airbnb struggled to get travellers to trust staying in a stranger's home instead of a hotel.",
    worseIdeas: [
      "Hide what the property actually looks like and only show stock photos.",
      "Give hosts total anonymity with no way to contact or verify them.",
      "Make guests pay upfront with no refund and no reviews.",
      "Let anyone list without any verification, ratings, or quality checks.",
      "Offer zero customer support if something goes wrong on arrival.",
    ],
    flippedIdeas: [
      "Send professional photographers to hosts so every listing has accurate, high-quality photos.",
      "Show full host profiles with verified IDs, response rates, and past reviews.",
      "Hold payment in escrow until 24 hours after check-in and introduce a refund guarantee.",
      "Require two-way reviews so both hosts and guests build a public trust score.",
      "Offer 24/7 support and a Host Guarantee covering property damage.",
    ],
    outcome: "By flipping every trust-destroying behaviour into a trust-building feature, Airbnb turned home sharing from a sketchy idea into a £100B+ marketplace. Trust became their core product, not a side concern.",
  },
  {
    company: "Domino's Pizza",
    problem: "In the late 2000s, Domino's had a reputation for low-quality pizza, slow delivery, and bland taste. Sales were falling fast.",
    worseIdeas: [
      "Use cheaper ingredients and hide the recipe from customers.",
      "Ignore customer complaints and pretend the pizza tastes great.",
      "Make the ordering process take 10+ minutes with no tracking.",
      "Deliver whenever, with no promises on time or temperature.",
      "Never update the menu or respond to changing tastes.",
    ],
    flippedIdeas: [
      "Launch the 'Pizza Turnaround' campaign: publicly admit the pizza was bad and reformulate every recipe.",
      "Feature real customer criticism in TV ads and show the company responding on camera.",
      "Build an online Pizza Tracker so customers see each step from oven to door in real time.",
      "Guarantee delivery times with refunds when missed; invest in store operations to hit them.",
      "Continuously launch new menu items driven by customer feedback loops.",
    ],
    outcome: "Domino's turnaround is a textbook case of reverse ideation in action. By identifying every way they were making customers unhappy and systematically flipping each one, they tripled their stock price and became the largest pizza chain in the world.",
  },
  {
    company: "Zappos",
    problem: "People were reluctant to buy shoes online because they couldn't try them on, worried about fit, and feared the hassle of returns.",
    worseIdeas: [
      "Charge for shipping in both directions.",
      "Give customers only 7 days to return items, with a restocking fee.",
      "Make returns require a phone call and a printed label from the customer.",
      "Staff support with scripts and strict call-time limits.",
      "Show limited stock info so customers don't know what's really available.",
    ],
    flippedIdeas: [
      "Offer free shipping both ways, on every order, every time.",
      "Extend returns to a full 365 days, no questions asked.",
      "Include a pre-printed return label in every box and let customers drop it at any carrier.",
      "Empower support reps to do whatever makes the customer happy, with no call time limits.",
      "Show real-time inventory and deliver items overnight when possible as a surprise upgrade.",
    ],
    outcome: "Zappos turned the biggest fears of online shoe shopping into the reasons to shop with them. Their radical customer service became a moat so strong that Amazon acquired them for £1.2B, and Zappos' support playbook is now studied in business schools worldwide.",
  },
]
