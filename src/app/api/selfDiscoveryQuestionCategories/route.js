import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// export async function POST(request) {
//   try {
//     const body = await request.json()
//     const { title, url, description } = body

//     const category = await prisma.selfDiscoveryQuestionCategory.create({
//       data: { title, url, description }
//     })

//     return NextResponse.json(category, {
//       status: 201
//     })
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, {
//       status: 400
//     })
//   }
// }

export async function GET() {
  try {
    const categories = await prisma.selfDiscoveryQuestionCategory.findMany()
    return NextResponse.json(categories, {
      status: 200
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, {
      status: 500
    })
  }
} 