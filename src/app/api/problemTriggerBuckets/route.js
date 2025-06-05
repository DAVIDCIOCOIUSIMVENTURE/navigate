import { prisma } from '@/lib/prisma'

// Get all buckets with their triggers for a specific user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const buckets = await prisma.problemTriggersBucket.findMany({
      where: { userId: Number(userId) },
      include: {
        problemTriggers: true
      }
    })
    // Format to match frontend expectations (id, title, ideaTriggerIds)
    const formatted = buckets.map(bucket => ({
      id: String(bucket.id),
      title: bucket.title,
      ideaTriggerIds: bucket.problemTriggers.map(t => String(t.id))
    }))
    return new Response(JSON.stringify(formatted), {
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

// Create a new bucket
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, userId, ideaTriggerIds } = body
    const bucket = await prisma.problemTriggersBucket.create({
      data: {
        title,
        userId: Number(userId),
        problemTriggers: {
          connect: ideaTriggerIds.map(id => ({ id: Number(id) }))
        }
      },
      include: { problemTriggers: true }
    })
    const formatted = {
      id: String(bucket.id),
      title: bucket.title,
      ideaTriggerIds: bucket.problemTriggers.map(t => String(t.id))
    }
    return new Response(JSON.stringify(formatted), {
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

// Update a bucket
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, title, userId, ideaTriggerIds } = body
    const bucket = await prisma.problemTriggersBucket.update({
      where: { id: Number(id) },
      data: {
        title,
        userId: Number(userId),
        problemTriggers: {
          set: ideaTriggerIds.map(id => ({ id: Number(id) }))
        }
      },
      include: { problemTriggers: true }
    })
    const formatted = {
      id: String(bucket.id),
      title: bucket.title,
      ideaTriggerIds: bucket.problemTriggers.map(t => String(t.id))
    }
    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Delete a bucket
export async function DELETE(request) {
  try {
    const { id } = await request.json()
    await prisma.problemTriggersBucket.delete({ where: { id: Number(id) } })
    return new Response(null, { status: 204 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 