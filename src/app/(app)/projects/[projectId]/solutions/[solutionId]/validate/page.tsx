import { redirect } from "next/navigation"
import { projectRoutes } from "@/lib/projects"

/** The flow has no landing page of its own; it opens on its first step. */
export default async function ValidateIndexPage({ params }: { params: Promise<{ projectId: string; solutionId: string }> }) {
  const { projectId, solutionId } = await params
  redirect(projectRoutes.solutionValidate(Number(projectId), Number(solutionId)))
}
