import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { titleId, url, title, description, selfDiscoveryQuestionCategoryId } = body

    const question = await prisma.selfDiscoveryQuestion.create({
      data: {
        titleId: String(titleId),
        url,
        title,
        description,
        selfDiscoveryQuestionCategoryId: String(selfDiscoveryQuestionCategoryId)
      }
    })

    return new Response(JSON.stringify({
      ...question,
      id: String(question.id),
      titleId: String(question.titleId),
      selfDiscoveryQuestionCategoryId: String(question.selfDiscoveryQuestionCategoryId)
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function GET() {
  try {
    const questions = await prisma.selfDiscoveryQuestion.findMany()
    return new Response(JSON.stringify(questions.map(q => ({
      ...q,
      id: String(q.id),
      titleId: String(q.titleId),
      selfDiscoveryQuestionCategoryId: String(q.selfDiscoveryQuestionCategoryId)
    }))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 