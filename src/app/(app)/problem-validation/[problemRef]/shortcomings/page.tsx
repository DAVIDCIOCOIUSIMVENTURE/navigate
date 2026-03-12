import { redirect } from "next/navigation"

export default async function ShortcomingsRedirect({ params }: { params: Promise<{ problemRef: string }> }) {
  const { problemRef } = await params
  redirect(`/problem-validation/${problemRef}/alternatives`)
}
