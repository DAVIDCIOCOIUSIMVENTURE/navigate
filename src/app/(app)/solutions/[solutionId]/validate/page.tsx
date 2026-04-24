import { redirect } from "next/navigation"

export default async function ValidateIndexPage({ params }: { params: Promise<{ solutionId: string }> }) {
  const { solutionId } = await params
  redirect(`/solutions/${solutionId}/validate/introduction`)
}
