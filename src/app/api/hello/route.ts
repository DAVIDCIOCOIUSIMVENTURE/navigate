import { NextResponse } from "next/server"

// GET /api/hello
export async function GET() {
  return NextResponse.json({ message: "Hello from the API!" })
}

// POST /api/hello
export async function POST(request: Request) {
  const data = await request.json()
  return NextResponse.json({ 
    message: "Data received!", 
    data 
  })
} 