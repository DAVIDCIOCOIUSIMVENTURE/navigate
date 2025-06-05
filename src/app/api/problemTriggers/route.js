import { prisma } from '@/lib/prisma'; 
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, userId, selfDiscoveryQuestionId } = body

    const problemTrigger = await prisma.problemTrigger.create({
      data: {
        title,
        userId,
        selfDiscoveryQuestionId,
      }
    })

    return NextResponse.json(problemTrigger, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const title = searchParams.get('title')
    const selfDiscoveryQuestionId = searchParams.get('selfDiscoveryQuestionId')

    // Build Prisma filter
    const where = {}
    if (userId) where.userId = Number(userId)
    if (title) where.title = title
    if (selfDiscoveryQuestionId) where.selfDiscoveryQuestionId = Number(selfDiscoveryQuestionId)

    const problemTriggers = await prisma.problemTrigger.findMany({
      where
    })
    return NextResponse.json(problemTriggers, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    await prisma.problemTrigger.delete({ where: { id: Number(id) } })
    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
} 