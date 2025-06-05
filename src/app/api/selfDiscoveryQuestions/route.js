import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { titleId, url, title, description, selfDiscoveryQuestionCategoryId } = body

    const question = await prisma.selfDiscoveryQuestion.create({
      data: {
        titleId,
        url,
        title,
        description,
        selfDiscoveryQuestionCategoryId
      }
    })

    return new Response(JSON.stringify(question), {
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
    return new Response(JSON.stringify(questions), {
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