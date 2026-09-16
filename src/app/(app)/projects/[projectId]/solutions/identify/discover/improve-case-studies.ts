export type ImproveCaseStudy = {
  company: string
  problem: string
  improvements: {
    group: string
    dimension: string
    idea: string
  }[]
  outcome: string
}

export const IMPROVE_CASE_STUDIES: ImproveCaseStudy[] = [
  {
    company: "Amazon Prime",
    problem: "Online shoppers were frustrated with slow shipping times, unpredictable delivery dates, and paying for shipping on every order.",
    improvements: [
      { group: "Product & Experience", dimension: "Speed & Convenience", idea: "Introduce guaranteed 2-day (and later same-day) delivery on millions of items to remove wait time as a purchase barrier." },
      { group: "Service & Delivery", dimension: "Delivery & Fulfilment", idea: "Build a private logistics network with real-time tracking, flexible delivery slots, and no-box returns at partner locations." },
      { group: "Value & Trust", dimension: "Price Value", idea: "Bundle unlimited fast shipping with Prime Video, Music, and Photos into one flat annual fee, increasing perceived value." },
      { group: "Value & Trust", dimension: "Risk Reduction", idea: "Offer free, no-questions-asked returns on most items, removing the risk of buying online." },
      { group: "Service & Delivery", dimension: "Communication", idea: "Send real-time shipping updates, delivery photos, and accurate ETAs to keep customers informed every step of the way." },
    ],
    outcome: "Amazon turned shipping from a cost centre into a competitive moat. Prime became the gold standard for ecommerce convenience, with over 200 million members worldwide willing to pay annually for the improved experience.",
  },
  {
    company: "Apple iPhone",
    problem: "Smartphones in the mid-2000s were clunky, hard to use, had poor build quality, and felt disposable rather than premium.",
    improvements: [
      { group: "Product & Experience", dimension: "Ease of Use", idea: "Replace physical keyboards and stylus input with a multi-touch screen and intuitive gestures anyone can learn in minutes." },
      { group: "Product & Experience", dimension: "Quality Perception", idea: "Use premium materials (aluminium, glass) and obsessive packaging design to make unboxing feel like a luxury event." },
      { group: "Emotional & Social", dimension: "Emotional Experience", idea: "Craft delightful moments: smooth animations, satisfying haptics, and a distinctive brand personality that customers identify with." },
      { group: "Emotional & Social", dimension: "Post-Purchase Experience", idea: "Offer free in-store workshops, the Genius Bar for support, and seamless software updates for years after purchase." },
      { group: "Product & Experience", dimension: "Customisation & Personalisation", idea: "Enable the App Store so every user can personalise their phone with apps tailored to their needs and interests." },
    ],
    outcome: "Apple redefined what a phone could be by improving ease of use, quality perception, and emotional experience simultaneously. The iPhone became the most profitable product in consumer electronics history and reshaped the entire mobile industry.",
  },
  {
    company: "Starbucks",
    problem: "Coffee shops in the US served generic, low-quality coffee in paper cups with no seating, customisation, or sense of place.",
    improvements: [
      { group: "Product & Experience", dimension: "Customisation & Personalisation", idea: "Let every customer fully customise their drink (milk type, syrups, shots, temperature) and remember their preferences in the app." },
      { group: "Emotional & Social", dimension: "Emotional Experience", idea: "Position the store as a 'third place' between home and work: comfortable seating, free Wi-Fi, warm lighting, and baristas who know your name." },
      { group: "Product & Experience", dimension: "Speed & Convenience", idea: "Introduce mobile order and pay so customers skip the queue entirely, with orders ready for pickup in minutes." },
      { group: "Value & Trust", dimension: "Price Value", idea: "Launch the Starbucks Rewards loyalty programme with free drinks, birthday rewards, and early access to new items." },
      { group: "Emotional & Social", dimension: "Social & Ethical Value", idea: "Commit to ethically sourced beans, reusable cup discounts, and community store initiatives that align with customer values." },
    ],
    outcome: "Starbucks turned a commodity (coffee) into a premium experience by improving customisation, emotional experience, and convenience together. The brand now operates over 35,000 stores worldwide and customers happily pay 5x the price of traditional diner coffee.",
  },
]
