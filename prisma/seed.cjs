// Seed script for Prisma
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Upsert requested user
  const user = await prisma.user.upsert({
    where: { email: 'david@simventure.co.uk' },
    update: {},
    create: {
      email: 'david@simventure.co.uk',
      firstName: 'David',
      lastName: 'Ciocoiu',
    },
  })

  // Clear dependent data first (order matters for FKs)
  await prisma.problemTriggersBucket.deleteMany()
  await prisma.problemTrigger.deleteMany()
  await prisma.selfDiscoveryQuestion.deleteMany()
  await prisma.selfDiscoveryQuestionCategory.deleteMany()

  const catPersonal = await prisma.selfDiscoveryQuestionCategory.create({
    data: {
      title: 'Personal Interests, Passions & Experience',
      url: 'personal-interests',
      description: 'Explore your personal interests, hobbies, passions, and lived experiences.',
    },
  })

  const catKnowledge = await prisma.selfDiscoveryQuestionCategory.create({
    data: {
      title: 'Knowledge',
      url: 'knowledge',
      description: 'Identify your areas of expertise and deep subject knowledge.',
    },
  })

  const catSkills = await prisma.selfDiscoveryQuestionCategory.create({
    data: {
      title: 'Skills & Expertise',
      url: 'skills-expertise',
      description: 'Discover your technical and soft skills that create value.',
    },
  })

  const catImpact = await prisma.selfDiscoveryQuestionCategory.create({
    data: {
      title: 'Social & Environmental Impact',
      url: 'social-impact',
      description: 'Explore your concerns about social and environmental issues.',
    },
  })

  // Reset and insert ONLY the requested SelfDiscoveryQuestion items, linked to categories
  const questionsToCreate = [
    {
      titleId: 'hobbies-interests',
      url: 'hobbies-interests',
      title: 'What are your hobbies and interests?',
      description: 'Consider activities you enjoy in your free time and what energises you.',
      selfDiscoveryQuestionCategoryId: catPersonal.id,
    },
    {
      titleId: 'life-experiences',
      url: 'life-experiences',
      title: 'What significant life experiences have shaped you?',
      description: 'Think about important events, challenges, or achievements that changed your perspective.',
      selfDiscoveryQuestionCategoryId: catPersonal.id,
    },
    {
      titleId: 'world-concerns',
      url: 'world-concerns',
      title: 'What issues concern you in the world?',
      description: 'Think about social, environmental, or economic issues that matter to you.',
      selfDiscoveryQuestionCategoryId: catImpact.id,
    },
    {
      titleId: 'sustainability-goals',
      url: 'sustainability-goals',
      title: 'What sustainability goals interest you?',
      description: 'Select the UN Sustainable Development Goals that resonate with you.',
      selfDiscoveryQuestionCategoryId: catImpact.id,
    },
    {
      titleId: 'social-political-concerns',
      url: 'social-political-concerns',
      title: 'What social or political problems are you concerned about?',
      description: 'Consider issues related to equality, justice, access, and wellbeing.',
      selfDiscoveryQuestionCategoryId: catImpact.id,
    },
    {
      titleId: 'technical-skills',
      url: 'technical-skills',
      title: 'What are your core technical skills and areas of expertise?',
      description: 'Consider both professional skills and self-taught capabilities.',
      selfDiscoveryQuestionCategoryId: catSkills.id,
    },
    {
      titleId: 'soft-skills',
      url: 'soft-skills',
      title: 'What soft skills do you excel at?',
      description: 'Think about communication, leadership, teamwork, and problem-solving.',
      selfDiscoveryQuestionCategoryId: catSkills.id,
    },
    {
      titleId: 'enjoyable-skills',
      url: 'enjoyable-skills',
      title: 'What skills do you enjoy developing the most?',
      description: 'These are the areas where you find learning and practice most engaging.',
      selfDiscoveryQuestionCategoryId: catSkills.id,
    },
    {
      titleId: 'areas-of-knowledge',
      url: 'areas-of-knowledge',
      title: 'What areas of knowledge are you most knowledgeable about?',
      description: 'Consider subjects, fields, or topics you have studied deeply.',
      selfDiscoveryQuestionCategoryId: catKnowledge.id,
    },
  ]

  const createdQuestions = {}
  for (const q of questionsToCreate) {
    const created = await prisma.selfDiscoveryQuestion.create({ data: q })
    createdQuestions[q.titleId] = created
  }

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


