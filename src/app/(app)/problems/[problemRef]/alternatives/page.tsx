import { redirect } from "next/navigation"

export default async function AlternativesRedirect({ params }: { params: Promise<{ problemRef: string }> }) {
  const { problemRef } = await params
  redirect(`/problems/${problemRef}/existing-solutions`)
}
