export interface SelfDiscoveryQuestion {
  url: string
  titleId: string
  title: string
  description: string
}

export interface SelfDiscoveryCategory {
  url: string
  title: string
  description: string
  questions: SelfDiscoveryQuestion[]
}

export const SELF_DISCOVERY_CATEGORIES: SelfDiscoveryCategory[] = [
  {
    url: "personal-interests",
    title: "Personal Interests, Passions & Experience",
    description: "Explore your personal interests, hobbies, passions, and lived experiences.",
    questions: [
      {
        url: "hobbies-interests",
        titleId: "hobbies-interests",
        title: "What are your hobbies and interests?",
        description: "Consider activities you enjoy in your free time and what energises you.",
      },
      {
        url: "life-experiences",
        titleId: "life-experiences",
        title: "What significant life experiences have shaped you?",
        description: "Think about important events, challenges, or achievements that changed your perspective.",
      },
    ],
  },
  {
    url: "knowledge",
    title: "Knowledge",
    description: "Identify your areas of expertise and deep subject knowledge.",
    questions: [
      {
        url: "areas-of-knowledge",
        titleId: "areas-of-knowledge",
        title: "What areas of knowledge are you most knowledgeable about?",
        description: "Consider subjects, fields, or topics you have studied deeply.",
      },
    ],
  },
  {
    url: "skills-expertise",
    title: "Skills & Expertise",
    description: "Discover your technical and soft skills that create value.",
    questions: [
      {
        url: "technical-skills",
        titleId: "technical-skills",
        title: "What are your core technical skills and areas of expertise?",
        description: "Consider both professional skills and self-taught capabilities.",
      },
      {
        url: "soft-skills",
        titleId: "soft-skills",
        title: "What soft skills do you excel at?",
        description: "Think about communication, leadership, teamwork, and problem-solving.",
      },
      {
        url: "enjoyable-skills",
        titleId: "enjoyable-skills",
        title: "What skills do you enjoy developing the most?",
        description: "These are the areas where you find learning and practice most engaging.",
      },
    ],
  },
  {
    url: "social-impact",
    title: "Social & Environmental Impact",
    description: "Explore your concerns about social and environmental issues.",
    questions: [
      {
        url: "world-concerns",
        titleId: "world-concerns",
        title: "What issues concern you in the world?",
        description: "Think about social, environmental, or economic issues that matter to you.",
      },
      {
        url: "sustainability-goals",
        titleId: "sustainability-goals",
        title: "What sustainability goals interest you?",
        description: "Select the UN Sustainable Development Goals that resonate with you.",
      },
      {
        url: "social-political-concerns",
        titleId: "social-political-concerns",
        title: "What social or political problems are you concerned about?",
        description: "Consider issues related to equality, justice, access, and wellbeing.",
      },
    ],
  },
]
